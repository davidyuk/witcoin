import { Actions } from '../../api/actions';
import { FeedItems } from '../../api/feeds';

Actions.after.insert((_, action) => {
  if (action.type == Actions.types.CONSULTATION_SUGGESTION) {
    FeedItems.insertBasedOnAction(action, {
      userId: Actions.findOne(action.objectId).userId,
      isNotification: true,
    });
  }
});
