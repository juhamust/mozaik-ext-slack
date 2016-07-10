import path from 'path';
import dotenv from 'dotenv';
import chalk from 'chalk';
import _ from 'lodash';
import slack from 'slack';
import config from './config';

const reConnectInterval = 30 * 30 * 1000; // 30mins
let users = null;
let channels = null;

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

// Create backend client for extension
const client = mozaik => {
  mozaik.loadApiConfig(config);

  const token = config.get('slack.token');
  const bot = slack.rtm.client();
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

  // NOTE: API uses push method, no promise response
  const apiCalls = {
    // For testing purposes
    test() {
      return new Promise((resolve, reject) => {
        slack.auth.test({ token }, (err, resp) => {
          if (err) {
            return reject(err);
          }
          return resolve(resp);
        });
      });
    },
    message(send, params = {}) {
      // Drop hash sign if set
      if (params.channel) {
        params.channel = params.channel.replace('#', '');
      }

      bot.message((message) => {
        Promise.all([
          getUser(token, { id: message.user }),
          getChannel(token, { id: message.channel })
        ])
        .then((output) => {
          const [user, channel] = output;

          if (!user || !channel) {
            console.warn('User and/or channel not found. Message from private channel?');
            return;
          }

          // Filter with params
          if (params.channel && params.channel !== channel.name) {
            //console.log('Skip', params.channel, 'vs', channel.name, message);
            return;
          }

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

export default client;
