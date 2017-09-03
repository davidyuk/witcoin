import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { authorizedMixin, actionMixin, actionOwnerMixin, actionTypeMixinFactory } from '../../api/mixins';
import { Actions } from '../../api/actions';

import { LessonStates } from './index';

const lessonMixin = actionTypeMixinFactory(Actions.types.LESSON);

export const createLesson = new ValidatedMethod({
  name: 'lesson.create',
  mixins: [authorizedMixin],
  applyOptions: {
    returnStubValue: true,
    throwStubExceptions: true,
  },
  validate: new SimpleSchema({
    actionId: {type: String, regEx: SimpleSchema.RegEx.Id, optional: true, defaultValue: null},
    canParticipateForFree: {type: Boolean},
    canParticipateWithPaid: {type: Boolean},
    requiredParticipants: {type: Number, min: 1, optional: true, decimal: false},
    requiredCoins: {type: Number, min: 1, optional: true, decimal: false},
    fixedCoinsPerParticipant: {type: Number, min: 1, optional: true, decimal: false},
    minCoinsPerParticipant: {type: Number, min: 1, optional: true, decimal: false},
    beginAt: {type: Date, optional: true},
    endAt: {type: Date, optional: true},
    location: {type: String, optional: true},
    description: {type: String, min: 1},
  }).validator(),
  run({
    actionId, canParticipateForFree, canParticipateWithPaid,
    requiredParticipants, requiredCoins,
    fixedCoinsPerParticipant, minCoinsPerParticipant,
    beginAt, endAt, location,
    description,
  }) {
    if (!canParticipateForFree && !canParticipateWithPaid)
      throw new Meteor.Error('should-be-allowed-to-participate');
    if (fixedCoinsPerParticipant && minCoinsPerParticipant)
      throw new Meteor.Error('should-set-one-of-fixedCoinsPerParticipant-and-minCoinsPerParticipant');
    if (!canParticipateWithPaid && (fixedCoinsPerParticipant || minCoinsPerParticipant))
      throw new Meteor.Error('when-participate-not-with-paid-cannot-set-fixedCoinsPerParticipant-or-minCoinsPerParticipant');
    if (beginAt && endAt && beginAt >= endAt)
      throw new Meteor.Error('beginAt-should-be-below-endAt');

    const selector = {
      userId: this.userId,
      type: Actions.types.LESSON,
    };
    const defaults = {
      extra: {
        state: LessonStates.WAITING,
        participantsCount: 0,
        coinsCount: 0,
        actual: 1,
      },
    };
    const modifier = {
      $set: {
        'extra.canParticipateForFree': canParticipateForFree,
        'extra.canParticipateWithPaid': canParticipateWithPaid,
        'extra.requiredParticipants': requiredParticipants,
        'extra.requiredCoins': requiredCoins,
        'extra.fixedCoinsPerParticipant': fixedCoinsPerParticipant,
        'extra.minCoinsPerParticipant': minCoinsPerParticipant,
        'extra.beginAt': beginAt,
        'extra.endAt': endAt,
        'extra.location': location,
        description,
      },
    };

    actionId = actionId || Actions.insert({...selector, ...defaults});
    Actions.update({...selector, _id: actionId}, modifier);
    return actionId;
  },
});

export const setLessonState = new ValidatedMethod({
  name: 'lesson.state',
  mixins: [lessonMixin, actionOwnerMixin, actionMixin, authorizedMixin],
  applyOptions: {
    returnStubValue: true,
    throwStubExceptions: true,
  },
  validate: new SimpleSchema({
    actionId: {type: String, regEx: SimpleSchema.RegEx.Id},
    state: {type: String, allowedValues: Object.values(LessonStates)},
  }).validator(),
  run({actionId, state}) {
    return Actions.update(actionId, {$set: {
      'extra.state': state,
      'extra.actual': [LessonStates.CANCELED, LessonStates.COMPLETED].includes(state),
    }});
  },
});

export const createParticipation = new ValidatedMethod({
  name: 'lesson.participation.create',
  mixins: [lessonMixin, actionMixin, authorizedMixin],
  applyOptions: {
    returnStubValue: true,
    throwStubExceptions: true,
  },
  validate: new SimpleSchema({
    actionId: {type: String, regEx: SimpleSchema.RegEx.Id},
    description: {type: String, optional: true},
    coins: {type: Number, min: 1, optional: true, decimal: false},
  }).validator(),
  run({actionId, action, description, coins}) {
    const {canParticipateForFree, fixedCoinsPerParticipant, minCoinsPerParticipant} = action.extra;

    if (coins) {
      if (fixedCoinsPerParticipant && fixedCoinsPerParticipant != coins)
        throw new Meteor.Error('coins-not-equal-to-fixedCoinsPerParticipant');
      if (minCoinsPerParticipant && minCoinsPerParticipant > coins)
        throw new Meteor.Error('coins-should-be-above-or-equal-to-minCoinsPerParticipant');
    } else {
      if (!canParticipateForFree) throw new Meteor.Error('coins-is-required');
    }

    const selector = {
      objectId: actionId,
      type: Actions.types.LESSON_PARTICIPATION,
      userId: this.userId,
    };
    Actions.remove(selector);
    return Actions.insert({
      ...selector,
      description,
      extra: {
        coins,
      },
    });
  },
});
