import React, { Component } from 'react'

import classNames from 'classnames';
import PropTypes from 'prop-types';

import moment from 'moment';

class Since extends Component {
  constructor(props) {
    console.log('Since: constructor()');
    super(props);

    this.mounted = false;
    this.intervalId;

    this.state = {
      humanizedDuration: this.getDuration().humanize(true)
    };
  }

  getDuration() {
    console.log('Since: getDuration()');
    if (!this.props.time.diff) {
      this.props.time = moment(this.props.time);
    }

    const diff = this.props.time.diff(moment());
    return moment.duration(diff);
  }

  componentWillMount() {
    this.intervalId = setInterval(() => {
      this.setState({
        humanizedDuration: this.getDuration().humanize(true)
      });
    }, 5000);
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;

    clearInterval(this.intervalId);
  }

  render() {
    return (
      <div>{this.state.humanizedDuration}</div>
    );
  }
}

Since.propTypes = {
  time: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.instanceOf(Date)
  ])
};
Since.defaultProps = {
  time: moment()
};

export default Since;
