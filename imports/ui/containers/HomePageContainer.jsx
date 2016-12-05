import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import HomePage from '../pages/HomePage';

export default createContainer(() => {
  Meteor.subscribe('homePage.counters');
  const usersLastReady = Meteor.subscribe('homePage.users.last').ready();
  const usersOnlineReady = Meteor.subscribe('homePage.users.online').ready();
  return {
    usersLast: usersLastReady ? Meteor.users.find({}, {sort: {createdAt: -1}, limit: 5}).fetch() : [],
    usersOnline: usersOnlineReady ? Meteor.users.find({'status.online': true}, {limit: 5}).fetch() : [],
    counts: {
      users: Counts.get('users'),
      usersOnline: Counts.get('users.online'),
      messages: Counts.get('messages'),
      connections: Counts.get('connections'),
    },
  };
}, HomePage);
