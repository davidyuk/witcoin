import React from 'react';

const ProgressBar = ({ value, children, contextCallback }) =>
  <div className="progress">
    <div className={'progress-bar progress-bar-' + contextCallback(value)}
         style={{minWidth: '10em', width: Math.min(value, 1) * 100 + '%'}}>
      {children}
    </div>
  </div>;

ProgressBar.propTypes = {
  value: React.PropTypes.number,
  contextCallback: React.PropTypes.func,
};

ProgressBar.defaultPropos = {
  contextCallback: value => value >= 1 ? 'success' : value >= 0.5 ? 'warning' : 'danger',
};

ProgressBar.contexts = {
  SUCCESS: 'success',
  WARNING: 'warning',
  DANGER: 'danger',
};

export default ProgressBar;
