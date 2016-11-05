import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import faker from 'faker';
import petrovich from 'petrovich';
import { EasySearch } from 'meteor/easysearch:core';

Meteor.users.publicFields = {
  'profile.firstName': 1,
  'profile.lastName': 1,
  'profile.gender': 1,
};

Meteor.users.genderTypes = {
  MALE: 'male',
  FEMALE: 'female',
};

Meteor.users.schema = new SimpleSchema({
  emails: {type: Array, defaultValue: []},
  'emails.$': {type: Object},
  'emails.$.address': {type: String, regEx: SimpleSchema.RegEx.Email},
  'emails.$.verified': {type: Boolean, defaultValue: false},
  'emails.$.primary': {type: Boolean, optional: true},
  'emails.$.verifyEmailSend': {type: Boolean, optional: true},
  createdAt: {type: Date},
  profile: {
    type: new SimpleSchema({
      firstName: {type: String, defaultValue: 'Имя'},
      lastName: {type: String, defaultValue: 'Фамилия'},
      gender: {
        type: String,
        allowedValues: [Meteor.users.genderTypes.MALE, Meteor.users.genderTypes.FEMALE],
        defaultValue: Meteor.users.genderTypes.MALE,
      },
    }),
  },
  services: {type: Object, optional: true, blackbox: true},
  heartbeat: {type: Date, optional: true},
});

Meteor.users.attachSchema(Meteor.users.schema);

Meteor.users.inflectionTypes = {
  NOMINATIVE: 'nominative',
  GENITIVE: 'genitive',
  DATIVE: 'dative',
  ACCUSATIVE: 'accusative',
  INSTRUMENTAL: 'instrumental',
  PREPOSITIONAL: 'prepositional',
};

Meteor.users.index = new EasySearch.Index({
  collection: Meteor.users,
  fields: ['profile.firstName', 'profile.lastName'],
  engine: new EasySearch.MongoDB({
    transform: doc => Meteor.users._transform(doc),
    fields: () => Meteor.users.publicFields,
  }),
});

if (Meteor.isServer) {
  Meteor.publish(null, function() {
    const serviceFields = ['name', 'first_name', 'given_name', 'last_name', 'family_name', 'email'];
    const services = AccountsTemplates.oauthServices();
    if (!services.length) return this.ready();
    return Meteor.users.find(this.userId, {fields: services.reduce((p, service) => {
      serviceFields.forEach(serviceField => p[`services.${service._id}.${serviceField}`] = 1);
      return p;
    }, {})});
  });

  Meteor.publish('users.last', function () {
    Counts.publish(this, 'users', Meteor.users.find());
    return Meteor.users.find({}, {
      sort: {createdAt: -1},
      limit: 5,
      fields: {...Meteor.users.publicFields, createdAt: 1},
    });
  });
}

Meteor.users.helpers({
  isMale() {
    return this.profile.gender != Meteor.users.genderTypes.FEMALE;
  },
  getFullName(inflection = null) {
    if (inflection) {
      let u = {
        first: this.profile.firstName,
        last: this.profile.lastName,
        gender: this.isMale() ? 'male' : 'female',
      };
      u = petrovich(u, inflection);
      return [u.first, u.last].join(' ');
    }
    return [this.profile.firstName, this.profile.lastName].join(' ');
  },
});

Meteor.methods({
  'user.email.add' (email) {
    if (Meteor.isServer) Accounts.addEmail(this.userId, email);
  },
  'user.email.remove' (email) {
    if (Meteor.isServer) Accounts.removeEmail(this.userId, email);
  },
  'user.email.sendVerification' (email) {
    if (Meteor.isServer) Accounts.sendVerificationEmail(this.userId, email);
    Meteor.users.update({_id: this.userId, 'emails.address': email}, {$set: {'emails.$.verifyEmailSend': true}});
  },
  'user.email.markAsPrimary' (email) {
    Meteor.users.update({_id: this.userId, 'emails.primary': true}, {$set: {'emails.$.primary': false}});
    Meteor.users.update({_id: this.userId, emails: {$elemMatch: {address: email, verified: true}}},
      {$set: {'emails.$.primary': true}});
  },
  'user.service.remove' (serviceName) {
    if (Meteor.isServer) Accounts.unlinkService(this.userId, serviceName);
  },
});

Factory.define('user', Meteor.users, {
  emails: () => [{
    address: faker.internet.email(),
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
