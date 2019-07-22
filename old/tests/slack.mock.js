import channel from './channel.json';
import channels from './channels.json';
import users from './users.json';
import message from './message';

export default {
  slack: {
    rtm: {
      client: () => {
        return {
          message: (cb) => {
            cb(message);
          },
          listen: () => {}
        };
      }
    },
    channels: {
      list: (opts, cb) => {
        cb(null, channels);
      }
    },
    users: {
      list: (opts, cb) => {
        cb(null, users);
      }
    }
  }
};
