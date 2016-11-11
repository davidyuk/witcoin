import { Meteor } from 'meteor/meteor';
import React from 'react';

import { Actions } from '../../api/actions';
import MessageInput from './MessageInput';

const renderDefault = () =>
  <MessageInput handler={content => Meteor.call('action.create', content, Actions.types.DEFAULT)}
                placeholder="Текст записи" buttonText="Сохранить" />;

const ActionCreator = () => {
  const creators = ActionCreator._creators;

  return (
    <div className="panel panel-default panel-body" style={{marginBottom: '10px'}}>
      <ul className="nav nav-tabs">
        {creators.map(({type, title}, i) =>
          <li className={i ? '' : 'active'} key={i}>
            <a href={'#' + type} data-toggle="tab">{title}</a>
          </li>
        )}
      </ul>

      <div className="tab-content">
        {creators.map(({type, render: Render}, i) =>
          <div className={'tab-pane fade ' + (i ? '' : 'in active')} id={type} key={i}>
            <Render />
          </div>
        )}
      </div>
    </div>
  );
};

ActionCreator._creators = [
  {type: Actions.types.DEFAULT, title: 'Запись', render: renderDefault},
];

ActionCreator.registerCreator = creator =>
  ActionCreator._creators.push(creator);

export default ActionCreator;
