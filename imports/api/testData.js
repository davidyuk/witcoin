import { Meteor } from 'meteor/meteor';
const faker = Meteor.isDevelopment && require('faker');
import * as fs from 'fs';

import './users';
import { Actions } from './actions';
import { Chats, Messages } from './chats';
import { generateMessage } from '../mails/report';

if (Meteor.isDevelopment) {
  faker.locale = 'ru';

  Meteor.methods({
    'generate.users': generateUsers,
    'generate.messages': generateMessages,
    'generate.actions': generateActions,
    'generate.actions.possible': generateAllPossibleActions,
    'generate.reportToFile': generateReportToFile,
  });
}

function generateUsers(n = 20) {
  const f = Meteor.users.find().count() + 1;
  for (let i = f; i < f + n; i++)
    Factory.create('user', {emails: [{address: `user${i}@example.com`}]});
}

function generateMessages() {
  const users = Meteor.users.find().fetch();
  const chats = new Set();
  users.forEach(function(user) {
    for (let i = 0; i < 20; i++) {
      const user2Id = users[faker.random.number(users.length - 1)]._id;
      if (user._id == user2Id) return;
      const chatId = Meteor.server.method_handlers['chat.get'].call({userId: user._id}, [user2Id]);
      for (let i = 0; i < faker.random.number(100); i++)
        Factory.create('message', { chatId });
      chats.add(chatId);
    }
  });
  chats.forEach(chatId =>
    Chats.update(chatId, {$set: {lastMessage: Messages.findOne({chatId}, {sort: {createdAt: -1}})}})
  );
}

function generateActions() {
  Actions.remove();
  let users = Meteor.users.find();
  users.forEach(function(user) {
    for (let i = 0; i < faker.random.number(100) + 100; i++)
      Factory.create('action.default', { userId: user._id });
  });
}

function generateAllPossibleActions(n) {
  let c = 0;
  const users = [ Factory.create('user', {emails: [{address: `user${++c}@example.com`}]}) ];
  const actions = [ Factory.create('action.default', { userId: users[0]._id }) ];

  const addLayer = () => {
    const user = Factory.create('user', {emails: [{address: `user${++c}@example.com`}]});
    actions.forEach(a => {
      actions.push(Factory.create('action.comment', { userId: user._id, objectId: a._id }));
      actions.push(Factory.create('action.rate',    { userId: user._id, objectId: a._id }));
      actions.push(Factory.create('action.share',   { userId: user._id, objectId: a._id }));
    });
    users.forEach(u =>
      actions.push(Factory.create('action.subscribe', { userId: user._id, objectId: u._id }))
    );
    users.push(user);
  };

  while (n--) addLayer();
}

function generateReportToFile(userId = this.userId) {
  if (Meteor.isServer) {
    const user = Meteor.users.findOne(userId);
    fs.writeFile('./report.html', generateMessage(user, false));
  }
}
