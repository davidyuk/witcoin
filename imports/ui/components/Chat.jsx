import { Meteor } from 'meteor/meteor';
import React from 'react';
import LinkToUser from './LinkToUser';

export default class Chat extends React.Component {
  sendMessage(event) {
    event.preventDefault();
    if (!event.target.content.value) return;
    Meteor.call('message.create', this.props.chat._id, event.target.content.value);
    event.target.content.value = '';
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
        <form onSubmit={this.sendMessage.bind(this)} style={{paddingTop: 5 + 'px', flexShrink: 0}}>
          <div className="form-group" style={{marginBottom: 5 + 'px'}}>
            <textarea className="form-control input-sm" name="content" placeholder="Текст сообщения"/>
          </div>
          <input type="submit" className="btn btn-primary btn-sm" value="Отправить"/>
        </form>
      </div>
    );
  }
}

Chat.propTypes = {
  chat: React.PropTypes.object,
  messages: React.PropTypes.array,
  users: React.PropTypes.array,
};
