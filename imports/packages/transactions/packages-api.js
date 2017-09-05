import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';

import { Actions } from '../../api/actions';

import { incUserPositiveField } from './utils';
import { registeredTransactionParentTypes, registeredTransactionTypes } from './internal';
import { Reserves } from './reserves';

const checkAmount = amount => {
  check(amount, Match.Integer);
  check(amount, Match.Where(a => a >= 0));
};

export const createReserve = ({userId, amount}) => {
  checkAmount(amount);
  incUserPositiveField(userId, 'balance', -amount);
  return Reserves.insert({userId, amount});
};

export const updateReserve = ({reserveId, amount}) => {
  checkAmount(amount);
  const {userId, amount: oldAmount} = Reserves.findOne(reserveId);
  const diff = amount - oldAmount;
  incUserPositiveField(userId, 'balance', -diff);
  Reserves.update(reserveId, {$inc: {amount: diff}});
};

export const restoreReserve = reserveId => {
  const {userId, amount} = Reserves.findOne(reserveId);
  Reserves.remove(reserveId);
  incUserPositiveField(userId, 'balance', amount);
};

const _createTransaction = ({userFromId, userToId, amount, actionId, description, extra, decUserFromBalance}) => {
  check(userFromId, String);
  check(userToId, String);
  check(actionId, Match.Optional(String));
  check(description, Match.Optional(String));
  !actionId && check(description, Match.Where(a => a.length));
  check(amount, Match.Integer);
  check(amount, Match.Where(a => a > 0));
  check(decUserFromBalance, Boolean);

  if (!Meteor.users.findOne(userFromId) || !Meteor.users.findOne(userToId))
    throw new Meteor.Error('user-not-found');
  if (actionId && !Actions.findOne(actionId))
    throw new Meteor.Error('action-not-found');

  if (userFromId == userToId)
    throw new Meteor.Error('cannot-transfer-to-yourself');

  if (decUserFromBalance)
    incUserPositiveField(userFromId, 'balance', -amount);
  incUserPositiveField(userToId, 'balance', amount);

  return Actions.insert({
    type: Actions.types.TRANSACTION,
    objectId: actionId,
    userId: userFromId,
    unDeletable: true,
    description,
    extra: {
      ...extra,
      amount,
      userId: userToId,
    },
  });
};

export const createTransaction = ({userFromId, userToId, amount, actionId, description, extra}) =>
  _createTransaction({userFromId, userToId, amount, actionId, description, extra, decUserFromBalance: true});

export const createTransactionByReserve = ({reserveId, userToId, actionId, description, extra}) => {
  const {userId, amount} = Reserves.findOne(reserveId);
  Reserves.remove(reserveId);
  return _createTransaction({
    userFromId: userId, userToId, actionId, description, amount, extra, decUserFromBalance: false,
  });
};

export const registerTransactionType = type => {
  registeredTransactionTypes.push(type);
  Actions.typesTree['Операции'] = registeredTransactionTypes;
  Actions.notificationTypesTree['Операции'] = registeredTransactionTypes;
};

export const registerTransactionParentType = type => {
  registeredTransactionParentTypes.push(type);
};
