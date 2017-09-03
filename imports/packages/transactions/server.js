import { Migrations } from 'meteor/percolate:migrations';

import { Actions, registerActionChildrenRequiredCursor } from '../../api/actions';
import { FeedItems } from '../../api/feeds';

import { TransactionParentActionTypes } from './index';

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
      return Meteor.users.find(action.objectId, {fields: Meteor.users.publicFields});
  }
});

registerActionChildrenRequiredCursor({
  find: action => {
    if (TransactionParentActionTypes.includes(action.type))
      return Actions.find({
        type: Actions.types.TRANSACTION,
        objectId: action._id, userId: this.userId,
      })
  }
});

Meteor.publish(null, function () {
  return Meteor.users.find(this.userId, {fields: {balance: 1}});
});

Migrations.add({
  version: 3,
  name: 'Rename objectId to extra.userId of Transaction',
  up() {
    Actions.update(
      {type: Actions.types.TRANSACTION}, {
        $rename: {objectId: 'extra.userId'},
        $unset: {objectId: null},
      }, {multi: true},
    );
  },
  down() {
    Actions.update(
      {type: Actions.types.TRANSACTION}, {
        $rename: {'extra.userId': 'objectId'},
        $unset: {'extra.userId': null},
      }, {multi: true},
    );
  }
});

Migrations.add({
  version: 4,
  name: 'Set unDeletable flag for all actions',
  up() {
    Actions.update(
      {type: {$ne: Actions.types.TRANSACTION}}, {
        $set: {unDeletable: false},
      }, {multi: true},
    );
    Actions.update(
      {type: Actions.types.TRANSACTION}, {
        $set: {unDeletable: true},
      }, {multi: true},
    );
  },
  down() {
    Actions.update({}, {$unset: {unDeletable: null}}, {multi: true});
  }
});
