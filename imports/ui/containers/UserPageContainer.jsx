import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import UserPage from '../pages/UserPage';

export default UserPageContainer = createContainer(({ params: { userId } }) => {
  Meteor.subscribe('user', userId);
  const user = Meteor.users.findOne(userId);
  return {
    user,
  };
}, UserPage);
