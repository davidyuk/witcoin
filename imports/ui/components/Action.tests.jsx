import React from 'react';
import { expect, assert } from 'meteor/practicalmeteor:chai';
import faker from 'faker';

import { mountWithIntl } from '../../helpers/intl-enzyme-test-helper';
import Action from './Action';

if (Meteor.isClient) {
  faker.locale = 'ru';
  Meteor.userId = () => null;

  function buildUser() {
    return Meteor.users._transform(Factory.build.apply(Factory, arguments));
  }

  describe('Action', () => {
    const hasCommentList = node => node.find('div.list-group').length == 1;
    const hasRateButton = node => node.find('button[title="Нравится"]').length == 1;
    const hasShareButton = node => node.find('button[title="Поделиться"]').length == 1;

    describe('default', () => {
      let action;
      beforeEach(() => {
        action = Factory.build('action.default');
        action.comments = [];
        action.user = buildUser('user');
      });

      it('render', () => {
        const item = mountWithIntl(<Action action={action} />).render();

        assert(hasCommentList(item));
        assert(hasRateButton(item));
        assert(hasShareButton(item));
        expect(item.text()).string(action.user.getFullName()).string(action.description);
      });

      it('render shared', () => {
        const item = mountWithIntl(<Action action={action} isShared={true} />).render();

        assert(!hasCommentList(item));
        assert(!hasRateButton(item));
        assert(!hasShareButton(item));
        expect(item.text()).string(action.user.getFullName()).string(action.description);
      });
    });

    describe('subscribe', () => {
      let action;
      beforeEach(() => {
        action = Factory.build('action.subscribe');
        action.comments = [];
      });

      it('render', () => {
        action.user = buildUser('user', {}, {gender: Meteor.users.genderTypes.MALE});
        action.object = buildUser('user', {
          'profile.firstName': 'Пётр',
          'profile.lastName': 'Петров',
        }, {gender: Meteor.users.genderTypes.MALE});
        const item = mountWithIntl(<Action action={action} />).render();

        assert(hasCommentList(item));
        assert(hasRateButton(item));
        assert(hasShareButton(item));
        expect(item.text()).string(action.user.getFullName()).string('подписался').string('Петра Петрова');
      });

      it('render female', () => {
        action.user = buildUser('user', {}, {gender: Meteor.users.genderTypes.FEMALE});
        action.object = buildUser('user');
        const item = mountWithIntl(<Action action={action} />).render();

        expect(item.text()).string('подписалась');
      });

      it('render notification', () => {
        action.user = buildUser('user');
        action.object = buildUser('user');
        const item = mountWithIntl(<Action action={action} isNotification={true} />).render();

        expect(item.text()).string('Ваш').not.string(action.object.getFullName());
      });
    });

    describe('comment', () => {
      let action;
      beforeEach(() => {
        action = Factory.build('action.comment');
        action.comments = [];
        action.object = Factory.build('action.default');
        action.object.user = buildUser('user');
      });

      it('render', () => {
        action.user = buildUser('user', {}, {gender: Meteor.users.genderTypes.MALE});
        const item = mountWithIntl(<Action action={action} />).render();

        assert(hasCommentList(item));
        assert(hasRateButton(item));
        assert(hasShareButton(item));
        expect(item.text()).string(action.user.getFullName()).string('прокомментировал').string(action.description)
          .string(action.object.user.getFullName());
      });

      it('render female', () => {
        action.user = buildUser('user', {}, {gender: Meteor.users.genderTypes.FEMALE});
        const item = mountWithIntl(<Action action={action} />).render();

        expect(item.text()).string('прокомментировала');
      });

      it('render notification', () => {
        action.user = buildUser('user');
        const item = mountWithIntl(<Action action={action} isNotification={true} />).render();

        expect(item.text()).string('Ваш');
      });
    });

    describe('rate', () => {
      let action;
      beforeEach(() => {
        action = Factory.build('action.rate');
        action.comments = [];
        action.object = Factory.build('action.default');
        action.object.user = buildUser('user');
      });

      it('render', () => {
        action.user = buildUser('user', {
          'profile.firstName': 'Пётр',
          'profile.lastName': 'Петров',
        }, {gender: Meteor.users.genderTypes.MALE});
        action.rate = 1;
        const item = mountWithIntl(<Action action={action} />).render();

        assert(hasCommentList(item));
        assert(hasRateButton(item));
        assert(hasShareButton(item));
        expect(item.text()).string('Петру Петрову').string('понравилась').string(action.object.description);
      });

      it('render dislike', () => {
        action.user = buildUser('user');
        action.rate = -1;
        const item = mountWithIntl(<Action action={action} />).render();

        expect(item.text()).string('не понравилась');
      });

      it('render notification', () => {
        action.user = buildUser('user');
        const item = mountWithIntl(<Action action={action} isNotification={true} />).render();

        expect(item.text()).string('Ваш');
      });
    });

    describe('share', () => {
      let action;

      it('render', () => {
        action = Factory.build('action.share');
        action.comments = [];
        action.user = buildUser('user');
        action.object = Factory.build('action.default');
        action.object.user = buildUser('user');
        const item = mountWithIntl(<Action action={action} />).render();

        assert(hasCommentList(item));
        assert(hasRateButton(item));
        assert(hasShareButton(item));
        expect(item.text())
          .string(action.description)
          .string(action.object.description)
          .string(action.user.getFullName())
          .string(action.object.user.getFullName());
      });

      it('render multiple shares', () => {
        const generateAction = action => {
          const a = Factory.build('action.' + (action ? 'share' : 'default'));
          if (action) a.object = action;
          a.user = buildUser('user');
          return a;
        };
        const assertAction = action => {
          expect(itemText).string(action.description).string(action.user.getFullName());
          return action.object;
        };

        const c = 8;
        for (let i = c; i > 0; --i) action = generateAction(action);
        action.comments = [];
        const item = mountWithIntl(<Action action={action} />).render();
        const itemText = item.text();
        for (let i = c; i > 0; --i) action = assertAction(action);
      });

      describe('notification', () => {
        beforeEach(() => {
          action = Factory.build('action.share');
          action.comments = [];
          action.object = Factory.build('action.default');
          action.object.user = buildUser('user');
        });

        it('render', () => {
          action.user = buildUser('user', {}, {gender: Meteor.users.genderTypes.MALE});
          const item = mountWithIntl(<Action action={action} isNotification={true}/>).render();

          expect(item.text()).string('поделился').string('Ваш');
        });

        it('render female', () => {
          action.user = buildUser('user', {}, {gender: Meteor.users.genderTypes.FEMALE});
          const item = mountWithIntl(<Action action={action} isNotification={true}/>).render();

          expect(item.text()).string('поделилась');
        });
      });
    });
  });
}
