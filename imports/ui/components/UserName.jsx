import React from 'react';

export default class UserName extends React.Component {
  render() {
    const user = this.props.user;

    return (
      <span>
        { user.profile ? user.profile.name : user._id }
      </span>
    );
  }
}

UserName.propTypes = {
  user: React.PropTypes.object.isRequired,
};
