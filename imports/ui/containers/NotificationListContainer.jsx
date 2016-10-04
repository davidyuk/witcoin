import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import ActionList from '../components/ActionList';
import { NotifyItems } from '../../api/feeds';
import { Actions, joinAction } from '../../api/actions';

export default NotificationListContainer = createContainer(({ limit, countCallback }) => {
  const handle = Meteor.subscribe('notifications', limit);

  const actions = NotifyItems
    .find({ userId: Meteor.userId() }, {sort: {createdAt: -1}})
    .map(notifyItem => Actions.findOne(notifyItem.actionId))
    .filter(joinAction);

  countCallback && countCallback(actions.length);

  return {
    actions,
    actionsLoading: !handle.ready(),
    isNotifications: true,
  };
}, ActionList);
