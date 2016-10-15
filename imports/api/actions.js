import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Match, check } from 'meteor/check';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import faker from 'faker';

import { SchemaHelpers } from './common';
import './users';
import { NewsItems, NotifyItems } from './feeds';

class ActionsCollection extends Mongo.Collection {
  insert(doc, callback) {
    const docId = super.insert(doc, callback);
    const action = Actions.findOne(docId);

    Actions
      .find({ type: Actions.types.SUBSCRIBE, objectId: action.userId })
      .forEach(subscription =>
        NewsItems.insert({
          userId: subscription.userId,
          actionId: action._id,
          authorId: action.userId,
          createdAt: action.createdAt,
        })
      );

    if ([Actions.types.COMMENT, Actions.types.RATE, Actions.types.SHARE].indexOf(action.type) >= 0) {
      const parentAction = Actions.findOne(action.objectId);

      NotifyItems.insert({
        userId: parentAction.userId,
        actionId: action._id,
        createdAt: action.createdAt,
      });
    }

    switch (action.type) {
      case Actions.types.SUBSCRIBE:
        Actions
          .find({ userId: action.objectId })
          .forEach(act =>
            NewsItems.insert({
              userId: action.userId,
              actionId: act._id,
              authorId: act.userId,
              createdAt: act.createdAt,
            })
          );

        NotifyItems.insert({
          userId: action.objectId,
          actionId: action._id,
          createdAt: action.createdAt,
        });
        break;
      case Actions.types.COMMENT:
        Actions.update(action.objectId, {$inc: {commentsCount: 1}});
        break;
      case Actions.types.RATE:
        action.rate && Actions.update(action.objectId, {$inc: {['rates.' + (action.rate == 1 ? 'up' : 'down')]: 1}});
        break;
      case Actions.types.SHARE:
        Actions.update(action.objectId, {$inc: {sharesCount: 1}});
        break;
    }
    return docId;
  }

  remove(selector, callback) {
    Actions.find(selector).forEach(action => {
      NewsItems.remove({ actionId: action._id });
      NotifyItems.remove({ actionId: action._id });
      Actions.remove({ objectId: action._id });

      switch (action.type) {
        case Actions.types.SUBSCRIBE:
          NewsItems.remove({ userId: action.userId, authorId: action.objectId });
          break;
        case Actions.types.COMMENT:
          Actions.update(action.objectId, {$inc: {commentsCount: -1}});
          break;
        case Actions.types.RATE:
          action.rate && Actions.update(action.objectId, {$inc: {['rates.' + (action.rate == 1 ? 'up' : 'down')]: -1}});
          break;
        case Actions.types.SHARE:
          Actions.update(action.objectId, {$inc: {sharesCount: -1}});
          break;
      }
    });
    return super.remove(selector, callback);
  }
}

export const Actions = new ActionsCollection('actions');

Actions.types = {
  DEFAULT: 'default',
  SUBSCRIBE: 'subscribe',
  COMMENT: 'comment',
  RATE: 'rate',
  SHARE: 'share',
};

Actions.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id, denyUpdate: true },
  userId: { type: String, regEx: SimpleSchema.RegEx.Id, denyUpdate: true },
  objectId: { type: String, regEx: SimpleSchema.RegEx.Id, denyUpdate: true, optional: true },
  description: { type: String, optional: true },
  type: { type: String, defaultValue: Actions.types.DEFAULT, denyUpdate: true },

  commentsCount: { type: Number, defaultValue: 0, optional: true },

  rates: { type: Object, optional: true },
  'rates.up': { type: Number, defaultValue: 0 },
  'rates.down': { type: Number, defaultValue: 0 },
  rate: { type: Number, optional: true, denyUpdate: true },

  sharesCount: { type: Number, defaultValue: 0, optional: true },

  createdAt: SchemaHelpers.createdAt,
  updatedAt: SchemaHelpers.updatedAt,
  deletedAt: SchemaHelpers.deletedAt,
});

Actions.attachSchema(Actions.schema);

if (Meteor.isServer) {
  const actionUsersCursor = {
    find: action => {
      const userIds = [action.userId];
      if (action.type == Actions.types.SUBSCRIBE)
        userIds.push(action.objectId);
      return Meteor.users.find({ _id: { $in: userIds } });
    }
  };

  const actionUserReactionCursor = {
    find: function(action) {
      return Actions.find({
        type: {$in: [Actions.types.RATE, Actions.types.SHARE]},
        objectId: action._id, userId: this.userId
      })
    }
  };

  const actionCommentsCursor = {
    find: action => Actions.find({
      type: Actions.types.COMMENT, objectId: action._id,
    }),
    children: [actionUsersCursor, actionUserReactionCursor],
  };

  const actionParentCursor = {
    find: action => {
      if ([Actions.types.COMMENT, Actions.types.RATE, Actions.types.SHARE].includes(action.type))
        return Actions.find(action.objectId);
    },
    children: [actionUsersCursor],
  };
  actionParentCursor.children.push(actionParentCursor);

  export const actionChildrenCursors = [
    actionUsersCursor,
    actionUserReactionCursor,
    actionCommentsCursor,
    actionParentCursor,
  ];

  Meteor.publishComposite('actions', function (selector, limit) {
    check(selector, Object);
    check(limit, Match.Integer);

    Counts.publish(this, 'actions', Actions.find(selector));
    return {
      find: () => Actions.find(selector, { sort: {createdAt: -1}, limit: limit }),
      children: actionChildrenCursors,
    };
  });
}

