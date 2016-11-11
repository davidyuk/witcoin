import React from 'react';

import Action from './Action';
import OnUserActive from './OnUserActive';

export default class ActionList extends React.Component {
  render() {
    const actions = this.props.actions;
    const proxyProps = Object.assign({}, this.props);
    Object.keys(ActionList.propTypes).forEach(key => delete proxyProps[key]);
    const onUserActive = this.props.onUserActive;

    return (
      <div>
        {onUserActive ? <OnUserActive handler={onUserActive} /> : null}
        <div className="list-group">
          {actions && actions.length ? actions.map(item =>
            <Action action={item} key={item._id} {...proxyProps} />
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
  actionsLoading: React.PropTypes.bool,
  showProgressBarPermanently: React.PropTypes.bool,
  onEmptyMessage: React.PropTypes.string,
  onUserActive: React.PropTypes.func,
};

ActionList.defaultProps = {
  actionsLoading: false,
  showProgressBarPermanently: false,
  onEmptyMessage: 'Нет действий',
};
