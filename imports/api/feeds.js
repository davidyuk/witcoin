import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { check } from 'meteor/check';
import faker from 'faker';

import { Actions, actionChildrenCursors } from './actions';

class FeedItemsCollection extends Mongo.Collection {
  insert(doc, callback) {
    if (doc.userId == doc.authorId) return null;
    return super.insert(doc, callback);
  }
}

export const FeedItems = new FeedItemsCollection('feeds');

FeedItems.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id, denyUpdate: true },
  userId: { type: String, regEx: SimpleSchema.RegEx.Id, denyUpdate: true },
  actionId: { type: String, regEx: SimpleSchema.RegEx.Id, denyUpdate: true },
  authorId: { type: String, regEx: SimpleSchema.RegEx.Id, denyUpdate: true },
  type: { type: String, denyUpdate: true },
  createdAt: { type: Date, denyUpdate: true },
  isNotification: { type: Boolean, defaultValue: false, denyUpdate: true },
});

FeedItems.attachSchema(FeedItems.schema);

if (Meteor.isServer) {
  const getActionFields = action => ({
    actionId: action._id,
    authorId: action.userId,
    type: action.type,
    createdAt: action.createdAt,
  });

  Actions.after.insert((userId, doc) => {
    const actionFields = getActionFields(doc);

    Actions
      .find({type: Actions.types.SUBSCRIBE, objectId: doc.userId})
      .forEach(subscription =>
        FeedItems.insert({
          ...actionFields,
          userId: subscription.userId,
        })
      );

    if ([Actions.types.COMMENT, Actions.types.RATE, Actions.types.SHARE].includes(doc.type)) {
      FeedItems.insert({
        ...actionFields,
        userId: Actions.findOne(doc.objectId).userId,
        isNotification: true,
      });
    }

    if (doc.type == Actions.types.SUBSCRIBE) {
      Actions
        .find({userId: doc.objectId})
        .forEach(act =>
          FeedItems.insert({
            ...getActionFields(act),
            userId: doc.userId,
          })
        );

      FeedItems.insert({
        ...actionFields,
        userId: doc.objectId,
        isNotification: true,
      });
    }
  });

  Actions.after.remove((userId, doc) => {
    FeedItems.remove({actionId: doc._id});

    if (doc.type == Actions.types.SUBSCRIBE) {
      FeedItems.remove({userId: doc.userId, authorId: doc.objectId, isNotification: false});
    }
  });

  Meteor.publishComposite('feedItems', function(selector, limit) {
    check(limit, Number);

    if (!this.userId)
      return this.ready();

    return {
      find: () => FeedItems.find(
        {...selector, userId: this.userId},
        {sort: { createdAt: -1 }, limit}
      ),
      children: [{
        find: newsItem => Actions.find(newsItem.actionId),
        children: actionChildrenCursors,
      }],
    };
  });
}

Meteor.methods({
  'feedItem.remove' (feedItemId) {
    check(feedItemId, String);

    if (!this.userId)
      throw new Meteor.Error('not-authorized');
    const feedItem = FeedItems.findOne(feedItemId);
    if (!feedItem)
      throw new Meteor.Error('feed-item-not-found');
    if (feedItem.userId != this.userId)
      throw new Meteor.Error('forbidden');

    FeedItems.remove(feedItemId);
  },
});

Factory.define('notification', FeedItems, {
  actionId: Factory.get('action.default'),
  authorId: function() {
    const action = Actions.findOne(this.actionId);
    return action ? action.userId : Factory.get('user');
  },
  type: function() {
    const action = Actions.findOne(this.actionId);
    return action ? action.type : Actions.types.DEFAULT;
  },
  createdAt: function() {
    const action = Actions.findOne(this.actionId);
    return action ? action.createdAt : faker.date.past();
  },
  userId: Factory.get('user'),
  isNotification: true,
});

Factory.define('newsItem', FeedItems, Factory.extend('notification', {
  isNotification: false,
}));
