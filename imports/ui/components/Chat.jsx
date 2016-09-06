import { Meteor } from 'meteor/meteor';
import React from 'react';
import LinkToUser from './LinkToUser';
import MessageInput from './MessageInput';

export default class Chat extends React.Component {
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
        <div style={{margin: 'auto'}}>
          Выберите диалог
        </div>
      </div>;

    let users = {};
    this.props.users.forEach((user) => { users[user._id] = user });

    return (
      <div style={rootStyle}>
        <div ref={el => el ? el.scrollTop = el.scrollHeight : null } style={{flexGrow: 1, overflowY: 'auto'}}>
          <div style={{display: 'flex', flexDirection: 'column-reverse', minHeight: 100 + '%', paddingRight: 10 + 'px'}}>
            {this.props.messages.length ? this.props.messages.map(message => (
              <div className="media" key={message._id} style={{flexShrink: 0}}>
                <div className="media-body">
                  <div className="pull-right text-muted">{message.createdAt.toLocaleString('ru')}</div>
                  <LinkToUser user={users[message.userId]}/>
                  <br/>
                  {message.content}
                </div>
              </div>
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
  users: React.PropTypes.array,
};
