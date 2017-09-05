import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { expect, assert } from 'meteor/practicalmeteor:chai';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { authorizedMixin, actionMixin, actionOwnerMixin, actionTypeMixinFactory } from './mixins';

if (Meteor.isServer) {
  describe('mixins', () => {
    afterEach(() => {
      delete Meteor.server.method_handlers['test'];
    });

    it('authorizedMixin', () => {
      const testMethod = new ValidatedMethod({
        name: 'test',
        validate() {},
        mixins: [authorizedMixin],
      });
      assert.throws(() => testMethod._execute({}), Meteor.Error, 'not-authorized');
    });

    it('actionMixin', () => {
      const actionId = Factory.create('action')._id;
      const testMethod = new ValidatedMethod({
        name: 'test',
        validate() {},
        mixins: [actionMixin],
        run({ action }) {
          expect(action._id).equal(actionId);
        },
      });
      testMethod._execute({}, { actionId });
    });

    it('actionOwnerMixin', () => {
      const testMethod = new ValidatedMethod({
        name: 'test',
        validate() {},
        mixins: [actionOwnerMixin],
      });
      const action = Factory.create('action');
      assert.throws(() => testMethod._execute({ userId: Random.id() }, { action }), Meteor.Error, 'forbidden');
    });

    it('actionTypeMixinFactory', () => {
      const testMethod = new ValidatedMethod({
        name: 'test',
        validate() {},
        mixins: [actionTypeMixinFactory('invalid-type')],
      });
      const action = Factory.create('action');
      assert.throws(() => testMethod._execute({}, { action }), Meteor.Error, 'action-should-be-invalid-type');
    });
  });
}
