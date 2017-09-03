import React from 'react';

const RequiredProgress = ({ value, children }) =>
  <div className="progress">
    <div className={'progress-bar progress-bar-' + (value >= 1 ? 'success' : value >= 0.5 ? 'warning' : 'danger')}
         style={{minWidth: '10em', width: Math.min(value, 1) * 100 + '%'}}>
      {children}
    </div>
  </div>;

RequiredProgress.propTypes = {
  value: React.PropTypes.number,
};

export default RequiredProgress;
