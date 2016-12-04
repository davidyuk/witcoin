import React from 'react';

const UserStatus = ({user}) => {
  const userStatus = [
    {name: 'offline', title: 'Не в сети'},
    {name: 'online', title: 'В сети'},
    {name: 'idle', title: 'Нет на месте'},
  ][user.status.online ? user.status.idle ? 2 : 1 : 0];

  return <span className={'user-status ' + userStatus.name} title={userStatus.title} />;
};

UserStatus.propTypes = {
  user: React.PropTypes.shape({
    status: React.PropTypes.shape({
      online: React.PropTypes.bool,
      idle: React.PropTypes.bool,
    }),
  }).isRequired,
};

UserStatus.defaultProps = {
  user: {
    status: {
      online: false,
      idle: false,
    },
  },
};

export default UserStatus;
