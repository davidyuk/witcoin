import React from 'react';

export default class OnUserActive extends React.Component {
  componentDidMount() {
    window.addEventListener('mousemove', this.props.handler);
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.props.handler);
  }

  render() {
    return null;
  }
}

OnUserActive.propTypes = {
  handler: React.PropTypes.func.isRequired,
};
