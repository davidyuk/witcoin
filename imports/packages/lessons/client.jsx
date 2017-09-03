import React from 'react';
import { Route, IndexRoute } from 'react-router';

import { Actions } from '../../api/actions';
import { renderRoutes } from '../../startup/client/routes';
import App from '../../ui/layouts/App';
import LinkMenu from '../../ui/components/LinkMenu';
import ActionCreator from '../../ui/components/ActionCreator';

import LessonListPage from './ui/LessonListPage';
import LessonPageContainer from './ui/LessonPageContainer';
import LessonCreator from './ui/LessonEditor';

renderRoutes.registerRoute(
  <Route path="lessons">
    <IndexRoute component={LessonListPage} />
    <Route path=":id" component={LessonPageContainer} />
  </Route>
);

App.registerMenuItem(<LinkMenu to="/lessons">Мастер-классы</LinkMenu>);

ActionCreator.registerCreator({
  type: Actions.types.LESSON,
  title: 'Мастер-класс',
  render: LessonCreator,
});
