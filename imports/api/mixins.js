import { Meteor } from 'meteor/meteor';

import { Actions } from './actions';

export const authorizedMixin = methodOptions => {
  const run = methodOptions.run;
  methodOptions.run = function() {
    if (!this.userId)
      throw new Meteor.Error('not-authorized');
    return run.apply(this, arguments);
  };
  return methodOptions;
};

export const actionMixin = methodOptions => {
  const run = methodOptions.run;
  methodOptions.run = function({actionId}) {
    if (arguments[0].action)
      throw new Meteor.Error('unexpected-action');
    arguments[0].action = Actions.findOne(actionId);
    if (!arguments[0].action)
      throw new Meteor.Error('action-not-found');
    return run.apply(this, arguments);
  };
  return methodOptions;
};

export const actionOwnerMixin = methodOptions => {
  const run = methodOptions.run;
  methodOptions.run = function({action}) {
    if (!action)
      throw new Meteor.Error('action-required');
    if (action.userId != this.userId)
      throw new Meteor.Error('forbidden');
    return run.apply(this, arguments);
  };
  return methodOptions;
};

export const actionTypeMixinFactory = actionType => methodOptions => {
  const run = methodOptions.run;
  methodOptions.run = function({action}) {
    if (!action)
      throw new Meteor.Error('action-required');
    if (action.type != actionType)
      throw new Meteor.Error('action-should-be-' + actionType);
    return run.apply(this, arguments);
  };
  return methodOptions;
};
