import React from 'react';
import { Link } from 'react-router';
import { FormattedPlural } from 'react-intl';

import { Actions } from '../../../api/actions';

import { ConsultationStates } from '../index';
import ConsultationState from './ConsultationState';

const ConsultationAction = ({baseType, action, user}) =>
  Actions.types.CONSULTATION == baseType ? <span>
    {' '}| <ConsultationState state={action.extra.actual ? ConsultationStates.WAITING : ConsultationStates.DISABLED} />
    {' | '}
    <Link className="label label-default" to={'/consultations/' + action._id}>
      {action.extra.suggestionsCount}&nbsp;
      <FormattedPlural value={action.extra.suggestionsCount}
                       one="предложение" few="предложения" other="предложений" />
    </Link>
  </span> : <span>
    добавил{user.isMale() ? '' : 'а'} <Link to={'/consultations/' + action._id}>консультацию</Link>
  </span>;

ConsultationAction.propTypes = {
  action: React.PropTypes.object.isRequired,
  user: React.PropTypes.object.isRequired,
  baseType: React.PropTypes.string,
};

export default ConsultationAction;
