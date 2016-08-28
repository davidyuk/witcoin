import { Meteor } from 'meteor/meteor';
import React from 'react';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import AppContainer from '../../ui/containers/AppContainer';
import HomePageContainer from '../../ui/containers/HomePageContainer';
import UserPageContainer from '../../ui/containers/UserPageContainer';
import ChatPageContainer from '../../ui/containers/ChatPageContainer';

import AccountsPage from '../../ui/pages/AccountsPage';
import NotFoundPage from '../../ui/pages/NotFoundPage';

function requireAuth(nextState, replace) {
  if (!Meteor.userId()) {
    replace({
      pathname: '/sign-in',
      state: { nextPathname: nextState.location.pathname },
    })
  }
}

export const renderRoutes = () => (
  <Router history={browserHistory}>
    <Route path="/" component={AppContainer}>
      <IndexRoute component={HomePageContainer} />
      <Route path="sign-in" component={AccountsPage} />
      <Route path="sign-up" component={AccountsPage} />
      <Route path="u/:userId" component={UserPageContainer} />

      <Route path="im" onEnter={requireAuth}>
        <IndexRoute component={ChatPageContainer} />
        <Route path=":chatId" component={ChatPageContainer} />
      </Route>

      <Route path="*" component={NotFoundPage} />
    </Route>
  </Router>
);
