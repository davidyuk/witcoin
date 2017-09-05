import React from 'react';

import { ConsultationStates } from '../action-types';

const ConsultationState = ({consultation}) => {
  const {extra: {
    counts: {suggestions, participations, completed},
    state,
  }} = consultation;

  const waitingTitle = suggestions == completed && 'Ожидание предложений' ||
    participations > completed && 'Ожидание подтверждения' || 'Выбор участника';
  const {title, className} = {
    [ConsultationStates.ACTIVE]: {title: 'В процессе', className: 'glyphicon glyphicon-ok-circle text-success'},
    [ConsultationStates.WAITING]: {title: waitingTitle, className: 'glyphicon glyphicon-time text-warning'},
    [ConsultationStates.DISABLED]: {title: 'Остановлена', className: 'glyphicon glyphicon-remove-circle text-danger'},
  }[state];

  return <span>
    <span title={title} className={className}
          style={{verticalAlign: 'middle', fontSize: '18px'}} />
    &nbsp;{title}
  </span>;
};

ConsultationState.propTypes = {
  consultation: React.PropTypes.shape({
    extra: React.PropTypes.shape({
      counts: React.PropTypes.shape({
        suggestions: React.PropTypes.number.isRequired,
        participations: React.PropTypes.number.isRequired,
        completed: React.PropTypes.number.isRequired,
      }).isRequired,
      state: React.PropTypes.string.isRequired,
    }),
  }).isRequired,
};

export default ConsultationState;
