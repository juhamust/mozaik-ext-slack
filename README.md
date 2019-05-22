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

- Register client api by adding to `src/register_apis.js`:

  ```javascript
    // NOTE: Widget uses push method to delivery messages!
    module.exports = (Mozaik, configFile, config) => {
        Mozaik.registerApi('slack', require('mozaik-ext-slack/client'), 'push');
    };
  ```

- Register widgets by adding to ``src/register_extensions.js``:

  ```javascript
  import slack from 'mozaik-ext-slack';

  Registry.addExtensions({
      slack
  });

  ```

- Build the dashboard:

  ```shell
  npm run build
  ```

### Slack API Configuration

- Generate/collect the Slack token: https://api.slack.com/docs/oauth-test-tokens
- Place token in dashboard `.env` file:
```
SLACK_TOKEN=value-provided-by-slack
```

Set additional API configuration settings as desired (also in `.env`):

```ini
SLACK_SHOW_IMAGES=true
SLACK_PUBLIC_DIR="assets/"
SLACK_MAX_IMAGE_AGE="8 hours"
```


### Widgets

Set widget configuration values in `conf/config.yml`. See followup sections for details.

```yaml

user: 0.0.0.0
port: 5000

# define duraton between each dashboard rotation (ms)
rotationDuration: 30
# define the interval used by Mozaïk Bus to call registered APIs
apisPollInterval: 10000000
dashboards:
  -
    columns: 2
    rows:    2
    title:   Slack Test
    widgets:
      - extension: slack
        widget:    Channel
        channel:   general
        showPulse: true,
        columns:   1 
        rows:      1
        x:         0
        y:         0
      - extension: slack
        widget:    Pulse
        channel:   general
        columns:   1
        rows:      1
        x:         1
        y:         0
```

Finally, start the dashboard with command:

```shell
node server.js conf/config.yml
```

## Widget: slack.channel

Show pulsating circle for each message sent in Slack channel(s)

![preview-channel](https://raw.githubusercontent.com/juhamust/mozaik-ext-slack/master/preview/channel.png)

![preview-channel](https://raw.githubusercontent.com/juhamust/mozaik-ext-slack/master/preview/image.png)

### parameters

key           | required | description
--------------|----------|---------------
`title`       | no       | *Textual title to show. Example: '#mychannel'.*
`channel`     | no       | *Channels to follow, separated with comma. Defaults to all the channels the token has permission to. Supports including/excluding rules by [micromatch](https://github.com/micromatch/micromatch). Leading hash character ignored*
`imageSize`   | no       | Scaling of image: initial, cover, contain. Default to `initial`
`showImages`  | no       | Show images or not. Defaults to `true`
`showPulse`   | no       | Show pulse visualisation on each message or not. Defaults to `false`
`keyword`     | no       | Show only message containing the defined keyword. Supports regexp like `^foo`. For file upload, the match is done against initial comment or title
`config`      | no       | Override default pulse config parameters or colors. See source code for details

### usage

```yaml
- extension: slack
  widget:    Pulse
  channel:   'general,!sales
  columns:   1, 
  rows:      1
  x:         1, 
  y:         0
```

## Widget: slack.pulse

Show pulsating circle from each message sent in Slack channel(s)

![preview-pulse](https://raw.githubusercontent.com/juhamust/mozaik-ext-slack/master/preview/pulse.png)

### parameters

key           | required | description
--------------|----------|---------------
`channel`     | no      | *Channels to follow, separated with comma. Defaults to all the channels the token has permission to. Supports including/excluding rules by [micromatch](https://github.com/micromatch/micromatch). Leading hash character ignored*
`title`       | no       | *Textual title to show. Example: '#mychannel'.*

### usage

```yaml
- extension: slack
  widget:    Pulse
  channel:   '*',
  columns:   2
  rows:      1
  x:         1
  y:         0
```

## License

Distributed under the MIT license

## Changelog

### Release 0.9.4
- Started upgrade to Mozaik v2
- Channel widget works with Mozaik v2
- Updated the documentation

### Release 0.9.0

- Added support for including/excluding channel messages by using advanced globbing channel name rules like: `general, !sales, team-*` (general -channel and all the channels starging with "team-". Explicitly no sales)
- Improved internal identifier

### Release 0.8.0

- Added support for restoring latest message from browser storage

### Release 0.7.2

- Updated documentation

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
