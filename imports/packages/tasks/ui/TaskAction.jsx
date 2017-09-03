import React from 'react';
import { Link } from 'react-router';
import { FormattedPlural } from 'react-intl';

import { Actions } from '../../../api/actions';

import TaskState from './TaskState';

const TaskAction = ({ baseType, action, user }) =>
  Actions.types.TASK == baseType ?
    <span>
      {' '}| <TaskState task={action} /> |{' '}
      <Link className="label label-default" to={'/tasks/' + action._id}>
        {action.extra.suggestionsCount}&nbsp;
        <FormattedPlural value={action.extra.suggestionsCount}
                         one="предложение"
                         few="предложения"
                         other="предложений" />
      </Link>
    </span>
    :
    <span>
      добавил{user.isMale() ? '' : 'а'} <Link to={'/tasks/' + action._id}>задание</Link>
    </span>;

TaskAction.propTypes = {
  action: React.PropTypes.object.isRequired,
  user: React.PropTypes.object.isRequired,
  baseType: React.PropTypes.string,
};

export default TaskAction;
