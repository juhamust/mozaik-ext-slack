import {
  React,
  Component
} from 'react';

import reactMixin    from 'react-mixin';
import ListenerMixin from 'reflux';
import Mozaik        from 'mozaik/browser';

import Impulse from './Impulse.jsx';

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

  getApiRequest() {
    const requestId = this.props.channel ? `slack.message.${this.props.channel}` : 'slack.message';

    return {
      id: requestId,
      params: {
        channel: this.props.channel
      }
    };
  }

  onApiData(data) {
    this.setState({
      message: data
    });
  }

  render() {
    const title = this.props.title;

    return (
      <div className="slack__pulse">
        <div className="widget__header slack__pulse--header">
          <span className="widget__header__subject">{title}</span>
          <i className="fa fa-comment-o" />
        </div>
        <Impulse message={this.state.message}></Impulse>
      </div>
    );
  }
}

Pulse.propTypes = {
  title:   React.PropTypes.string,
  channel: React.PropTypes.string,
};

Pulse.defaultProps = {
  title:   'Slack',
  channel:  null
};

// apply the mixins on the component
reactMixin(Pulse.prototype, ListenerMixin);
reactMixin(Pulse.prototype, Mozaik.Mixin.ApiConsumer);

export default Pulse;
