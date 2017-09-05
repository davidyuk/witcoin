import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Actions } from '../../api/actions';
import { authorizedMixin, actionMixin, actionOwnerMixin, actionTypeMixinFactory } from '../../api/mixins';

import { createTransaction } from '../transactions';

import { ConsultationStates, ConsultationParticipationStates } from './action-types';
import { countCoins } from './utils';

const consultationMixin = actionTypeMixinFactory(Actions.types.CONSULTATION);
const consultationSuggestionMixin = actionTypeMixinFactory(Actions.types.CONSULTATION_SUGGESTION);
const consultationParticipationMixin = actionTypeMixinFactory(Actions.types.CONSULTATION_PARTICIPATION);

export const createConsultation = new ValidatedMethod({
  name: 'consultation.create',
  mixins: [authorizedMixin],
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

    actionId = actionId || Actions.insert({...selector, extra: {
      state: ConsultationStates.WAITING,
      counts: {
        suggestions: 0,
        participations: 0,
        completed: 0,
      },
    }});
    Actions.update({...selector, _id: actionId}, modifier);
    return actionId;
  },
});

export const toggleConsultationState = new ValidatedMethod({
  name: 'consultation.state',
  mixins: [actionOwnerMixin, consultationMixin, actionMixin, authorizedMixin],
  validate: new SimpleSchema({
    actionId: {type: String, regEx: SimpleSchema.RegEx.Id},
  }).validator(),
  run({action}) {
    const {DISABLED, WAITING} = ConsultationStates;
    const allowedStates = [DISABLED, WAITING];
    if (!allowedStates.includes(action.extra.state))
      throw new Meteor.Error('consultation-state-must-be-one-of--' + allowedStates.join('-'));

    Actions.remove({
      type: Actions.types.CONSULTATION_PARTICIPATION,
      'extra.consultationId': action._id,
      'extra.state': {$ne: ConsultationParticipationStates.COMPLETED},
    });
    return Actions.update(action._id, {$set: {
      'extra.state': action.extra.state == DISABLED ? WAITING : DISABLED,
    }});
  }
});

export const createSuggestion = new ValidatedMethod({
  name: 'consultation.suggestion.create',
  mixins: [consultationMixin, actionMixin, authorizedMixin],
  validate: new SimpleSchema({
    actionId: {type: String, regEx: SimpleSchema.RegEx.Id},
    description: {type: String, optional: true},
    coinsPerHour: {type: Number, min: 1, optional: true, decimal: false},
    minutes: {type: Number, min: 1, optional: true, decimal: false},
  }).validator(),
  run({actionId, action, description, coinsPerHour, minutes}) {
    const {canParticipateForFree, canParticipateWithPaid, fixedCoinsPerHour, minCoinsPerHour} = action.extra;

    if (this.userId == action.userId)
      throw new Meteor.Error('cannot-suggest-to-own-consultation');
    if (coinsPerHour) {
      if (!canParticipateWithPaid)
        throw new Meteor.Error('cannot-participate-with-paid');
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

export const createParticipation = new ValidatedMethod({
  name: 'consultation.participation.create',
  mixins: [consultationSuggestionMixin, actionMixin, authorizedMixin],
  validate: new SimpleSchema({
    actionId: {type: String, regEx: SimpleSchema.RegEx.Id},
  }).validator(),
  run({action: suggestion}) {
    const consultation = Actions.findOne(suggestion.objectId);
    if (consultation.userId != this.userId) throw new Meteor.Error('forbidden');
    if (ConsultationStates.WAITING != consultation.extra.state)
      throw new Meteor.Error('consultation-state-must-be-' + ConsultationStates.WAITING);

    return Actions.insert({
      objectId: suggestion._id,
      type: Actions.types.CONSULTATION_PARTICIPATION,
      userId: this.userId,
      extra: {
        consultationId: suggestion.objectId,
        userId: suggestion.userId,
        state: ConsultationParticipationStates.WAITING,
      },
    });
  },
});

export const confirmParticipation = new ValidatedMethod({
  name: 'consultation.participation.confirm',
  mixins: [consultationParticipationMixin, actionMixin, authorizedMixin],
  validate: new SimpleSchema({
    actionId: {type: String, regEx: SimpleSchema.RegEx.Id},
  }).validator(),
  run({action: participation}) {
    const suggestion = Actions.findOne(participation.objectId);
    if (suggestion.userId != this.userId)
      throw new Meteor.Error('forbidden');
    const consultation = Actions.findOne(participation.extra.consultationId);
    if (consultation.extra.state != ConsultationStates.WAITING)
      throw new Meteor.Error('consultation-state-must-be-' + ConsultationStates.WAITING);

    Actions.update(participation.objectId, {$set: {'extra.actual': false}}); // disable edit
    Actions.update(participation._id, {$set: {
      'extra.state': ConsultationParticipationStates.ACTIVE,
      'extra.startAt': new Date(),
    }});
    Actions.remove({
      type: Actions.types.CONSULTATION_PARTICIPATION,
      'extra.consultationId': participation.extra.consultationId,
      'extra.state': ConsultationParticipationStates.WAITING,
    });
    Actions.update(participation.extra.consultationId, {$set: {'extra.state': ConsultationStates.ACTIVE}});
  },
});

export const stopConsultation = new ValidatedMethod({
  name: 'consultation.stop',
  mixins: [consultationMixin, actionMixin, authorizedMixin],
  validate: new SimpleSchema({
    actionId: {type: String, regEx: SimpleSchema.RegEx.Id},
    transferCoins: {type: Boolean, optional: true, defaultValue: true},
  }).validator({clean: true}),
  run({action: consultation, transferCoins}) {
    const isOwner = consultation.userId == this.userId;
    if (!isOwner && !transferCoins)
      throw new Meteor.Error('forbidden');

    const participation = Actions.findOne({
      type: Actions.types.CONSULTATION_PARTICIPATION,
      'extra.consultationId': consultation._id,
      'extra.state': ConsultationParticipationStates.ACTIVE,
    });
    const suggestion = Actions.findOne(participation.objectId);
    if (!isOwner && suggestion.userId != this.userId)
      throw new Meteor.Error('forbidden');

    const {extra: {startAt}} = participation;
    const {extra: {coinsPerHour}} = suggestion;
    const endAt = new Date();
    if (transferCoins && coinsPerHour) {
      createTransaction({
        userFromId: suggestion.userId,
        userToId: consultation.userId,
        amount: countCoins(startAt, endAt, coinsPerHour, Meteor.users.findOne(suggestion.userId).balance),
        actionId: participation._id,
        extra: {consultationId: consultation._id},
      });
    }

    Actions.update(participation._id, {$set: {
      'extra.state': ConsultationParticipationStates.COMPLETED,
      'extra.endAt': endAt,
    }});
    Actions.update(consultation._id, {
      $set: {'extra.state': ConsultationStates.WAITING},
      $inc: {'extra.counts.completed': 1},
    });
  },
});
