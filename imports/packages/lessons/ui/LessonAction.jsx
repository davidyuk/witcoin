import React from 'react';
import { Link } from 'react-router';

import { Actions } from '../../../api/actions';

import LessonState from './LessonState';

const LessonAction = ({ baseType, action, user }) =>
  Actions.types.LESSON == baseType ? <span>
    {' '}| <LessonState state={action.extra.state} /> |{' '}
    <Link to={'/lessons/' + action._id} className="label label-default">подробнее</Link>
  </span> : <span>
    добавил{user.isMale() ? '' : 'а'} <Link to={'/lessons/' + action._id}>мастер-класс</Link>
  </span>;

LessonAction.propTypes = {
  action: React.PropTypes.object.isRequired,
  user: React.PropTypes.object.isRequired,
  baseType: React.PropTypes.string,
};

export default LessonAction;
