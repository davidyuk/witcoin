import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Actions } from './actions';

if (Meteor.isServer) {
  Meteor.publishComposite('user.page', function(userId) {
    check(userId, String);

    Counts.publish(this, 'subscribers', Actions.find({ type: Actions.types.SUBSCRIBE, objectId: userId }));
    return {
      find: () => Meteor.users.find(userId, {fields: {...Meteor.users.publicFields, createdAt: 1} }),
      children: [
        { find: user => Actions.find({ type: Actions.types.SUBSCRIBE, objectId: userId, userId: this.userId }) },
        {
          find: user => Actions.find({ type: Actions.types.SUBSCRIBE, objectId: userId }, { limit: 10 }),
          children: [{ find: action => Meteor.users.find(action.userId, {fields: Meteor.users.publicFields}) }]
        },
      ],
    };
  });
}
