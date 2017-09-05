import React from 'react';
import { Link } from 'react-router';
import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import CoinsAmount from './CoinsAmount';

const CurrentUserBalance = ({balance, reserve}) => <span>
  Доступно: <CoinsAmount value={balance} />
  {!!reserve && <span> (зарезервировано:&nbsp;<Link to="/reserves"><CoinsAmount value={reserve} /></Link>)</span>}
  .
</span>;

CurrentUserBalance.propTypes = {
  balance: React.PropTypes.number,
  reserve: React.PropTypes.number,
};

CurrentUserBalance.defaultProps = {
  balance: 0,
  reserve: 0,
};

export default createContainer(({}) => {
  const u = Meteor.user();
  return {
    balance: u && u.balance,
    reserve: u && u.reserve,
  };
}, CurrentUserBalance);
