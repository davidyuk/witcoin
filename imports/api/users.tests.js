import { Meteor } from 'meteor/meteor';
import { expect } from 'meteor/practicalmeteor:chai';

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
  });
}
