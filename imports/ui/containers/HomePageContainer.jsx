import { createContainer } from 'meteor/react-meteor-data';
import HomePage from '../pages/HomePage';

export default HomePageContainer = createContainer(() => {
  const lastUsers = Meteor.users.find({}, {sort: {createdAt: -1}, limit: 5}).fetch();
  const usersCount = Meteor.users.find({}).count();
  return {
    lastUsers,
    usersCount,
  };
}, HomePage);
