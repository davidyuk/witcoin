import React from 'react';
import AccountsWrapper from '../components/AccountsWrapper';

export default class AccountsPage extends React.Component {
  render() {
    return (
      <div className="row">
        <div className="col-md-6 col-md-offset-3">
          <AccountsWrapper/>
        </div>
      </div>
    );
  }
}
