import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Match, check } from 'meteor/check';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import faker from 'faker';

import { SchemaHelpers } from './common';
import './users';

export const Actions = new Mongo.Collection('actions');

Actions.types = {
  DEFAULT: 'default',
};

Actions.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id, denyUpdate: true },
  userId: { type: String, regEx: SimpleSchema.RegEx.Id, denyUpdate: true },
  description: { type: String },
  type: { type: String, defaultValue: Actions.types.DEFAULT, denyUpdate: true },
  createdAt: SchemaHelpers.createdAt,
  updatedAt: SchemaHelpers.updatedAt,
  deletedAt: SchemaHelpers.deletedAt,
});

Actions.attachSchema(Actions.schema);

if (Meteor.isServer) {
  Meteor.publish('actions', function (selector, limit) {
    check(selector, Object);
    check(limit, Match.Integer);

    Counts.publish(this, 'actions', Actions.find(selector));
    return Actions.find(selector, {
      sort: {createdAt: -1},
      limit: limit,
    });
  });
}

export const methods = {
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
};

Meteor.methods(methods);

Factory.define('action', Actions, {
  userId: Factory.get('user'),
  description: () => faker.lorem.sentences(faker.random.number(8) + 1),
  createdAt: () => faker.date.past(),
});
