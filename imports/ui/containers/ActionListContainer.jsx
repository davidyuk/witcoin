import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import ActionList from '../components/ActionList';
import { Actions, joinAction } from '../../api/actions';

export default ActionListContainer = createContainer(({ selector, limit, countCallback }) => {
  const handle = Meteor.subscribe('actions', selector, limit);

  const actions = Actions.find(selector, {sort: {createdAt: -1}}).fetch().filter(joinAction);
  const actionsCount = Counts.get('actions');

  countCallback && countCallback(actions.length);

  return {
    actions,
    actionsCount,
    actionsLoading: !handle.ready(),
  };
}, ActionList);
