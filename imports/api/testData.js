import { Meteor } from 'meteor/meteor';
import faker from 'faker';
import { resetDatabase } from 'meteor/xolvio:cleaner';

import './users';

if (Meteor.isDevelopment) {
  faker.locale = 'ru';

  Meteor.methods({
    'reset.database': resetDatabase,
    'generate.users': generateUsers,
  });
}

function generateUsers() {
  const f = Meteor.users.find().count() + 1;
  for (let i = f; i < f + 20; i++)
    Factory.create('user', {emails: [{address: `user${i}@example.com`}]});
}
