import { Meteor } from 'meteor/meteor';
import React from 'react';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { IntlProvider } from 'react-intl';
import { jQuery } from 'meteor/jquery';

import App from '../../ui/layouts/App';
import HomePageContainer from '../../ui/containers/HomePageContainer';
import UserPageContainer from '../../ui/containers/UserPageContainer';
import ChatPageContainer from '../../ui/containers/ChatPageContainer';

import AccountsPage from '../../ui/pages/AccountsPage';
import NotFoundPage from '../../ui/pages/NotFoundPage';
import NewsPage from '../../ui/pages/NewsPage';
import NotificationPage from '../../ui/pages/NotificationPage';
import SettingsPage from '../../ui/pages/SettingsPage';

const hideNavbar = () => {
  jQuery('.navbar-collapse.in').collapse('hide');
};

function requireAuth(nextState, replace) {
  if (!Meteor.userId()) {
    replace({
      pathname: '/sign-in',
      state: { nextPathname: nextState.location.pathname },
    })
  }
}

const handleNotAuthError = err => {
  if (err && err.error == 'not-authorized') {
    browserHistory.push({
      pathname: '/sign-in',
      state: { nextPathname: window.location.pathname },
    });
  }
};

const _meteorCall = Meteor.call;
Meteor.call = function() {
  if (typeof arguments[arguments.length - 1] == 'function') {
    const cb = arguments[arguments.length - 1];
    arguments[arguments.length - 1] = function (err) {
      cb.apply(this, arguments);
      handleNotAuthError.apply(this, arguments);
    };
    _meteorCall.apply(this, arguments);
  } else {
    _meteorCall.apply(this, [...arguments, handleNotAuthError]);
  }
};

export const renderRoutes = () => (
  <IntlProvider locale="ru">
    <Router history={browserHistory}>
      <Route path="/" component={App} onChange={hideNavbar}>
        <IndexRoute component={HomePageContainer} />

        <Route path="sign-in" component={AccountsPage} />
        <Route path="sign-up" component={AccountsPage} />
        <Route path="change-password" component={AccountsPage} />
        <Route path="forgot-password" component={AccountsPage} />
        <Route path="reset-password/:token" component={AccountsPage} />
        <Route path="verify-email/:token" component={AccountsPage} />

        <Route path="u/:userId" component={UserPageContainer} />

        <Route path="settings" component={SettingsPage} onEnter={requireAuth} />

        <Route path="im" onEnter={requireAuth}>
          <IndexRoute component={ChatPageContainer} />
          <Route path=":chatId" component={ChatPageContainer} />
        </Route>
        <Route path="feed" component={NewsPage} onEnter={requireAuth} />
        <Route path="notifications" component={NotificationPage} onEnter={requireAuth} />

        {renderRoutes._routes.map(route =>
          React.cloneElement(route, {...route.props, key: route.props.path})
        )}

        <Route path="*" component={NotFoundPage} />
      </Route>
    </Router>
  </IntlProvider>
);

renderRoutes._routes = [];

renderRoutes.registerRoute = route => renderRoutes._routes.push(route);
