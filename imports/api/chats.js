import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Match, check } from 'meteor/check';

import { SchemaHelpers } from './common';
import faker from 'faker';

export const Chats = new Mongo.Collection('chats');

Chats.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id },
  userIds: { type: [String], minCount: 1 },
  'userIds.$': { type: String, regEx: SimpleSchema.RegEx.Id },
  lastMessage: { type: Object, blackbox: true, optional: true },
});

Chats.attachSchema(Chats.schema);

class MessagesCollection extends Mongo.Collection {
  insert(message, callback) {
    function callbackWrap(err, recordId) {
      if (!err)
        Chats.update(message.chatId, { $set: { lastMessage: Messages.findOne(recordId) } });
      if (callback) callback.apply(this, arguments);
    }
    return super.insert(message, callbackWrap);
  }
}

export const Messages = new MessagesCollection('messages');

Messages.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id },
  chatId: { type: String, regEx: SimpleSchema.RegEx.Id },
  userId: { type: String, regEx: SimpleSchema.RegEx.Id },
  content: { type: String },
  createdAt: SchemaHelpers.createdAt,
  updatedAt: SchemaHelpers.updatedAt,
  deletedAt: SchemaHelpers.deletedAt,
});

Messages.attachSchema(Messages.schema);

if (Meteor.isServer) {
  Meteor.publishComposite('chats', function(limit) {
    check(limit, Number);

    if (!this.userId)
      return this.ready();

    let q = {
      userIds: this.userId,
      lastMessage: { $exists: true },
    };
    Counts.publish(this, 'chats', Chats.find(q));
    return {
      find: () => Chats.find(q, {
        sort: {'lastMessage.createdAt': -1},
        limit: limit,
      }),
      children: [
        { find: chat => Meteor.users.find({ _id: { $in: chat.userIds } }) },
      ],
    };
  });

  Meteor.publishComposite('chat', function(chatId, limit) {
    check(chatId, String);
    check(limit, Number);

    if (!this.userId)
      return this.ready();
    let chat = Chats.findOne(chatId);
    if (!chat || chat.userIds.indexOf(this.userId) == -1)
      return this.ready();

    return {
      find: () => Chats.find({
        _id: chatId,
        userIds: this.userId,
      }),
      children: [
        { find: chat => Meteor.users.find({ _id: { $in: chat.userIds } }) },
        { find: chat => Messages.find({ chatId: chat._id }, { sort: {createdAt: -1}, limit: limit }) },
      ]
    };
  });
}

Meteor.methods({
  'chat.get' (pairIds) {
    check(pairIds, [String]);
    check(pairIds, Match.Where(a => a.length));

    if (!this.userId)
      throw new Meteor.Error('not-authorized');

    const userIds = [this.userId, ...pairIds].sort();

    if (Meteor.users.find({_id: {'$in': userIds}}).count() != pairIds.length + 1)
      throw new Meteor.Error('invalid-user-ids');

    const chat = Chats.findOne({userIds});
    return chat ? chat._id : Chats.insert({userIds});
  },

  'message.create' (chatId, content) {
    check(chatId, String);
    check(content, String);
    check(content, Match.Where(a => a.length));

    if (!this.userId)
      throw new Meteor.Error('not-authorized');
    const chat = Chats.findOne(chatId);
    if (!chat)
      throw new Meteor.Error('chat-not-found');
    if (chat.userIds.indexOf(this.userId) == -1)
      throw new Meteor.Error('forbidden');

    Messages.insert({
      chatId,
      userId: this.userId,
      content,
    });
  },
});

Factory.define('chat', Chats, {
  userIds: [Factory.get('user'), Factory.get('user')],
});

Factory.define('message', Messages, {
  chatId: function() {
    return Meteor.users.findOne(this.userId)
      ? Factory.create('chat', {userIds: [this.userId, Factory.get('user')]})._id
      : Factory.get('chat');
  },
  content: () => faker.lorem.sentences(faker.random.number(8) + 1),
  createdAt: () => faker.date.past(),
  userId: function() {
    const chat = Chats.findOne(this.chatId);
    return chat
      ? chat.userIds[faker.random.number(chat.userIds.length - 1)]
      : Factory.get('user');
  },
});
