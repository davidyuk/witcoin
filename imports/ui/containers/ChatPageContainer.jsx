import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import ChatPage from '../pages/ChatPage';
import { Chats } from '../../api/chats';

export default ChatPageContainer = createContainer(({ params: { chatId } }) => {
  const chats = Chats.find({ userIds: Meteor.userId(), lastMessage: { $exists: true } },
    {sort: {'lastMessage.createdAt': -1}}).fetch();

  return {
    chats,
    chatId,
  };
}, ChatPage);
