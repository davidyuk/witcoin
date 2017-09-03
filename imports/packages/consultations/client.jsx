import React from 'react';
import { Route, IndexRoute } from 'react-router';

import { Actions } from '../../api/actions';
import { renderRoutes } from '../../startup/client/routes';
import App from '../../ui/layouts/App';
import LinkMenu from '../../ui/components/LinkMenu';
import ActionCreator from '../../ui/components/ActionCreator';

import ConsultationListPage from './ui/ConsultationListPage';
import ConsultationPage from './ui/ConsultationPage';
import ConsultationEditor from './ui/ConsultationEditor';

renderRoutes.registerRoute(
  <Route path="consultations">
    <IndexRoute component={ConsultationListPage} />
    <Route path=":id" component={ConsultationPage} />
  </Route>
);

App.registerMenuItem(<LinkMenu to="/consultations">Консультации</LinkMenu>);

ActionCreator.registerCreator({
  type: Actions.types.CONSULTATION,
  title: 'Консультация',
  render: ConsultationEditor,
});
