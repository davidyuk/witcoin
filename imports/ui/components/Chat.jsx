import { Meteor } from 'meteor/meteor';
import React from 'react';

import LinkToUser from './LinkToUser';
import MessageInput from './MessageInput';
import Date from './Date';
import OnUserActive from './OnUserActive';

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

    let users = {};
    this.props.users.forEach((user) => { users[user._id] = user });

    const renderMessageTools = (message) => {
      if (message.userId != Meteor.userId()) return;
      return <div className="pull-right text-muted">
        <span title={'Сообщение ' + (message.isRead ? '' : 'не ') + 'доставлено'}
              className={'glyphicon glyphicon-' + (message.isRead ? 'ok' : 'time')} />
      </div>
    };

    return (
      <div style={rootStyle}>
        <OnUserActive handler={this.markAsRead.bind(this)} />
        <div ref={el => el ? el.scrollTop = el.scrollHeight : null } style={{flexGrow: 1, overflowY: 'auto'}}>
          <div style={{display: 'flex', flexDirection: 'column-reverse', minHeight: 100 + '%', paddingRight: 10 + 'px'}}>
            {this.props.messages.length ? this.props.messages.map(message => (
              <div className="media" key={message._id} style={{flexShrink: 0, margin: '5px 0'}}>
                <div className="media-body">
                  <div className="pull-right text-muted">
                    <Date value={message.createdAt} />
                  </div>
                  <LinkToUser user={users[message.userId]}/>
                  <br/>
                  {message.content}
                  {renderMessageTools(message)}
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
