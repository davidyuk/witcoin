import React from 'react';

import InfiniteScroll from '../components/InfiniteScroll';
import NotificationListContainer from '../containers/NotificationListContainer';

export default class NotificationPage extends React.Component {
  render() {
    return (
      <InfiniteScroll>
        <NotificationListContainer onEmptyMessage="Нет уведомлений" />
      </InfiniteScroll>
    );
  }
}
