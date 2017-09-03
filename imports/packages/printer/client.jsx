import React from 'react';
import { Route, IndexRoute } from 'react-router';

import { renderRoutes } from '../../startup/client/routes';
import App from '../../ui/layouts/App';
import LinkMenu from '../../ui/components/LinkMenu';

import PrinterPage from './ui/PrinterPage';
import DocumentPage from './ui/DocumentPage';

renderRoutes.registerRoute(
  <Route path="printer">
    <IndexRoute component={PrinterPage} />
    <Route path="document/:documentId" component={DocumentPage} />
  </Route>
);

App.registerMenuItem(<LinkMenu to="/printer">Принтер</LinkMenu>);
