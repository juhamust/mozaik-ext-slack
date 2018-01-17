import path from 'path';
import fs from 'fs';
import request from 'request';
import zlib from 'zlib';
import dotenv from 'dotenv';
import chalk from 'chalk';
import _ from 'lodash';
import slack from 'slack';
import emoji from 'emojilib';
import moment from 'moment';
import mm from 'micromatch';
import getFormatRemover from 'slack-remove-formatting';
import EchoClient from './echo.client';

const reConnectInterval = 30 * 30 * 1000; // 30mins
const tempDirName = 'images';
let users = null;
let channels = null;

// Check if provided channel name matches with micromatch
// rules (separated with comma) and returns true if match
function matchChannel(channelName, filterString) {
  return mm.all(
    channelName.replace('#', ''),
    filterString.split(',').map(filter => filter.trim())
  );
}

function getChannels(token) {
  return new Promise((resolve, reject) => {
    // Return cached data if available
    if (channels) {
      return resolve(channels);
    }
    // Fetch channels data from Slack
    slack.channels.list({ token }, (err, response) => {
      if (err) {
        return reject(err || 'Failed retrieving channels');
      }
      channels = response.channels;
      return resolve(channels);
    });
  });
}

function getUsers(token) {
  return new Promise((resolve, reject) => {
    // Return cached data if available
    if (users) {
      return resolve(users);
    }
    // Fetch users data from Slack
    slack.users.list({ token }, (err, response) => {
      if (err) {
        return reject(err || 'Failed retrieving users');
      }
      users = response.members;
      return resolve(users);
    });
  });
}

function getBotInfo(token, opts) {
  console.log(`Get bot info: ${opts.botId}`);
  return new Promise((resolve, reject) => {
    // Return cached data if available
    // Fetch channels data from Slack
    slack.bots.info({ token, bot: opts.botId }, (err, response) => {
      if (err) {
        return reject(err || new Error(`Failed retrieving bot info with id: ${opts.botId}`));
      }
      return resolve(response.bot);
    });
  });
}

// Get cached list of users
function getChannel(token, opts) {
  //console.log('Fetching channel:', opts);
  return getChannels()
    .then((channels) => {
      // NOTE: Matches with Slack response. Example: { id: 'T01233' } or { name: 'bar' }
      return _.find(channels, opts);
    });
}

// Get cached list of users
function getUser(token, opts) {
  //console.log('Fetching user:', opts);
  return getUsers()
    .then((users) => {
      // NOTE: Matches with Slack response. Example: { id: 'T01233' } or { name: 'bar' }
      return _.find(users, opts);
    });
}

function getImage(token, opts = {}) {
  if (!opts.file || !opts.showImages) {
    return Promise.resolve();
  }

  const outputPath = path.join(opts.publicDir, tempDirName, `${moment().valueOf()}.${opts.file.filetype}`);
  return downloadFile(token, {
    url: opts.file.thumb_360 || opts.file.url_private_download,
    outputPath: outputPath
  })
  .then(() => {
    console.log(`Downloaded file ${opts.file.title}`);
    return Promise.resolve(outputPath);
  });
}

/**
 * Replace multiple emojis from text like "hello there! :smile: :smirk:"
 */
function replaceEmojis(text, offset = 0) {
  const match = text.match(/(:((\w|\+|_)+):)+/);
  if (match) {
    // Increase the search index
    const postIndex = match.index + match[0].length;
    // Collect the emoji character if found, default back to :placeholder:
    const emojiChar = emoji.lib[match[2]] ? emoji.lib[match[2]].char : match[1];
    text = text.substr(offset, postIndex).replace(match[1], emojiChar) + replaceEmojis(text.substr(postIndex));
  }
  return text;
}

function deleteFiles(tempDir, maxAge = required()) {
  const now = moment();

  return new Promise((resolve, reject) => {
    fs.readdir(tempDir, (err, contents) => {
      if (err) {
        return reject(err);
      }

      return Promise.all(contents.map((entry) => {
        const entryPath = path.join(tempDir, entry);
        const stat = fs.stat(entryPath, (err, stat) => {
          if (err) {
            // Just ignore
            return Promise.resolve();
          }

          const age = parseInt(now.diff(stat.birthtime, 'seconds')) * 1000;
          if (age > maxAge) {
            console.log('Delete', entry);
            return new Promise((res, rej) => {
              fs.unlink(entryPath, (err) => {
                if (err) {
                  console.warn(`File ${entryPath} cannot be deleted`);
                  res(err);
                }
                res();
              });
            });
          }
        });
        return Promise.resolve();
      }))
      .then(resolve)
      .catch(reject);
    });
  });
}

function downloadFile(token, opts = {}) {
  const options = {
    url: opts.url,
    headers: {
      'Authorization': `Bearer ${token}`,
      'accept-encoding': 'gzip,deflate'
    }};

  return new Promise((resolve, reject) => {
    const downloadRequest = (options, outStream) => {
      const req = request(options);
      const ready = () =>  {
        resolve({});
      };

      req.on('response', function (res) {
        if (res.statusCode !== 200) {
          reject(new Error('Received 200 response'));
        }

        const encoding = res.headers['content-encoding'];
        if (encoding == 'gzip') {
          res.pipe(zlib.createGunzip()).pipe(outStream).on('finish', ready);
        } else if (encoding == 'deflate') {
          res.pipe(zlib.createInflate()).pipe(outStream).on('finish', ready);
        } else {
          res.pipe(outStream).on('finish', ready);
        }
      });

      req.on('error', (err) => {
        reject(err);
      });
    };

    // Dummy write stream. Substitute with any other writeable stream
    const outStream = fs.createWriteStream(opts.outputPath);
    downloadRequest(options, outStream);
  });
}

