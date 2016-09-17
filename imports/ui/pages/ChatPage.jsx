import { Meteor } from 'meteor/meteor';
import React from 'react';
import { Link } from 'react-router';
import UserName from '../components/UserName';
import TruncateText from '../components/TruncateText';
import ChatContainer from '../containers/ChatContainer';

export default class ChatPage extends React.Component {
  getUsers(chat) {
    return Meteor.users.find({_id: {$in: chat.userIds, $ne: Meteor.userId()}});
  }

  componentDidMount() {
    document.getElementById('app').className += ' full-screen';
  }

  componentWillUnmount() {
    let node = document.getElementById('app');
    node.className = node.className.replace('full-screen', '');
  }

  render() {
    let listClass = this.props.chatId ? 'hidden-xs' : '';
    let chatClass = this.props.chatId ? '' : 'hidden-xs';

    return (
      <div style={{height: 100 + '%', display: 'flex', paddingBottom: 20 + 'px'}}>
        <div className={'list-group ' + listClass} style={{marginBottom: 0, flex: '1 0 250px', display: 'flex', flexDirection: 'column'}}>
          <span className="list-group-item active" style={{flexShrink: 0}}>
            <string>{this.props.chats.length} диалогов</string>
          </span>
          <div style={{overflow: 'auto', flexGrow: 1}}>
            {this.props.chats.map(chat => (
              <Link to={'/im/' + chat._id} key={chat._id} className="list-group-item" activeClassName="active">
                <b className="list-group-item-heading">
                  {this.getUsers(chat).map(user => (
                    <UserName key={user._id} user={user}/>
                  ))}
                </b>
                <p className="list-group-item-text">
                  <TruncateText content={chat.lastMessage.content} length={60} />
                </p>
              </Link>
            ))}
          </div>
        </div>
        <div className={chatClass} style={{flexGrow: 10000}}>
          <ChatContainer params={{chatId: this.props.chatId}} />
        </div>
      </div>
    );
  }
}

ChatPage.propTypes = {
  chats: React.PropTypes.array,
  chatId: React.PropTypes.string,
};
