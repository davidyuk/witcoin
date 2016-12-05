import React from 'react';
import DateComponent from '../components/Date';

const UserStatusDate = ({user}) => {
  const date = user.status.lastLogin && user.status.lastLogin.date || user.status.lastActivity;
  if (user.status.online && !user.status.idle || !date) return null;
  return <div className="text-muted" style={{fontSize: '12px', margin: '5px 0'}}>
    был{user.isMale() ? '' : 'а'}
    {' '}<DateComponent value={date} isRelative={Date.now() - date < 24 * 60 * 60 * 1000} />
  </div>;
};

UserStatusDate.propTypes = {
  user: React.PropTypes.shape({
    status: React.PropTypes.shape({
      online: React.PropTypes.bool,
      lastLogin: React.PropTypes.shape({date: React.PropTypes.instanceOf(Date)}),
      idle: React.PropTypes.bool,
      lastActivity: React.PropTypes.instanceOf(Date),
    }),
    isMale: React.PropTypes.func.isRequired,
  }).isRequired,
};

UserStatusDate.defaultProps = {
  user: {
    status: {
      online: false,
      idle: false,
    },
  },
};

export default UserStatusDate;
