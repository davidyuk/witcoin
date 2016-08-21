import React from 'react';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import AppContainer from '../../ui/containers/AppContainer';
import HomePageContainer from '../../ui/containers/HomePageContainer';
import UserPageContainer from '../../ui/containers/UserPageContainer';

import AccountsPage from '../../ui/pages/AccountsPage';
import NotFoundPage from '../../ui/pages/NotFoundPage';

export const renderRoutes = () => (
  <Router history={browserHistory}>
    <Route path="/" component={AppContainer}>
      <IndexRoute component={HomePageContainer} />
      <Route path="accounts" component={AccountsPage} />
      <Route path="u/:userId" component={UserPageContainer} />
      <Route path="*" component={NotFoundPage} />
    </Route>
  </Router>
);
