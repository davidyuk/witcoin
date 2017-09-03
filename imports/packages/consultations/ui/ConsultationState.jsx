import React from 'react';

import { ConsultationStates } from '../index';

const ConsultationState = ({state}) => {
  const {title, className} = {
    [ConsultationStates.ACTUAL]: {title: 'В процессе', className: 'glyphicon glyphicon-ok-circle text-success'},
    [ConsultationStates.WAITING]: {title: 'Выбор участника', className: 'glyphicon glyphicon-time text-warning'},
    [ConsultationStates.DISABLED]: {title: 'Остановлена', className: 'glyphicon glyphicon-remove-circle text-danger'},
  }[state];
  return <span>
    <span title={title} className={className}
          style={{verticalAlign: 'middle', fontSize: '18px'}} />
    &nbsp;{title}
  </span>;
};

ConsultationState.propTypes = {
  state: React.PropTypes.string.isRequired,
};

export default ConsultationState;
