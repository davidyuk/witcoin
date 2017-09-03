import { Meteor } from 'meteor/meteor';
const faker = Meteor.isDevelopment && require('faker');

import { Actions } from '../../api/actions';
import Action from '../../ui/components/Action';

import ConsultationAction from './ui/ConsultationAction';
import ConsultationSuggestionAction from './ui/ConsultationSuggestionAction';

Actions.types.CONSULTATION = 'consultation';
Actions.types.CONSULTATION_SUGGESTION = 'consultation_suggestion';

Actions.relevantTypes.push(Actions.types.CONSULTATION);
Actions.typesTree['Консультации'] = Actions.types.CONSULTATION;
Actions.typesTree['Ответы']['Предложения в консультациях'] = Actions.types.CONSULTATION_SUGGESTION;

export const ConsultationStates = {
  DISABLED: 'disabled',
  WAITING: 'waiting',
  ACTIVE: 'active',
};

const updateCounter = isInc => (_, action) => {
  if (action.type == Actions.types.CONSULTATION_SUGGESTION)
    Actions.update(action.objectId, {$inc: {'extra.suggestionsCount': isInc ? 1 : -1}});
};

Actions.after.insert(updateCounter(true));
Actions.after.remove(updateCounter(false));

Action.registerActionRender(Actions.types.CONSULTATION, ConsultationAction);
Action.registerActionRender(Actions.types.CONSULTATION_SUGGESTION, ConsultationSuggestionAction);

require('./api');

if (Meteor.isServer) require('./server');
if (Meteor.isClient) require('./client');

Factory.define('consultation', Actions, Factory.extend('action.default', {
  type: Actions.types.CONSULTATION,
  extra: (api, userOptions) => {
    const canParticipate = faker.random.arrayElement([[false, true], [true, false], [true, true]]);
    const res = {
      canParticipateForFree: canParticipate[0],
      canParticipateWithPaid: canParticipate[1],
      suggestionsCount: 0,
      active: faker.random.boolean(),
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
  extra: function() {
    const consExtra = Actions.findOne(this.objectId).extra;
    const res = {};
    res.minutes = faker.random.boolean() ? faker.random.number({min: 1, max: 100}) : Number.MAX_SAFE_INTEGER;
    if (consExtra.canParticipateWithPaid && (!consExtra.canParticipateForFree || faker.random.boolean())) {
      res.coinsPerHour = consExtra.fixedPaid ? consExtra.coinsPerHour : faker.random.number({min: 1, max: 100});
    }
    return res;
  },
}));