function dirExists(dir) {
  let exists;
  try {
    exists = fs.statSync(dir).isDirectory();
  } catch (e) {
    exists = false;
  }
  return exists;
}

// Create backend client for extension
const client = mozaik => {
  // NOTE: Loaded here to avoid issues with testing
  const config = require('./config').default;
  mozaik.loadApiConfig(config);

  const publicDir = config.get('slack.publicDir');
  const token = config.get('slack.token');
  const maxImageAge = config.get('slack.maxImageAge');
  let showImages = config.get('slack.showImages');
  let bot;

  // Validate config
  if (!token) {
    mozaik.logger.error(chalk.red('Missing config key "slack.token", ignoring client'));
    return;
  }

  // Use echo message if set (mostly for dev/demo purposes)
  const echoMessage = config.get('slack.echoMessage');
  if (echoMessage && !_.isEmpty(echoMessage)) {
    mozaik.logger.warn(chalk.yellow('Emulating Slack messages for demo purposes'), typeof echoMessage, echoMessage);
    bot = EchoClient(echoMessage);
  }
  else {
    mozaik.logger.info('Registering Slack client');
    bot = slack.rtm.client();
  }

  const reListen = () => {
    try {
      bot.close();
    } catch (e) {
      // Closing failed (or not opened yet)
    } finally {
      bot.listen({ token });
    }
    mozaik.logger.info('Started listening Slack events');
    return bot;
  };

  // Create missing temp dir if missing
  const tempDir = path.join(publicDir, tempDirName);
  if (showImages && !dirExists(tempDir)) {
    try {
      fs.mkdirSync(tempDir);
    } catch (e) {
      mozaik.logger.warn(chalk.red(`Failed to create tmp directory for images: ${tempDir}`), e);
      showImages = false;
    }
  }

  // NOTE: API uses push method, no promise response
  const apiCalls = {
    message(send, params = {}) {
      if (!_.isFunction(send)) {
        mozaik.logger.error(chalk.red('mozaik-ext-slack supports only push API'));
        return Promise.reject(new Error('Use push API with mozaik-ext-slack'));
      }

      // Drop hash sign if set
      if (params.channel) {
        params.channel = params.channel.replace('#', '');
      }

      bot.message((message) => {
        //mozaik.logger.info(message);

        // Harmonize the user and bot data by loading them into userInfo
        let userPromise = null;
        let userInfo = {
          name: null,
          profileImage: null
        };
        if (message.user) {
          userPromise = getUser(token, { id: message.user })
          .then((user) => {
            userInfo.name = user.profile.real_name || user.real_name || user.name;
            userInfo.profileImage = user.profile.image_48;
            return userInfo;
          });
        }
        else if (message.bot_id) {
          userPromise = getBotInfo(token, { botId: message.bot_id })
          .then((bot) => {
            userInfo.name = bot.name;
            userInfo.profileImage = bot.icons.image_48;
            return userInfo;
          });
        }

        // Load user, channel and image
        Promise.all([
          userPromise,
          getChannel(token, { id: message.channel }),
          getImage(token, {
            publicDir: publicDir,
            file: message.file,
            showImages: showImages
          })
        ])
        .then((output) => {
          const [user, channel, image] = output;

          if (!user || !channel) {
            console.warn('User and/or channel not found. Message from private channel?');
            return;
          }

          // Filter with params by using micromatch module
          // See options in documentation: https://www.npmjs.com/package/micromatch
          if (params.channel && !matchChannel(channel.name, params.channel)) {
            return;
          }

          // Delete old files async (not interested in outcome)
          deleteFiles(path.join(publicDir, tempDirName), maxImageAge);

          // Remove Slack syntax to make outcome more readable
          const removeFormat = getFormatRemover({
            users: users,
            channels: channels
          });
          message.text = removeFormat(message.text || '');
          message.text = replaceEmojis(message.text);
          message.image = image ? path.relative(publicDir, image) : null;
          message.text = image ? _.get(message, 'file.initial_comment.comment', null) || message.file.title : message.text;

          // Replace ids with data
          message.user = user;
          message.channel = channel;
          //console.log('Syncing Slack message:', message);
          send(message);
        })
        .catch((err) => {
          console.error(err);
        });
      });
    }
  };

  // Initiate by caching some data
  getChannels(token)
  .then((channels) => {
    mozaik.logger.info(chalk.green('Loaded slack', channels.length, 'channels'));
    return getUsers(token);
  })
  .then((users) => {
    mozaik.logger.info(chalk.green('Loaded', users.length, 'slack users'));
    setInterval(reListen, reConnectInterval);
    reListen();
  })
  .catch((err) => {
    mozaik.logger.warn(chalk.yellow('Failure while initiating slack data:', err));
    setInterval(reListen, reConnectInterval);
    reListen();
  });

  return apiCalls;
};

function required() {
  throw new Error('Missing requirement');
}

export default client;
export { replaceEmojis, matchChannel };
