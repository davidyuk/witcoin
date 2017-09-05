import React from 'react';
import { Route, IndexRoute } from 'react-router';

import { Actions } from '../../api/actions';
import { renderRoutes } from '../../startup/client/routes';
import App from '../../ui/layouts/App';
import LinkMenu from '../../ui/components/LinkMenu';
import ActionCreator from '../../ui/components/ActionCreator';

import TaskListPage from './ui/TaskListPage';
import TaskPageContainer from './ui/TaskPageContainer';
import TaskCreator from './ui/TaskCreator';

renderRoutes.registerRoute(
  <Route path="tasks">
    <IndexRoute component={TaskListPage} />
    <Route path=":taskId" component={TaskPageContainer} />
  </Route>
);

App.registerMenuItem(<LinkMenu to="/tasks">Задания</LinkMenu>);

ActionCreator.registerCreator({
  type: Actions.types.TASK,
  title: 'Задание',
  render: TaskCreator,
});
