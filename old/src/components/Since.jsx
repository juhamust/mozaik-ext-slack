import {
  React, Component
} from 'react';

import classNames from 'classnames';

import moment from 'moment';

class Since extends Component {
  constructor(props) {
    super(props);

    this.mounted = false;
    this.intervalId;

    this.state = {
      humanizedDuration: this.getDuration().humanize(true)
    };
  }

  getDuration() {
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
  time: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number,
    React.PropTypes.instanceOf(Date)
  ])
};
Since.defaultProps = {
  time: moment()
};

export default Since;
