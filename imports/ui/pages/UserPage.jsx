import React from 'react';

import NotFoundPage from '../pages/NotFoundPage.jsx';
import { Chats } from '../../api/chats';
import UserName from '../components/UserName';

export default class UserPage extends React.Component {
  goToChat() {
    let doc = { userIds: [Meteor.userId()] };
    if (Meteor.userId() != this.props.user._id) doc.userIds.push(this.props.user._id);

    let chatId = Chats.findOne(doc);
    chatId = chatId ? chatId._id : null;
    if (!chatId) chatId = Chats.insert(doc);
    this.context.router.push('/im/' + chatId);
  }

  render() {
    if (!this.props.user)
      return <NotFoundPage/>;

    return (
      <div>
        <UserName user={this.props.user}/><br/>
        <button onClick={this.goToChat.bind(this)}>Написать сообщение</button>
      </div>
    );
  }
}

UserPage.propTypes = {
  user: React.PropTypes.object,
};

UserPage.contextTypes = {
  router: React.PropTypes.object,
};
