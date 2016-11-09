import React from 'react';

import InfiniteScroll from '../components/InfiniteScroll';
import FeedListContainer from '../containers/FeedListContainer';
import ActionTypeFilter from '../components/ActionTypeFilter';
import { Actions } from '../../api/actions';

export default () =>
  <InfiniteScroll>
    <ActionTypeFilter typesTree={Actions.notificationTypesTree}>
      <FeedListContainer selector={{isNotification: true}} onEmptyMessage="Уведомления не найдены" />
    </ActionTypeFilter>
  </InfiniteScroll>;
