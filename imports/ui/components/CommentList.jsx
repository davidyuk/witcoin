import { Meteor } from 'meteor/meteor';
import React from 'react';
import { FormattedPlural } from 'react-intl';
import { createContainer } from 'meteor/react-meteor-data';

import MessageInput from './MessageInput';
import Comment from './Comment';
import { Actions } from '../../api/actions';

class CommentList extends React.Component {
  constructor() {
    super();
    this.state = {showAll: false};
    this.alwaysVisibleCount = 1;
  }

  addComment(comment) {
    Meteor.call('action.comment', this.props.actionId, comment);
  }

  renderToggleCommentsButton() {
    const comments = this.props.comments;
    if (this.props.showAll || comments.length <= this.alwaysVisibleCount) return null;
    return (
      <button className="btn btn-default btn-sm btn-block" style={{marginBottom: '5px'}}
              onClick={() => this.setState({showAll: !this.state.showAll})}>
        {this.state.showAll ? 'Скрыть комментарии' : <span>
          Показать {comments.length - this.alwaysVisibleCount}&nbsp;
          <FormattedPlural value={comments.length - this.alwaysVisibleCount}
                           one="предыдущий комментарий"
                           few="предыдущих комментария"
                           other="предыдущих комментариев" />
        </span>}
      </button>
    );
  }

  render() {
    const showAll = this.props.showAll || this.state.showAll;
    const comments = this.props.comments.slice(!showAll && -this.alwaysVisibleCount);

    return (
      <div style={{padding: '5px 0 0 40px'}}>
        {this.renderToggleCommentsButton()}
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
  showAll: React.PropTypes.bool,
};

CommentList.defaultProps = {
  showAll: false,
};

export default createContainer(
  ({ actionId }) => ({
    comments: Actions.find({
      type: Actions.types.COMMENT, objectId: actionId,
    }, {sort: {createdAt: 1}}).fetch(),
  }),
  CommentList
);
