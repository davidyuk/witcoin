import React from 'react';
import { expect } from 'meteor/practicalmeteor:chai';
import StubCollections from 'meteor/hwillson:stub-collections';
import { mount } from 'enzyme';

import { Actions } from '../../../api/actions';

import ServiceAction from './ServiceAction';
import '../index';

if (Meteor.isClient) {
  describe('ServiceAction', () => {
    beforeEach(() => {
      StubCollections.stub([Actions, Meteor.users]);
    });

    afterEach(() => {
      StubCollections.restore();
    });

    it('render', () => {
      const user = Factory.create('user', {}, {gender: Meteor.users.genderTypes.MALE});
      const service = Factory.create('service', {userId: user._id});
      const item = mount(<ServiceAction action={service} user={user} />).render();

      expect(item.text()).string('опубликовал услугу');
    });

    it('render female', () => {
      const user = Factory.create('user', {}, {gender: Meteor.users.genderTypes.FEMALE});
      const service = Factory.create('service', {userId: user._id});
      const item = mount(<ServiceAction action={service} user={user} />).render();

      expect(item.text()).string('опубликовала услугу');
    });

    it('render as base type', () => {
      const service = Factory.create('service');
      const user = Meteor.users.findOne(service.userId);
      const item = mount(<ServiceAction action={service} user={user} baseType={Actions.types.SERVICE} />).render();

      expect(item.text()).not.string('опубликовал');
    });
  });
}
