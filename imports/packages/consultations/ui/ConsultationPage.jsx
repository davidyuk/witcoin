import React from 'react';
import { withRouter } from 'react-router';
import Helmet from 'react-helmet';
import { FormattedPlural } from 'react-intl';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import { pageWrapper } from '../../../ui/hocs';
import LinkToUser from '../../../ui/components/LinkToUser';
import ActionListContainer from '../../../ui/containers/ActionListContainer';
import CommentList from '../../../ui/components/CommentList';
import VoteButton from '../../../ui/components/VoteButton';
import ShareButton from '../../../ui/components/ShareButton';
import Date from '../../../ui/components/Date';
import { Actions } from '../../../api/actions';

import CoinsAmount from '../../transactions/ui/CoinsAmount';
import { PRECISION_FACTOR } from '../../transactions/constants';

import { ConsultationStates } from '../index';
import ConsultationState from './ConsultationState';
import ConsultationEditor from './ConsultationEditor';
import ConsultationSuggestionEditor from './ConsultationSuggestionEditor';
import { setConsultationActual } from '../api';

const ConsultationPage = ({consultation, user, router}) => {
  const removeConsultation = () => {
    Meteor.call('action.remove', consultation._id);
    router.goBack();
  };

  const truncateString = (str, n) => str.length > n ? str.substr(0, n) + '…' : str;
  const {actual} = consultation.extra;
  const state = actual ? ConsultationStates.WAITING : ConsultationStates.DISABLED;
  const owner = Meteor.userId() == consultation.userId;

  return (
    <div className="row">
      <Helmet title={truncateString(consultation.description, 50)} />
      <div className="col-sm-7">
        <table className="table table-noTopBorder">
          <tbody>
          <tr>
            <td><LinkToUser user={user} /></td>
            <td><ConsultationState state={state} /></td>
          </tr>
          <tr>
            <td>Дата создания</td>
            <td><Date value={consultation.createdAt} /></td>
          </tr>
          <tr>
            <td>{owner ? (
              <div>
                <button className="btn btn-danger btn-xs" onClick={removeConsultation}>
                  <span className="glyphicon glyphicon-remove" />
                  &nbsp;Удалить
                </button>
                &nbsp;
                <button className="btn btn-default btn-xs" data-toggle="collapse" data-target="#editConsultation">
                  <span className="glyphicon glyphicon-pencil" />
                  &nbsp;Изменить
                </button>
                &nbsp;
                <button className="btn btn-default btn-xs"
                        onClick={() => setConsultationActual.call({actionId: consultation._id, actual: !actual})}>
                  {actual ? 'Остановить' : 'Возобновить'}
                </button>
              </div>
            ) : null}</td>
            <td style={{textAlign: 'right'}}>
              <ShareButton action={consultation} />
              &nbsp;<VoteButton action={consultation} />
            </td>
          </tr>
          </tbody>
        </table>
        {owner ? (
          <div className="collapse" id="editConsultation" style={{marginBottom: '20px'}}>
            <strong>Изменить консультацию</strong>
            <ConsultationEditor instance={consultation} />
          </div>
        ) : null}

        <div>{consultation.description}</div>
        <CommentList actionId={consultation._id} comments={consultation.comments} showAll={true} />
      </div>
      <div className="col-sm-5">
        <h3>Предложения</h3>
        <ActionListContainer selector={{objectId: consultation._id, type: Actions.types.CONSULTATION_SUGGESTION}}
                             sort={{'extra.coinsPerHour': -1, 'extra.minutes': 1, createdAt: 1}}
                             baseType={Actions.types.CONSULTATION_SUGGESTION}
                             onEmptyMessage="Предложений нет" limit={1000} />
        <div className="panel panel-default panel-body">
          <strong>Участвовать в консультации</strong>
          <ConsultationSuggestionEditor consultation={consultation} />
        </div>
      </div>
    </div>
  );
};

ConsultationPage.propTypes = {
  consultation: React.PropTypes.object.isRequired,
  router: React.PropTypes.object.isRequired,
};

export default createContainer(({params: {id}}) => {
  const loading = !Meteor.subscribe('actions', {_id: id, type: Actions.types.CONSULTATION}, {}, 1).ready();
  const consultation = Actions.findOne(id);
  const user = Meteor.users.findOne(consultation && consultation.userId);

  return {
    loading,
    notFound: !consultation || !user,
    consultation,
    user,
  };
}, pageWrapper(withRouter(ConsultationPage)));
