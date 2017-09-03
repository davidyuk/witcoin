import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { expect, assert } from 'meteor/practicalmeteor:chai';
import { Match } from 'meteor/check';

import { Actions } from '../../api/actions';
import { FeedItems } from '../../api/feeds';

import './api';

if (Meteor.isServer) {
  describe('transactions', () => {
    describe('user min balance constraint by simple schema', () => {
      it('fail when try to $set balance below zero', () => {
        const userId = Factory.create('user', {balance: 0})._id;
        assert.throws(() => {
          Meteor.users.update(userId, {$set: {balance: -1}});
        }, 400, 'Balance must be at least 0');
      });

      it('allow to set balance below zero using $inc', () => {
        const userId = Factory.create('user', {balance: 0})._id;
        Meteor.users.update(userId, {$inc: {balance: -1}});
        expect(Meteor.users.findOne(userId).balance).to.equal(-1);
      });
    });

    describe('create method', () => {
      const createTransaction = Meteor.server.method_handlers['transaction.create'];
      const description = 'Test transaction.';

      it('fail when current user not logged in', () => {
        assert.throws(() => {
          createTransaction.call({}, Factory.create('user')._id, 1, description);
        }, Meteor.Error, 'not-authorized');
      });

      [
        {it: 'fail when transfer without description', arguments: [1, '']},
        {it: 'fail when transfer zero amount', arguments: [0, description]},
        {it: 'fail when transfer negative amount', arguments: [-1, description]},
        {it: 'fail when transfer real amount', arguments: [0.1, description]},
        {it: 'fail when transfer Infinity amount', arguments: [Infinity, description]},
      ].forEach(test => {
        it(test.it, () => {
          const userId = Factory.create('user', {balance: 1})._id;
          const userIdTo = Factory.create('user')._id;
          assert.throws(() => {
            createTransaction.apply({userId}, [userIdTo, ...test.arguments])
          }, Match.Error);
        });
      });

      it('fail when transfer to yourself', () => {
        const userId = Factory.create('user', {balance: 1})._id;
        assert.throws(() => {
          createTransaction.call({userId}, userId, 1, description);
        }, Meteor.Error, 'cannot-transfer-to-yourself');
      });

      it('fail when transfer to uncreated user', () => {
        const userId = Factory.create('user', {balance: 1})._id;
        assert.throws(() => {
          createTransaction.call({userId}, Random.id(), 1, description);
        }, Meteor.Error, 'user-not-found');
      });

      it('fail when transfer more than balance', () => {
        const userId = Factory.create('user', {balance: 1})._id;
        const userToId = Factory.create('user')._id;
        assert.throws(() => {
          createTransaction.call({userId}, userToId, 2, description);
        }, Meteor.Error, 'not-enough-money');
        expect(Actions.find({userId}).count()).to.equal(0);
        expect(Actions.find({userId: userToId}).count()).to.equal(0);
      });

      it('create', () => {
        const userId = Factory.create('user', {balance: 1})._id;
        const userToId = Factory.create('user', {balance: 0})._id;
        createTransaction.call({userId}, userToId, 1, description);

        const action = Actions.findOne({userId});
        expect(action.description).to.equal(description);
        expect(action.type).to.equal(Actions.types.TRANSACTION);
        expect(action.extra).to.eql({amount: 1});
        expect(action.objectId).to.equal(userToId);
        expect(action.userId).to.equal(userId);
        expect(Meteor.users.findOne(userId).balance).to.equal(0);
        expect(Meteor.users.findOne(userToId).balance).to.equal(1);
      });
    });

    it('fail when try to remove transaction', () => {
      const removeAction = Meteor.server.method_handlers['action.remove'];
      const transaction = Factory.create('transaction');
      assert.throws(() => {
        removeAction.call({userId: transaction.userId}, transaction._id);
      }, Meteor.Error, 'actions-of-this-type-cannot-be-deleted');
    });

    it('create notification', () => {
      const transaction = Factory.create('transaction');
      const notification = FeedItems.findOne({userId: transaction.objectId, isNotification: true});
      expect(notification).not.to.equal(undefined);
      expect(notification.actionId).to.equal(transaction._id);
    });
  });
}
