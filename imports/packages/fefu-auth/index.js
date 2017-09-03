import { Meteor } from 'meteor/meteor';
const faker = Meteor.isDevelopment && require('faker');

import '../transactions';
import { registerTransactionType } from '../transactions/register';
import { PRECISION_FACTOR } from '../transactions/constants';

import Action from '../../ui/components/Action';
import { Actions } from '../../api/actions';

import FefuAuthAction from './ui/FefuAuthAction';

Actions.types.FEFU_AUTH = 'fefuAuth';
registerTransactionType(Actions.types.FEFU_AUTH);

// fixme: should be exported only for tests
export const FEFU_STUDENT_INITIAL_BALANCE = 10 * PRECISION_FACTOR;

const updateUserBalance = isInsert => (_, action) => {
  if (action.type == Actions.types.FEFU_AUTH) {
    Meteor.users.update(action.userId, {$inc: {balance: FEFU_STUDENT_INITIAL_BALANCE * (isInsert ? 1 : -1)}});
  }
};

Actions.after.insert(updateUserBalance(true));
Actions.after.remove(updateUserBalance(false));

Action.registerActionRender(Actions.types.FEFU_AUTH, FefuAuthAction);

if (Meteor.isClient) require('./client');
if (Meteor.isServer) require('./server');

Factory.define('fefuAuth', Actions, Factory.extend('action', {
  type: Actions.types.FEFU_AUTH,
  extra: () => ({fefuUserName: faker.internet.userName()}),
}));
