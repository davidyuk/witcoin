import { Meteor } from 'meteor/meteor';

import { Actions } from '../../api/actions';

import { INITIAL_BALANCE } from './constants';
import { registerTransactionType } from './packages-api';
import { incUserPositiveField } from './utils';

const faker = Meteor.isDevelopment && require('faker');

Actions.types.TRANSACTION = 'transaction';
Actions.hasParentActionTypes.push(Actions.types.TRANSACTION);
registerTransactionType(Actions.types.TRANSACTION);

Meteor.users.schema = new SimpleSchema({
  ...Meteor.users.schema.schema(),
  balance: {type: Number, defaultValue: INITIAL_BALANCE, min: 0, decimal: false},
  reserve: {type: Number, defaultValue: 0, min: 0, decimal: false},
});

Meteor.users.attachSchema(Meteor.users.schema);

const updateUserBalance = (_, action) => {
  if (action.type == Actions.types.TRANSACTION) {
    incUserPositiveField(action.userId, 'balance', -action.extra.amount);
    incUserPositiveField(action.extra.userId, 'balance', action.extra.amount);
  }
};

Actions.before.remove(updateUserBalance);

const updateParentActionCoinsCount = isInsert => (_, action) => {
  if (action.type == Actions.types.TRANSACTION && action.objectId) {
    Actions.update(action.objectId, {$inc: {'extra.coinsCount': (isInsert ? 1 : -1) * action.extra.amount}});
  }
};

Actions.after.insert(updateParentActionCoinsCount(true));
Actions.after.remove(updateParentActionCoinsCount(false));

Factory.define('transaction', Actions, Factory.extend('action.default', {
  type: Actions.types.TRANSACTION,
  extra: (api, userOptions) => ({
    amount: faker.random.number({min: 1, max: 5}),
    userId: userOptions.userToId || Factory.create('user')._id,
  }),
  unDeletable: true,
}));

Factory.get('user').attributes.balance = 10;
