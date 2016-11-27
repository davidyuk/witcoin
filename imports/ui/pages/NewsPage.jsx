import React from 'react';
import Helmet from 'react-helmet';

import InfiniteScroll from '../components/InfiniteScroll';
import FeedListContainer from '../containers/FeedListContainer';
import ActionTypeFilter from '../components/ActionTypeFilter';
import { Actions } from '../../api/actions';

export default () => <div>
  <Helmet title="Новости" />
  <InfiniteScroll>
    <ActionTypeFilter defaultTypes={Actions.relevantTypes}>
      <FeedListContainer selector={{isNotification: false}} onEmptyMessage="Новости не найдены" />
    </ActionTypeFilter>
  </InfiniteScroll>
</div>;
