import path from 'path';
import convict from 'convict';

const config = convict({
  slack: {
    publicDir: {
      doc: 'Directory where ',
      default: path.join(process.cwd(), 'build/images'),
      format: String,
      env: 'SLACK_PUBLIC_DIR'
    },
    token: {
      doc: 'The Slack API token.',
      default: '',
      format: String,
      env: 'SLACK_TOKEN'
    }
  }
});

export default config;
