import { createContainer } from 'meteor/react-meteor-data';
import HomePage from '../pages/HomePage';

export default HomePageContainer = createContainer(() => {
  Meteor.subscribe('users.last');
  const lastUsers = Meteor.users.find({}, {sort: {createdAt: -1}, limit: 5}).fetch();
  const usersCount = Counts.get('users');
  return {
    lastUsers,
    usersCount,
  };
}, HomePage);
