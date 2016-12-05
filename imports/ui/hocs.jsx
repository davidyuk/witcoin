import { createContainer } from 'meteor/react-meteor-data';

export const injectUser = WrappedComponent => createContainer({
  getMeteorData: () => ({user: Meteor.user()}),
  pure: false,
}, WrappedComponent);
