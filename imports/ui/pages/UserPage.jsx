import React from 'react';

import NotFoundPage from '../pages/NotFoundPage.jsx';
import UserName from '../components/UserName';

export default class UserPage extends React.Component {
  render() {
    if (!this.props.user)
      return <NotFoundPage/>;

    return (
      <div>
        <UserName user={this.props.user}/><br/>
      </div>
    );
  }
}

UserPage.propTypes = {
  user: React.PropTypes.object,
};

UserPage.contextTypes = {
  router: React.PropTypes.object,
};
