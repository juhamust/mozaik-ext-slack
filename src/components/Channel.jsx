import React, { Component } from 'react';
import reactMixin from 'react-mixin';
import { ListenerMixin } from 'reflux';
import Mozaik from 'mozaik/browser';
import classNames from 'classnames';
import moment from 'moment';
import Since from './Since.jsx';

class Channel extends Component {
  constructor(props) {
    super(props);
    this.mounted = false;
    this.state = {
      message: null
    };
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  getApiRequest() {
    const requestId = this.props.channel ? `slack.message.${this.props.channel}` : 'slack.message';
    return {
      id: requestId,
      params: {
        channel: this.props.channel
      }
    };
  }

  onApiData(message) {
    if (!this.mounted) {
      console.warn('Component is not yet/more mounted. Skipping.');
      return;
    }

    this.setState({ message: message });
    console.log('State changed', this.state);
  }

  render() {
    const { message } = this.state;
    let content = {
      empty: true,
      title: this.props.title || (this.props.channel ? `Slack ${this.props.channel}` : 'Slack'),
      text: 'Send msg in Slack',
      style: null,
      avatar: '',
      date: null
    };

    // Override actual content
    if (message) {
      const time = message.ts ? moment.unix(message.ts) : new Date();
      content.empty = false;
      content.text = message.text;
      content.style = {
        backgroundImage: `url(${message.image})`,
        backgroundSize: this.props.imageSize,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
      };
      content.author = message.user.real_name;
      content.avatar = message.user.profile.image_48;
      content.date = (<Since time={time}></Since>);
    }

    // Construct classes
    content.bodyClass = classNames('slack-channel__message', {
      'slack-channel__message--empty': content.empty,
      'slack-channel__message--image': message ? message.image : false
    });
    content.footerClass = classNames('slack-channel__footer', {
      'slack-channel__footer--empty': content.empty,
      'slack-channel__footer--image': message ? message.image : false
    });

    return (<div>
      <div className="widget__header">
        <span className="widget__header__subject">{content.title}</span>
        <i className="fa fa-comment-o" />
      </div>
      <div className="widget__body">
        <div className={content.bodyClass}>
          <div style={content.style} className="slack-channel__message--value">{content.text}</div>
        </div>
        <div className={content.footerClass}>
          <div className="slack-channel__footer--avatar"><img src={content.avatar} /></div>
          <div className="slack-channel__footer--meta">
            <div className="slack-channel__footer--author">{content.author}</div>
            <div className="slack-channel__footer--date">{content.date}</div>
          </div>
        </div>
      </div>
    </div>);
  }
}

Channel.propTypes = {
  title: React.PropTypes.string,
  channel: React.PropTypes.string,
  showImages: React.PropTypes.bool,
  imageSize: React.PropTypes.oneOf(['initial', 'contain', 'cover'])
};

Channel.defaultProps = {
  channel: null,
  showImages: true,
  imageSize: 'initial',
};

// apply the mixins on the component
reactMixin(Channel.prototype, ListenerMixin);
reactMixin(Channel.prototype, Mozaik.Mixin.ApiConsumer);

export default Channel;
