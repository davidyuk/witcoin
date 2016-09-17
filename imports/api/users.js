import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import faker from 'faker';

Meteor.users.publicFields = {
  createdAt: 1,
  'profile.name': 1,
};

if (Meteor.isServer) {
  Meteor.publish('users.last', function () {
    Counts.publish(this, 'users', Meteor.users.find());
    return Meteor.users.find({}, {
      sort: {createdAt: -1},
      limit: 5,
      fields: Meteor.users.publicFields,
    });
  });

  Meteor.publish('user', function (userId) {
    check(userId, String);

    return Meteor.users.find({
      _id: userId,
    }, {
      fields: Meteor.users.publicFields,
    });
  });
}

Factory.define('user', Meteor.users, {
  emails: () => [{
    address: faker.internet.email(),
    verified: false,
  }],
  createdAt: () => faker.date.past(),
  profile: () => { return {
    name: faker.name.findName()
  }}
}).after(user => {
  Accounts.setPassword(user._id, 'password');
});
