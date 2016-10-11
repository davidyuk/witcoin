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
    }
    return docId;
  }

  remove(selector, callback) {
    Actions.find(selector).forEach(action => {
      NewsItems.remove({ actionId: action._id });
      NotifyItems.remove({ actionId: action._id });

      switch (action.type) {
        case Actions.types.SUBSCRIBE:
          NewsItems.remove({ userId: action.userId, authorId: action.objectId });
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
};

Actions.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id, denyUpdate: true },
  userId: { type: String, regEx: SimpleSchema.RegEx.Id, denyUpdate: true },
  objectId: { type: String, regEx: SimpleSchema.RegEx.Id, denyUpdate: true, optional: true },
  description: { type: String, optional: true },
  type: { type: String, defaultValue: Actions.types.DEFAULT, denyUpdate: true },
  createdAt: SchemaHelpers.createdAt,
  updatedAt: SchemaHelpers.updatedAt,
  deletedAt: SchemaHelpers.deletedAt,
});

Actions.attachSchema(Actions.schema);

if (Meteor.isServer) {
  export const actionChildrenCursors = [{
    find: action => {
      const userIds = [action.userId];
      if (action.type == Actions.types.SUBSCRIBE)
        userIds.push(action.objectId);
      return Meteor.users.find({ _id: { $in: userIds } });
    }
  }];

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
  export const joinAction = action => {
    if (!action) return null;
    let valid;
    action.user = Meteor.users.findOne(action.userId) || (valid = null);
    if (action.type == Actions.types.SUBSCRIBE)
      action.object = Meteor.users.findOne(action.objectId) || (valid = null);

    if (valid === null) return null;
    return action;
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
});

Factory.define('action', Actions, {
  userId: Factory.get('user'),
  description: () => faker.lorem.sentences(faker.random.number(8) + 1),
  createdAt: () => faker.date.past(),
});
