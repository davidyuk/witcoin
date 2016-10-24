import React from 'react';

import InfiniteScroll from '../components/InfiniteScroll';
import FeedListContainer from '../containers/FeedListContainer';
import ActionTypeFilter from '../components/ActionTypeFilter';

export default () =>
  <InfiniteScroll>
    <ActionTypeFilter>
      <FeedListContainer selector={{isNotification: false}} onEmptyMessage="Новости не найдены" />
    </ActionTypeFilter>
  </InfiniteScroll>;
