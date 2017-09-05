import { Actions, registerActionChildrenRequiredCursor, actionChildrenCursors } from '../../api/actions';
import { FeedItems } from '../../api/feeds';

import { registeredTransactionParentTypes } from './internal';
import { Reserves } from './reserves';
import './migrations';

Actions.after.insert((userId, doc) => {
  if (doc.type == Actions.types.TRANSACTION) {
    FeedItems.insertBasedOnAction(doc, {
      userId: doc.extra.userId,
      isNotification: true,
    });
  }
});

registerActionChildrenRequiredCursor({
  find: action => {
    if (Actions.types.TRANSACTION == action.type)
      return Meteor.users.find(action.extra.userId, {fields: Meteor.users.publicFields});
  }
});

registerActionChildrenRequiredCursor({
  find: function(action) {
    if (registeredTransactionParentTypes.includes(action.type))
      return Actions.find({
        type: Actions.types.TRANSACTION,
        objectId: action._id, userId: this.userId,
      });
  }
});

Meteor.publish(null, function () {
  return Meteor.users.find(this.userId, {fields: {balance: 1, reserve: 1}});
});

Meteor.publishComposite('reserves', function () {
  return {
    find: () => Reserves.find({userId: this.userId}),
    children: [{
      find: reserve => Actions.find({'extra.reserveId': reserve._id}),
      children: actionChildrenCursors,
    }],
  };
});
