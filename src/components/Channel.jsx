import React, { Component } from 'react';
import reactMixin from 'react-mixin';
import { ListenerMixin } from 'reflux';
import Mozaik from 'mozaik/browser';

class Channel extends Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }

  getApiRequest() {
    return { id: 'slack.channel.123' };
  }

  onApiData(data) {
    console.log(data);
    this.setState({ count: data.count });
  }

  render() {
    const { count } = this.state;

    return (
      <div>{count}</div>
    );
  }
}

// apply the mixins on the component
reactMixin(ClientConsumer.prototype, ListenerMixin);
reactMixin(ClientConsumer.prototype, Mozaik.Mixin.ApiConsumer);

export default ClientConsumer;
