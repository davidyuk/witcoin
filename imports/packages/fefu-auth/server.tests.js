import { expect, assert } from 'meteor/practicalmeteor:chai';
const faker = Meteor.isDevelopment && require('faker');

import { Actions } from '../../api/actions';

import { FEFU_STUDENT_INITIAL_BALANCE } from './index';
import { isFefuEmail } from './utils';

if (Meteor.isServer) {
  const { createFefuAuthOnFefuEmailVerify } = require('./server');

  describe('fefuAuth', () => {
    const genFefuEmail = () => faker.internet.userName() + '@students.dvfu.ru';

    it('genFefuEmail generates fefuEmail', () => {
      assert(isFefuEmail(genFefuEmail()));
    });

    it('increase balance on fefu auth', () => {
      const userId = Factory.create('user', {balance: 0})._id;
      const fefuAuth = Factory.create('fefuAuth', {userId});

      expect(Meteor.users.findOne(userId).balance).to.equal(FEFU_STUDENT_INITIAL_BALANCE);
    });

    describe('methods', () => {
      describe('user.email.add', () => {
        const addEmail = Meteor.server.method_handlers['user.email.add'];
        it('fail when add more than one fefu email', () => {
          const userId = Factory.create('user', {emails: [{address: genFefuEmail()}]})._id;

          assert.throws(() => {
            addEmail.call({userId}, genFefuEmail());
          }, Meteor.Error, 'fefu-email-already-added');
        });
      });

      describe('user.email.remove', () => {
        const removeEmail = Meteor.server.method_handlers['user.email.remove'];
        it('fail when try to remove verified fefu email', () => {
          const email = genFefuEmail();
          const userId = Factory.create('user', {emails: [{address: email, verified: true}]})._id;

          assert.throws(() => {
            removeEmail.call({userId}, email);
          }, Meteor.Error, 'verified-fefu-email-cannot-be-removed');
        });

        it('allow to remove unverified fefu email', () => {
          const email = genFefuEmail();
          const userId = Factory.create('user', {emails: [{address: email, verified: false}]})._id;

          removeEmail.call({userId}, email);
          expect(Meteor.users.findOne(userId).emails.length).to.equal(0);
        });
      });

      describe('verifyEmail', () => {
        const sendEmail = Meteor.server.method_handlers['user.email.sendVerification'];
        const verifyEmail = Meteor.server.method_handlers['verifyEmail'];

        const createFefuAuth = userId => {
          sendEmail.call({userId}, Meteor.users.findOne(userId).emails[0].address);
          const token = Meteor.users.findOne(userId).services.email.verificationTokens[0].token;
          assert(token.length);

          const res = createFefuAuthOnFefuEmailVerify((token, t) => t, token, 42);
          expect(res).to.equal(42);

          return Actions.findOne({userId});
        };

        it('create fefu auth action on fefu email verify', () => {
          const user = Factory.create('user', {emails: [{address: genFefuEmail(), verified: false}]});

          const fefuAuth = createFefuAuth(user._id);
          expect(fefuAuth).not.to.equal(undefined);
          expect(fefuAuth.type).to.equal(Actions.types.FEFU_AUTH);
          expect(fefuAuth.extra).to.eql({fefuUserName: user.emails[0].address.split('@')[0]});
          expect(fefuAuth.userId).to.equal(user._id);
          expect(fefuAuth.unDeletable).to.equal(true);
        });

        it('don\'t create fefu auth action if fefu email already verified', () => {
          const user = Factory.create('user', {emails: [{address: genFefuEmail(), verified: true}]});

          const fefuAuth = createFefuAuth(user._id);
          expect(fefuAuth).to.equal(undefined);
        });

        it('don\'t create fefu auth action on other email verify', () => {
          const user = Factory.create('user', {emails: [{address: faker.internet.email(), verified: false}]});

          const fefuAuth = createFefuAuth(user._id);
          expect(fefuAuth).to.equal(undefined);
        });
      });
    });
  });
}
