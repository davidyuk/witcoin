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

        it('fail when remove un deletable action', () => {
          const action = Factory.create('action', {unDeletable: true});
          assert.throws(() => removeAction.call({userId: action.userId}, action._id)
            , Meteor.Error, 'this-action-cannot-be-removed');
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

      describe('action.rate', () => {
        const rateAction = Meteor.server.method_handlers['action.rate'];

        it('fail when current user not logged in', () => {
          const actionId = Factory.create('action')._id;
          assert.throws(() => {
            rateAction.call({}, actionId, 1);
          }, Meteor.Error, 'not-authorized');
        });

        it('rate', () => {
          const user1Id = Factory.create('user')._id;
          const user2Id = Factory.create('user')._id;
          const actionId = Factory.create('action')._id;
          const assertRates = (up, down) => {
            const action = Actions.findOne(actionId);
            expect(action.rates.up).to.equal(up);
            expect(action.rates.down).to.equal(down);
            expect(action.rates.total).to.equal(up - down);
          };

          rateAction.call({userId: user1Id}, actionId, 1);
          assertRates(1, 0);

          rateAction.call({userId: user2Id}, actionId, 1);
          assertRates(2, 0);
          rateAction.call({userId: user2Id}, actionId, -1);
          assertRates(1, 1);
          rateAction.call({userId: user2Id}, actionId, 0);
          assertRates(1, 0);

          const o = {objectId: actionId, type: Actions.types.RATE};
          expect(Actions.find(o).count()).to.equal(1);
          expect(Actions.findOne({...o, userId: user1Id}).rate).to.equal(1);
        });
      });

      describe('action.comment', () => {
        const commentAction = Meteor.server.method_handlers['action.comment'];
        const testComment = 'Test comment.';

        it('fail when current user not logged in', () => {
          const actionId = Factory.create('action')._id;
          assert.throws(() => {
            commentAction.call({}, actionId, testComment);
          }, Meteor.Error, 'not-authorized');
        });

        it('comment', () => {
          const user1Id = Factory.create('user')._id;
          const user2Id = Factory.create('user')._id;
          const actionId = Factory.create('action')._id;

          commentAction.call({ userId: user1Id }, actionId, testComment);
          commentAction.call({ userId: user2Id }, actionId, testComment);
          commentAction.call({ userId: user1Id }, actionId, 'Hello');

          const action = Actions.findOne(actionId);
          expect(action.commentsCount).to.equal(3);
          expect(Actions.find({objectId: actionId}).count()).to.equal(3);
          const comments = Actions.find({objectId: actionId, userId: user1Id}).fetch();
          expect(comments.length).to.equal(2);
          expect(comments[0].description).to.equal(testComment);
          expect(comments[1].description).to.equal('Hello');
        });
      });

      describe('action.share', () => {
        const shareAction = Meteor.server.method_handlers['action.share'];

        it('fail when current user not logged in', () => {
          const actionId = Factory.create('action')._id;
          assert.throws(() => {
            shareAction.call({}, actionId, 'test');
          }, Meteor.Error, 'not-authorized');
        });

        it('share', () => {
          const actionId = Factory.create('action')._id;
          const userId = Factory.create('user')._id;

          shareAction.call({ userId }, actionId, 'test');
          const action = Actions.findOne(actionId);
          expect(action.sharesCount).to.equal(1);
          expect(Actions.find({objectId: actionId}).count()).to.equal(1);
          const shares = Actions.find({objectId: actionId, userId }).fetch();
          expect(shares.length).to.equal(1);
          expect(shares[0].description).to.equal('test');
        });
      });
    });

    it('marks parent actions as un deletable', () => {
      const ids = [Factory.create('action.default')._id];
      ids.push(Factory.create('action.share', {objectId: ids[ids.length - 1]})._id);
      ids.push(Factory.create('action.share', {objectId: ids[ids.length - 1], unDeletable: true})._id);
      ids.forEach(id => expect(Actions.findOne(id).unDeletable).to.equal(true));
    })
  });
}
