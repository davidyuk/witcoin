import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Match, check } from 'meteor/check';

export const Chats = new Mongo.Collection('chats');

class MessagesCollection extends Mongo.Collection {
  insert(message, callback) {
    Chats.update(message.chatId, { $set: { lastMessage: message } });
    return super.insert(message, callback);
  }
}

export const Messages = new MessagesCollection('messages');

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
      createdAt: new Date(),
      content,
    });
  },
});
