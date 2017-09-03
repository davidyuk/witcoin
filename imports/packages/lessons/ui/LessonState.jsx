import React from 'react';

import { LessonStates } from '../index';

const LessonState = ({ state }) => {
  const {title, className} = {
    [LessonStates.WAITING]: {title: 'Сбор средств', className: 'glyphicon glyphicon-flag text-info'},
    [LessonStates.LOCKED]: {title: 'Регистрация закрыта', className: 'glyphicon glyphicon-lock text-info'},
    [LessonStates.CONDUCTED]: {title: 'Проведён, сбор отзывов', className: 'glyphicon glyphicon-ok text-warning'},
    [LessonStates.COMPLETED]: {title: 'Проведён', className: 'glyphicon glyphicon-ok text-success'},
    [LessonStates.CANCELED]: {title: 'Отменён', className: 'glyphicon glyphicon-remove text-primary'},
  }[state];
  return <span>
    <span title={title} className={className}
          style={{verticalAlign: 'middle', fontSize: '18px'}} />
    &nbsp;{title}
  </span>
};

LessonState.propTypes = {
  state: React.PropTypes.string.isRequired,
};

export default LessonState;
