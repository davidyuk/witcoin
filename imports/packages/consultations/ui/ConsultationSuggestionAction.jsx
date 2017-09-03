import React from 'react';
import { Link } from 'react-router';

import { Actions } from '../../../api/actions';

import CoinsAmount from '../../transactions/ui/CoinsAmount';

import FormattedPluralMinutes from './FormattedPluralMinutes';

const ConsultationSuggestionAction = ({action, baseType, user, isNotification}) => {
  const {objectId: consultationId, extra: {coinsPerHour, minutes}} = action;
  const _minutes = minutes == Number.MAX_SAFE_INTEGER ? 0 : minutes;

  return <span>
    {Actions.types.CONSULTATION_SUGGESTION == baseType ? null : <span>
      добавил{user.isMale() ? '' : 'а'} предложение к {isNotification ? 'Вашей' : ''}
      {' '}<Link to={'/consultations/' + consultationId}>консультации</Link>
    </span>}
    <div><i>
      {coinsPerHour ? <span><CoinsAmount value={coinsPerHour} /> в час</span> : null}
      {coinsPerHour && _minutes ? ', ' : null}
      {_minutes ? <span>
        {_minutes}{' '}
        <FormattedPluralMinutes value={_minutes} />
      </span> : null}
      {coinsPerHour && _minutes ? <span>
        {' '}(<CoinsAmount value={Math.round(coinsPerHour * _minutes / 60)} />)
      </span> : null}
    </i></div>
  </span>;
};

ConsultationSuggestionAction.propTypes = {
  action: React.PropTypes.object.isRequired,
  baseType: React.PropTypes.string,
  user: React.PropTypes.object.isRequired,
  isNotification: React.PropTypes.bool,
};

export default ConsultationSuggestionAction;
