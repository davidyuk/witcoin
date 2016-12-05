import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import LoaderPage from './pages/LoaderPage';
import NotFoundPage from './pages/NotFoundPage';

export const injectUser = WrappedComponent => createContainer({
  getMeteorData: ({loading}) => ({
    loading: loading || !Meteor.user(),
    user: Meteor.user(),
  }),
  pure: false,
}, WrappedComponent);

export const pageWrapper = WrappedComponent => props => {
  const {loading, notFound} = props;
  if (loading) return <LoaderPage {...props} />;
  if (notFound) return <NotFoundPage {...props} />;
  return <WrappedComponent {...props} />
};