if (Meteor.isClient) {
  const joinActionUsers = action => {
    action.user = Meteor.users.findOne(action.userId);
    if (!action.user) return null;
    if (action.type == Actions.types.SUBSCRIBE) {
      action.object = Meteor.users.findOne(action.objectId);
      if (!action.object) return null;
    }
    return action;
  };

  const joinActionUserReaction = action => {
    const rateAction = Actions.findOne({
      type: Actions.types.RATE,
      objectId: action._id, userId: Meteor.userId()
    });
    if (rateAction) action.currentUserRate = rateAction.rate;
    const shareAction = Actions.findOne({
      type: Actions.types.SHARE,
      objectId: action._id, userId: Meteor.userId()
    });
    action.currentUserShared = !!shareAction;
    return action;
  };

  const joinActionComments = action => {
    action.comments = Actions.find({
      type: Actions.types.COMMENT, objectId: action._id
    }, {sort: {createdAt: 1}}).fetch().filter(joinActionUsers);
    action.comments.forEach(joinActionUserReaction);
    return action;
  };

  const joinActionParent = action => {
    if ([Actions.types.COMMENT, Actions.types.RATE, Actions.types.SHARE].includes(action.type)) {
      action.object = Actions.findOne(action.objectId);
      const valid = [joinActionUsers, joinActionParent]
        .reduce((p, join) => p && join(action.object), !!action.object);
      if (!valid) return null;
    }
    return action;
  };

  export const joinAction = action => {
    const valid = [joinActionUsers, joinActionUserReaction, joinActionComments, joinActionParent]
      .reduce((p, join) => p && join(action), !!action);
    return valid ? action : null;
  };
}

Meteor.methods({
  'action.create' (description, type = Actions.types.DEFAULT) {
    check(description, String);
    check(description, Match.Where(a => a.length));
    check(type, Match.Where(a => [Actions.types.DEFAULT].includes(a)));

    if (!this.userId)
      throw new Meteor.Error('not-authorized');

    return Actions.insert({
      description,
      type,
      userId: this.userId,
    });
  },

  'action.remove' (actionId) {
    check(actionId, String);

    if (!this.userId)
      throw new Meteor.Error('not-authorized');
    const action = Actions.findOne(actionId);
    if (!action)
      throw new Meteor.Error('action-not-found');
    if (action.userId != this.userId)
      throw new Meteor.Error('forbidden');

    Actions.remove(actionId);
  },

  'action.subscribe' (userId) {
    check(userId, String);

    if (!this.userId)
      throw new Meteor.Error('not-authorized');
    const user = Meteor.users.findOne(userId);
    if (!user)
      throw new Meteor.Error('user-not-found');

    const doc = {
      type: Actions.types.SUBSCRIBE,
      objectId: userId,
      userId: this.userId,
    };
    const subscription = Actions.findOne(doc);
    if (subscription) Actions.remove(subscription._id);
    else Actions.insert(doc);
  },

  'action.comment' (actionId, description) {
    check(actionId, String);
    check(description, String);
    check(description, Match.Where(a => a.length));

    if (!this.userId)
      throw new Meteor.Error('not-authorized');
    if (!Actions.findOne(actionId))
      throw new Meteor.Error('action-not-found');

    return Actions.insert({
      type: Actions.types.COMMENT,
      objectId: actionId,
      description,
      userId: this.userId,
    });
  },

  'action.rate' (actionId, rateValue) {
    check(actionId, String);
    check(rateValue, Match.Integer);
    check(rateValue, Match.Where(a => Math.abs(a) <= 1));

    if (!this.userId)
      throw new Meteor.Error('not-authorized');
    if (!Actions.findOne(actionId))
      throw new Meteor.Error('action-not-found');

    Actions.remove({type: Actions.types.RATE, objectId: actionId, userId: this.userId});
    if (rateValue)
      return Actions.insert({
        type: Actions.types.RATE,
        userId: this.userId,
        objectId: actionId,
        rate: rateValue,
      });
  },

  'action.share' (actionId, description = '') {
    check(actionId, String);
    check(description, String);

    if (!this.userId)
      throw new Meteor.Error('not-authorized');
    if (!Actions.findOne(actionId))
      throw new Meteor.Error('action-not-found');

    return Actions.insert({
      type: Actions.types.SHARE,
      objectId: actionId,
      userId: this.userId,
      description,
    });
  },
});

Factory.define('action', Actions, {
  userId: Factory.get('user'),
  commentsCount: 0,
  rates: { up: 0, down: 0 },
  sharesCount: 0,
  createdAt: () => faker.date.past(),
});

Factory.define('action.default', Actions, Factory.extend('action', {
  type: Actions.types.DEFAULT,
  description: () => faker.lorem.sentences(faker.random.number(8) + 1),
}));

Factory.define('action.subscribe', Actions, Factory.extend('action', {
  objectId: Factory.get('user'),
  type: Actions.types.SUBSCRIBE,
}));

Factory.define('action.comment', Actions, Factory.extend('action', {
  objectId: Factory.get('action'),
  type: Actions.types.COMMENT,
  description: () => faker.lorem.sentences(faker.random.number(8) + 1),
}));

Factory.define('action.rate', Actions, Factory.extend('action', {
  objectId: Factory.get('action'),
  type: Actions.types.RATE,
  rate: () => Math.random() >= 0.5 ? 1 : -1,
}));

Factory.define('action.share', Actions, Factory.extend('action', {
  objectId: Factory.get('action'),
  type: Actions.types.SHARE,
  description: () => faker.lorem.sentences(faker.random.number(8) + 1),
}));
