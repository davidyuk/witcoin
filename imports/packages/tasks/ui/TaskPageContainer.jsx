import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import { Actions } from '../../../api/actions';
import { pageWrapper } from '../../../ui/hocs';

import TaskPage from './TaskPage';

export default createContainer(({ params: { taskId } }) => {
  const loading = !Meteor.subscribe('actions', {_id: taskId, type: Actions.types.TASK}, {}, 1).ready();
  const task = Actions.findOne(taskId);
  const user = Meteor.users.findOne(task && task.userId);

  return {
    loading,
    notFound: !task || !user,
    task,
    user,
  };
}, pageWrapper(TaskPage));
