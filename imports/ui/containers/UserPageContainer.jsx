import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import UserPage from '../pages/UserPage';
import { Actions } from '../../api/actions';
import { pageWrapper } from '../hocs';

export default UserPageContainer = createContainer(({ params: { userId } }) => {
  const loading = !Meteor.subscribe('user.page', userId).ready();
  const user = Meteor.users.findOne({_id: userId, status: {$exists: true}});
  const subscribers = Actions
    .find({ type: Actions.types.SUBSCRIBE, objectId: userId }, { limit: 10 })
    .map(action => Meteor.users.findOne(action.userId))
    .filter(Boolean);
  const subscribersCount = Counts.get('subscribers');
  const isSubscribed = !!Actions.findOne({ type: Actions.types.SUBSCRIBE, userId: Meteor.userId(), objectId: userId });

  return {
    loading,
    notFound: !user,
    user,
    subscribers,
    subscribersCount,
    isSubscribed,
  };
}, pageWrapper(UserPage));
