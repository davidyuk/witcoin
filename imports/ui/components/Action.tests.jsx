import React from 'react';
import { shallow } from 'enzyme';
import { expect, assert } from 'meteor/practicalmeteor:chai';
import faker from 'faker';

import Action from './Action';

if (Meteor.isClient) {
  faker.locale = 'ru';
  Meteor.userId = () => null;
  const getFullName = user => user.profile.firstName + ' ' + user.profile.lastName;

  describe('Action', () => {
    const hasCommentList = node => node.find('div.list-group').length == 1;
    const hasRateButton = node => node.find('button[title="Нравится"]').length == 1;
    const hasShareButton = node => node.find('button[title="Поделиться"]').length == 1;

    describe('default', () => {
      let action;
      beforeEach(() => {
        action = Factory.build('action.default');
        action.comments = [];
        action.user = Factory.build('user');
      });

      it('render', () => {
        const item = shallow(<Action action={action} />).render();

        assert(hasCommentList(item));
        assert(hasRateButton(item));
        assert(hasShareButton(item));
        expect(item.text()).string(getFullName(action.user)).string(action.description);
      });

      it('render shared', () => {
        const item = shallow(<Action action={action} isShared={true} />).render();

        assert(!hasCommentList(item));
        assert(!hasRateButton(item));
        assert(!hasShareButton(item));
        expect(item.text()).string(getFullName(action.user)).string(action.description);
      });
    });

    describe('subscribe', () => {
      let action;
      beforeEach(() => {
        action = Factory.build('action.subscribe');
        action.comments = [];
      });

      it('render', () => {
        action.user = Factory.build('user', {}, {gender: Meteor.users.genderTypes.MALE});
        action.object = Factory.build('user', {
          'profile.firstName': 'Пётр',
          'profile.lastName': 'Петров',
        }, {gender: Meteor.users.genderTypes.MALE});
        const item = shallow(<Action action={action} />).render();

        assert(hasCommentList(item));
        assert(hasRateButton(item));
        assert(hasShareButton(item));
        expect(item.text()).string(getFullName(action.user)).string('подписался').string('Петра Петрова');
      });

      it('render female', () => {
        action.user = Factory.build('user', {}, {gender: Meteor.users.genderTypes.FEMALE});
        action.object = Factory.build('user');
        const item = shallow(<Action action={action} />).render();

        expect(item.text()).string('подписалась');
      });

      it('render notification', () => {
        action.user = Factory.build('user');
        action.object = Factory.build('user');
        const item = shallow(<Action action={action} isNotification={true} />).render();

        expect(item.text()).string('Ваш').not.string(getFullName(action.object));
      });
    });

    describe('comment', () => {
      let action;
      beforeEach(() => {
        action = Factory.build('action.comment');
        action.comments = [];
        action.object = Factory.build('action.default');
        action.object.user = Factory.build('user');
      });

      it('render', () => {
        action.user = Factory.build('user', {}, {gender: Meteor.users.genderTypes.MALE});
        const item = shallow(<Action action={action} />).render();

        assert(hasCommentList(item));
        assert(hasRateButton(item));
        assert(hasShareButton(item));
        expect(item.text()).string(getFullName(action.user)).string('прокомментировал').string(action.description)
          .string(getFullName(action.object.user));
      });

      it('render female', () => {
        action.user = Factory.build('user', {}, {gender: Meteor.users.genderTypes.FEMALE});
        const item = shallow(<Action action={action} />).render();

        expect(item.text()).string('прокомментировала');
      });

      it('render notification', () => {
        action.user = Factory.build('user');
        const item = shallow(<Action action={action} isNotification={true} />).render();

        expect(item.text()).string('Ваш');
      });
    });

    describe('rate', () => {
      let action;
      beforeEach(() => {
        action = Factory.build('action.rate');
        action.comments = [];
        action.object = Factory.build('action.default');
        action.object.user = Factory.build('user');
      });

      it('render', () => {
        action.user = Factory.build('user', {
          'profile.firstName': 'Пётр',
          'profile.lastName': 'Петров',
        }, {gender: Meteor.users.genderTypes.MALE});
        action.rate = 1;
        const item = shallow(<Action action={action} />).render();

        assert(hasCommentList(item));
        assert(hasRateButton(item));
        assert(hasShareButton(item));
        expect(item.text()).string('Петру Петрову').string('понравилась').string(action.object.description);
      });

      it('render dislike', () => {
        action.user = Factory.build('user');
        action.rate = -1;
        const item = shallow(<Action action={action} />).render();

        expect(item.text()).string('не понравилась');
      });

      it('render notification', () => {
        action.user = Factory.build('user');
        const item = shallow(<Action action={action} isNotification={true} />).render();

        expect(item.text()).string('Ваш');
      });
    });

    describe('share', () => {
      let action;

      it('render', () => {
        action = Factory.build('action.share');
        action.comments = [];
        action.user = Factory.build('user');
        action.object = Factory.build('action.default');
        action.object.user = Factory.build('user');
        const item = shallow(<Action action={action} />).render();

        assert(hasCommentList(item));
        assert(hasRateButton(item));
        assert(hasShareButton(item));
        expect(item.text())
          .string(action.description)
          .string(action.object.description)
          .string(getFullName(action.user))
          .string(getFullName(action.object.user));
      });

      it('render multiple shares', () => {
        const generateAction = action => {
          const a = Factory.build('action.' + (action ? 'share' : 'default'));
          if (action) a.object = action;
          a.user = Factory.build('user');
          return a;
        };
        const assertAction = action => {
          expect(itemText).string(action.description).string(getFullName(action.user));
          return action.object;
        };

        const c = 8;
        for (let i = c; i > 0; --i) action = generateAction(action);
        action.comments = [];
        const item = shallow(<Action action={action} />).render();
        const itemText = item.text();
        for (let i = c; i > 0; --i) action = assertAction(action);
      });

      describe('notification', () => {
        beforeEach(() => {
          action = Factory.build('action.share');
          action.comments = [];
          action.object = Factory.build('action.default');
          action.object.user = Factory.build('user');
        });

        it('render', () => {
          action.user = Factory.build('user', {}, {gender: Meteor.users.genderTypes.MALE});
          const item = shallow(<Action action={action} isNotification={true}/>).render();

          expect(item.text()).string('поделился').string('Ваш');
        });

        it('render female', () => {
          action.user = Factory.build('user', {}, {gender: Meteor.users.genderTypes.FEMALE});
          const item = shallow(<Action action={action} isNotification={true}/>).render();

          expect(item.text()).string('поделилась');
        });
      });
    });
  });
}
