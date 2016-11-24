import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Match, check } from 'meteor/check';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
const faker = Meteor.isDevelopment && require('faker');

import { SchemaHelpers } from './common';
import './users';

export const Actions = new Mongo.Collection('actions');

Actions.after.remove((userId, doc) => Actions.remove({ objectId: doc._id }));

const updateParentActionCounter = isInc => (_, action) => {
  const d = isInc ? 1 : -1;
  switch (action.type) {
    case Actions.types.COMMENT:
      Actions.update(action.objectId, {$inc: {commentsCount: d}});
      break;
    case Actions.types.RATE:
      action.rate && Actions.update(action.objectId, {$inc: {
        ['rates.' + (action.rate == 1 ? 'up' : 'down')]: d,
        'rates.total': (action.rate == 1 ? 1 : -1) * d,
      }});
      break;
    case Actions.types.SHARE:
      Actions.update(action.objectId, {$inc: {sharesCount: d}});
      break;
  }
};

Actions.after.insert(updateParentActionCounter(true));
Actions.after.remove(updateParentActionCounter(false));

const markParentActionsAsUnDeletable = actionId => {
  if (!actionId) return;
  const action = Actions.findOne(actionId);
  if (action.unDeletable) return;
  Actions.update(actionId, {$set: {unDeletable: true}});
  if (action.type != Actions.types.SUBSCRIBE)
    markParentActionsAsUnDeletable(action.objectId);
};

Actions.before.insert((_, action) => {
  if (action.unDeletable) markParentActionsAsUnDeletable(action.objectId);
});

Actions.types = {
  DEFAULT: 'default',
  SUBSCRIBE: 'subscribe',
  COMMENT: 'comment',
  RATE: 'rate',
  SHARE: 'share',
};

Actions.relevantTypes = [Actions.types.DEFAULT, Actions.types.SHARE];
Actions.simpleTypes = [Actions.types.DEFAULT];
Actions.hasParentActionTypes = [Actions.types.COMMENT, Actions.types.RATE, Actions.types.SHARE];

Actions.typesTree = {
  'Записи': {
    'Обычные': Actions.types.DEFAULT, 'Репосты': Actions.types.SHARE,
  },
  'Ответы': {
    'Подписки': Actions.types.SUBSCRIBE, 'Оценки': Actions.types.RATE, 'Комментарии': Actions.types.COMMENT,
  },
};

Actions.notificationTypesTree = {
  'Репосты': Actions.types.SHARE,
  'Оценки': Actions.types.RATE,
  'Комментарии': Actions.types.COMMENT,
  'Другие': {
    'Подписки на Ваши обновления': Actions.types.SUBSCRIBE,
  },
};

Actions.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id, denyUpdate: true },
  userId: { type: String, regEx: SimpleSchema.RegEx.Id, denyUpdate: true },
  objectId: { type: String, regEx: SimpleSchema.RegEx.Id, denyUpdate: true, optional: true },
  description: { type: String, optional: true },
  type: { type: String, defaultValue: Actions.types.DEFAULT, denyUpdate: true,
    allowedValues: () => Object.values(Actions.types) },
  unDeletable: { type: Boolean, defaultValue: false },

  commentsCount: { type: Number, defaultValue: 0, optional: true },

  rates: { type: Object, optional: true },
  'rates.total': { type: Number, defaultValue: 0 },
  'rates.up': { type: Number, defaultValue: 0 },
  'rates.down': { type: Number, defaultValue: 0 },
  rate: { type: Number, optional: true, denyUpdate: true },

  sharesCount: { type: Number, defaultValue: 0, optional: true },

  extra: { type: Object, blackbox: true, optional: true },

  createdAt: SchemaHelpers.createdAt,
  updatedAt: SchemaHelpers.updatedAt,
  deletedAt: SchemaHelpers.deletedAt,
});

Actions.attachSchema(Actions.schema);

if (Meteor.isServer) {
  export const actionChildrenCursors = [];

  const _actionChildrenRequiredCursors = [];

  export const registerActionChildrenRequiredCursor = ActionChildrenCursor => {
    if (ActionChildrenCursor)
      _actionChildrenRequiredCursors.push(ActionChildrenCursor);

    const creatorCursor = {
      find: action => Meteor.users.find(action.userId, {fields: Meteor.users.publicFields}),
    };

    const userReactionCursor = {
      find: function(action) {
        return Actions.find({
          type: {$in: [Actions.types.RATE, Actions.types.SHARE]},
          objectId: action._id, userId: this.userId
        })
      }
    };

    const commentsCursor = {
      find: action => Actions.find({
        type: Actions.types.COMMENT, objectId: action._id,
      }),
      children: [creatorCursor, userReactionCursor],
    };

    const parentCursor = {
      find: action => {
        if (Actions.hasParentActionTypes.includes(action.type))
          return Actions.find(action.objectId);
      },
      children: [creatorCursor, ..._actionChildrenRequiredCursors],
    };
    parentCursor.children.push(parentCursor);

    actionChildrenCursors.length = 0;
    actionChildrenCursors.push(
      ..._actionChildrenRequiredCursors,
      creatorCursor,
      userReactionCursor,
      commentsCursor,
      parentCursor,
    );
  };

  registerActionChildrenRequiredCursor();

  registerActionChildrenRequiredCursor({
    find: action => {
      if (action.type == Actions.types.SUBSCRIBE)
        return Meteor.users.find(action.objectId, {fields: Meteor.users.publicFields});
    }
  });

  Meteor.publishComposite('actions', function (selector, sort, limit) {
    check(selector, Object);
    check(sort, Object);
    check(limit, Match.Integer);

    Counts.publish(this, 'actions', Actions.find(selector));
    return {
      find: () => Actions.find(selector, {sort, limit}),
      children: actionChildrenCursors,
    };
  });
}

Meteor.methods({
  'action.create' (description, type = Actions.types.DEFAULT) {
    check(description, String);
    check(description, Match.Where(a => a.length));
    check(type, Match.Where(a => Actions.simpleTypes.includes(a)));

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
    if (action.unDeletable)
      throw new Meteor.Error('this-action-cannot-be-removed');
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
