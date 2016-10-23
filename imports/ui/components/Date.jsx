import { Meteor } from 'meteor/meteor';
import React from 'react';
import { injectIntl, intlShape, FormattedRelative } from 'react-intl';
import { jQuery } from 'meteor/jquery';

if (Meteor.isTest && Meteor.isClient) {
  require('bootstrap-sass');
}

const Date = ({ value, intl, isRelative }) => {
  const formatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const dateStr = intl.formatDate(value, formatOptions) + ' ' + intl.formatTime(value);
  return isRelative ? (
    <span ref={c => jQuery(c).tooltip({delay: 200})} data-placement="bottom" data-original-title={dateStr}>
      <FormattedRelative value={value} />
    </span>
  ) : <span>{dateStr}</span>
};

Date.propTypes = {
  value: React.PropTypes.any.isRequired,
  intl: intlShape.isRequired,
  isRelative: React.PropTypes.bool,
};

export default injectIntl(Date);
