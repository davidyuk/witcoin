import React from 'react';
import { withRouter } from 'react-router';

import SelectUser from './SelectUser';

const UserSearch = ({ router }) =>
  <div className="navbar-form navbar-left">
    <SelectUser selectHandler={userId => userId && router.push('/u/' + userId)}
                updateInput={false} className="form-control" />
  </div>;

UserSearch.propTypes = {
  router: React.PropTypes.shape({
    push: React.PropTypes.func.isRequired,
  }).isRequired,
};

export default withRouter(UserSearch);
