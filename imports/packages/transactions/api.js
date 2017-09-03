import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';

import { Actions } from '../../api/actions';

import { TransactionParentActionTypes } from './index';

Meteor.methods({
  'transaction.create' (objectId, amount, description, objectIsUser = true) {
    check(objectId, String);
    check(description, String);
    objectIsUser && check(description, Match.Where(a => a.length));
    check(amount, Match.Integer);
    check(amount, Match.Where(a => a > 0));

    if (!this.userId)
      throw new Meteor.Error('not-authorized');

    const userId = objectIsUser ? objectId : (() => {
        const action = Actions.findOne(objectId);
        if (!action)
          throw new Meteor.Error('action-not-found');
        if (!TransactionParentActionTypes.includes(action.type))
          throw new Meteor.Error('action-should-be-oneOf--' + TransactionParentActionTypes.join('-'));
        return action.userId;
    })();

    if (this.userId == userId)
      throw new Meteor.Error('cannot-transfer-to-yourself');
    if (!Meteor.isClient && objectIsUser) {
      const user = Meteor.users.findOne(objectId);
      if (!user)
        throw new Meteor.Error('user-not-found');
    }

    return Actions.insert({
      description,
      type: Actions.types.TRANSACTION,
      extra: { amount, userId },
      ...objectIsUser ? {} : { objectId },
      userId: this.userId,
      unDeletable: true,
    });
  },
});
