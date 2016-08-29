import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import ChatPage from '../pages/ChatPage';
import { Chats } from '../../api/chats';

export default ChatPageContainer = createContainer(({ params: { chatId } }) => {
  Meteor.subscribe('chats', 100);
  const chats = Chats.find({ userIds: Meteor.userId(), lastMessage: { $exists: true } },
    {sort: {'lastMessage.createdAt': -1}}).fetch();
  const chatsCount = Counts.get('chats');

  return {
    chats,
    chatsCount,
    chatId,
  };
}, ChatPage);
