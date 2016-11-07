import React from 'react';

import Action from './Action';
import OnUserActive from './OnUserActive';

export default class ActionList extends React.Component {
  render() {
    const actions = this.props.actions;
    const commonProps = {
      isNotification: this.props.isNotifications,
      isNewsItem: this.props.isNews,
    };
    const onUserActive = this.props.onUserActive;

    return (
      <div>
        {onUserActive ? <OnUserActive handler={onUserActive} /> : null}
        <div className="list-group">
          {actions && actions.length ? actions.map(item =>
            <Action action={item} key={item._id} {...commonProps} />
          ) : <i>{this.props.onEmptyMessage}</i>}
        </div>
        {this.props.showProgressBarPermanently || this.props.actionsLoading ? (
          <div className="progress" style={{visibility: this.props.actionsLoading ? 'visible' : 'hidden'}}>
            <div className="progress-bar progress-bar-striped active" style={{width: '100%'}} />
          </div>
        ) : null}
      </div>
    );
  }
}

ActionList.propTypes = {
  actions: React.PropTypes.array,
  actionsLoading: React.PropTypes.bool.isRequired,
  isNotifications: React.PropTypes.bool,
  isNews: React.PropTypes.bool,
  showProgressBarPermanently: React.PropTypes.bool,
  onEmptyMessage: React.PropTypes.string,
  onUserActive: React.PropTypes.func,
};

ActionList.defaultProps = {
  showProgressBarPermanently: false,
  onEmptyMessage: 'Нет действий',
};
