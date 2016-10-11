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
  });
}
