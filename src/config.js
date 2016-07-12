import path from 'path';
import convict from 'convict';

const config = convict({
  slack: {
    publicDir: {
      doc: 'Directory where the static files are hosted from. Needed for images.',
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
      default: '8 hours',
      format: 'duration',
      env: 'SLACK_MAX_IMAGE_AGE'
    },
    showImages: {
      doc: 'Download the uploaded images and show them in dashboard',
      default: true,
      format: 'duration',
      env: 'SLACK_SHOW_IMAGES'
    },
  }
});

export default config;
