import React, { Component } from 'react';
import reactMixin from 'react-mixin';
import { ListenerMixin } from 'reflux';
import Mozaik from 'mozaik/browser';

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
    return {
      id: `slack.message.${this.props.channel}`,
      params: {
        channel: this.props.channel
      }
    };
  }

  onApiData(message) {
    console.log(message);

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
      title: this.props.title || (this.props.channel ? `Slack ${this.props.channel}` : 'Slack'),
      text: '--',
      avatar: ''
    };

    // Override actual content
    if (message) {
      content.text = message.text;
      content.author = message.user.real_name;
      content.avatar = message.user.profile.image_48;
    }

    return (<div>
      <div className="widget__header">
        <span className="widget__header__subject">{content.title}</span>
        <i className="fa fa-comment-o" />
      </div>
      <div className="widget__body">
        <div className="slack-channel__message">
          <div className="slack-channel__message--value">{content.text}</div>
        </div>
        <div className="slack-channel__footer">
          <div className="slack-channel__footer--avatar"><img src={content.avatar} /></div>
          <div className="slack-channel__footer--author">{content.author}</div>
          <div className="slack-channel__footer--date"></div>
        </div>
      </div>
    </div>);
  }
}

Channel.propTypes = {
  title: React.PropTypes.string,
  channel: React.PropTypes.string
};

// apply the mixins on the component
reactMixin(Channel.prototype, ListenerMixin);
reactMixin(Channel.prototype, Mozaik.Mixin.ApiConsumer);

export default Channel;
