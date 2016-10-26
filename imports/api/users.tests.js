import { Meteor } from 'meteor/meteor';
import { expect } from 'meteor/practicalmeteor:chai';
import faker from 'faker';

import './users';

if (Meteor.isServer) {
  describe('users', () => {
    it('factory', () => {
      const user = Factory.create('user');
      expect(Meteor.users.findOne(user._id)).is.an('object');
    });

    describe('helpers', () => {
      describe('getFullName', () => {
        let user;
        beforeEach(() =>
          user = Meteor.users._transform(
            Factory.build('user', {
              'profile.firstName': 'Пётр',
              'profile.lastName': 'Петров',
            }, {gender: Meteor.users.genderTypes.MALE})
          )
        );

        it('call', () => {
          expect(user.getFullName()).string('Пётр Петров');
        });

        const tests = [
          ['nominative',    Meteor.users.inflectionTypes.NOMINATIVE,    'Пётр Петров',     'именительный', ],
          ['genitive',      Meteor.users.inflectionTypes.GENITIVE,      'Петра Петрова',   'родительный',  ],
          ['dative',        Meteor.users.inflectionTypes.DATIVE,        'Петру Петрову',   'дательный',    ],
          ['accusative',    Meteor.users.inflectionTypes.ACCUSATIVE,    'Петра Петрова',   'винительный',  ],
          ['instrumental',  Meteor.users.inflectionTypes.INSTRUMENTAL,  'Петром Петровым', 'творительный', ],
          ['prepositional', Meteor.users.inflectionTypes.PREPOSITIONAL, 'Петре Петрове',   'предложный',   ],
        ];

        tests.forEach(test =>
          it(`call with ${test[0]} inflection (${test[3]})`, () => {
            expect(user.getFullName(test[1])).string(test[2]);
          })
        )
      })
    });

    describe('methods', () => {
      describe('user.email.add', () => {
        const addEmail = Meteor.server.method_handlers['user.email.add'];
        it('allow to add email', () => {
          const userId = Factory.create('user', {emails: []})._id;
          const email = faker.internet.email();
          addEmail.call({userId}, email);

          const emailRecord = Meteor.users.findOne(userId).emails[0];
          expect(emailRecord.address).to.equal(email);
          expect(emailRecord.verified).to.equal(false);
        });
      });

      describe('user.email.remove', () => {
        const removeEmail = Meteor.server.method_handlers['user.email.remove'];
        it('allow to remove email', () => {
          const email = faker.internet.email();
          const userId = Factory.create('user', {emails: [{address: email}]})._id;
          removeEmail.call({userId}, email);

          expect(Meteor.users.findOne(userId).emails.length).to.equal(0);
        });
      });
    });
  });
}
