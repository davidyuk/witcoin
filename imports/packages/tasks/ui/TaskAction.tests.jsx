import React from 'react';
import { expect } from 'meteor/practicalmeteor:chai';
import StubCollections from 'meteor/hwillson:stub-collections';
import { mountWithIntl as mount } from '../../../helpers/intl-enzyme-test-helper';

import { Actions } from '../../../api/actions';

import { TaskStates } from '../index';
import TaskAction from './TaskAction';

if (Meteor.isClient) {
  describe('TaskAction', () => {
    beforeEach(() => {
      StubCollections.stub([Actions, Meteor.users]);
    });

    afterEach(() => {
      StubCollections.restore();
    });

    it('render', () => {
      const user = Factory.create('user', {}, {gender: Meteor.users.genderTypes.MALE});
      const task = Factory.create('task', {userId: user._id});
      const item = mount(<TaskAction action={task} user={user} />).render();

      expect(item.text()).string('добавил задание');
    });

    it('render female', () => {
      const user = Factory.create('user', {}, {gender: Meteor.users.genderTypes.FEMALE});
      const task = Factory.create('task', {userId: user._id});
      const item = mount(<TaskAction action={task} user={user} />).render();

      expect(item.text()).string('добавила задание');
    });

    it('render as base type', () => {
      const task = Factory.create('task', {extra: {state: TaskStates.ACTUAL, suggestionsCount: 42}});
      const user = Meteor.users.findOne(task.userId);
      const item = mount(<TaskAction action={task} user={user} baseType={Actions.types.TASK} />).render();

      expect(item.text())
        .string('Актуально')
        .string(task.extra.suggestionsCount)
        .string('предложен')
        .not.string('добавил');
    });
  });
}
