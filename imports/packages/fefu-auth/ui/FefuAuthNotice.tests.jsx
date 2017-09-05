import React from 'react';
import { expect } from 'meteor/practicalmeteor:chai';
import { mount } from 'enzyme';
const faker = Meteor.isDevelopment && require('faker');

import FefuAuthNotice from './FefuAuthNotice';

if (Meteor.isClient) {
  describe('FefuAuthNotice', () => {
    const noticeFefuAuth = 'Получите 10 кленинок, зарегистрировав';
    const noticeFefuWebMail = 'Вы можете проверить электронную почту ДВФУ по адресу';

    it('render', () => {
      const user = Factory.build('user');
      const item = mount(<FefuAuthNotice user={user} />).render();

      expect(item.text()).string(noticeFefuAuth).not.string(noticeFefuWebMail);
    });

    it('render when send mail for verify not fefu address', () => {
      const user = Factory.build('user', {
        emails: [{address: faker.internet.email(), verifyEmailSend: true}],
      });
      const item = mount(<FefuAuthNotice user={user} />).render();

      expect(item.text()).string(noticeFefuAuth).not.string(noticeFefuWebMail);
    });

    it('render when send mail for verify fefu address', () => {
      const user = Factory.build('user', {
        emails: [{address: 'test@students.dvfu.ru', verifyEmailSend: true}],
      });
      const item = mount(<FefuAuthNotice user={user} />).render();

      expect(item.text()).string(noticeFefuAuth).string(noticeFefuWebMail);
    });

    it('render for fefu authorized user', () => {
      const user = Factory.build('user', {
        emails: [{address: 'test@students.dvfu.ru', verified: true}],
      });
      const item = mount(<FefuAuthNotice user={user} />).render();

      expect(item.text()).not.string(noticeFefuAuth).string(noticeFefuWebMail);
    });
  });
}
