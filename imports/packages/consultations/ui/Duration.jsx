import React from 'react';
import { FormattedPlural } from 'react-intl';

const Duration = ({beginAt, endAt, isAccusative}) => {
  if (!beginAt || !endAt) return null;

  const secondsAll = Math.floor((endAt - beginAt) / 1000);
  const seconds = secondsAll % 60;
  const minutes = Math.floor(secondsAll / 60) % 60;
  const hours = Math.floor(secondsAll / 60 / 60) % 24;
  const days = Math.floor(secondsAll / 60 / 60 / 24);

  return [
    {value: days, one: 'день', few: 'дня', other: 'дней'},
    {value: hours, one: 'час', few: 'часа', other: 'часов'},
    {value: minutes, one: isAccusative ? 'минуту' : 'минута', few: 'минуты', other: 'минут'},
    {value: seconds, one: isAccusative ? 'секунду' : 'секунда', few: 'секунды', other: 'секунд'},
  ].reduce((ac, el) => el.value ? <span>{ac}{ac ? ' ' : ''}{el.value} <FormattedPlural {...el} /></span> : ac, null);
};

Duration.propTypes = {
  beginAt: React.PropTypes.object,
  endAt: React.PropTypes.object,
  isAccusative: React.PropTypes.bool,
};

Duration.defaultValues = {
  isAccusative: false,
};

export default Duration;
