import { Meteor } from 'meteor/meteor';
import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import MessageInput from './MessageInput';
import Comment from './Comment';
import { Actions } from '../../api/actions';

class CommentList extends React.Component {
  addComment(comment) {
    Meteor.call('action.comment', this.props.actionId, comment);
  }

  render() {
    const comments = this.props.comments;

    return (
      <div style={{padding: '5px 0 0 40px'}}>
        <div className="list-group" style={{marginBottom: 0}}>
          {comments.map(comment =>
            <Comment comment={comment} key={comment._id} />
          )}
        </div>
        <MessageInput handler={this.addComment.bind(this)} placeholder="Текст комментария" />
      </div>
    );
  }
}

CommentList.propTypes = {
  comments: React.PropTypes.array.isRequired,
  actionId: React.PropTypes.string.isRequired,
};

export default createContainer(
  ({ actionId }) => ({
    comments: Actions.find({
      type: Actions.types.COMMENT, objectId: actionId,
    }, {sort: {createdAt: 1}}).fetch(),
  }),
  CommentList
);
