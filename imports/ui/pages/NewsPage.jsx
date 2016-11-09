import React from 'react';

import InfiniteScroll from '../components/InfiniteScroll';
import FeedListContainer from '../containers/FeedListContainer';
import ActionTypeFilter from '../components/ActionTypeFilter';
import { Actions } from '../../api/actions';

export default () =>
  <InfiniteScroll>
    <ActionTypeFilter defaultTypes={Actions.relevantTypes}>
      <FeedListContainer selector={{isNotification: false}} onEmptyMessage="Новости не найдены" />
    </ActionTypeFilter>
  </InfiniteScroll>;
