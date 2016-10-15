import { Meteor } from 'meteor/meteor';
import React from 'react';

import LinkToUser from './LinkToUser';
import { Actions } from '../../api/actions';
import VoteButton from './VoteButton';
import ShareButton from './ShareButton';
import CommentList from './CommentList';
import RemoveButton from './RemoveButton';

export default class Action extends React.Component {
  isMale(user) {
    return !user.profile || user.profile.gender != Meteor.users.genderTypes.FEMALE;
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
            {action.createdAt.toLocaleString('ru')}
          </small>
        </div>
        {!this.props.isNotification ? <CommentList comments={action.comments} actionId={action._id} /> : null}
      </div>
    );
  }

  getMessage() {
    const action = this.props.action;
    const isN = this.props.isNotification;
    const v1 = ['ся', 'ась'][+!this.isMale(action.user)];
    const v2 = ['', 'а'][+!this.isMale(action.user)];
    switch (action.type) {
      case Actions.types.SUBSCRIBE:
        return <span>
          подписал{v1} на {isN ? 'Ваши' : ''} обновления
          {' '}{isN ? null : <LinkToUser user={action.object} inflection={LinkToUser.inflections.GENITIVE} />}
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
    const inflection = action.type == Actions.types.RATE ? LinkToUser.inflections.DATIVE : null;
    const hasParentRecord = [Actions.types.COMMENT, Actions.types.RATE, Actions.types.SHARE].includes(action.type);
    const style = !this.props.isShared ? {}
      : { borderTop: 'none', borderRight: 'none', borderBottom: 'none', padding: '0 5px', margin: '5px' };

    return (
      <div className="list-group-item" style={style}>
        <div className="pull-right">
          <RemoveButton {...this.props} />
        </div>
        <LinkToUser user={action.user} inflection={inflection} /> {this.getMessage()}
        <div>{action.description}</div>
        {hasParentRecord ? <Action action={action.object} isShared={true} /> : null}
        {this.renderBottom()}
      </div>
    );
  }
}

Action.propTypes = {
  action: React.PropTypes.object.isRequired,
  isShared: React.PropTypes.bool,
  isNotification: React.PropTypes.bool,
};
