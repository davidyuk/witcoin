import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { expect } from 'meteor/practicalmeteor:chai';

import { NewsItems, NotifyItems } from './feeds';
import { Actions } from './actions';
import './users';

if (Meteor.isServer) {
  describe('feeds', () => {
    const subscribeAction = Meteor.server.method_handlers['action.subscribe'];
    const createAction = Meteor.server.method_handlers['action.create'];
    const removeAction = Meteor.server.method_handlers['action.remove'];

    it('news', () => {
      const userId = Factory.create('user')._id;
      const newsSourceId = Factory.create('user')._id;
      const assertNewsCount = (c) =>
        expect(NewsItems.find({ userId }).count()).to.equal(c);

      const actionId = createAction.call({ userId: newsSourceId }, 'test action');
      assertNewsCount(0);
      subscribeAction.call({ userId }, newsSourceId);
      assertNewsCount(1);

      const newsItem = NewsItems.findOne({ userId });
      expect(newsItem.actionId).to.equal(actionId);
      const action = Actions.findOne(actionId);
      expect(newsItem.createdAt).to.eql(action.createdAt);

      subscribeAction.call({ userId }, newsSourceId);
      assertNewsCount(0);
      subscribeAction.call({ userId }, newsSourceId);
      assertNewsCount(1);

      removeAction.call({ userId: newsSourceId }, actionId);
      assertNewsCount(0);
    });

    it('show/hide notification on subscribe', () => {
      const subscriberId = Factory.create('user')._id;
      const userId = Factory.create('user')._id;
      const assertNotificationCount = (c) =>
        expect(NotifyItems.find({ userId }).count()).to.equal(c);

      assertNotificationCount(0);
      subscribeAction.call({ userId: subscriberId }, userId);
      assertNotificationCount(1);
      subscribeAction.call({ userId: subscriberId }, userId);
      assertNotificationCount(0);
    });

    describe('factory', () => {
      it('notification', () => {
        const notification = Factory.create('notification');
        expect(NotifyItems.findOne(notification._id)).is.an('object');
      });
    });

    describe('methods', () => {
      describe('notification.remove', () => {
        const removeNotification = Meteor.server.method_handlers['notification.remove'];

        it('fail when current user not logged in', () => {
          assert.throws(() => removeNotification.call({}, Factory.create('notification').actionId)
            , Meteor.Error, 'not-authorized');
        });

        it('fail when remove uncreated notification', () => {
          const userId = Factory.create('user')._id;
          assert.throws(() => removeNotification.call({ userId }, Random.id())
            , Meteor.Error, 'notification-not-found');
        });

        it('fail when remove notification of another user', () => {
          const actionId = Factory.create('notification').actionId;
          const userId = Factory.create('user')._id;
          assert.throws(() => removeNotification.call({ userId }, actionId)
            , Meteor.Error, 'notification-not-found');
        });

        it('remove', () => {
          const notification = Factory.create('notification');
          const userId = notification.userId;
          expect(NotifyItems.find({ userId }).count()).to.equal(1);
          removeNotification.call({ userId }, notification.actionId);
          expect(NotifyItems.find({ userId }).count()).to.equal(0);
        });
      });
    });
  });
}
