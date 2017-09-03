import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import { Actions } from '../../../api/actions';
import { pageWrapper } from '../../../ui/hocs';

import LessonPage from './LessonPage';

export default createContainer(({params: {id}}) => {
  const loading = !Meteor.subscribe('actions', {_id: id, type: Actions.types.LESSON}, {}, 1).ready();
  const action = Actions.findOne(id);
  const user = Meteor.users.findOne(action && action.userId);

  return {
    loading,
    notFound: !action || !user,
    action,
    user,
  };
}, pageWrapper(LessonPage));
