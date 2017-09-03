import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { expect, assert } from 'meteor/practicalmeteor:chai';

import { Actions } from '../../api/actions';
import { FeedItems } from '../../api/feeds';

import { TaskStates } from './index';

if (Meteor.isServer) {
  describe('tasks', () => {
    describe('methods', () => {
      describe('task.create', () => {
        const createTask = Meteor.server.method_handlers['task.create'];
        const testTask = 'Test task.';

        it('fail when current user not logged in', () => {
          assert.throws(() => {
            createTask.call({}, testTask);
          }, Meteor.Error, 'not-authorized');
        });

        it('create', () => {
          const userId = Factory.create('user')._id;
          createTask.call({userId}, testTask);

          const action = Actions.findOne({userId});
          expect(action.type).to.equal(Actions.types.TASK);
          expect(action.description).to.equal(testTask);
          expect(action.extra).to.eql({state: TaskStates.ACTUAL, isActual: true, suggestionsCount: 0});
        });
      });

      describe('task.state', () => {
        const taskState = Meteor.server.method_handlers['task.state'];

        it('fail when current user not logged in', () => {
          assert.throws(() => taskState.call({}, Factory.create('task')._id, TaskStates.SUCCEED)
            , Meteor.Error, 'not-authorized');
        });

        it('fail when change state of uncreated task', () => {
          const userId = Factory.create('user')._id;
          assert.throws(() => taskState.call({userId}, Random.id(), TaskStates.SUCCEED)
            , Meteor.Error, 'task-not-found');
        });

        it('fail when change state of not a task', () => {
          const userId = Factory.create('user')._id;
          const taskId = Factory.create('action.default')._id;
          assert.throws(() => taskState.call({userId}, taskId, TaskStates.SUCCEED)
            , Meteor.Error, 'action-should-be-task');
        });

        it('fail when change task state of another user', () => {
          const taskId = Factory.create('task')._id;
          const userId = Factory.create('user')._id;
          assert.throws(() => taskState.call({userId}, taskId, TaskStates.SUCCEED)
            , Meteor.Error, 'forbidden');
        });

        it('change task state', () => {
          const task = Factory.create('task', {extra: {state: TaskStates.ACTUAL}});
          taskState.call({userId: task.userId}, task._id, TaskStates.SUCCEED);

          const createdTask = Actions.findOne(task._id);
          expect(createdTask.extra.state).to.equal(TaskStates.SUCCEED);
          expect(createdTask.extra.isActual).to.equal(false);
        });
      });

      describe('task.suggestion', () => {
        const taskSuggestion = Meteor.server.method_handlers['task.suggestion'];
        const testTaskSuggestion = 'Test task suggestion.';

        it('fail when current user not logged in', () => {
          assert.throws(() => taskSuggestion.call({}, Factory.create('task')._id, testTaskSuggestion)
            , Meteor.Error, 'not-authorized');
        });

        it('fail when add suggestion for uncreated task', () => {
          const userId = Factory.create('user')._id;
          assert.throws(() => taskSuggestion.call({userId}, Random.id(), testTaskSuggestion)
            , Meteor.Error, 'task-not-found');
        });

        it('fail when add suggestion for not a task', () => {
          const userId = Factory.create('user')._id;
          const taskId = Factory.create('action.default')._id;
          assert.throws(() => taskSuggestion.call({userId}, taskId, testTaskSuggestion)
            , Meteor.Error, 'action-should-be-task');
        });

        it('fail when add suggestion for not actual task', () => {
          const userId = Factory.create('user')._id;
          const taskId = Factory.create('task', {extra: {state: TaskStates.FAILED}})._id;
          assert.throws(() => taskSuggestion.call({userId}, taskId, testTaskSuggestion)
            , Meteor.Error, 'task-should-be-actual');
        });

        it('add suggestion', () => {
          const taskId = Factory.create('task', {extra: {state: TaskStates.ACTUAL, suggestionsCount: 0}})._id;
          const userId = Factory.create('user')._id;
          const suggestionId = taskSuggestion.call({userId}, taskId, testTaskSuggestion);

          const suggestion = Actions.findOne(suggestionId);
          expect(suggestion.type).to.equal(Actions.types.TASK_SUGGESTION);
          expect(suggestion.description).to.equal(testTaskSuggestion);
          expect(suggestion.userId).to.equal(userId);
          expect(suggestion.objectId).to.equal(taskId);
          expect(Actions.findOne(taskId).extra.suggestionsCount).to.equal(1);
        });

        it('count suggestions', () => {
          const removeAction = Meteor.server.method_handlers['action.remove'];
          const taskId = Factory.create('task')._id;
          const assertSuggestionCount = count =>
            expect(Actions.findOne(taskId).extra.suggestionsCount).to.equal(count);

          assertSuggestionCount(0);
          const suggestion1 = Factory.create('task.suggestion', {objectId: taskId});
          assertSuggestionCount(1);
          const suggestion2 = Factory.create('task.suggestion', {objectId: taskId});
          assertSuggestionCount(2);
          removeAction.call({userId: suggestion2.userId}, suggestion2._id);
          assertSuggestionCount(1);
          removeAction.call({userId: suggestion1.userId}, suggestion1._id);
          assertSuggestionCount(0);
        });
      });
    });

    it('create notification', () => {
      const suggestion = Factory.create('task.suggestion');
      const task = Actions.findOne(suggestion.objectId);
      const notification = FeedItems.findOne({userId: task.userId, isNotification: true});
      expect(notification).not.to.equal(undefined);
      expect(notification.actionId).to.equal(suggestion._id);
    });
  });
}
