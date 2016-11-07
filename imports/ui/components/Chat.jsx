import { Meteor } from 'meteor/meteor';
import React from 'react';

import MessageInput from './MessageInput';
import OnUserActive from './OnUserActive';
import Message from './Message';

export default class Chat extends React.Component {
  markAsRead() {
    const unreadMessageIds = this.props.messages.filter(m => !m.isRead && m.userId != Meteor.userId()).map(m => m._id);
    if (unreadMessageIds.length) Meteor.call('message.markAsRead', this.props.chat._id, unreadMessageIds);
  }

  sendMessage(message) {
    Meteor.call('message.create', this.props.chat._id, message);
  }

  render() {
    let rootStyle = {
      display: 'flex',
      flexDirection: 'column',
      height: 100 + '%',
      padding: '0 10px',
    };

    if (!this.props.chat)
      return <div style={rootStyle}>
        <div style={{margin: 'auto', textAlign: 'center'}}>
          Выберите диалог
        </div>
      </div>;

    const messages = this.props.messages;

    return (
      <div style={rootStyle}>
        <OnUserActive handler={this.markAsRead.bind(this)} />
        <div ref={el => el ? el.scrollTop = el.scrollHeight : null } style={{flexGrow: 1, overflowY: 'auto'}}>
          <div style={{display: 'flex', flexDirection: 'column-reverse', minHeight: 100 + '%', paddingRight: 10 + 'px'}}>
            {messages && messages.length ? this.props.messages.map(message => (
              <Message key={message._id} message={message} />
            )) : <i>Сообщений нет</i>}
          </div>
        </div>
        <MessageInput handler={this.sendMessage.bind(this)} placeholder="Текст сообщения" />
      </div>
    );
  }
}

Chat.propTypes = {
  chat: React.PropTypes.object,
  messages: React.PropTypes.array,
};
