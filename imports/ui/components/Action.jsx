import { Meteor } from 'meteor/meteor';
import React from 'react';

import '../../api/users';
import LinkToUser from './LinkToUser';
import { Actions } from '../../api/actions';

export default class Action extends React.Component {
  removeAction(event) {
    event.preventDefault();
    Meteor.call('action.remove', this.props.action._id);
  }

  isMale(user) {
    return !user.profile || user.profile.gender != Meteor.users.genderTypes.FEMALE;
  }

  renderSubscribe() {
    let action = this.props.action;
    if (action.type != Actions.types.SUBSCRIBE) return null;

    return (
      <span> подписал{this.isMale(action.user) ? 'ся' : 'ась'} на
        {this.props.isNotification
          ? ' Ваши обновления'
          : <span> обновления <LinkToUser user={action.object} inflection={LinkToUser.inflections.GENITIVE} /></span>}
      </span>
    );
  }

  render() {
    let action = this.props.action;

    return (
      <div className="list-group-item">
        <div className="pull-right">
          {action.userId == Meteor.userId() ?
            <a onClick={this.removeAction.bind(this)} className="text-muted" href="#">
              <span className="glyphicon glyphicon-remove" />
            </a>
            : null}
        </div>
        <LinkToUser user={action.user} />
        {this.renderSubscribe()}
        <div>{action.description}</div>
        <div>
          <small>
            {action.createdAt.toLocaleString('ru')}
          </small>
        </div>
      </div>
    );
  }
}

Action.propTypes = {
  action: React.PropTypes.object.isRequired,
  isNotification: React.PropTypes.bool,
};
