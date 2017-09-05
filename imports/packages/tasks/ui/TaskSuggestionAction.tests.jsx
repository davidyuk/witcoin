import React from 'react';
import { expect } from 'meteor/practicalmeteor:chai';
import StubCollections from 'meteor/hwillson:stub-collections';
import { mount } from 'enzyme';

import { Actions } from '../../../api/actions';

import TaskSuggestionAction from './TaskSuggestionAction';

if (Meteor.isClient) {
  describe('TaskSuggestionAction', () => {
    beforeEach(() => {
      StubCollections.stub([Actions, Meteor.users]);
    });

    afterEach(() => {
      StubCollections.restore();
    });

    it('render', () => {
      const user = Factory.create('user', {}, {gender: Meteor.users.genderTypes.MALE});
      const task = Factory.create('task.suggestion', {userId: user._id});
      const item = mount(<TaskSuggestionAction action={task} user={user} />).render();

      expect(item.text()).string('заданию').string('добавил предложение');
    });

    it('render female', () => {
      const user = Factory.create('user', {}, {gender: Meteor.users.genderTypes.FEMALE});
      const task = Factory.create('task.suggestion', {userId: user._id});
      const item = mount(<TaskSuggestionAction action={task} user={user} />).render();

      expect(item.text()).string('добавила');
    });

    it('render as notification', () => {
      const task = Factory.create('task.suggestion');
      const user = Meteor.users.findOne(task.userId);
      const item = mount(
        <TaskSuggestionAction action={task} user={user} isNotification={true} />
      ).render();

      expect(item.text()).string('Ваш');
    });

    it('render as base type', () => {
      const task = Factory.create('task.suggestion');
      const user = Meteor.users.findOne(task.userId);
      const item = mount(
        <TaskSuggestionAction action={task} user={user} baseType={Actions.types.TASK_SUGGESTION} />
      ).render();

      expect(item.text()).not.string('добавил');
    });
  });
}
