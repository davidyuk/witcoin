import React from 'react';

import NotFoundPage from '../pages/NotFoundPage.jsx';
import UserName from '../components/UserName';

export default class UserPage extends React.Component {
  goToChat() {
    Meteor.call('chat.get', [this.props.user._id], (err, chatId) => {
      if (err || !chatId) alert(err || 'Неизвестная ошибка');
      else this.context.router.push('/im/' + chatId);
    });
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
