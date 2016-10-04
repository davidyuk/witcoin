import React from 'react';
import petrovich from 'petrovich';

export default class UserName extends React.Component {
  getName() {
    const user = this.props.user;
    if (!user.profile) return user._id;
    let u = {
      first: user.profile.firstName,
      last: user.profile.lastName,
      gender: user.profile.gender || Meteor.users.genderTypes.MALE,
    };
    if (this.props.inflection)
      u = petrovich(u, this.props.inflection);
    return [u.first, u.last].join(' ');
  }

  render() {
    return (
      <span>
        { this.getName() }
      </span>
    );
  }
}

UserName.inflections = {
  NOMINATIVE: 'nominative',
  GENITIVE: 'genitive',
  DATIVE: 'dative',
  ACCUSATIVE: 'accusative',
  INSTRUMENTAL: 'instrumental',
  PREPOSITIONAL: 'prepositional',
};

UserName.propTypes = {
  user: React.PropTypes.object.isRequired,
  inflection: React.PropTypes.string,
};
