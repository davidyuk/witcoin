import { incUserPositiveField } from './utils';

export const Reserves = new Mongo.Collection('transactions_reserves');

Reserves.schema = new SimpleSchema({
  _id: {type: String, regEx: SimpleSchema.RegEx.Id, denyUpdate: true},
  userId: {type: String, regEx: SimpleSchema.RegEx.Id, denyUpdate: true},
  amount: {type: Number, min: 0, decimal: false},
});

Reserves.attachSchema(Reserves.schema);

const updateUserReserve = isInsert => (_, doc) => {
  const {userId, amount} = doc;
  incUserPositiveField(userId, 'reserve', (isInsert ? 1 : -1) * amount);
};

Reserves.before.insert(updateUserReserve(true));
Reserves.before.remove(updateUserReserve(false));
Reserves.after.update(function(_, doc) {
  incUserPositiveField(doc.userId, 'reserve', doc.amount - this.previous.amount);
});
