import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { expect, assert } from 'meteor/practicalmeteor:chai';

import { Actions } from './actions';
import './users';

if (Meteor.isServer) {
  describe('actions', () => {
    describe('factory', () => {
      it('action', () => {
        const action = Factory.create('action');
        expect(Actions.findOne(action._id)).is.an('object');
      });
    });

    describe('methods', () => {
      describe('action.create', () => {
        const createAction = Meteor.server.method_handlers['action.create'];
        const testAction = 'Test action.';

        it('fail when current user not logged in', () => {
          assert.throws(() => {
            createAction.call({}, testAction);
          }, Meteor.Error, 'not-authorized');
        });

        it('create', () => {
          const userId = Factory.create('user')._id;
          createAction.call({userId}, testAction);
          const actions = Actions.find({userId}).fetch();
          expect(actions.length).to.equal(1);
          expect(actions[0].description).to.equal(testAction);
        });
      });

      describe('action.remove', () => {
        const removeAction = Meteor.server.method_handlers['action.remove'];

        it('fail when current user not logged in', () => {
          assert.throws(() => removeAction.call({}, Factory.create('action')._id)
            , Meteor.Error, 'not-authorized');
        });

        it('fail when remove uncreated action', () => {
          const userId = Factory.create('user')._id;
          assert.throws(() => removeAction.call({userId: userId}, Random.id())
            , Meteor.Error, 'action-not-found');
        });

        it('fail when remove action of another user', () => {
          const actionId = Factory.create('action')._id;
          const userId = Factory.create('user')._id;
          assert.throws(() => removeAction.call({userId: userId}, actionId)
            , Meteor.Error, 'forbidden');
        });

        it('remove', () => {
          const action = Factory.create('action');
          const userId = action.userId;
          expect(Actions.find({userId: userId}).count()).to.equal(1);
          removeAction.call({userId: userId}, action._id);
          expect(Actions.find({userId: userId}).count()).to.equal(0);
        });
      });

      describe('action.subscribe', () => {
        const subscribeAction = Meteor.server.method_handlers['action.subscribe'];

        it('fail when current user not logged in', () => {
          assert.throws(() => subscribeAction.call({}, Factory.create('user')._id)
            , Meteor.Error, 'not-authorized');
        });

        it('fail when subscribe uncreated user', () => {
          const userId = Factory.create('user')._id;
          assert.throws(() => subscribeAction.call({userId: userId}, Random.id())
            , Meteor.Error, 'user-not-found');
        });

        it('subscribe', () => {
          const userId = Factory.create('user')._id;
          const objectId = Factory.create('user')._id;

          const doc = { type: Actions.types.SUBSCRIBE, userId, objectId };
          expect(Actions.find(doc).count()).to.equal(0);
          subscribeAction.call({ userId }, objectId);
          expect(Actions.find(doc).count()).to.equal(1);
          subscribeAction.call({ userId }, objectId);
          expect(Actions.find(doc).count()).to.equal(0);
        });
      });
    });
  });
}
