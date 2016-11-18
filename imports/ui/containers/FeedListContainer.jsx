import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import ActionList from '../components/ActionList';
import { FeedItems } from '../../api/feeds';
import { Actions } from '../../api/actions';

export default FeedListContainer = createContainer(({ selector, limit, countCallback }) => {
  const handle = Meteor.subscribe('feedItems', selector, limit);

  const actions = FeedItems
    .find({userId: Meteor.userId()}, {sort: {createdAt: -1}})
    .map(feedItem => {
      const action = Actions.findOne(feedItem.actionId);
      if (!action) return;
      action.feedItemId = feedItem._id;
      return action;
    })
    .filter(Boolean);

  countCallback && countCallback(actions.length);

  return {
    actions,
    actionsLoading: !handle.ready(),
    isNotification: selector.isNotification,
    isNewsItem: !selector.isNotification,
    onUserActive: () => {
      const unreadFeedItemIds = FeedItems.find({isRead: false, userId: Meteor.userId()}).map(f => f._id);
      if (unreadFeedItemIds.length) Meteor.call('feedItem.markAsRead', unreadFeedItemIds);
    },
  };
}, ActionList);
