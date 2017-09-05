export const incUserPositiveField = (userId, fieldName, amount) => {
  if (amount < 0) {
    const f = Meteor.users.update(
      {_id: userId, [fieldName]: {$gte: -amount}},
      {$inc: {[fieldName]: amount}}
    );
    if (!f)
      throw new Meteor.Error(fieldName + '-cannot-be-below-zero');
  } else {
    Meteor.users.update(userId, {$inc: {[fieldName]: amount}});
  }
};
