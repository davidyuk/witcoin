import { Meteor } from 'meteor/meteor';
import faker from 'faker';
import { resetDatabase } from 'meteor/xolvio:cleaner';

import './users';
import { methods } from './chats';
import { Actions } from './actions';

if (Meteor.isDevelopment) {
  faker.locale = 'ru';

  Meteor.methods({
    'reset.database': resetDatabase,
    'generate.users': generateUsers,
    'generate.messages': generateMessages,
    'generate.actions': generateActions,
  });
}

function generateUsers() {
  const f = Meteor.users.find().count() + 1;
  for (let i = f; i < f + 20; i++)
    Factory.create('user', {emails: [{address: `user${i}@example.com`}]});
}

function generateMessages() {
  let users = Meteor.users.find().fetch();
  users.forEach(function(user) {
    for (let i = 0; i < 20; i++) {
      const user2Id = users[faker.random.number(users.length - 1)]._id;
      if (user._id == user2Id) return;
      const chatId = methods['chat.get'].call({userId: user._id}, [user2Id]);
      for (let i = 0; i < faker.random.number(100); i++)
        Factory.create('message', { chatId });
    }
  });
}

function generateActions() {
  Actions.remove();
  let users = Meteor.users.find();
  users.forEach(function(user) {
    for (let i = 0; i < faker.random.number(100) + 100; i++)
      Factory.create('action', { userId: user._id });
  });
}
