import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import UserPage from '../pages/UserPage';

import { Actions } from '../../api/actions';

export default UserPageContainer = createContainer(({ params: { userId } }) => {
  Meteor.subscribe('user.page', userId);
  const user = Meteor.users.findOne(userId);
  const subscribers = Actions
    .find({ type: Actions.types.SUBSCRIBE, objectId: userId }, { limit: 10 })
    .map(action => Meteor.users.findOne(action.userId));
  const subscribersCount = Counts.get('subscribers');
  const isSubscribed = !!Actions.findOne({ type: Actions.types.SUBSCRIBE, userId: Meteor.userId(), objectId: userId });

  return {
    user,
    subscribers,
    subscribersCount,
    isSubscribed,
  };
}, UserPage);
