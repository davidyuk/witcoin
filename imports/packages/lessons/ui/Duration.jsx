import React from 'react';
import { FormattedPlural } from 'react-intl';

const Duration = ({beginAt, endAt}) => {
  if (!beginAt || !endAt) return null;
  const minutesAll = Math.round((endAt.getTime() - beginAt.getTime()) / (1000 * 60));
  const minutes = minutesAll % 60;
  const hours = Math.floor(minutesAll / 60) % 24;
  const days = Math.floor(minutesAll / (60 * 24));
  return <span>
    {days ? <span> {days} <FormattedPlural value={days} one="день" few="дня" other="дней" /></span> : null}
    {hours ? <span> {hours} <FormattedPlural value={hours} one="час" few="часа" other="часов" /></span> : null}
    {minutes ? <span> {minutes} <FormattedPlural value={minutes} one="минута" few="минуты" other="минут" /></span>
      : null}
  </span>;
};

Duration.propTypes = {
  beginAt: React.PropTypes.object,
  endAt: React.PropTypes.object,
};

export default Duration;
