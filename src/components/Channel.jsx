import React, { Component } from 'react';
import reactMixin from 'react-mixin';
import { ListenerMixin } from 'reflux';
import Mozaik from 'mozaik/browser';
import classNames from 'classnames';
import moment from 'moment';
import _ from 'lodash';
import Since from './Since.jsx';
import Impulse from './Impulse.jsx';


const MIN_FONT_SIZE = 10;

function getStoreValue(key) {
  if (typeof(Storage) === 'undefined') {
    return;
  }
  return JSON.parse(localStorage.getItem(key));
}

function setStoreValue(key, value) {
  if (typeof(Storage) === 'undefined') {
    return;
  }
  localStorage.setItem(key, JSON.stringify(value));
}

class Channel extends Component {
  constructor(props) {
    super(props);
    this.mounted = false;
    this.matcher = this.props.keyword ? new RegExp(this.props.keyword, 'i') : null;
    this.requestId = `slack.message.${this.props.channel || 'nochannel'}.${this.props.keyword || 'nokeyword'}`;
    this.state = {
      message: getStoreValue(this.requestId),
      width: 100,
      height: 100
    };
  }

  componentDidMount() {
    this.mounted = true;

    // Get area size
    const bodyElement = this._body.getDOMNode();
    this.setState({
      height: bodyElement.clientHeight,
      width: bodyElement.clientWidth
    });
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  getApiRequest() {


    return {
      id: this.requestId,
      params: {
        channel: this.props.channel
      }
    };
  }

  onApiData(message) {
    // Clone the message since same object can be provided to others
    message = _.cloneDeep(message);

    if (!this.mounted) {
      console.warn('Component is not yet/more mounted. Skipping.');
      return;
    }

    if (this.props.keyword && this.matcher) {
      // Skip if no match
      if (!this.matcher.test(message.text)) {
        console.warn('Message does not match with provided keyword:', this.props.keyword);
        return;
      }
      // Remove keyword
      message.text = message.text.replace(this.matcher.exec(message.text)[0], '').trim();
    }

    // Store
    setStoreValue(this.requestId, message);

    this.renderPulse = true;
    this.setState({
      message: message
    });
  }

  componentDidUpdate(prevProps, prevState) {
    // Set internal flag once the rendering is done
    // so that we don't draw pulse on every render (for example when switching widgets)
    this.renderPulse = false;
  }

  getFontSize(width, height, textLength = 1) {
    const textLengthFactor = 2.1;
    let size = Math.ceil(Math.sqrt((width * height / (textLength * textLengthFactor))));
    return size > MIN_FONT_SIZE ? size : MIN_FONT_SIZE;
  }

  render() {
    const { message } = this.state;
    let content = {
      empty: true,
      title: this.props.title || (this.props.channel ? `Slack ${this.props.channel}` : 'Slack'),
      text: 'Send msg in Slack',
      style: {},
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
      content.author = message.user.name;
      content.avatar = message.user.profileImage;
      content.date = (<Since time={time}></Since>);
    }

    const fontSize = this.getFontSize(this.state.width, this.state.height, content.text.length);
    content.style.fontSize = fontSize;
    content.style.lineHeight = `${fontSize + 2}px`;

    // Construct classes
    content.bodyClass = classNames('slack-channel__message', {
      'slack-channel__message--empty': content.empty,
      'slack-channel__message--image': message ? message.image : false
    });
    content.footerClass = classNames('slack-channel__footer', {
      'slack-channel__footer--empty': content.empty,
      'slack-channel__footer--image': message ? message.image : false
    });

    const pulse = (this.props.showPulse && this.renderPulse) ? <Impulse className="slack-channel__impulse" message={content.text}></Impulse> : null;

    return (<div>
      <div className="widget__header">
        <span className="widget__header__subject">{content.title}</span>
        <i className="fa fa-comment-o" />
      </div>
      <div className="widget__body" ref={(c) => this._body = c}>
        <div className={content.bodyClass}>
          <div style={content.style} className="slack-channel__message--value">{content.text}</div>
        </div>
        {pulse}
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
  showPulse: React.PropTypes.bool,
  keyword: React.PropTypes.string,
  imageSize: React.PropTypes.oneOf(['initial', 'contain', 'cover'])
};

Channel.defaultProps = {
  channel: null,
  showImages: true,
  showPulse: false,
  keyword: null,
  imageSize: 'initial',
};

// apply the mixins on the component
reactMixin(Channel.prototype, ListenerMixin);
reactMixin(Channel.prototype, Mozaik.Mixin.ApiConsumer);

export default Channel;
