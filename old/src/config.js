import path    from 'path';
import convict from 'convict';

const config = convict({
  slack: {
    publicDir: {
      doc:     'Directory where the static files are hosted from. Needed for images.',
      default: path.join(process.cwd(), 'build'),
      format:  String,
      env:     'SLACK_PUBLIC_DIR'
    },
    token: {
      doc:     'The Slack API token.',
      default: '',
      format:  String,
      env: '   SLACK_TOKEN'
    },
    maxImageAge: {
      doc:     'The age of an image in hours to delete',
      default: '8 hours',
      format:  'duration',
      env:     'SLACK_MAX_IMAGE_AGE'
    },
    showImages: {
      doc:     'Download the uploaded images and show them in dashboard',
      default: true,
      format:  Boolean,
      env:     'SLACK_SHOW_IMAGES'
    },

    // For testing/development
    // NOTE: Use JSON in .env
    // Example: SLACK_ECHO_MESSAGE = { "type": "message", "channel": "C02GVP9DZ", "user": "U02558FA2", "text": "Hello from Slack!", "ts": "1475003567.000006", "team": "T0254ARL8" }

    echoMessage: {
      doc: 'Slack message to simulate',
      default: { },
      format: Object,
      env: 'SLACK_ECHO_MESSAGE'
    }
  }
});

export default config;
