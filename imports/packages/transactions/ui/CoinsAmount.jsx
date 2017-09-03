import React from 'react';

import { PRECISION_FACTOR } from '../constants';
import FormattedPluralCoins from './FormattedPluralCoins';

const CoinsAmount = props => <span>
  {props.value / PRECISION_FACTOR}&nbsp;
  <FormattedPluralCoins {...props} />
</span>;

CoinsAmount.propTypes = {
  value: React.PropTypes.number.isRequired,
  isAccusative: React.PropTypes.bool,
};

CoinsAmount.defaultValues = {
  isAccusative: false,
};

export default CoinsAmount;
