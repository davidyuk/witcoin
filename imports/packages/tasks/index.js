import { Meteor } from 'meteor/meteor';
import React from 'react';

import { Actions } from '../../api/actions';
import Action from '../../ui/components/Action';

import { registerTransactionParentType } from '../transactions';

import TaskAction from './ui/TaskAction';
import TaskSuggestionAction from './ui/TaskSuggestionAction';

Actions.types.TASK = 'task';
Actions.types.TASK_SUGGESTION = 'task_suggestion';

Actions.relevantTypes.push(Actions.types.TASK);
Actions.typesTree['Другие'] = [];
Actions.typesTree['Другие']['Задания'] = Actions.types.TASK;
Actions.typesTree['Ответы']['Предложения к заданиям'] = Actions.types.TASK_SUGGESTION;
Actions.notificationTypesTree['Другие']['Предложения к Вашим заданиям'] = Actions.types.TASK_SUGGESTION;

registerTransactionParentType(Actions.types.TASK_SUGGESTION);

export const TaskStates = {
  ACTUAL: 'actual',
  SUCCEED: 'succeed',
  FAILED: 'failed',
};

const updateParentTaskCounter = isInc => (_, action) => {
  if (action.type == Actions.types.TASK_SUGGESTION)
    Actions.update(action.objectId, {$inc: {'extra.suggestionsCount': isInc ? 1 : -1}});
};

Actions.after.insert(updateParentTaskCounter(true));
Actions.after.remove(updateParentTaskCounter(false));

Action.registerActionRender(Actions.types.TASK, TaskAction);
Action.registerActionRender(Actions.types.TASK_SUGGESTION, TaskSuggestionAction);

require('./api');

if (Meteor.isClient) require('./client');
if (Meteor.isServer) require('./server');

Factory.define('task', Actions, Factory.extend('action.default', {
  type: Actions.types.TASK,
  extra: () => {
    const state = (a => a[Math.floor(Math.random() * a.length)])(Object.values(TaskStates));
    return {state, isActual: state == TaskStates.ACTUAL, suggestionsCount: 0};
  },
}));

Factory.define('task.suggestion', Actions, Factory.extend('action.default', {
  type: Actions.types.TASK_SUGGESTION,
  objectId: Factory.get('task'),
}));
