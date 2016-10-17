# mozaik-ext-slack

Module provides some [Slack](https://slack.com) widgets for [Mozaïk dashboard](http://mozaik.rocks/).

![preview-channel](https://raw.githubusercontent.com/juhamust/mozaik-ext-slack/master/preview/logo.png)

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
      // Slack api token
      // $SLACK_TOKEN
      token: 'valuefromslack',

      // NOTE: Following config parameters are OPTIONAL!
      // Download the uploaded images and show them in dashboard
      // $SLACK_SHOW_IMAGES
      showImages: true,
      // Directory where the static files are hosted from. Needed for images. Defaults to cwd() + './build'
      publicDir: '/path/to/mozai-demo/build',
      // The age of temp images to delete
      // $SLACK_MAX_IMAGE_AGE
      maxImageAge: '8 hours',
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
        showPulse: true,
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

![preview-channel](https://raw.githubusercontent.com/juhamust/mozaik-ext-slack/master/preview/image.png)

### parameters

key           | required | description
--------------|----------|---------------
`title`       | no       | *Textual title to show. Example: '#mychannel'.*
`channel`     | no       | *Name of the channel to follow. Defaults to all public channels where token has permissions to*
`imageSize`   | no       | Scaling of image: initial, cover, contain. Default to `initial`
`showImages`  | no       | Show images or not. Defaults to `true`
`showPulse`   | no       | Show pulse visualisation on each message or not. Defaults to `false`
`keyword`     | no       | Show only message containing the defined keyword. Supports regexp like `^foo`. For file upload, the match is done against initial comment or title
`config`      | no       | Override default pulse config parameters or colors. See source code for details

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

Show pulsating circle from each message sent in Slack channel(s)

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

### Release 0.7.1

- Show pulse only on new API data

### Release 0.7.0

- Add support for keywords: Show only messages matching with the rule

### Release 0.6.0

- Add support to show pulse within channel widget

### Release 0.5.0

- Adjust font size automatically: Based on given size and length of text
- Improved ripple to have random location and more configurable outcome
- Fixed #7: Show bot messages
- Created `echoMessage` for testing purpsoses

### Release 0.4.0

- Added support for pulse configuration
- Multiple ripples per message

### Release 0.3.1

- Improved error cases and logging

### Release 0.3.0

- Added support for showing images
- Added support for showing emojis
- Added duration info since previous message
- Improved message formatting

### Release 0.2.0

- Added since time information
- Fixed issue when having multiple pulse widgets
- Improved style

### Release 0.1.0

- Initial somewhat working version
