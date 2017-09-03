import React from 'react';
import Helmet from 'react-helmet';

import { Actions } from '../../../api/actions';
import InfiniteScroll from '../../../ui/components/InfiniteScroll';
import ActionListContainer from '../../../ui/containers/ActionListContainer';

import ConsultationEditor from './ConsultationEditor';

export default () =>
  <div className="row">
    <Helmet title="Консультации" />
    <div className="col-sm-7">
      <InfiniteScroll>
        <ActionListContainer selector={{type: Actions.types.CONSULTATION}}
                             sort={{'extra.isActual': -1, createdAt: -1}}
                             baseType={Actions.types.CONSULTATION}
                             onEmptyMessage="Консультации не найдены" />
      </InfiniteScroll>
    </div>
    <div className="col-sm-5">
      <div className="panel panel-default panel-body">
        <strong>Добавить консультацию</strong>
        <ConsultationEditor />
      </div>
    </div>
  </div>;
