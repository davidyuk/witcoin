import { Meteor } from 'meteor/meteor';
import { expect } from 'meteor/practicalmeteor:chai';

import './users';

if (Meteor.isServer) {
  describe('users', () => {
    it('factory', () => {
      const user = Factory.create('user');
      expect(Meteor.users.findOne(user._id)).is.an('object');
    });
  });
}
