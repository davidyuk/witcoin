import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { ReactiveVar } from 'meteor/reactive-var';

import ActionList from '../components/ActionList';
import { Actions, joinAction } from '../../api/actions';

const limit = new ReactiveVar();
let lastSelector = null;

export default ActionListContainer = createContainer(({ selector }) => {
  if (lastSelector != selector) limit.set(5);
  lastSelector = selector;
  const handle = Meteor.subscribe('actions', selector, limit.get());

  const actions = Actions.find(selector, {sort: {createdAt: -1}}).fetch().filter(joinAction);
  const actionsCount = Counts.get('actions');

  return {
    actions,
    actionsCount,
    actionsLoading: !handle.ready(),
    loadMore: () => {
      if (!handle.ready() || actions.length < limit.get()) return;
      limit.set(limit.get() + 5);
    },
  };
}, ActionList);
