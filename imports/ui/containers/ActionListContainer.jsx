import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import ActionList from '../components/ActionList';
import { Actions } from '../../api/actions';

export default ActionListContainer = createContainer(({ selector, sort = {createdAt: -1}, limit, countCallback }) => {
  const handle = Meteor.subscribe('actions', selector, sort, limit);

  const actions = Actions.find(selector, {sort, limit}).fetch();
  const actionsCount = Counts.get('actions');

  countCallback && countCallback(actions.length);

  return {
    actions,
    actionsCount,
    actionsLoading: !handle.ready(),
  };
}, ActionList);
