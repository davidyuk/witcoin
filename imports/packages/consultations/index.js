import { Meteor } from 'meteor/meteor';

import { Actions } from '../../api/actions';
import Action from '../../ui/components/Action';

import './api';
import ConsultationAction from './ui/ConsultationAction';
import ConsultationSuggestionAction from './ui/ConsultationSuggestionAction';
import ConsultationParticipationAction from './ui/ConsultationParticipationAction';

Action.registerActionRender(Actions.types.CONSULTATION, ConsultationAction);
Action.registerActionRender(Actions.types.CONSULTATION_SUGGESTION, ConsultationSuggestionAction);
Action.registerActionRender(Actions.types.CONSULTATION_PARTICIPATION, ConsultationParticipationAction);

if (Meteor.isServer) require('./server');
if (Meteor.isClient) require('./client');
