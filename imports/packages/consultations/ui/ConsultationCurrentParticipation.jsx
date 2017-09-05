import React from 'react';
import ReactMixin from 'react-mixin';
import TimerMixin from 'react-timer-mixin';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import { Actions } from '../../../api/actions';

import CoinsAmount from '../../transactions/ui/CoinsAmount';

import { ConsultationParticipationStates } from '../action-types';
import Duration from './Duration';
import { confirmParticipation, stopConsultation } from '../api';
import { countCoins } from '../utils';

export default class ConsultationCurrentParticipation extends React.Component {
  getMeteorData() {
    const consultation = Actions.findOne(this.props.consultationId);
    const isParticipant = Meteor.userId() != consultation.userId;
    const participation = Actions.findOne({
      type: Actions.types.CONSULTATION_PARTICIPATION,
      'extra.consultationId': consultation._id,
      ...isParticipant ? {
          'extra.state': {$in: [ConsultationParticipationStates.ACTIVE, ConsultationParticipationStates.WAITING]},
          'extra.userId': Meteor.userId(),
        } : {
          'extra.state': ConsultationParticipationStates.ACTIVE,
        },
    });
    const suggestion = participation && Actions.findOne(participation.objectId);
    if (!isParticipant && suggestion) Meteor.subscribe('consultation.participantBalance', consultation._id);

    return {
      consultation,
      participation,
      suggestion,
      isParticipant,
      participantBalance: suggestion ? Meteor.users.findOne(suggestion.userId).balance : 0,
    };
  }

  render() {
    const {consultation, participation, suggestion, isParticipant, participantBalance} = this.data;
    if (!participation || !suggestion) return null;

    const {extra: {coinsPerHour}} = suggestion;
    if (participation.extra.state == ConsultationParticipationStates.WAITING)
      return <div style={{marginBottom: '20px'}}>
        <h4>Текущая консультация</h4>
        {coinsPerHour && <table className="table table-bordered table-hover table-noStretchLastColumn">
          <tbody>
          <tr>
            <td>Цена</td>
            <td><CoinsAmount value={coinsPerHour}/> в час</td>
          </tr>
          </tbody>
        </table>}
        <button className="btn btn-primary"
                onClick={() => confirmParticipation.call({actionId: participation._id})}>
          Начать консультацию
        </button>
      </div>;

    const {extra: {startAt}} = participation;
    const coinsOverAt = new Date(startAt.getTime() + participantBalance / coinsPerHour * 60 * 60 * 1000);
    this.setTimeout(() => this.forceUpdate(), 1000);

    return <div style={{marginBottom: '20px'}}>
      <h4>Текущая консультация</h4>
      {coinsOverAt > Date.now() && coinsOverAt - startAt < 1000 * 60 * 10 && <div className="alert alert-warning">
        Средства участника закночатся через <Duration beginAt={new Date()} endAt={coinsOverAt} isAccusative={true} />.
      </div>}
      {coinsOverAt <= Date.now() && <div className="alert alert-danger">
        Средства участника закончились.
      </div>}
      <table className="table table-bordered table-hover table-noStretchLastColumn">
        <tbody>
        <tr>
          <td>Длительность</td>
          <td><Duration beginAt={startAt} endAt={new Date()} /></td>
        </tr>
        {coinsPerHour && <tr style={{visibility: coinsPerHour ? 'visible' : 'hidden'}}>
          <td>Цена</td>
          <td><CoinsAmount value={coinsPerHour}/> в час</td>
        </tr>}
        {coinsPerHour && <tr style={{visibility: coinsPerHour ? 'visible' : 'hidden'}}>
          <td>Стоимость</td>
          <td><CoinsAmount value={countCoins(startAt, new Date(), coinsPerHour, participantBalance)}/></td>
        </tr>}
        </tbody>
      </table>
      <button className="btn btn-success" onClick={() => stopConsultation.call({actionId: consultation._id})}>
        Завершить консультацию
      </button>
      {!isParticipant && coinsPerHour && <span>{' '}
        <button className="btn btn-warning"
                onClick={() => stopConsultation.call({actionId: consultation._id, transferCoins: false})}>
          Остановить без перевода кленинок
        </button>
      </span>}
    </div>;
  };
}

ConsultationCurrentParticipation.propTypes = {
  consultationId: React.PropTypes.string.isRequired,
};

ReactMixin(ConsultationCurrentParticipation.prototype, ReactMeteorData);
ReactMixin(ConsultationCurrentParticipation.prototype, TimerMixin);
