# mozaik-ext-slack

Module provides some [Slack](https://slack.com) widgets for [Mozaïk dashboard](http://mozaik.rocks/).

![preview-channel](https://raw.githubusercontent.com/juhamust/mozaik-ext-slack/master/preview/channel.png)

## Setup

Follow the steps to install and configure widget into dashboard

### Dependencies

- Install module in dashboard directory:

  ```shell
  npm install -S mozaik-ext-slack
  ```

- Register client api by adding to dashboard `src/server.js`:

  ```javascript
  // NOTE: Widget uses push method to delivery messages!
  import slack from 'mozaik-ext-slack/client';
  mozaik.bus.registerApi('slack', slack, 'push');
  ```

- Register widgets by adding to dashboard ``src/App.jsx``:

  ```javascript
  import slack from 'mozaik-ext-slack';
  mozaik.addBatch('slack', slack);
  ```

- Build the dashboard:

  ```shell
  npm run build-assets
  ```

### Slack

- Generate/collect the Slack token: https://api.slack.com/docs/oauth-test-tokens
- Place token in dashboard `.env` file:
```
SLACK_TOKEN=value-provided-by-slack
```

### Widgets

Set api and widget configuration values in dashboard `config.js`. See followup sections for details.

```javascript
module.exports = {
  // Configure api
  api: {
    slack: {
      // NOTE: You can also use .env or set value here
      token: process.env.SLACK_TOKEN
    },
    // Other services ...
  },

  // Set widgets
  dashboards: [
    columns: 2,
    rows: 2,
    // See next sections for details
    widgets: [
      {
        type: 'slack.channel',
        channel: 'general',
        columns: 1, rows: 1,
        x: 0, y: 0
      },
      {
        type: 'slack.pulse',
        columns: 1, rows: 1,
        x: 1, y: 0
      },
    ]
  ]
}
```

Finally, start the dashboard with command:

```shell
node app.js
```

## Widget: slack.channel

Show pulsating circle for each message sent in Slack channel(s)

![preview-channel](https://raw.githubusercontent.com/juhamust/mozaik-ext-slack/master/preview/channel.png)

### parameters

key           | required | description
--------------|----------|---------------
`channel`     | no      | *Name of the channel to follow. Defaults to all public channels where token has permissions to*
`title`       | no       | *Textual title to show. Example: '#mychannel'.*

### usage

```javascript
{
  type: 'slack.pulse',
  channel: 'general',
  columns: 2, rows: 1,
  x: 1, y: 0
}
```

## Widget: slack.pulse

Show pulsating circle for each message sent in Slack channel(s)

![preview-pulse](https://raw.githubusercontent.com/juhamust/mozaik-ext-slack/master/preview/pulse.png)

### parameters

key           | required | description
--------------|----------|---------------
`channel`     | no      | *Name of the channel to follow. Defaults to all public channels where token has permissions to*
`title`       | no       | *Textual title to show. Example: '#mychannel'.*

### usage

```javascript
{
  type: 'slack.pulse',
  channel: 'general',
  columns: 2, rows: 1,
  x: 1, y: 0
}
```

## License

Distributed under the MIT license

## Changelog

# Release 0.2.0

- Added since time information
- Fixed issue when having multiple pulse widgets
- Improved style

# Release 0.1.0

- Initial somewhat working version
