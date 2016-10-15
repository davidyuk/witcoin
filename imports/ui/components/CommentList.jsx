import React from 'react';

import LinkToUser from './LinkToUser';
import VoteButton from './VoteButton';
import RemoveButton from './RemoveButton';
import MessageInput from './MessageInput';

export default class CommentList extends React.Component {
  addComment(comment) {
    Meteor.call('action.comment', this.props.actionId, comment);
  }

  renderComments() {
    const comments = this.props.comments;

    return comments && comments.length ? comments.map(comment =>
      <div className="list-group-item" key={comment._id}>
        <div className="pull-right">
          <RemoveButton action={comment} />
        </div>

        <LinkToUser user={comment.user} />
        <div>{comment.description}</div>

        <div style={{overflow: 'hidden'}}>
          <div className="pull-right">
            <VoteButton action={comment} />
          </div>
          <small>
            {comment.createdAt.toLocaleString('ru')}
          </small>
        </div>
      </div>
    ) : null;
  }

  render() {
    return (
      <div style={{padding: '5px 0 0 40px'}}>
        <div className="list-group" style={{marginBottom: 0}}>
          {this.renderComments()}
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
