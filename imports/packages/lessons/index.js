import { Meteor } from 'meteor/meteor';
import React from 'react';
const faker = Meteor.isDevelopment && require('faker');

import { Actions } from '../../api/actions';
import Action from '../../ui/components/Action';

import { registerTransactionType } from '../transactions';

import LessonAction from './ui/LessonAction';
import LessonParticipationAction from './ui/LessonParticipationAction';

Actions.types.LESSON = 'lesson';
Actions.types.LESSON_PARTICIPATION = 'lesson_participation';
registerTransactionType(Actions.types.LESSON_PARTICIPATION);
// Actions.undeletableTypes.push(Actions.types.LESSON, Actions.types.LESSON_PARTICIPATION);

Actions.relevantTypes.push(Actions.types.LESSON);
Actions.relevantTypes.push(Actions.types.LESSON_PARTICIPATION);
Actions.typesTree['Мастер-классы'] = Actions.types.LESSON;
Actions.typesTree['Ответы']['Участия в мастер-классах'] = Actions.types.LESSON_PARTICIPATION;

export const LessonStates = {
  WAITING: 'waiting',
  LOCKED: 'locked',
  CONDUCTED: 'conducted',
  COMPLETED: 'completed',
  CANCELED: 'canceled',
};

const updateParentLessonCounter = isInc => (_, action) => {
  if (action.type == Actions.types.LESSON_PARTICIPATION)
    Actions.update(action.objectId, {$inc: {'extra.participantsCount': isInc ? 1 : -1}});
};

Actions.after.insert(updateParentLessonCounter(true));
Actions.after.remove(updateParentLessonCounter(false));

Action.registerActionRender(Actions.types.LESSON, LessonAction);
Action.registerActionRender(Actions.types.LESSON_PARTICIPATION, LessonParticipationAction);

require('./api');

if (Meteor.isClient) require('./client');
if (Meteor.isServer) require('./server');

Factory.define('consultation', Actions, Factory.extend('action.default', {
  type: Actions.types.LESSON,
  extra: () => {
    const canParticipate = faker.random.arrayElement([[false, true], [true, false], [true, true]]);
    const beginAt = faker.date.future();
    const endAt = new Date(beginAt.getTime() + faker.random.number(3 * 24 * 60 * 60 * 1000));
    const res = {
      canParticipateForFree: canParticipate[0],
      canParticipateWithPaid: canParticipate[1],
      participantsCount: 0,
      beginAt, endAt,
      location: faker.address.streetAddress(),
    };
    if (faker.random.boolean())
      res.requiredParticipants = faker.random.number(100);
    if (res.canParticipateWithPaid) {
      if (faker.random.boolean())
        res.requiredCoins = faker.random.number(1000) + 100;
      res.coinsCount = 0;
      if (faker.random.boolean())
        res.fixedCoinsPerHour = faker.random.boolean();
      if (typeof res.fixedCoinsPerHour == 'boolean')
        res.paid = faker.random.number(100);
    }
    return res;
  },
}));

Factory.define('lesson.participation', Actions, Factory.extend('action.default', {
  type: Actions.types.LESSON_PARTICIPATION,
  objectId: Factory.get('consultation'),
}));
