import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import UserMenu from '../components/UserMenu';

export default UserMenuContainer = createContainer({
  getMeteorData: () => {
    Meteor.subscribe('chats.unread');

    return {
      chatsUnreadCount: Counts.get('chats.unread'),
    };
  },
  pure: false,
}, UserMenu);
