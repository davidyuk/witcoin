import React from 'react';
import { FormattedPlural } from 'react-intl';

const FormattedPluralMinutes = ({value}) =>
  <FormattedPlural value={value} one="участник" few="участника" other="участников" />;

FormattedPluralMinutes.propTypes = {
  value: React.PropTypes.number.isRequired,
};

export default FormattedPluralMinutes;
