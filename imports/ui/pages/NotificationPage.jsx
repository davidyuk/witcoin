import React from 'react';

import InfiniteScroll from '../components/InfiniteScroll';
import FeedListContainer from '../containers/FeedListContainer';
import ActionTypeFilter from '../components/ActionTypeFilter';
import { Actions } from '../../api/actions';

export default () => {
  const T = Actions.types;
  const defaultTypes = [T.SHARE, T.SUBSCRIBE, T.RATE, T.COMMENT];
  const typesTree = {
    'Репосты': T.SHARE,
    'Подписки': T.SUBSCRIBE,
    'Оценки': T.RATE,
    'Комментарии': T.COMMENT,
    'Выбрать все': defaultTypes,
  };

  return (
    <InfiniteScroll>
      <ActionTypeFilter {...{ typesTree, defaultTypes }}>
        <FeedListContainer selector={{isNotification: true}} onEmptyMessage="Уведомления не найдены" />
      </ActionTypeFilter>
    </InfiniteScroll>
  );
}
