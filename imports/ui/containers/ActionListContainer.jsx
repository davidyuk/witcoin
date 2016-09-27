import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import ActionList from '../components/ActionList';
import { Actions } from '../../api/actions';

export default ActionListContainer = createContainer(({ selector }) => {
  Meteor.subscribe('actions', selector, 100);

  const actions = Actions.find(selector, {sort: {createdAt: -1}}).fetch();
  const actionsCount = Counts.get('actions');

  return {
    actions,
    actionsCount,
  };
}, ActionList);
