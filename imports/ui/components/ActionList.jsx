import React from 'react';

import Action from './Action';

export default class ActionList extends React.Component {
  render() {
    const actions = this.props.actions;

    return (
      <div>
        <div className="list-group">
          {actions && actions.length ? actions.map(item =>
            <Action action={item} key={item._id} isNotification={this.props.isNotifications} />
          ) : <i>{this.props.onEmptyMessage}</i>}
        </div>
        <div className="progress" style={{visibility: this.props.actionsLoading ? 'visible' : 'hidden'}}>
          <div className="progress-bar progress-bar-striped active" style={{width: '100%'}} />
        </div>
      </div>
    );
  }
}

ActionList.propTypes = {
  actions: React.PropTypes.array,
  actionsLoading: React.PropTypes.bool.isRequired,
  isNotifications: React.PropTypes.bool,
  onEmptyMessage: React.PropTypes.string,
};

ActionList.defaultProps = {
  onEmptyMessage: 'Нет действий',
};
