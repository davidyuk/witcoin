import React from 'react';

import InfiniteScroll from '../components/InfiniteScroll';
import FeedListContainer from '../containers/FeedListContainer';
import ActionTypeFilter from '../components/ActionTypeFilter';
import { Actions } from '../../api/actions';

export default () => {
  const T = Actions.types;
  const typesTree = {
    'Репосты': T.SHARE,
    'Подписки': T.SUBSCRIBE,
    'Оценки': T.RATE,
    'Комментарии': T.COMMENT,
  };

  return (
    <InfiniteScroll>
      <ActionTypeFilter {...{ typesTree }}>
        <FeedListContainer selector={{isNotification: true}} onEmptyMessage="Уведомления не найдены" />
      </ActionTypeFilter>
    </InfiniteScroll>
  );
}
