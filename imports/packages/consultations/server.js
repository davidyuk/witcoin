import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Actions } from '../../api/actions';
import { FeedItems } from '../../api/feeds';

import { ConsultationStates, ConsultationParticipationStates } from './action-types';

Actions.after.insert((_, action) => {
  switch (action.type) {
    case Actions.types.CONSULTATION_SUGGESTION:
      FeedItems.insertBasedOnAction(action, {
        userId: Actions.findOne(action.objectId).userId,
        isNotification: true,
      });
      break;
    case Actions.types.CONSULTATION_PARTICIPATION:
      FeedItems.insertBasedOnAction(action, {
        userId: Actions.findOne(action.objectId).userId,
        isNotification: true,
      });
      break;
  }
});

Meteor.publish('consultation.participantBalance', function(consultationId) {
  check(consultationId, String);

  if (!this.userId)
    throw Meteor.Error('not-authorized');
  const consultation = Actions.findOne(consultationId);
  if (!consultation) throw Meteor.Error('action-not-found');
  if (consultation.type != Actions.types.CONSULTATION)
    throw new Meteor.Error('action-should-be-' + Actions.types.CONSULTATION);
  if (consultation.extra.state != ConsultationStates.ACTIVE)
    throw new Meteor.Error('consultation-should-be-active');
  if (consultation.userId != this.userId)
    throw new Meteor.Error('forbidden');
  const participation = Actions.findOne({
    type: Actions.types.CONSULTATION_PARTICIPATION,
    'extra.consultationId': consultation._id,
    'extra.state': ConsultationParticipationStates.ACTIVE,
  });
  if (!participation)
    throw new Meteor.Error('active-participation-not-found');
  const suggestion = Actions.findOne(participation.objectId);

  return Meteor.users.find(suggestion.userId, {fields: {balance: 1}});
});

const disableTooLongWaitingConsultations = () => {
  Actions.update({
    type: Actions.types.CONSULTATION,
    'extra.state': ConsultationStates.WAITING,
  }, {$set: {
    'extra.state': ConsultationStates.DISABLED,
  }});
};

Meteor.setInterval(() => {
  // обновить резервы всех текущих консультаций
}, 60 * 1000);

Meteor.setInterval(() => {
  // переключить все кносультации с "ожидает участников" до "остановлена"
}, 60 * 60 * 1000);
