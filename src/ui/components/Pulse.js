import React, { Component } from 'react';

import ListenerMixin from 'reflux';
import Mozaik from '@mozaik/ui';

import {Slack} from 'react-feather';

import {
  Widget,
  WidgetHeader,
  WidgetBody,
} from '@mozaik/ui';

import PropTypes from 'prop-types';

import Impulse from './Impulse';

var d3   = require('d3');
var ease = require('d3-ease');

import _ from 'lodash';

class Pulse extends Component {
  constructor(props) {

    super(props);

    this.mounted = false;

    this.state = {
      message: null
    };
  }

  static getApiRequest(obj) {

    const requestId = obj.channel ? `slack.message.${obj.channel}` : 'slack.message';

    return {
      id: requestId,
      params: {
        channel: obj.channel
      }
    };
  }

  onApiData(data) {
    this.setState({
      message: data
    });
  }

  render(obj) {
    const {
      apiData,
      theme,
    } = this.props;

    const title = this.props.title;

    return (
      <Widget>
        <WidgetHeader title={title} icon={Slack}>
        </WidgetHeader>
        <WidgetBody>
          <Impulse message={apiData}/>
        </WidgetBody>
      </Widget>
    );
  }
}

Pulse.propTypes = {
  title: PropTypes.string,
  channel: PropTypes.string,
};

Pulse.defaultProps = {
  title: 'Slack',
  channel: null
};

export default Pulse;
