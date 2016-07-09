import convict from 'convict';

const config = convict({
  slack: {
    token: {
      doc: 'The Slack API token.',
      default: '',
      format: String,
      env: 'SLACK_TOKEN'
    }
  }
});

export default config;
