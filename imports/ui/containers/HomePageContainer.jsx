import { createContainer } from 'meteor/react-meteor-data';
import HomePage from '../pages/HomePage';

export default HomePageContainer = createContainer(() => {
  Meteor.subscribe('homePage.counters');
  const usersLastReady = Meteor.subscribe('homePage.users.last').ready();
  return {
    usersLast: usersLastReady ? Meteor.users.find({}, {sort: {createdAt: -1}, limit: 5}).fetch() : [],
    counts: {
      users: Counts.get('users'),
      messages: Counts.get('messages'),
    },
  };
}, HomePage);
