import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { expect, assert } from 'meteor/practicalmeteor:chai';

import { getActions, getMessages } from './report';
import { FeedItems } from '../api/feeds';
import { Actions } from '../api/actions';
import { Chats, Messages } from '../api/chats';

if (Meteor.isServer) {
  describe('mail report', () => {
    describe('getActions', () => {
      it('notifications', () => {
        const user = Factory.create('user');
        const items = [];
        items.push(Factory.create('notification', {userId: user._id, createdAt: new Date(0)}));
        items.push(Factory.create('notification', {userId: user._id, createdAt: new Date(1000)}));
        items.push(Factory.create('notification', {userId: user._id, isRead: true}));
        items.push(Factory.create('notification', {userId: user._id, isMailed: true}));

        const res = getActions(user._id, true);

        expect(res.length).is.eq(2);
        expect(res[0]._id).is.eq(items[1].actionId);
        expect(res[1]._id).is.eq(items[0].actionId);
        [items[0]._id, items[1]._id].forEach(feedItemId => {
          const feedItem = FeedItems.findOne(feedItemId);
          expect(feedItem.isRead).is.eq(false);
          expect(feedItem.isMailed).is.eq(true);
        });
        expect(FeedItems.findOne(items[2]._id).isMailed).is.eq(false);
        expect(FeedItems.findOne(items[3]._id).isRead).is.eq(false);
      });

      it('filter not relevant newsItems', () => {
        const feedItem = Factory.create('newsItem', {type: Actions.types.COMMENT});

        const res = getActions(feedItem.userId, false);
        expect(res.length).is.eq(0);
        expect(FeedItems.findOne(feedItem._id).isMailed).is.eq(false);
      });

      it('don\'t mark as mailed', () => {
        const feedItem = Factory.create('notification');

        const res = getActions(feedItem.userId, true, false);
        expect(res.length).is.eq(1);
        expect(FeedItems.findOne(feedItem._id).isMailed).is.eq(false);
      });
    });

    describe('getMessages', () => {
      const getChatLastMessageId = (userId, isOwnLastMessage, lastMessageProps = {}) => {
        const user2Id = Factory.create('user')._id;
        const chatId = Factory.create('chat', {userIds: [userId, user2Id].sort()})._id;
        return Factory.create('message', {
          ...lastMessageProps, chatId, userId: isOwnLastMessage ? userId: user2Id,
        })._id;
      };

      it('mark as mailed', () => {
        const userId = Factory.create('user')._id;

        const lastMessagesId = [];
        lastMessagesId.push(getChatLastMessageId(userId, false, {createdAt: new Date(0)}));
        lastMessagesId.push(getChatLastMessageId(userId, false, {createdAt: new Date(1000)}));
        lastMessagesId.push(getChatLastMessageId(userId, true));
        lastMessagesId.push(getChatLastMessageId(userId, false, {isRead: true}));
        lastMessagesId.push(getChatLastMessageId(userId, false, {isMailed: true}));

        const res = getMessages(userId);
        expect(res.length).is.eq(2);
        expect(res[0]._id).is.eq(lastMessagesId[1]);
        expect(res[1]._id).is.eq(lastMessagesId[0]);
        res.forEach(message => {
          const chat = Chats.findOne({'lastMessage._id': message._id});
          expect(chat.lastMessage.isRead).is.eq(false);
          expect(chat.lastMessage.isMailed).is.eq(true);
        });
        const ownMessage = Chats.findOne({'lastMessage._id': lastMessagesId[2]}).lastMessage;
        expect(ownMessage.isRead).is.eq(false);
        expect(ownMessage.isMailed).is.eq(false);
        expect(Chats.findOne({'lastMessage._id': lastMessagesId[3]}).lastMessage.isMailed).is.eq(false);
        expect(Chats.findOne({'lastMessage._id': lastMessagesId[4]}).lastMessage.isRead).is.eq(false);
      });

      it('don\'t mark as mailed', () => {
        const userId = Factory.create('user')._id;
        const messageId = getChatLastMessageId(userId, false);

        let res = getMessages(userId, false);
        expect(res.length).is.eq(1);
        expect(Chats.findOne({'lastMessage._id': messageId}).lastMessage.isMailed).is.eq(false);
        res = getMessages(userId);
        expect(res.length).is.eq(1);
        expect(Chats.findOne({'lastMessage._id': messageId}).lastMessage.isMailed).is.eq(true);
      });
    });
  });
}
