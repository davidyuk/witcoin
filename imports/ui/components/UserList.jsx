import React from 'react';

import LinkToUser from './LinkToUser';

export default class UserList extends React.Component {
  render() {
    const title = this.props.title;
    const count = this.props.count;

    return (
      <div className="panel panel-default">
        {title || count ?
          <div className="panel-heading">
            { title }
            { count ? <span className="badge pull-right">{ count }</span> : null }
          </div>
          : null}
        <ul className="list-group">
          { this.props.users.map(user =>
            <li key={user._id} className="list-group-item">
              <LinkToUser user={user}/>
            </li>
          ) }
        </ul>
      </div>
    );
  }
}

UserList.propTypes = {
  users: React.PropTypes.array.isRequired,
  title: React.PropTypes.string,
  count: React.PropTypes.number,
};
