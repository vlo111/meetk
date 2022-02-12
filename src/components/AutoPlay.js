import React, { Component } from 'react';
import { toast } from 'react-toastify';
import { ReactComponent as PlaySvg } from '../assets/images/icons/play.svg';
import { ReactComponent as ControlSvg } from '../assets/images/icons/control.svg';
import Chart from '../Chart';

class AutoPlay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      play: Chart.isAutoPosition,
    };
  }

  componentDidMount() {
    Chart.event.on('render', this.handleChartRender);
  }

  componentWillUnmount() {
    Chart.event.removeListener('render', this.handleChartRender);
  }

  handleChartRender = () => {
    const { play: _play } = this.state;
    const play = Chart.isAutoPosition;
    if (play !== _play) {
      this.setState({ play });
    }
  }

  toggle = () => {
    const labels = Chart.getLabels();
    toast.dismiss(this.notification);
    const { play: _play } = this.state;
    const play = !_play;
    if (play) {
      if (labels.length) {
        this.notification = toast.info('You can not use this feature because you have a label(s)');
        return;
      }
    }
    Chart.render({}, { isAutoPosition: play });
    Chart.event.emit('auto-position.change', play);
    this.setState({ play });
  }

  render() {
    const { play } = this.state;
    return (
      <div id="autoPlay" onClick={this.toggle}>
        {play ? (
          <ControlSvg width={15} height={22} />
        ) : (
          <PlaySvg width={15} height={15} />
        )}
      </div>
    );
  }
}

export default AutoPlay;
