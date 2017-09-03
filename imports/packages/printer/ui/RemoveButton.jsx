import { Meteor } from 'meteor/meteor';
import React from 'react';

export default class RemoveButton extends React.Component {
  removeAction(event) {
    event.preventDefault();
    Meteor.call('action.remove', this.props.action._id);
  }

  removeFeedItem(event) {
    event.preventDefault();
    Meteor.call('feedItem.remove', this.props.action.feedItemId);
  }

  getHandler() {
    if (this.props.isShared) return null;
    if (this.props.isNotification || this.props.isNewsItem) return this.removeFeedItem.bind(this);
    if (Actions.undeletableTypes.includes(this.props.action.type)) return null;
    if (this.props.action.userId == Meteor.userId()) return this.removeAction.bind(this);
  }

  render() {
    const onClick = this.getHandler();
    const title =
      this.props.isNotification && 'Удалить уведомление' ||
      this.props.isNewsItem && 'Скрыть новость' ||
      'Отменить действие';

    if (!onClick) return null;
    return (
      <a {...{onClick, title}} className="text-muted" href="#">
        <span className="glyphicon glyphicon-remove" />
      </a>
    );
  }
}

RemoveButton.propTypes = {
  documentId: React.PropTypes.bool,
};
