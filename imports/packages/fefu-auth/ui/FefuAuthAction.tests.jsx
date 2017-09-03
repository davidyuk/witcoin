import React from 'react';
import { expect } from 'meteor/practicalmeteor:chai';
import StubCollections from 'meteor/hwillson:stub-collections';
import { mount } from 'enzyme';

import { Actions } from '../../../api/actions';

import '../index';
import FefuAuthAction from './FefuAuthAction';

if (Meteor.isClient) {
  describe('FefuAuthAction', () => {
    beforeEach(() => {
      StubCollections.stub([Actions, Meteor.users]);
    });

    afterEach(() => {
      StubCollections.restore();
    });

    it('render', () => {
      const user = Factory.create('user', {}, {gender: Meteor.users.genderTypes.MALE});
      const fefuAuth = Factory.create('fefuAuth', {userId: user._id});
      const item = mount(<FefuAuthAction action={fefuAuth} user={user} />).render();

      expect(item.text())
        .string('подтвердил, что является студентом ДВФУ')
        .string(fefuAuth.extra.fefuUserName);
    });

    it('render female', () => {
      const user = Factory.create('user', {}, {gender: Meteor.users.genderTypes.FEMALE});
      const fefuAuth = Factory.create('fefuAuth', {userId: user._id});
      const item = mount(<FefuAuthAction action={fefuAuth} user={user} />).render();

      expect(item.text()).string('подтвердила');
    });
  });
}
