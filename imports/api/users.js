import { Meteor } from 'meteor/meteor';
import faker from 'faker';

Meteor.users.publicFields = {
  createdAt: 1,
  'profile.firstName': 1,
  'profile.lastName': 1,
  'profile.gender': 1,
};

Meteor.users.genderTypes = {
  MALE: 'male',
  FEMALE: 'female',
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
}

Factory.define('user', Meteor.users, {
  emails: () => [{
    address: faker.internet.email(),
    verified: false,
  }],
  createdAt: () => faker.date.past(),
  profile: (api, userOptions) => {
    const gender = userOptions.gender || Meteor.users.genderTypes[Math.random() >= 0.5 ? 'MALE' : 'FEMALE'];
    return {
      gender,
      firstName: faker.name.firstName(+ (gender == Meteor.users.genderTypes.FEMALE)),
      lastName: faker.name.lastName(+ (gender == Meteor.users.genderTypes.FEMALE)),
    };
  }
}).after(user => {
  Accounts.setPassword(user._id, 'password');
});
