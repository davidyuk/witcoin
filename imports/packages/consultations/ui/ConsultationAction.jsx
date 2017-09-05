import React from 'react';
import { Link } from 'react-router';
import { FormattedPlural } from 'react-intl';

import { Actions } from '../../../api/actions';

import ConsultationState from './ConsultationState';

const ConsultationAction = ({baseType, action, user}) => {
  const {
    extra: {
      counts: {suggestions, participations, completed}
    }
  } = action;

  return Actions.types.CONSULTATION == baseType ? <span>
    {' '}| <ConsultationState consultation={action} />
      {' | '}
      <Link className="label label-default" to={'/consultations/' + action._id}>
        {suggestions - completed}&nbsp;
        <FormattedPlural value={suggestions - completed}
                         one="предложение" few="предложения" other="предложений" />
        ,&nbsp;
        {completed}&nbsp;
        <FormattedPlural value={completed}
                         one="консультация" few="консультации" other="консультаций" />
    </Link>
  </span> : <span>
    добавил{user.isMale() ? '' : 'а'} <Link to={'/consultations/' + action._id}>консультацию</Link>
  </span>
};

ConsultationAction.propTypes = {
  action: React.PropTypes.object.isRequired,
  user: React.PropTypes.object.isRequired,
  baseType: React.PropTypes.string,
};

export default ConsultationAction;
