import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Actions } from '../../api/actions';

import { registeredTransactionParentTypes } from './internal';
import { createTransaction } from './packages-api';

Meteor.methods({
  'transaction.create' (objectId, amount, description, objectIsUser = true) {
    check(objectId, String);

    if (!this.userId)
      throw new Meteor.Error('not-authorized');

    const userId = objectIsUser ? objectId : (() => {
        const action = Actions.findOne(objectId);
        if (!action)
          throw new Meteor.Error('action-not-found');
        if (!registeredTransactionParentTypes.includes(action.type))
          throw new Meteor.Error('action-should-be-oneOf--' + registeredTransactionParentTypes.join('-'));
        return action.userId;
    })();

    return createTransaction({
      userFromId: this.userId,
      userToId: userId,
      amount,
      ...objectIsUser ? {} : {actionId: objectId},
      description,
    });
  },
});
