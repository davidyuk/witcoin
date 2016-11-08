import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import ChatPage from '../pages/ChatPage';
import { Chats } from '../../api/chats';

export default ChatPageContainer = createContainer(({ params: { chatId } }) => {
  Meteor.subscribe('chats', 100);
  const chats = Chats.find({ userIds: Meteor.userId(), lastMessage: { $ne: null } },
    {sort: {'lastMessage.createdAt': -1}}).fetch();
  chats.forEach(c => c.unreadMessagesCount = Counts.get('chats.' + c._id));
  const chatsCount = Counts.get('chats');

  return {
    chats,
    chatsCount,
    chatId,
  };
}, ChatPage);
