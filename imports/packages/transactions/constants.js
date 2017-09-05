import { Meteor } from 'meteor/meteor';

export const PRECISION_FACTOR = 10;
export const INITIAL_BALANCE = (Meteor.isDevelopment ? 10 : 0) * PRECISION_FACTOR;
