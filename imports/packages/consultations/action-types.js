const faker = Meteor.isDevelopment && require('faker');

import { Actions } from '../../api/actions';

Actions.types.CONSULTATION = 'consultation';
Actions.types.CONSULTATION_SUGGESTION = 'consultation_suggestion';
Actions.types.CONSULTATION_PARTICIPATION = 'consultation_participation';

Actions.hasParentActionTypes.push(Actions.types.CONSULTATION_PARTICIPATION);

Actions.relevantTypes.push(Actions.types.CONSULTATION);
Actions.typesTree['Другие'] = [];
Actions.typesTree['Другие']['Консультации'] = Actions.types.CONSULTATION;
Actions.notificationTypesTree['Другие']['Предложения к Вашим консультациям'] = Actions.types.CONSULTATION_SUGGESTION;
Actions.notificationTypesTree['Другие']['Участия к консультациях'] = Actions.types.CONSULTATION_PARTICIPATION;

export const ConsultationStates = {
  DISABLED: 'disabled',
  WAITING: 'waiting',
  ACTIVE: 'active',
};

export const ConsultationParticipationStates = {
  WAITING: 'waiting',
  ACTIVE: 'active',
  COMPLETED: 'completed',
};

Factory.define('consultation', Actions, Factory.extend('action.default', {
  type: Actions.types.CONSULTATION,
  extra: (api, userOptions) => {
    const canParticipate = faker.random.arrayElement([[false, true], [true, false], [true, true]]);
    const res = {
      canParticipateForFree: canParticipate[0],
      canParticipateWithPaid: canParticipate[1],
      counts: {
        suggestions: 0,
        participations: 0,
        completed: 0,
      },
      state: ConsultationStates.WAITING,
    };
    if (res.canParticipateWithPaid && !userOptions.canParticipateWithPaid) {
      if (faker.random.boolean())
        res[faker.random.boolean() ? 'fixedCoinsPerHour' : 'minCoinsPerHour'] = faker.random.number({min: 1, max: 100});
    }
    return {...res, ...userOptions};
  },
}));

Factory.define('consultation.suggestion', Actions, Factory.extend('action.default', {
  description: () => faker.lorem.sentences(faker.random.number(2)),
  type: Actions.types.CONSULTATION_SUGGESTION,
  objectId: Factory.get('consultation'),
  extra() {
    const consExtra = Actions.findOne(this.objectId).extra;
    const res = {};
    if (faker.random.boolean()) res.minutes = faker.random.number({min: 1, max: 100});
    if (consExtra.canParticipateWithPaid && (!consExtra.canParticipateForFree || faker.random.boolean())) {
      res.coinsPerHour = consExtra.fixedPaid ? consExtra.coinsPerHour : faker.random.number({min: 1, max: 100});
    }
    return res;
  },
}));

Factory.define('consultation.participation', Actions, Factory.extend('action.default', {
  type: Actions.types.CONSULTATION_PARTICIPATION,
  objectId() {
    const consultationId = this.extra && this.extra.consultationId;
    return Factory.create('consultation.suggestion', consultationId ? {consultationId} : {})._id;
  },
  extra() {
    const dates = [faker.date.past(), faker.date.past()].sort();
    return {
      consultationId: this.objectId ? Actions.findOne(this.objectId).objectId : Factory.create('consultation')._id,
      startAt: dates[0],
      endAt: dates[1],
      state: ConsultationParticipationStates.COMPLETED,
    };
  },
}));

const updateCounts = isInc => (_, action) => {
  switch (action.type) {
    case Actions.types.CONSULTATION_SUGGESTION:
      Actions.update(action.objectId, {$inc: {'extra.counts.suggestions': isInc ? 1 : -1}});
      break;
    case Actions.types.CONSULTATION_PARTICIPATION:
      Actions.update(action.extra.consultationId, {$inc: {'extra.counts.participations': isInc ? 1 : -1}});
      break;
  }
};

Actions.after.insert(updateCounts(true));
Actions.after.remove(updateCounts(false));
