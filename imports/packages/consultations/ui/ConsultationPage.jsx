import React from 'react';
import { withRouter } from 'react-router';
import Helmet from 'react-helmet';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import { pageWrapper } from '../../../ui/hocs';
import LinkToUser from '../../../ui/components/LinkToUser';
import ActionList from '../../../ui/components/ActionList';
import CommentList from '../../../ui/components/CommentList';
import VoteButton from '../../../ui/components/VoteButton';
import ShareButton from '../../../ui/components/ShareButton';
import Date from '../../../ui/components/Date';
import { Actions } from '../../../api/actions';

import { ConsultationStates, ConsultationParticipationStates } from '../action-types';
import ConsultationState from './ConsultationState';
import ConsultationEditor from './ConsultationEditor';
import ConsultationSuggestionEditor from './ConsultationSuggestionEditor';
import ConsultationCurrentParticipation from './ConsultationCurrentParticipation';
import { toggleConsultationState } from '../api';

const ConsultationPage = ({consultation, user, router, actionsLoading, suggestions, completed}) => {
  const removeConsultation = () => {
    Meteor.call('action.remove', consultation._id);
    router.goBack();
  };

  const truncateString = (str, n) => str.length > n ? str.substr(0, n) + '…' : str;
  const {state} = consultation.extra;
  const actual = state != ConsultationStates.DISABLED;
  const owner = Meteor.userId() == consultation.userId;

  return (
    <div className="row">
      <Helmet title={truncateString(consultation.description, 50)} />
      <div className="col-sm-7">
        <table className="table table-noTopBorder table-noStretchLastColumn">
          <tbody>
          <tr>
            <td><LinkToUser user={user} /></td>
            <td><ConsultationState {...{consultation}} /></td>
          </tr>
          <tr>
            <td>Дата создания</td>
            <td><Date value={consultation.createdAt} /></td>
          </tr>
          <tr>
            <td>
              {owner && <div>
                {!consultation.unDeletable && <span>
                  <button className="btn btn-danger btn-xs" onClick={removeConsultation}>
                    <span className="glyphicon glyphicon-remove" />
                    &nbsp;Удалить
                  </button>
                  &nbsp;
                </span>}
                <button className="btn btn-default btn-xs" data-toggle="collapse" data-target="#editConsultation">
                  <span className="glyphicon glyphicon-pencil" />
                  &nbsp;Изменить
                </button>
                &nbsp;
                <button className="btn btn-default btn-xs"
                        onClick={() => toggleConsultationState.call({actionId: consultation._id})}>
                  {actual ? 'Остановить' : 'Возобновить'}
                </button>
              </div>}
            </td>
            <td style={{textAlign: 'right'}}>
              <ShareButton action={consultation} />
              &nbsp;<VoteButton action={consultation} />
            </td>
          </tr>
          </tbody>
        </table>
        {owner && (
          <div className="collapse" id="editConsultation" style={{marginBottom: '20px'}}>
            <strong>Изменить консультацию</strong>
            <ConsultationEditor instance={consultation} />
          </div>
        )}

        <ConsultationCurrentParticipation consultationId={consultation._id} />

        <div>{consultation.description}</div>
        <CommentList actionId={consultation._id} comments={consultation.comments} showAll={true} />
      </div>
      <div className="col-sm-5">
        <ul className="nav nav-tabs" style={{marginBottom: '5px'}}>
          <li className="active"><a href="#suggestions" data-toggle="tab">
            Предложения <span className="label label-success">{suggestions.length}</span>
          </a></li>
          <li><a href="#conducted" data-toggle="tab">
            Проведено <span className="label label-default">{completed.length}</span>
          </a></li>
        </ul>

        <div className="tab-content">
          <div className="tab-pane fade in active" id="suggestions">
            <ActionList actions={suggestions} {...{actionsLoading}} onEmptyMessage="Предложений нет"
                        baseType={Actions.types.CONSULTATION_SUGGESTION}
                        consultationOwner={owner && state != ConsultationStates.ACTIVE} />
            {!owner && (
              <div className="panel panel-default panel-body">
                <strong>Участвовать в консультации</strong>
                <ConsultationSuggestionEditor consultation={consultation} />
              </div>
            )}
          </div>
          <div className="tab-pane fade" id="conducted">
            <ActionList actions={completed} {...{actionsLoading}} onEmptyMessage="Нет проведённых консультаций"
                        baseType={Actions.types.CONSULTATION_PARTICIPATION} />
          </div>
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
  const {CONSULTATION, CONSULTATION_SUGGESTION, CONSULTATION_PARTICIPATION, TRANSACTION} = Actions.types;
  const loading = !Meteor.subscribe('actions', {_id: id, type: CONSULTATION}, {}, 1).ready();
  const consultation = Actions.findOne(id);
  const user = Meteor.users.findOne(consultation && consultation.userId);

  const actionsLoading = !Meteor.subscribe('actions', {
    type: {$in: [CONSULTATION_SUGGESTION, CONSULTATION_PARTICIPATION, TRANSACTION]},
    $or: [{objectId: id}, {'extra.consultationId': id}],
  }, {}, 1000).ready();

  return {
    loading,
    notFound: !consultation || !user,
    consultation,
    user,
    actionsLoading,
    suggestions: Actions.find(
      {type: CONSULTATION_SUGGESTION},
      {sort: {'extra.coinsPerHour': -1, 'extra.minutes': 1, createdAt: 1}},
    ).fetch().filter(suggestion => {
      const participation = Actions.findOne({type: CONSULTATION_PARTICIPATION, objectId: suggestion._id});
      return !participation || participation.extra.state != ConsultationParticipationStates.COMPLETED;
    }),
    completed: Actions.find(
      {type: CONSULTATION_PARTICIPATION, 'extra.state': 'completed'},
      {sort: {createdAt: -1}},
    ).fetch().map(participation => {
      const transaction = Actions.findOne({type: TRANSACTION, objectId: participation._id});
      return transaction || participation;
    }),
  };
}, pageWrapper(withRouter(ConsultationPage)));
