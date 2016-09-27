import { Meteor } from 'meteor/meteor';
import React from 'react';

import LinkToUser from './LinkToUser';

export default class Action extends React.Component {
  removeAction(event) {
    event.preventDefault();
    Meteor.call('action.remove', this.props.action._id);
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
        <LinkToUser user={Meteor.users.findOne(action.userId)} />
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
};
