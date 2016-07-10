import React, { Component } from 'react';
import reactMixin from 'react-mixin';
import { ListenerMixin } from 'reflux';
import Mozaik from 'mozaik/browser';
var d3 = require('d3');
var ease = require('d3-ease');
//import _ from 'lodash';

// Slack colours
const colors = [
  { r: 112, g: 204, b: 220 }, // blue
  { r: 223, g: 168, b: 35 }, // orange
  { r: 225, g: 22, b: 101 }, // red
  { r: 61, g: 186, b: 145 } // green
];

function pulse(colorIndex = 0) {
  const color = colors[colorIndex];

  d3.select('svg')
    .append('circle')
    .attr('cx', 100)
    .attr('cy', 100)
    .attr('r', 30)
    .attr('stroke-width', 20)
    .attr('fill', 'transparent')
    .attr('stroke', `rgba(${color.r}, ${color.g}, ${color.b}, 255)`)
    .transition()
    .duration(15000)
    .ease(ease.easeExp)
    .attr('stroke-width', 2)
    .attr('stroke', `rgba(${color.r}, ${color.g}, ${color.b}, 0)`)
    .attr('r', 100)
    .remove();
}

class Pulse extends Component {
  constructor(props) {
    super(props);
    this.mounted = false;
    this.state = { colorIndex: 0 };
  }

  getApiRequest() {
    return {
      id: 'slack.message'
    };
  }

  onApiData(data) {
    const nextIndex = this.state.colorIndex < 3 ? this.state.colorIndex + 1 : 0;
    this.setState({
      colorIndex: nextIndex
    });

    // NOTE: Modifying DOM with D3 is not ideal, consider
    // using https://github.com/Olical/react-faux-dom later on
    if (this.mounted) {
      pulse(nextIndex);
    }
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    const title = this.props.title || 'Pulse';

    return (
      <div className="slack__pulse">
        <div className="widget__header">
          <span className="widget__header__subject">{title}</span>
          <i className="fa fa-comment-o" />
        </div>
        <div className="slack__pulse--body widget__body">
          <svg height="200" width="200"></svg>
        </div>
      </div>
    );
  }
}

Pulse.propTypes = {
  title: React.PropTypes.string,
  channel: React.PropTypes.string
};

Pulse.defaultProps = {
  channel: 'all'
};

// apply the mixins on the component
reactMixin(Pulse.prototype, ListenerMixin);
reactMixin(Pulse.prototype, Mozaik.Mixin.ApiConsumer);

export default Pulse;
