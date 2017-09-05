import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';

import { Actions } from '../../api/actions';
import { TaskStates } from './index';

Meteor.methods({
  'task.create' (description) {
    check(description, String);
    check(description, Match.Where(a => a.length));

    if (!this.userId)
      throw new Meteor.Error('not-authorized');

    return Actions.insert({
      description,
      type: Actions.types.TASK,
      extra: {state: TaskStates.ACTUAL, isActual: true, suggestionsCount: 0},
      userId: this.userId,
    });
  },

  'task.state' (actionId, state) {
    check(actionId, String);
    check(state, Match.Where(a => Object.values(TaskStates).includes(a)));

    if (!this.userId)
      throw new Meteor.Error('not-authorized');
    const action = Actions.findOne(actionId);
    if (!action)
      throw new Meteor.Error('task-not-found');
    if (action.type != Actions.types.TASK)
      throw new Meteor.Error('action-should-be-task');
    if (action.userId != this.userId)
      throw new Meteor.Error('forbidden');

    Actions.update(action._id, {$set: {'extra.state': state, 'extra.isActual': state == TaskStates.ACTUAL}});
  },

  'task.suggestion' (actionId, description) {
    check(actionId, String);
    check(description, String);

    if (!this.userId)
      throw new Meteor.Error('not-authorized');
    const action = Actions.findOne(actionId);
    if (!action)
      throw new Meteor.Error('task-not-found');
    if (action.type != Actions.types.TASK)
      throw new Meteor.Error('action-should-be-task');
    if (action.extra.state != TaskStates.ACTUAL)
      throw new Meteor.Error('task-should-be-actual');

    return Actions.insert({
      objectId: actionId,
      description,
      type: Actions.types.TASK_SUGGESTION,
      userId: this.userId,
    });
  },
});
