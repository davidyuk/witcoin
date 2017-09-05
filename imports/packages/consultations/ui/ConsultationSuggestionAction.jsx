import React from 'react';
import { Link } from 'react-router';

import { Actions } from '../../../api/actions';

import CoinsAmount from '../../transactions/ui/CoinsAmount';

import { ConsultationParticipationStates } from '../action-types';

import { createParticipation } from '../api';
import Duration from './Duration';

const ConsultationSuggestionAction = ({action, baseType, user, isNotification, consultationOwner}) => {
  const {objectId: consultationId, extra: {coinsPerHour, minutes}} = action;
  const participation = Actions.findOne({
    type: Actions.types.CONSULTATION_PARTICIPATION,
    objectId: action._id,
  });

  const label = participation && {
    [ConsultationParticipationStates.WAITING]: {context: 'default', text: 'Ожидание подтверждения'},
    [ConsultationParticipationStates.ACTIVE]: {context: 'success', text: 'В процессе'},
  }[participation.extra.state];

  return <span>
    {Actions.types.CONSULTATION_SUGGESTION == baseType ? <span>
        {!label && consultationOwner && (
          <button className="btn btn-xs btn-default"
                  onClick={() => createParticipation.call({actionId: action._id})}>
            Начать консультацию
          </button>
        )}
        {label && <span className={'label label-' + label.context}>{label.text}</span>}
      </span> : <span>
      добавил{user.isMale() ? '' : 'а'} предложение к {isNotification ? 'Вашей' : ''}
      {' '}<Link to={'/consultations/' + consultationId}>консультации</Link>
    </span>}
    <div><i>
      {coinsPerHour ? <span><CoinsAmount value={coinsPerHour} /> в час</span> : null}
      {coinsPerHour && minutes ? ', ' : null}
      {minutes && <Duration beginAt={new Date(0)} endAt={new Date(minutes * 60 * 1000)} />}
      {coinsPerHour && minutes ? <span>
        {' '}(<CoinsAmount value={Math.round(coinsPerHour * minutes / 60)} />)
      </span> : null}
    </i></div>
  </span>;
};

ConsultationSuggestionAction.propTypes = {
  action: React.PropTypes.object.isRequired,
  baseType: React.PropTypes.string,
  user: React.PropTypes.object.isRequired,
  isNotification: React.PropTypes.bool,
  consultationOwner: React.PropTypes.bool,
};

export default ConsultationSuggestionAction;
