import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'meteor/practicalmeteor:chai';
import UserName from './UserName';

if (Meteor.isClient) {
  describe('UserName', () => {
    let user;
    beforeEach(() =>
      user = Factory.build('user', {
        'profile.firstName': 'Пётр',
        'profile.lastName': 'Петров',
      }, {gender: Meteor.users.genderTypes.MALE})
    );

    it('render', () => {
      const item = shallow(<UserName user={user} />).render();
      expect(item.text()).string('Пётр Петров');
    });

    const tests = [
      ['nominative',    UserName.inflections.NOMINATIVE,    'Пётр Петров',     'именительный', ],
      ['genitive',      UserName.inflections.GENITIVE,      'Петра Петрова',   'родительный',  ],
      ['dative',        UserName.inflections.DATIVE,        'Петру Петрову',   'дательный',    ],
      ['accusative',    UserName.inflections.ACCUSATIVE,    'Петра Петрова',   'винительный',  ],
      ['instrumental',  UserName.inflections.INSTRUMENTAL,  'Петром Петровым', 'творительный', ],
      ['prepositional', UserName.inflections.PREPOSITIONAL, 'Петре Петрове',   'предложный',   ],
    ];

    tests.forEach(test =>
      it(`render ${test[0]} (${test[3]})`, () => {
        const item = shallow(<UserName user={user} inflection={test[1]} />).render();
        expect(item.text()).string(test[2]);
      })
    )
  });
}
