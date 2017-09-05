import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { expect, assert } from 'meteor/practicalmeteor:chai';

import { Actions } from '../../api/actions';

import { Reserves } from './reserves';
import { createReserve, updateReserve, restoreReserve, createTransactionByReserve } from './packages-api';

if (Meteor.isServer) {
  describe('reserves', () => {
    const assertUser = (userId, balance, reserve) => {
      const user = Meteor.users.findOne(userId);
      expect(user.balance).equal(balance);
      expect(user.reserve).equal(reserve);
    };

    it('createReserve', () => {
      const userId = Factory.create('user', {balance: 1})._id;

      const reserveId = createReserve({userId, amount: 1});

      assertUser(userId, 0, 1);
      expect(reserveId).a('string');
      const reserve = Reserves.findOne(reserveId);
      expect(reserve).not.equal(undefined);
      expect(reserve.userId).equal(userId);
      expect(reserve.amount).equal(1);
    });

    it('updateReserve', () => {
      const userId = Factory.create('user', {balance: 0})._id;
      const reserveId = Reserves.insert({userId, amount: 10});

      updateReserve({reserveId, amount: 3});
      assertUser(userId, 7, 3);
      expect(Reserves.findOne(reserveId)).eql({_id: reserveId, userId, amount: 3});

      updateReserve({reserveId, amount: 7});
      assertUser(userId, 3, 7);
      expect(Reserves.findOne(reserveId)).eql({_id: reserveId, userId, amount: 7});
    });

    it('restoreReserve', () => {
      const userId = Factory.create('user', {balance: 0})._id;
      const reserveId = Reserves.insert({userId, amount: 1});

      restoreReserve(reserveId);

      assertUser(userId, 1, 0);
      expect(Reserves.findOne(reserveId)).equal(undefined);
    });

    it('createTransactionByReserve', () => {
      const userId = Factory.create('user', {balance: 0})._id;
      const userToId = Factory.create('user', {balance: 0})._id;
      const reserveId = Reserves.insert({userId, amount: 1});
      const actionId = Factory.create('action')._id;

      const transactionId = createTransactionByReserve({reserveId, userToId, actionId, extra: {test: true}});

      expect(Reserves.findOne(reserveId)).equal(undefined);
      const transaction = Actions.findOne(transactionId);
      expect(transaction).not.equal(undefined);
      expect(transaction.userId).equal(userId);
      expect(transaction.objectId).equal(actionId);
      expect(transaction.extra.amount).equal(1);
      expect(transaction.extra.userId).equal(userToId);
      expect(transaction.extra.test).equal(true);
      assertUser(userId, 0, 0);
      assertUser(userToId, 1, 0);
    });
  });
}
