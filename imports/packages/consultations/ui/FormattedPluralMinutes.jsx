import React from 'react';
import { FormattedPlural } from 'react-intl';

const FormattedPluralMinutes = ({value}) =>
  <FormattedPlural value={value} one="минута" few="минуты" other="минут" />;

FormattedPluralMinutes.propTypes = {
  value: React.PropTypes.number.isRequired,
};

export default FormattedPluralMinutes;
