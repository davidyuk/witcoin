import React from 'react';
import { expect } from 'meteor/practicalmeteor:chai';
import StubCollections from 'meteor/hwillson:stub-collections';

import { mountWithIntl as mount } from '../../../helpers/intl-enzyme-test-helper';
import { Actions } from '../../../api/actions';

import TransactionAction from './TransactionAction';

if (Meteor.isClient) {
  describe('TransactionAction', () => {
    beforeEach(() => {
      StubCollections.stub([Actions, Meteor.users]);
    });

    afterEach(() => {
      StubCollections.restore();
    });

    it('render', () => {
      const user = Factory.create('user', {}, {gender: Meteor.users.genderTypes.MALE});
      const transaction = Factory.create('transaction', {
        userId: user._id,
        objectId: Factory.create('user', {
          'profile.firstName': 'Пётр',
          'profile.lastName': 'Петров',
        }, {gender: Meteor.users.genderTypes.MALE})._id,
      });
      const item = mount(<TransactionAction action={transaction} user={user} />).render();

      expect(item.text()).string('перевёл').string('Петру Петрову');
    });

    it('render female', () => {
      const user = Factory.create('user', {}, {gender: Meteor.users.genderTypes.FEMALE});
      const transaction = Factory.create('transaction', {userId: user._id});
      const item = mount(<TransactionAction action={transaction} user={user} />).render();

      expect(item.text()).string('перевела');
    });

    it('render as notification', () => {
      const transaction = Factory.create('transaction');
      const user = Meteor.users.findOne(transaction.userId);
      const item = mount(
        <TransactionAction action={transaction} user={user} isNotification={true} />
      ).render();

      expect(item.text()).string('Вам');
    });
  });
}
