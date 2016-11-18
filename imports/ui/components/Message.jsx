import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import LinkToUser from './LinkToUser';
import Date from './Date';

const Message  = ({ message, user, isMail }) => {
  if (!user) return null;
  return <div className="media" key={message._id} style={{flexShrink: 0, margin: '5px 0'}}>
    <div className="media-body">
      <div className="pull-right text-muted">
        <Date value={message.createdAt} />
      </div>
      <LinkToUser user={user} />
      <br />
      <span style={{whiteSpace: 'pre-wrap'}}>{message.content}</span>
      {!isMail && message.userId == Meteor.userId() ? (
        <div className="pull-right text-muted">
          <span title={'Сообщение ' + (message.isRead ? '' : 'не ') + 'доставлено'}
                className={'glyphicon glyphicon-' + (message.isRead ? 'ok' : 'time')} />
        </div>
      ) : null}
    </div>
  </div>;
};

Message.propTypes = {
  message: React.PropTypes.object.isRequired,
  user: React.PropTypes.object,
  isMail: React.PropTypes.bool,
};

export default createContainer(
  ({ message }) => ({user: Meteor.users.findOne(message.userId)}),
  Message
);
