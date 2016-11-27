import React from 'react';
import Helmet from 'react-helmet';

import InfiniteScroll from '../components/InfiniteScroll';
import FeedListContainer from '../containers/FeedListContainer';
import ActionTypeFilter from '../components/ActionTypeFilter';
import { Actions } from '../../api/actions';

export default () => <div>
  <Helmet title="Уведомления" />
  <InfiniteScroll>
    <ActionTypeFilter typesTree={Actions.notificationTypesTree}>
      <FeedListContainer selector={{isNotification: true}} onEmptyMessage="Уведомления не найдены" />
    </ActionTypeFilter>
  </InfiniteScroll>
</div>;
