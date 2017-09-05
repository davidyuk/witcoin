import { Migrations } from 'meteor/percolate:migrations';

import { Actions } from '../../api/actions';
import { FeedItems } from '../../api/feeds';

import { TaskStates } from './index';

Actions.after.insert((_, action) => {
  if (action.type == Actions.types.TASK_SUGGESTION) {
    FeedItems.insertBasedOnAction(action, {
      userId: Actions.findOne(action.objectId).userId,
      isNotification: true,
    });
  }
});

Migrations.add({
  version: 2,
  name: 'Add extra.isActual to Task',
  up() {
    Actions.find({type: Actions.types.TASK}).map(a =>
      Actions.update(a._id, {$set: {'extra.isActual': a.extra.state == TaskStates.ACTUAL}})
    );
  },
  down() {
    Actions.update({type: Actions.types.TASK}, {$unset: {'extra.isActual': ''}});
  }
});
