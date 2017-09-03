import React from 'react';
import Helmet from 'react-helmet';

import { Actions } from '../../../api/actions';
import InfiniteScroll from '../../../ui/components/InfiniteScroll';
import ActionListContainer from '../../../ui/containers/ActionListContainer';

import LessonCreator from './LessonEditor';

export default () =>
  <div className="row">
    <Helmet title="Мастер-классы" />
    <div className="col-sm-7">
      <InfiniteScroll>
        <ActionListContainer selector={{type: Actions.types.LESSON}}
                             sort={{'extra.isActual': -1, createdAt: -1}}
                             baseType={Actions.types.LESSON}
                             onEmptyMessage="Мастер-классы не найдены" />
      </InfiniteScroll>
    </div>
    <div className="col-sm-5">
      <div className="panel panel-default panel-body">
        <strong>Добавить мастер-класс</strong>
        <LessonCreator />
      </div>
    </div>
  </div>;
