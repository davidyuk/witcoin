import React from 'react';

import InfiniteScroll from '../components/InfiniteScroll';
import FeedListContainer from '../containers/FeedListContainer';

export default class NewsPage extends React.Component {
  render() {
    return (
      <InfiniteScroll>
        <FeedListContainer selector={{isNotification: false}} onEmptyMessage="Нет новостей" />
      </InfiniteScroll>
    );
  }
}
