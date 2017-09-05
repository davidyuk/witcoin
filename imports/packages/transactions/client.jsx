import React from 'react';
import { Route } from 'react-router';

import { Actions } from '../../api/actions';
import { renderRoutes } from '../../startup/client/routes';
import App from '../../ui/layouts/App';
import ActionCreator from '../../ui/components/ActionCreator';
import UserPage from '../../ui/pages/UserPage';
import LinkMenu from '../../ui/components/LinkMenu';

import TransactionListPage from './ui/TransactionListPage';
import ReserveListPage from './ui/ReserveListPage';
import TransactionCreator from './ui/TransactionCreator';
import TransactionCreatorForUserPage from './ui/TransactionCreatorForUserPage';

renderRoutes.registerRoute(<Route path="transactions" component={TransactionListPage} />);
renderRoutes.registerRoute(<Route path="reserves" component={ReserveListPage} />);

App.registerMenuItem(<LinkMenu to="/transactions">Операции</LinkMenu>);

ActionCreator.registerCreator({
  type: Actions.types.TRANSACTION,
  title: 'Операция',
  render: TransactionCreator,
});

UserPage.registerButton(TransactionCreatorForUserPage);
