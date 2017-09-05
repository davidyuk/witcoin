import React from 'react';
import Helmet from 'react-helmet';

import InfiniteScroll from '../../../ui/components/InfiniteScroll';
import ActionListContainer from '../../../ui/containers/ActionListContainer';

import TransactionCreator from './TransactionCreator';
import { registeredTransactionTypes } from '../internal';

export default () =>
  <div className="row">
    <Helmet title="Операции" />
    <div className="col-md-3">
      <div className="panel panel-default panel-body">
        <strong>Перевести кленинки</strong>
        <TransactionCreator />
      </div>
    </div>
    <div className="col-md-9">
      <InfiniteScroll>
        <ActionListContainer selector={{type: {$in: registeredTransactionTypes}}}
                             onEmptyMessage="Операции не найдены" />
      </InfiniteScroll>
    </div>
  </div>;
