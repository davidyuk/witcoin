import React from 'react';
import { Link } from 'react-router';

import UserName from './UserName';

export default class LinkToUser extends React.Component {
  render() {
    return (
      <Link to={"/u/" + this.props.user._id}>
        <UserName user={this.props.user} />
      </Link>
    );
  }
}

LinkToUser.propTypes = {
  user: React.PropTypes.object.isRequired,
};
