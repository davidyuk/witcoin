import { Meteor } from 'meteor/meteor';
import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import LinkToUser from './LinkToUser';
import VoteButton from './VoteButton';
import RemoveButton from './RemoveButton';
import Date from './Date';

const Comment = ({ comment, user }) =>
  <div className="list-group-item" key={comment._id}>
    <div className="pull-right">
      <RemoveButton action={comment} />
    </div>

    <LinkToUser user={user} />
    <div>{comment.description}</div>

    <div style={{overflow: 'hidden'}}>
      <div className="pull-right">
        <VoteButton action={comment} />
      </div>
      <small>
        <Date value={comment.createdAt} isRelative={true} />
      </small>
    </div>
  </div>;

Comment.propTypes = {
  comment: React.PropTypes.object.isRequired,
  user: React.PropTypes.object.isRequired,
};

export default createContainer(
  ({ comment }) => ({user: Meteor.users.findOne(comment.userId)}),
  Comment
);
