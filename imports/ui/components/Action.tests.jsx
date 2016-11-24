import React from 'react';
import { expect, assert } from 'meteor/practicalmeteor:chai';
const faker = Meteor.isDevelopment && require('faker');
import StubCollections from 'meteor/hwillson:stub-collections';

import { mountWithIntl } from '../../helpers/intl-enzyme-test-helper';
import { Actions } from '../../api/actions';
import Action from './Action';

if (Meteor.isClient) {
  faker.locale = 'ru';
  Meteor.userId = () => null;

  describe('Action', () => {
    beforeEach(() => {
      StubCollections.stub([Actions, Meteor.users]);
    });

    afterEach(() => {
      StubCollections.restore();
    });

    const hasCommentList = node => node.find('div.list-group, a:contains("Комментировать")').length == 1;
    const hasRateButton = node => node.find('button[title="Нравится"]').length == 1;
    const hasShareButton = node => node.find('button[title="Поделиться"]').length == 1;

    describe('default', () => {
      it('render', () => {
        const action = Factory.create('action.default');
        const item = mountWithIntl(<Action action={action} />).render();

        assert(hasCommentList(item));
        assert(hasRateButton(item));
        assert(hasShareButton(item));
        expect(item.text())
          .string(Meteor.users.findOne(action.userId).getFullName())
          .string(action.description);
      });

      it('render shared', () => {
        const item = mountWithIntl(<Action action={Factory.create('action.default')} isShared={true} />).render();

        assert(!hasCommentList(item));
        assert(!hasRateButton(item));
        assert(!hasShareButton(item));
      });
    });

    describe('subscribe', () => {
      it('render', () => {
        const action = Factory.create('action.subscribe', {
          userId: Factory.create('user', {}, {gender: Meteor.users.genderTypes.MALE})._id,
          objectId: Factory.create('user', {
            'profile.firstName': 'Пётр',
            'profile.lastName': 'Петров',
          }, {gender: Meteor.users.genderTypes.MALE})._id,
        });
        const item = mountWithIntl(<Action action={action} />).render();

        assert(hasCommentList(item));
        assert(hasRateButton(item));
        assert(hasShareButton(item));
        expect(item.text())
          .string(Meteor.users.findOne(action.userId).getFullName())
          .string('подписался').string('Петра Петрова');
      });

      it('render female', () => {
        const action = Factory.create('action.subscribe', {
          userId: Factory.create('user', {}, {gender: Meteor.users.genderTypes.FEMALE})._id,
        });
        const item = mountWithIntl(<Action action={action} />).render();

        expect(item.text()).string('подписалась');
      });

      it('render notification', () => {
        const action = Factory.create('action.subscribe');
        const item = mountWithIntl(<Action action={action} isNotification={true} />).render();

        expect(item.text()).string('Ваш')
          .not.string(Meteor.users.findOne(action.objectId).getFullName());
      });
    });

    describe('comment', () => {
      it('render', () => {
        const defaultAction = Factory.create('action.default');
        const action = Factory.create('action.comment', {
          objectId: defaultAction._id,
          userId: Factory.create('user', {}, {gender: Meteor.users.genderTypes.MALE}),
        });
        const item = mountWithIntl(<Action action={action} />).render();

        assert(hasCommentList(item));
        assert(hasRateButton(item));
        assert(hasShareButton(item));
        expect(item.text())
          .string(Meteor.users.findOne(action.userId).getFullName())
          .string('прокомментировал ')
          .string(action.description)
          .string(Meteor.users.findOne(defaultAction.userId).getFullName());
      });

      it('render female', () => {
        const action = Factory.create('action.comment', {
          userId: Factory.create('user', {}, {gender: Meteor.users.genderTypes.FEMALE}),
        });
        const item = mountWithIntl(<Action action={action} />).render();

        expect(item.text()).string('прокомментировала');
      });

      it('render notification', () => {
        const item = mountWithIntl(
          <Action action={Factory.create('action.comment')} isNotification={true} />
        ).render();

        expect(item.text()).string('Ваш');
      });
    });

    describe('rate', () => {
      it('render', () => {
        const defaultAction = Factory.create('action.default');
        const action = Factory.create('action.rate', {
          objectId: defaultAction._id,
          userId: Factory.create('user', {
            'profile.firstName': 'Пётр',
            'profile.lastName': 'Петров',
          }, {gender: Meteor.users.genderTypes.MALE}),
          rate: 1,
        });
        const item = mountWithIntl(<Action action={action} />).render();

        assert(hasCommentList(item));
        assert(hasRateButton(item));
        assert(hasShareButton(item));
        expect(item.text()).string('Петру Петрову').string('понравилась').string(defaultAction.description);
      });

      it('render dislike', () => {
        const item = mountWithIntl(
          <Action action={Factory.create('action.rate', {rate: -1})} isNotification={true} />
        ).render();

        expect(item.text()).string('не понравилась');
      });

      it('render notification', () => {
        const item = mountWithIntl(
          <Action action={Factory.create('action.rate')} isNotification={true} />
        ).render();

        expect(item.text()).string('Ваш');
      });
    });

    describe('share', () => {
      it('render', () => {
        const defaultAction = Factory.create('action.default');
        const action = Factory.create('action.share', {objectId: defaultAction._id});
        const item = mountWithIntl(<Action action={action} />).render();

        assert(hasCommentList(item));
        assert(hasRateButton(item));
        assert(hasShareButton(item));
        expect(item.text())
          .string(action.description)
          .string(defaultAction.description)
          .string(Meteor.users.findOne(action.userId).getFullName())
          .string(Meteor.users.findOne(defaultAction.userId).getFullName());
      });

      it('render multiple shares', () => {
        const generateAction = action =>
          Factory.create('action.' + (action ? 'share' : 'default'), action ? {objectId: action._id} : {});
        const assertAction = action => {
          expect(itemText)
            .string(action.description)
            .string(Meteor.users.findOne(action.userId).getFullName());
          return Actions.findOne(action.objectId);
        };

        const c = 8;
        let action = null;
        for (let i = c; i > 0; --i) action = generateAction(action);
        const item = mountWithIntl(<Action action={action} />).render();
        const itemText = item.text();
        for (let i = c; i > 0; --i) action = assertAction(action);
        expect(action).equal(undefined);
      });

      describe('notification', () => {
        it('render', () => {
          const action = Factory.create('action.share', {
            userId: Factory.create('user', {}, {gender: Meteor.users.genderTypes.MALE}),
          });
          const item = mountWithIntl(<Action action={action} isNotification={true} />).render();

          expect(item.text()).string('поделился').string('Ваш');
        });

        it('render female', () => {
          const action = Factory.create('action.share', {
            userId: Factory.create('user', {}, {gender: Meteor.users.genderTypes.FEMALE}),
          });
          const item = mountWithIntl(<Action action={action} isNotification={true} />).render();

          expect(item.text()).string('поделилась');
        });
      });
    });
  });
}
