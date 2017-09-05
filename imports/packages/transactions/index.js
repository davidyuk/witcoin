import Action from '../../ui/components/Action';
import { Actions } from '../../api/actions';

import './action-type';
import TransactionAction from './ui/TransactionAction';
import TransactionActionButton from './ui/TransactionActionButton';

export * from './packages-api';

Action.registerActionRender(Actions.types.TRANSACTION, TransactionAction);
Action.registerBottomButton(TransactionActionButton);

require('./api');

if (Meteor.isClient) require('./client');
if (Meteor.isServer) require('./server');
