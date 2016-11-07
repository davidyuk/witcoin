import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import Chat from '../components/Chat';
import { Chats, Messages } from '../../api/chats';

export default ChatContainer = createContainer(({ params: { chatId } }) => {
  if (chatId) Meteor.subscribe('chat', chatId, 100);
  const chat = Chats.findOne(chatId);
  const messages = Messages.find({chatId: chatId}, {sort: {createdAt: -1}}).fetch()
    .filter(message => message.user = Meteor.users.findOne(message.userId));

  return {
    chat,
    messages,
  };
}, Chat);
