import { Meteor } from 'meteor/meteor';
import React from 'react';
import Helmet from 'react-helmet';

import ActionListContainer from '../containers/ActionListContainer';
import UserList from '../components/UserList';
import InfiniteScroll from '../components/InfiniteScroll';
import ActionCreator from '../components/ActionCreator';
import ActionTypeFilter from '../components/ActionTypeFilter';
import MessageInput from '../components/MessageInput';
import UserStatus from '../components/UserStatus';
import UserStatusDate from '../components/UserStatusDate';
import { Actions } from '../../api/actions';

export default class UserPage extends React.Component {
  constructor() {
    super();
    this.state = {isAboutEdit: false};
    this.aboutEditClickHandler = this.aboutEditClickHandler.bind(this);
    this.aboutSaveHandler = this.aboutSaveHandler.bind(this);
  }

  aboutEditClickHandler(event) {
    event.preventDefault();
    this.setState({isAboutEdit: !this.state.isAboutEdit});
  }

  aboutSaveHandler(content) {
    Meteor.users.update(this.props.user._id, {$set: {'profile.about': content}});
    this.setState({isAboutEdit: false});
  }

  goToChat() {
    Meteor.call('chat.get', [this.props.user._id], (err, chatId) =>
      chatId && this.context.router.push('/im/' + chatId)
    );
  }

  subscribe() {
    Meteor.call('action.subscribe', this.props.user._id);
  }

  render() {
    const isSubscribed = this.props.isSubscribed;
    const user = this.props.user;

    return (
      <div className="row">
        <Helmet title={this.props.user.getFullName()} />
        <div className="col-md-4">
          <h3>
            {this.props.user.getFullName()}
            <UserStatus user={user} />
          </h3>
          <UserStatusDate user={user} />
          {this.props.user._id != Meteor.userId() ?
            <ul className="nav nav-pills nav-stacked" style={{marginBottom: 10 + 'px'}}>
              <li>
                <a href="#" onClick={this.goToChat.bind(this)}>
                  <span className="glyphicon glyphicon-send" /> Написать сообщение
                </a>
              </li>
              <li>
                <a href="#" onClick={this.subscribe.bind(this)}>
                  <span className={`glyphicon glyphicon-eye-${isSubscribed ? 'close' : 'open'}`} />
                  {` ${isSubscribed ? 'Отписаться' : 'Подписаться'}`}
                </a>
              </li>
              {UserPage._buttons.map((Button, key) =>
                <Button {...{key}} userToId={this.props.user._id} />
              )}
            </ul>
          : null}
          {user.profile.about || user._id == Meteor.userId() ? (
            <div className="panel panel-default">
              <div className="panel-heading">О себе
                {user._id == Meteor.userId() ? (
                  <a className={'btn btn-default btn-xs pull-right' + (this.state.isAboutEdit ? ' active' : '')}
                     title="Изменить" href="#" onClick={this.aboutEditClickHandler}>
                    <span className="glyphicon glyphicon-pencil" />
                  </a>
                ) : null}
              </div>
              {this.state.isAboutEdit || user.profile.about ? (
                <div className="panel-body">
                  {this.state.isAboutEdit ? (
                    <MessageInput placeholder="Произвольная информация на вашей странице. Например, контактные данные."
                                  defaultValue={user.profile.about} handler={this.aboutSaveHandler} required={false}
                                  buttonText="Сохранить" />
                  ) : (
                    <div style={{whiteSpace: 'pre-wrap'}}>{user.profile.about}</div>
                  )}
                </div>
              ) : null}
            </div>
          ) : null}
          { this.props.subscribersCount ?
            <UserList users={ this.props.subscribers } count={ this.props.subscribersCount } title="Подписчики"/>
          : null }
        </div>
        <div className="col-md-8">
          { this.props.user._id == Meteor.userId() ?
            <ActionCreator />
          : null }
          <InfiniteScroll>
            <ActionTypeFilter defaultTypes={Actions.relevantTypes}>
              <ActionListContainer selector={{ userId: this.props.user._id }} onEmptyMessage="Действия не найдены" />
            </ActionTypeFilter>
          </InfiniteScroll>
        </div>
      </div>
    );
  }
}

UserPage._buttons = [];

UserPage.registerButton = button => UserPage._buttons.push(button);

UserPage.propTypes = {
  user: React.PropTypes.object.isRequired,
  subscribers: React.PropTypes.array.isRequired,
  subscribersCount: React.PropTypes.number.isRequired,
  isSubscribed: React.PropTypes.bool.isRequired,
};

UserPage.contextTypes = {
  router: React.PropTypes.object,
};
