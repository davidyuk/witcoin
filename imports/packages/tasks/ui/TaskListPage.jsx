import React from 'react';
import Helmet from 'react-helmet';

import { Actions } from '../../../api/actions';
import InfiniteScroll from '../../../ui/components/InfiniteScroll';
import ActionListContainer from '../../../ui/containers/ActionListContainer';

import TaskCreator from './TaskCreator';

export default () =>
  <div className="row">
    <Helmet title="Задания" />
    <div className="col-md-3">
      <div className="panel panel-default panel-body">
        <strong>Добавить задание</strong>
        <TaskCreator />
      </div>
    </div>
    <div className="col-md-9">
      <InfiniteScroll>
        <ActionListContainer selector={{type: Actions.types.TASK}}
                             sort={{'extra.isActual': -1, createdAt: -1}}
                             baseType={Actions.types.TASK}
                             onEmptyMessage="Задания не найдены" />
      </InfiniteScroll>
    </div>
  </div>;
