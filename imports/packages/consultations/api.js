import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Actions } from '../../api/actions';

import './index';

const authorizedMixin = methodOptions => {
  const run = methodOptions.run;
  methodOptions.run = function() {
    if (!this.userId)
      throw new Meteor.Error('not-authorized');
    return run.apply(this, arguments);
  };
  return methodOptions;
};

const actionMixin = methodOptions => {
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

const ownerMixin = methodOptions => {
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

const consultationMixin = methodOptions => {
  const run = methodOptions.run;
  methodOptions.run = function({action}) {
    if (!action)
      throw new Meteor.Error('action-required');
    if (action.type != Actions.types.CONSULTATION)
      throw new Meteor.Error('action-should-be-consultation');
    return run.apply(this, arguments);
  };
  return methodOptions;
};

export const createConsultation = new ValidatedMethod({
  name: 'consultation.create',
  mixins: [authorizedMixin],
  applyOptions: {
    returnStubValue: true,
    throwStubExceptions: true,
  },
  validate: new SimpleSchema({
    actionId: {type: String, regEx: SimpleSchema.RegEx.Id, optional: true, defaultValue: null},
    description: {type: String, min: 1},
    canParticipateForFree: {type: Boolean},
    canParticipateWithPaid: {type: Boolean},
    fixedCoinsPerHour: {type: Number, min: 1, optional: true, decimal: false},
    minCoinsPerHour: {type: Number, min: 1, optional: true, decimal: false},
  }).validator(),
  run({actionId, description, canParticipateForFree, canParticipateWithPaid, fixedCoinsPerHour, minCoinsPerHour}) {
    if (!canParticipateForFree && !canParticipateWithPaid)
      throw new Meteor.Error('should-be-allowed-to-participate');
    if (fixedCoinsPerHour && minCoinsPerHour)
      throw new Meteor.Error('should-set-one-of-fixedCoinsPerHour-and-minCoinsPerHour');
    if (!canParticipateWithPaid && (fixedCoinsPerHour || minCoinsPerHour))
      throw new Meteor.Error('when-participate-not-with-paid-cannot-set-fixedCoinsPerHour-or-minCoinsPerHour');

    const selector = {
      userId: this.userId,
      type: Actions.types.CONSULTATION,
    };
    const modifier = {
      $unset: {},
      $set: {
        description,
        'extra.canParticipateForFree': canParticipateForFree,
        'extra.canParticipateWithPaid': canParticipateWithPaid,
      },
    };
    modifier[fixedCoinsPerHour ? '$set' : '$unset']['extra.fixedCoinsPerHour'] = fixedCoinsPerHour || null;
    modifier[minCoinsPerHour ? '$set' : '$unset']['extra.minCoinsPerHour'] = minCoinsPerHour || null;

    actionId = actionId || Actions.insert({...selector, extra: {actual: true, suggestionsCount: 0}});
    Actions.update({...selector, _id: actionId}, modifier);
    return actionId;
  },
});

export const setConsultationActual = new ValidatedMethod({
  name: 'consultation.actual',
  mixins: [consultationMixin, ownerMixin, actionMixin, authorizedMixin],
  applyOptions: {
    returnStubValue: true,
    throwStubExceptions: true,
  },
  validate: new SimpleSchema({
    actionId: {type: String, regEx: SimpleSchema.RegEx.Id},
    actual: {type: Boolean},
  }).validator(),
  run({actionId, actual}) {
    return Actions.update(actionId, {$set: {'extra.actual': actual}});
  }
});

export const createSuggestion = new ValidatedMethod({
  name: 'consultation.suggestion.create',
  mixins: [consultationMixin, actionMixin, authorizedMixin],
  applyOptions: {
    returnStubValue: true,
    throwStubExceptions: true,
  },
  validate: new SimpleSchema({
    actionId: {type: String, regEx: SimpleSchema.RegEx.Id},
    description: {type: String, optional: true},
    coinsPerHour: {type: Number, min: 1, optional: true, decimal: false},
    minutes: {type: Number, min: 1, optional: true, decimal: false},
  }).validator(),
  run({actionId, action, description, coinsPerHour, minutes}) {
    const {canParticipateForFree, fixedCoinsPerHour, minCoinsPerHour} = action.extra;

    if (coinsPerHour) {
      if (fixedCoinsPerHour && fixedCoinsPerHour != coinsPerHour)
        throw new Meteor.Error('coinsPerHour-not-equal-to-fixedCoinsPerHour');
      if (minCoinsPerHour && minCoinsPerHour > coinsPerHour)
        throw new Meteor.Error('coinsPerHour-should-be-above-or-equal-to-minCoinsPerHour');
    } else {
      if (!canParticipateForFree) throw new Meteor.Error('coinsPerHour-is-required');
    }

    const selector = {
      objectId: actionId,
      type: Actions.types.CONSULTATION_SUGGESTION,
      userId: this.userId,
    };
    Actions.remove({...selector, 'extra.actual': true});
    return Actions.insert({
      ...selector,
      description,
      extra: {
        ...(coinsPerHour ? {coinsPerHour} : {}),
        ...(minutes ? {minutes} : {}),
        actual: true,
      },
    });
  },
});
