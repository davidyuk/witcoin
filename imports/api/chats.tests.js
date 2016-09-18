import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { expect, assert } from 'meteor/practicalmeteor:chai';

import { Messages, Chats, methods } from './chats';
import './users';

if (Meteor.isServer) {
  describe('chats', () => {
    describe('factory', () => {
      it('chat', () => {
        const chat = Factory.create('chat');
        expect(Chats.findOne(chat._id)).is.an('object');
      });

      it('message', () => {
        const message = Factory.create('message');
        expect(Messages.findOne(message._id)).is.an('object');
      });
    });

    describe('methods', () => {
      describe('chat.get', () => {
        const getChat = methods['chat.get'];

        it('fail when current user not logged in', () => {
          const user = Factory.create('user');
          assert.throws(() => {
            getChat.call({}, [user._id]);
          }, Meteor.Error, 'not-authorized');
        });

        describe('fail with invalid-user-ids exception when', () => {
          let userId, userIds;

          beforeEach(() => {
            userId = Factory.create('user')._id;
            userIds = [...(new Array(3)).keys()].map(() => Factory.create('user')._id);
          });

          it('random id in user ids', () =>
            userIds.push(Random.id())
          );

          it('current user id in users ids', () =>
            userIds.push(userId)
          );

          it('user id duplicates in users ids', () =>
            userIds.push(userIds[0])
          );

          afterEach(() =>
            assert.throws(() => getChat.call({userId}, userIds), Meteor.Error, 'invalid-user-ids')
          );
        });

        it('create and then get same chat', () => {
          const userId = Factory.create('user')._id;
          const userIds = [...(new Array(3)).keys()].map(() => Factory.create('user')._id);
          const chatId = getChat.call({userId}, userIds);
          expect(Chats.findOne(chatId)).is.an('object');
          expect(chatId).to.equal(getChat.call({userId}, userIds));
        });

        it('create separate chats with same user ids by different current users', () => {
          const user1Id = Factory.create('user')._id;
          const user2Id = Factory.create('user')._id;
          expect(user1Id).not.to.equal(user2Id);
          const userIds = [...(new Array(3)).keys()].map(() => Factory.create('user')._id);
          const chat1Id = getChat.call({userId: user1Id}, userIds);
          const chat2Id = getChat.call({userId: user2Id}, userIds);
          expect(chat1Id).not.to.equal(chat2Id);
        });
      });

      const testMessage = 'Test message.';
      describe('message.create', () => {
        const createMessage = methods['message.create'];

        it('fail when current user not logged in', () => {
          assert.throws(() => createMessage.call({}, Factory.create('chat')._id, testMessage)
            , Meteor.Error, 'not-authorized');
        });

        it('fail when create in not exist chat', () => {
          const userId = Factory.create('user')._id;
          assert.throws(() => createMessage.call({userId}, Random.id(), testMessage)
            , Meteor.Error, 'chat-not-found');
        });

        it('fail when create in foreign chat', () => {
          const chatId = Factory.create('chat')._id;
          const userId = Factory.create('user')._id;
          assert.throws(() => createMessage.call({userId}, chatId, testMessage)
            , Meteor.Error, 'forbidden');
        });

        it('create', () => {
          const chat = Factory.create('chat');
          const userId = chat.userIds[0];
          createMessage.call({userId}, chat._id, testMessage);
          const messages = Messages.find({chatId: chat._id, userId}).fetch();
          expect(messages.length).to.equal(1);
          expect(messages[0].content).to.equal(testMessage);
        });
      });

      describe('message.edit', () => {
        const editMessage = methods['message.edit'];

        it('fail when current user not logged in', () => {
          assert.throws(() => editMessage.call({}, Factory.create('message')._id, testMessage)
            , Meteor.Error, 'not-authorized');
        });

        it('fail when edit not exist message', () => {
          const userId = Factory.create('user')._id;
          assert.throws(() => editMessage.call({userId}, Random.id(), testMessage)
            , Meteor.Error, 'message-not-found');
        });

        it('fail when edit not own message', () => {
          const messageId = Factory.create('message')._id;
          const userId = Factory.create('user')._id;
          assert.throws(() => editMessage.call({userId}, messageId, testMessage)
            , Meteor.Error, 'forbidden');
        });

        it('edit', () => {
          const userId = Factory.create('user')._id;
          const messageId = Factory.create('message', {userId})._id;
          editMessage.call({userId}, messageId, testMessage);
          expect(Messages.findOne(messageId).content).to.equal(testMessage);
        });
      });

      describe('message.remove', () => {
        const removeMessage = methods['message.remove'];

        it('fail when current user not logged in', () => {
          assert.throws(() => removeMessage.call({}, Factory.create('message')._id)
            , Meteor.Error, 'not-authorized');
        });

        it('fail when edit not exist message', () => {
          const userId = Factory.create('user')._id;
          assert.throws(() => removeMessage.call({userId}, Random.id())
            , Meteor.Error, 'message-not-found');
        });

        it('fail when edit not own message', () => {
          const messageId = Factory.create('message')._id;
          const userId = Factory.create('user')._id;
          assert.throws(() => removeMessage.call({userId}, messageId)
            , Meteor.Error, 'forbidden');
        });

        it('remove', () => {
          const userId = Factory.create('user')._id;
          const messageId = Factory.create('message', {userId})._id;
          expect(Messages.findOne(messageId).deletedAt).to.equal(undefined);
          removeMessage.call({userId}, messageId);
          expect(Messages.findOne(messageId).deletedAt).not.to.equal(undefined);
        });
      });
    });
  });
}
