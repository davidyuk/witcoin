import React from 'react';

import InfiniteScroll from '../components/InfiniteScroll';
import FeedListContainer from '../containers/FeedListContainer';
import ActionTypeFilter from '../components/ActionTypeFilter';

export default class NewsPage extends React.Component {
  render() {
    return (
      <InfiniteScroll>
        <ActionTypeFilter>
          <FeedListContainer selector={{isNotification: false}} onEmptyMessage="Новости не найдены" />
        </ActionTypeFilter>
      </InfiniteScroll>
    );
  }
}
