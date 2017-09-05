export const countCoins = (startAt, endAt, coinsPerHour, availableCoins) => {
  return Math.min(availableCoins, Math.round(coinsPerHour * (endAt - startAt) / 1000 / 60 / 60));
};
