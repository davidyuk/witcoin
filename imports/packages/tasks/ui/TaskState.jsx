import React from 'react';

import { TaskStates } from '../index';

const TaskState = ({ task }) => {
  const {title, className} = {
    [TaskStates.ACTUAL]: {title: 'Актуально', className: 'glyphicon glyphicon-flag text-info'},
    [TaskStates.SUCCEED]: {title: 'Выполнено', className: 'glyphicon glyphicon-ok text-success'},
    [TaskStates.FAILED]: {title: 'Не выполнено', className: 'glyphicon glyphicon-remove text-warning'},
  }[task.extra.state];
  return <span>
    {' '}
    <span title={title} className={className}
          style={{verticalAlign: 'middle', fontSize: '18px'}} />
    &nbsp;{title}
  </span>
};

TaskState.propTypes = {
  task: React.PropTypes.object.isRequired,
};

export default TaskState;
