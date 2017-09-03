import React from 'react';
import { FormattedPlural } from 'react-intl';

import { PRECISION_FACTOR } from '../constants';

const FormattedPluralCoins = ({ value, isAccusative }) =>
  <FormattedPlural value={value / PRECISION_FACTOR}
                   one={isAccusative ? 'кленинку': 'кленинка'}
                   few="кленинки"
                   other="кленинок" />;

FormattedPluralCoins.propTypes = {
  value: React.PropTypes.number.isRequired,
  isAccusative: React.PropTypes.bool,
};

FormattedPluralCoins.defaultValues = {
  isAccusative: false,
};

export default FormattedPluralCoins;
