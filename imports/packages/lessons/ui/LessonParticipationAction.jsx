import React from 'react';
import { Link } from 'react-router';

import { Actions } from '../../../api/actions';

const TaskSuggestionAction = ({ baseType, action, user, isNotification }) =>
  Actions.types.TASK_SUGGESTION == baseType ? null :
    <span>
      к {isNotification ? 'Вашему' : ''} <Link to={'/tasks/' + action.objectId}>заданию</Link>
      {' '}добавил{user.isMale() ? '' : 'а'} предложение
    </span>;

TaskSuggestionAction.propTypes = {
  action: React.PropTypes.object.isRequired,
  user: React.PropTypes.object.isRequired,
  baseType: React.PropTypes.string,
  isNotification: React.PropTypes.bool,
};

export default TaskSuggestionAction;
