import { Meteor } from 'meteor/meteor';
import { UserStatus } from 'meteor/mizzao:user-status';

import { Messages } from './chats';

if (Meteor.isServer) {
  Meteor.publish('homePage.counters', function() {
    Counts.publish(this, 'users', Meteor.users.find());
    Counts.publish(this, 'users.online', Meteor.users.find({'status.online': true}));
    Counts.publish(this, 'messages', Messages.find());
    Counts.publish(this, 'connections', UserStatus.connections.find());
  });

  Meteor.publish('homePage.users.last', () =>
    Meteor.users.find({}, {
      sort: {createdAt: -1},
      limit: 5,
      fields: {...Meteor.users.publicFields, createdAt: 1},
    })
  );

  Meteor.publish('homePage.users.online', () =>
    Meteor.users.find({'status.online': true}, {
      limit: 5,
      fields: Meteor.users.publicFields,
    })
  );
}
