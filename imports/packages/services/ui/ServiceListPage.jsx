import React from 'react';
import Helmet from 'react-helmet';

import { Actions } from '../../../api/actions';
import InfiniteScroll from '../../../ui/components/InfiniteScroll';
import ActionListContainer from '../../../ui/containers/ActionListContainer';

import ServiceCreator from './ServiceCreator';

export default () =>
  <div className="row">
    <Helmet title="Услуги" />
    <div className="col-md-3">
      <div className="panel panel-default panel-body">
        <strong>Добавить услугу</strong>
        <ServiceCreator />
      </div>
    </div>
    <div className="col-md-9">
      <h4>Недавно добавленные</h4>
      <ActionListContainer selector={{type: Actions.types.SERVICE, 'rates.total': {$gte: 0}}}
                           sort={{createdAt: -1}}
                           limit={2}
                           baseType={Actions.types.SERVICE}
                           onEmptyMessage="Услуги не найдены" />
      <h4>Все услуги</h4>
      <InfiniteScroll>
        <ActionListContainer selector={{type: Actions.types.SERVICE}}
                             sort={{'rates.total': -1, createdAt: -1}}
                             baseType={Actions.types.SERVICE}
                             onEmptyMessage="Услуги не найдены" />
      </InfiniteScroll>
    </div>
  </div>;
