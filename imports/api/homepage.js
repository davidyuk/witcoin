import { Meteor } from 'meteor/meteor';

import { Messages } from './chats';

if (Meteor.isServer) {
  Meteor.publish('homePage.counters', function() {
    Counts.publish(this, 'users', Meteor.users.find());
    Counts.publish(this, 'messages', Messages.find());
  });

  Meteor.publish('homePage.users.last', () =>
    Meteor.users.find({}, {
      sort: {createdAt: -1},
      limit: 5,
      fields: {...Meteor.users.publicFields, createdAt: 1},
    })
  );
}
