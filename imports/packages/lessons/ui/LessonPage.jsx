import React from 'react';
import { withRouter } from 'react-router';
import Helmet from 'react-helmet';
import { FormattedPlural } from 'react-intl';

import NotFoundPage from '../../../ui/pages/NotFoundPage.jsx';
import LinkToUser from '../../../ui/components/LinkToUser';
import ActionListContainer from '../../../ui/containers/ActionListContainer';
import CommentList from '../../../ui/components/CommentList';
import VoteButton from '../../../ui/components/VoteButton';
import ShareButton from '../../../ui/components/ShareButton';
import MessageInput from '../../../ui/components/MessageInput';
import Date from '../../../ui/components/Date';
import { Actions } from '../../../api/actions';

import CoinsAmount from '../../transactions/ui/CoinsAmount';
import { PRECISION_FACTOR } from '../../transactions/constants';

import LessonEditor from './LessonEditor';
import LessonParticipationCreator from './LessonParticipationCreator';
import LessonState from './LessonState';
import RequiredProgress from './RequiredProgress';
import Duration from './Duration';
import FormattedPluralParticipants from './FormattedPluralParticipants';

const LessonPage = ({action, user, router}) => {
  const remove = () => {
    Meteor.call('action.remove', action._id);
    router.goBack();
  };
  const truncateString = (str, n) => str.length > n ? str.substr(0, n) + '…' : str;
  const owner = Meteor.userId() == action.userId;
  const {
    extra: {
      requiredParticipants, requiredCoins,
      participantsCount, coinsCount,
      beginAt, endAt, location,
      state,
    },
    description,
    createdAt,
  } = action;

  return (
    <div className="row">
      <Helmet title={truncateString(description, 50)} />
      <div className="col-sm-7">
        <table className="table table-noTopBorder">
          <tbody>
          <tr>
            <td><LinkToUser user={user} /></td>
            <td><LessonState state={state} /></td>
          </tr>
          <tr><td>Дата создания</td><td><Date value={createdAt} /></td></tr>
          <tr><td>Дата начала</td><td>{beginAt ? <Date value={beginAt} /> : 'Не определена'}</td></tr>
          <tr><td>Дата завершения</td><td>{endAt ? <Date value={endAt} /> : 'Не определена'}</td></tr>
          {beginAt && endAt ? <tr>
            <td>Длительность</td><td><Duration {...{beginAt, endAt}} /></td>
          </tr> : null}
          <tr><td>Место проведения</td><td>{location ? location : 'Не определено'}</td></tr>
          <tr>
            <td>{owner ? (
              <div>
                <button className="btn btn-danger btn-xs" onClick={remove}>
                  <span className="glyphicon glyphicon-remove" /> Удалить
                </button>
                &nbsp;
                <button className="btn btn-default btn-xs" data-toggle="collapse" data-target="#editForm">
                  <span className="glyphicon glyphicon-pencil" /> Изменить
                </button>
              </div>
            ) : null}</td>
            <td style={{textAlign: 'right'}}><ShareButton action={action} /> <VoteButton action={action} /></td>
          </tr>
          </tbody>
        </table>

        {owner ? (
          <div className="collapse" id="editForm" style={{marginBottom: '20px'}}>
            <strong>Изменить мастер-класс</strong>
            <LessonEditor instance={action} />
          </div>
        ) : null}

        {requiredCoins ? (
          <RequiredProgress value={coinsCount / requiredCoins}>
            {coinsCount / PRECISION_FACTOR}/{requiredCoins / PRECISION_FACTOR} кленинок
          </RequiredProgress>
        ) : null}

        {requiredParticipants ? (
          <RequiredProgress value={participantsCount / requiredParticipants}>
            {participantsCount}/{requiredParticipants} участников
          </RequiredProgress>
        ) : null}

        <div>{description}</div>
        <CommentList actionId={action._id} comments={action.comments} showAll={true} />
      </div>
      <div className="col-sm-5">
        <h3>Участники</h3>
        <ActionListContainer selector={{objectId: action._id, type: Actions.types.LESSON_PARTICIPATION}}
                             sort={{'rates.total': -1, createdAt: 1}}
                             baseType={Actions.types.LESSON_PARTICIPATION}
                             onEmptyMessage="Участников нет" limit={1000} />
        <LessonParticipationCreator lesson={action} />
      </div>
    </div>
  );
};

LessonPage.propTypes = {
  action: React.PropTypes.object,
  router: React.PropTypes.object.isRequired,
};

export default withRouter(LessonPage);
