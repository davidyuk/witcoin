import React from 'react';

import InfiniteScroll from '../components/InfiniteScroll';
import FeedListContainer from '../containers/FeedListContainer';

export default class NotificationPage extends React.Component {
  render() {
    return (
      <InfiniteScroll>
        <FeedListContainer selector={{isNotification: true}} onEmptyMessage="Нет уведомлений" />
      </InfiniteScroll>
    );
  }
}
