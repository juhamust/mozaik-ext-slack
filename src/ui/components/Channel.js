import React, {Component} from 'react';

import _ from 'lodash';
import hash from 'hash.js';

import ReactDOM from 'react-dom';

import moment from 'moment';

import PropTypes from 'prop-types';

import Since from './Since.js';
import Impulse from './Impulse.js';

import {Slack} from 'react-feather';

import {Widget, WidgetBody, WidgetHeader,} from '@mozaik/ui';

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

    const identifier = hash.sha256().update(`${props.channel || ''}${props.keyword || ''}`).digest('hex');

    this.mounted   = false;
    this.matcher   = this.props.keyword ? new RegExp(this.props.keyword, 'i') : null;
    this.requestId = `slack.message.${identifier}`;

    this.state = {
      message: '',
      width: 100,
      height: 100
    };
  }

  componentDidMount() {
    this.mounted = true;

    // Get area size
    const bodyElement =  ReactDOM.findDOMNode(this._body);

    this.setState({
      height: bodyElement.clientHeight,
      width: bodyElement.clientWidth
    });
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  static getApiRequest(obj) {
    const identifier = hash.sha256().update(`${obj.channel || ''}`).digest('hex');

    return {
      id: `slack.message.${identifier}`,
      params: {
        channel: obj.channel
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
    //this.renderPulse = false;
  }

  getFontSize(width, height, textLength = 1) {
    const textLengthFactor = 2.1;

    let size = Math.ceil(Math.sqrt((width * height / (textLength * textLengthFactor))));

    return size > MIN_FONT_SIZE ? size : MIN_FONT_SIZE;
  }

  render() {

    const {
      apiData,
      theme,
    } = this.props;
    const message = apiData;

    let content = {
      empty: true,
      title: this.props.title || (this.props.channel ? `Slack #${this.props.channel}` : 'Slack'),
      text: 'Send msg in Slack',
      style: { },
      avatar: '',
      date: null
    };

    // Override actual content
    if (message) {
      const time = message.ts ? moment.unix(message.ts) : new Date();

      content.empty = false;
      content.text  = message.text;

      content.style = {
        backgroundImage: `url(${message.image})`,
        backgroundSize: this.props.imageSize,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
      };
      content.author = message.user.name;
      content.avatar = message.user.profileImage;
      content.date   = (<Since time={time}/>);
    }

    const fontSize = this.getFontSize(this.state.width, this.state.height, content.text.length);

    content.style.fontSize   = fontSize;
    content.style.lineHeight = `${fontSize + 2}px`;

    let slackChannelMessageImageStyle = {
      top: 'auto',
      height: '100%',
      width: '100%'
    };

    let slackChannelMessageEmptyStyle = {
      color: 'gray',
      textShadow: '0 -2px 0 black'
    };

    let slackChannelMessageStyle  = {
      position: 'absolute',
      top: '20%',
      width: '100%',
      textAlign: 'center',
      fontSize: '2rem',
      lineHeight: '2.5rem',
      zIndex: '5000',
      overflowY: 'hidden'
    };

    // Construct classes
    let bodyStyle = {
      ...slackChannelMessageStyle,
    };

    if(content.empty) {
      bodyStyle = {
        ...bodyStyle,
        ...slackChannelMessageEmptyStyle
      };
    }

    if(message) {
      bodyStyle = {
        ...content.style,
        ...bodyStyle,
        ...slackChannelMessageImageStyle
      };
    }

    let slackChannelFooterImage = {
      backgroundColor: 'black'
    };

    let footerStyle = {
      position: 'absolute',
      bottom: '0',
      width: '100%',
      height: '48px',
      backgroundColor: 'rgba(0, 0, 0, 0.06)'
    };

    if(content.empty) {
      footerStyle = {...footerStyle };
    }

    if(message) {
      footerStyle = {
        ...footerStyle,
        slackChannelFooterImage
      };
    }


    const pulse =(this.props.showPulse )  ? <Impulse className="slack-channel__impulse" message={content.text}></Impulse> : null;

    let slackChannelMessageValueStyle = {
      position: 'absolute',
      top: '20%',
      width: '100%',
      textAlign: 'center',
      fontSize: '1.5rem',
      lineHeight: '2rem',
      zIndex: '5000',
      overflowY: 'hidden',
      color: 'white',
      textShadow: '1px 1px 0px rgba(0,0,0,0.35)',

    };

    let slackChannelFooterAvatarStyle = {
      float: 'left'
    };

    let slackChannelFooterMetaStyle = {
      float: 'left',
      margin: '0',
      boxSizing: 'border-box'
    };

    let slackChannelFooterAuthorStyle = {
      float: 'none',
      marginLeft: '1.6vmin',
      fontSize: '2vmin'
    };

    let slackChannelFooterDateStyle = {
      float: 'none',
      marginLeft: '1.6vmin',
      fontSize: '1.6vmin',
      position: 'relative',
      bottom: '1vmin'
    };

    return (<Widget>
      <WidgetHeader title = {`Channel: ${this.props.channel}`} icon={Slack}>

      </WidgetHeader>
      <WidgetBody ref={(c) => this._body = c} style={{ overflowY: 'hidden'}}>
        <div style={bodyStyle}>
          <div style={slackChannelMessageValueStyle}>{content.text}</div>
        </div>
        {pulse}
        <div style={footerStyle}>
          <div style={slackChannelFooterAvatarStyle}><img src={content.avatar} /></div>
          <div style={slackChannelFooterMetaStyle}>
            <div style={slackChannelFooterAuthorStyle}>{content.author}</div>
            <div style={slackChannelFooterDateStyle}>{content.date}</div>
          </div>
        </div>
      </WidgetBody>
    </Widget>);
  }
}

Channel.propTypes = {
  title: PropTypes.string,
  channel: PropTypes.string,
  showImages: PropTypes.bool,
  showPulse: PropTypes.bool,
  keyword: PropTypes.string,
  imageSize: PropTypes.oneOf(['initial', 'contain', 'cover'])
};

Channel.defaultProps = {
  channel: null,
  showImages: true,
  showPulse: false,
  keyword: null,
  imageSize: 'initial',
};

export default Channel;
