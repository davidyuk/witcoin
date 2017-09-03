import { Actions } from '../../api/actions';
import Action from '../../ui/components/Action';

import { TransactionParentActionTypes } from '../transactions';

import ServiceAction from './ui/ServiceAction';

Actions.types.SERVICE = 'service';
Actions.relevantTypes.push(Actions.types.SERVICE);
Actions.simpleTypes.push(Actions.types.SERVICE);
Actions.typesTree['Услуги'] = Actions.types.SERVICE;

TransactionParentActionTypes.push(Actions.types.SERVICE);

Action.registerActionRender(Actions.types.SERVICE, ServiceAction);

if (Meteor.isClient) require('./client');

Factory.define('service', Actions, Factory.extend('action.default', {
  type: Actions.types.SERVICE,
}));
