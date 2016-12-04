import React from 'react';

import LinkToUser from './LinkToUser';
import UserStatus from './UserStatus';

const UserList = ({title, count, users}) =>
  <div className="panel panel-default">
    {title || count ? (
      <div className="panel-heading">
        {title}
        {count ? <span className="badge pull-right">{count}</span> : null}
      </div>
    ) : null}
    <ul className="list-group">
      {users.map(user =>
        <li key={user._id} className="list-group-item">
          <LinkToUser user={user} />
          <UserStatus user={user} />
        </li>
      )}
    </ul>
  </div>;

UserList.propTypes = {
  users: React.PropTypes.array.isRequired,
  title: React.PropTypes.string,
  count: React.PropTypes.number,
};

export default UserList;
