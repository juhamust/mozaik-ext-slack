import React, { Component } from 'react'

import reactMixin    from 'react-mixin';
import ListenerMixin from 'reflux';
import Mozaik from '@mozaik/ui';

import {Slack} from 'react-feather';

import {
  Widget,
  WidgetHeader,
  WidgetBody,
} from '@mozaik/ui'

import PropTypes from 'prop-types';

import Impulse from './Impulse';

var d3   = require('d3');
var ease = require('d3-ease');

import _ from 'lodash';

export default class Pulse extends Component {
  constructor(props) {
    console.log('Pulse: constructor()');
    super(props);

    this.mounted = false;

    this.state = {
      message: null
    };
  }

  getApiRequest() {
    console.log('Pulse: getApiRequest()');
    const requestId = this.props.channel ? `slack.message.${this.props.channel}` : 'slack.message';

    return {
      id: requestId,
      params: {
        channel: this.props.channel
      }
    };
  }

  onApiData(data) {
    console.log(`Pulse: onApiData(${JSON.stringify(data, null, 2)})`);
    this.setState({
      message: data
    });
  }

  render() {
    const title = this.props.title;

    return (
      <Widget>
        <WidgetHeader title={title} icon={Slack}>
        </WidgetHeader>
        <WidgetBody>
          <Impulse message={this.state.message}></Impulse>
        </WidgetBody>
      </Widget>
    );
  }
}

Pulse.propTypes = {
  title:   PropTypes.string,
  channel: PropTypes.string,
};

Pulse.defaultProps = {
  title:   'Slack',
  channel:  null
};
//
// // apply the mixins on the component
// reactMixin(Pulse.prototype, ListenerMixin);
// reactMixin(Pulse.prototype, Mozaik.Mixin.ApiConsumer);
