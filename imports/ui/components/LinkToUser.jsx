import React from 'react';
import { Link } from 'react-router';

export default class LinkToUser extends React.Component {
  render() {
    return (
      <Link to={"/u/" + this.props.user._id}>
        {this.props.user.getFullName(this.props.inflection)}
      </Link>
    );
  }
}

LinkToUser.propTypes = {
  user: React.PropTypes.object.isRequired,
  inflection: React.PropTypes.string,
};
