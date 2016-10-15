import { Meteor } from 'meteor/meteor';
import React from 'react';

export default class RemoveButton extends React.Component {
  removeAction(event) {
    event.preventDefault();
    Meteor.call('action.remove', this.props.action._id);
  }

  removeNotification(event) {
    event.preventDefault();
    Meteor.call('notification.remove', this.props.action._id);
  }

  getHandler() {
    if (this.props.isShared) return null;
    if (this.props.isNotification) return this.removeNotification.bind(this);
    if (this.props.action.userId == Meteor.userId()) return this.removeAction.bind(this);
  }

  render() {
    const onClick = this.getHandler();
    const title = this.props.isNotification ? 'Удалить уведомление' : 'Отменить действие';

    if (!onClick) return null;
    return (
      <a {...{onClick, title}} className="text-muted" href="#">
        <span className="glyphicon glyphicon-remove" />
      </a>
    );
  }
}

RemoveButton.propTypes = {
  action: React.PropTypes.object.isRequired,
  isShared: React.PropTypes.bool,
  isNotification: React.PropTypes.bool,
};
