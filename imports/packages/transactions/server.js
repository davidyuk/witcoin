import { Actions, registerActionChildrenRequiredCursor } from '../../api/actions';
import { FeedItems } from '../../api/feeds';

import { TransactionParentActionTypes } from './index';
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
    if (TransactionParentActionTypes.includes(action.type))
      return Actions.find({
        type: Actions.types.TRANSACTION,
        objectId: action._id, userId: this.userId,
      });
  }
});

Meteor.publish(null, function () {
  return Meteor.users.find(this.userId, {fields: {balance: 1}});
});
