import { Meteor } from 'meteor/meteor';
import React from 'react';

import LinkToUser from './LinkToUser';
import { Actions } from '../../api/actions';
import VoteButton from './VoteButton';
import ShareButton from './ShareButton';
import CommentList from './CommentList';
import RemoveButton from './RemoveButton';
import Date from './Date';

export default class Action extends React.Component {
  constructor() {
    super();
    this.state = {showComments: false};
    this.toggleComments = this.toggleComments.bind(this);
  }

  toggleComments(event) {
    event.preventDefault();
    this.setState({showComments: !this.state.showComments})
  }

  renderBottom() {
    const action = this.props.action;
    if (this.props.isShared) return null;
    return (
      <div>
        <div style={{overflow: 'hidden'}}>
          <div className="pull-right">
            <ShareButton action={this.props.action} />
            &nbsp;<VoteButton action={this.props.action} />
          </div>
          <small>
            <Date value={action.createdAt} isRelative={true} />
            {!action.comments.length ? <span>
              {' | '}<a onClick={this.toggleComments} href="#">Комментировать</a>
            </span> : null}
          </small>
        </div>
        {action.comments.length || this.state.showComments
          ? <CommentList comments={action.comments} actionId={action._id} /> : null}
      </div>
    );
  }

  getMessage() {
    const action = this.props.action;
    const isN = this.props.isNotification;
    const v1 = ['ся', 'ась'][+!action.user.isMale()];
    const v2 = ['', 'а'][+!action.user.isMale()];
    switch (action.type) {
      case Actions.types.SUBSCRIBE:
        return <span>
          подписал{v1} на {isN ? 'Ваши' : ''} обновления
          {' '}{isN ? null : <LinkToUser user={action.object} inflection={Meteor.users.inflectionTypes.GENITIVE} />}
          </span>;
      case Actions.types.COMMENT:
        return `прокомментировал${v2} ${isN ? 'Вашу' : ''} запись`;
      case Actions.types.RATE:
        return `${action.rate == -1 ? 'не' : ''} понравилась ${isN ? 'Ваша' : ''} запись`;
      case Actions.types.SHARE:
        return isN ? `поделил${v1} Вашей записью` : '';
    }
    return '';
  }

  render() {
    const action = this.props.action;
    const inflection = action.type == Actions.types.RATE ? Meteor.users.inflectionTypes.DATIVE : null;
    const hasParentRecord = [Actions.types.COMMENT, Actions.types.RATE, Actions.types.SHARE].includes(action.type);
    const style = !this.props.isShared ? {}
      : { borderTop: 'none', borderRight: 'none', borderBottom: 'none', padding: '0 5px', margin: '5px' };

    return (
      <div className="list-group-item" style={style}>
        {!this.props.isMail ? (
          <div className="pull-right">
            <RemoveButton {...this.props} />
          </div>
        ) : null}

        <LinkToUser user={action.user} inflection={inflection} /> {this.getMessage()}
        <div>{action.description}</div>
        {hasParentRecord ? <Action action={action.object} isShared={true} /> : null}

        {this.props.isMail
          ? <small><Date value={action.createdAt} /></small>
          : this.renderBottom()}
      </div>
    );
  }
}

Action.propTypes = {
  action: React.PropTypes.object.isRequired,
  isShared: React.PropTypes.bool,
  isNotification: React.PropTypes.bool,
  isNewsItem: React.PropTypes.bool,
  isMail: React.PropTypes.bool,
};
