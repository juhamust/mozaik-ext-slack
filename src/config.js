import path from 'path';
import convict from 'convict';

const config = convict({
  slack: {
    publicDir: {
      doc: 'Directory where ',
      default: path.join(process.cwd(), 'build'),
      format: String,
      env: 'SLACK_PUBLIC_DIR'
    },
    token: {
      doc: 'The Slack API token.',
      default: '',
      format: String,
      env: 'SLACK_TOKEN'
    },
    maxImageAge: {
      doc: 'The age of an image in hours to delete',
      default: 8,
      format: 'nat',
      env: 'SLACK_MAX_IMAGE_AGE'
    },
  }
});

export default config;
