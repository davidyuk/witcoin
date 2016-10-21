import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import ActionList from '../components/ActionList';
import { FeedItems } from '../../api/feeds';
import { Actions, joinAction } from '../../api/actions';

export default FeedListContainer = createContainer(({ selector, limit, countCallback }) => {
  const handle = Meteor.subscribe('feedItems', selector, limit);

  const actions = FeedItems
    .find({userId: Meteor.userId()}, {sort: {createdAt: -1}})
    .map(feedItem => {
      const action = Actions.findOne(feedItem.actionId);
      if (action) action.feedItemId = feedItem._id;
      return action;
    })
    .filter(joinAction);

  countCallback && countCallback(actions.length);

  return {
    actions,
    actionsLoading: !handle.ready(),
    isNotifications: selector.isNotification,
    isNews: !selector.isNotification,
  };
}, ActionList);
