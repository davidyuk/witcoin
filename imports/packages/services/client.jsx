import React from 'react';
import { Route } from 'react-router';

import { Actions } from '../../api/actions';
import { renderRoutes } from '../../startup/client/routes';
import App from '../../ui/layouts/App';
import LinkMenu from '../../ui/components/LinkMenu';
import ActionCreator from '../../ui/components/ActionCreator';

import ServiceListPage from './ui/ServiceListPage';
import ServiceCreator from './ui/ServiceCreator';

renderRoutes.registerRoute(<Route path="services" component={ServiceListPage} />);

App.registerMenuItem(<LinkMenu to="/services">Услуги</LinkMenu>);

ActionCreator.registerCreator({
  type: Actions.types.SERVICE,
  title: 'Услуга',
  render: ServiceCreator,
});
