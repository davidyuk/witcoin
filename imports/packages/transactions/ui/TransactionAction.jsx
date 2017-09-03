import React from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import LinkToUser from '../../../ui/components/LinkToUser';

import CoinsAmount from './CoinsAmount';

const TransactionAction = ({ action, user, isNotification, userTo }) => {
  if (!userTo) return null;
  return <span>
    перев{user.isMale() ? 'ёл' : 'ела'} {isNotification ? 'Вам' : ''}
    {' '}<CoinsAmount value={action.extra.amount} isAccusative={true}/>
    {' '}{isNotification ? null : <LinkToUser user={userTo} inflection={Meteor.users.inflectionTypes.DATIVE}/>}
  </span>;
};

TransactionAction.propTypes = {
  action: React.PropTypes.object.isRequired,
  user: React.PropTypes.object.isRequired,
  userTo: React.PropTypes.object,
  isNotification: React.PropTypes.bool,
};

export default createContainer(
  ({ action }) => ({userTo: Meteor.users.findOne(action.extra.userId)}),
  TransactionAction
);
