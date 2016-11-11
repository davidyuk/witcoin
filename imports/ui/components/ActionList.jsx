import React from 'react';

import Action from './Action';
import OnUserActive from './OnUserActive';

const ActionList = props => {
  const {actions, actionsLoading, onEmptyMessage, onUserActive, showProgressBarPermanently} = props;
  const proxyProps = Object.assign({}, props);
  Object.keys(ActionList.propTypes).forEach(key => delete proxyProps[key]);

  return (
    <div>
      {onUserActive ? <OnUserActive handler={onUserActive} /> : null}
      <div className="list-group">
        {actions.length ? actions.map(item =>
          <Action action={item} key={item._id} {...proxyProps} />
        ) : actionsLoading ? null : <i>{onEmptyMessage}</i>}
      </div>
      {showProgressBarPermanently || actionsLoading ? (
        <div className="progress" style={{visibility: actionsLoading ? 'visible' : 'hidden'}}>
          <div className="progress-bar progress-bar-striped active" style={{width: '100%'}} />
        </div>
      ) : null}
    </div>
  );
};

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

export default ActionList;
