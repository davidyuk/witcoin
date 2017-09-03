const faker = Meteor.isDevelopment && require('faker');

import Action from '../../ui/components/Action';
import { Actions } from '../../api/actions';

import TransactionAction from './ui/TransactionAction';
import TransactionActionButton from './ui/TransactionActionButton';
import { INITIAL_BALANCE } from './constants';
import { registerTransactionType } from './register';

export const TransactionParentActionTypes = [];

Actions.types.TRANSACTION = 'transaction';
Actions.hasParentActionTypes.push(Actions.types.TRANSACTION);
registerTransactionType(Actions.types.TRANSACTION);

Meteor.users.schema = new SimpleSchema({
  ...Meteor.users.schema.schema(),
  balance: {type: Number, defaultValue: INITIAL_BALANCE, min: 0, decimal: false},
});

Meteor.users.attachSchema(Meteor.users.schema);

const updateUserBalance = isInsert => (_, action) => {
  if (action.type == Actions.types.TRANSACTION) {
    const userFromId = isInsert ? action.userId : action.extra.userId;
    const userToId = isInsert ? action.extra.userId : action.userId;
    const f = Meteor.users.update(
      {_id: userFromId, balance: {$gte: action.extra.amount}},
      {$inc: {balance: -action.extra.amount}}
    );
    if (!f)
      throw new Meteor.Error('not-enough-money');
    Meteor.users.update(userToId, {$inc: {balance: action.extra.amount}});
  }
};

Actions.before.insert(updateUserBalance(true));
Actions.before.remove(updateUserBalance(false));

Actions.after.insert((_, action) => {
  if (action.type == Actions.types.TRANSACTION && action.objectId) {
    Actions.update(action.objectId, {$inc: {'extra.coinsCount': (isInsert ? 1 : -1) * action.extra.amount}});
  }
});

Action.registerActionRender(Actions.types.TRANSACTION, TransactionAction);
Action.registerBottomButton(TransactionActionButton);

require('./api');

if (Meteor.isClient) require('./client');
if (Meteor.isServer) require('./server');

Factory.define('transaction', Actions, Factory.extend('action.default', {
  type: Actions.types.TRANSACTION,
  extra: () => ({
    amount: faker.random.number({min: 1, max: 5}),
    userId: Factory.get('user'),
  }),
}));

Factory.get('user').attributes.balance = 10;
