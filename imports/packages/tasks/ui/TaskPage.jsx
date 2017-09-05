import React from 'react';
import { withRouter } from 'react-router';
import Helmet from 'react-helmet';

import LinkToUser from '../../../ui/components/LinkToUser';
import ActionListContainer from '../../../ui/containers/ActionListContainer';
import CommentList from '../../../ui/components/CommentList';
import VoteButton from '../../../ui/components/VoteButton';
import ShareButton from '../../../ui/components/ShareButton';
import MessageInput from '../../../ui/components/MessageInput';
import Date from '../../../ui/components/Date';
import { Actions } from '../../../api/actions';

import { TaskStates } from '../index';
import TaskState from './TaskState';

const TaskPage = ({ task, user, router }) => {
  const removeTask = () => {
    Meteor.call('action.remove', task._id);
    router.goBack();
  };

  const setState = state => () =>
    Meteor.call('task.state', task._id, state);

  const authorControls = Meteor.userId() == task.userId ? (
    <div>
      {!task.unDeletable && (
        <button className="btn btn-danger btn-xs" onClick={removeTask}>
          <span className="glyphicon glyphicon-remove" />
          &nbsp;Удалить
        </button>
      )}
      {task.extra.state == TaskStates.ACTUAL ? (
        <div className="modal fade" id="inactive_modal">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <button type="button" className="close" data-dismiss="modal">&times;</button>
                <h4 className="modal-title">Оценка эффективности</h4>
              </div>
              <div className="modal-body">
                Вы нашли решение среди предложений к этому заданию?
              </div>
              <div className="modal-footer">
                <button onClick={setState(TaskStates.SUCCEED)} className="btn btn-success" data-dismiss="modal">
                  Да</button>
                <button onClick={setState(TaskStates.FAILED)} className="btn btn-warning" data-dismiss="modal">
                  Нет</button>
                <button className="btn btn-default" data-dismiss="modal">Отмена</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      &nbsp;
      <button className="btn btn-primary btn-xs"
              {...(task.extra.state == TaskStates.ACTUAL
                ? {'data-toggle': 'modal', 'data-target': '#inactive_modal'}
                : {onClick: setState(TaskStates.ACTUAL)})}>
        Отметить как {task.extra.state == TaskStates.ACTUAL ? 'не' : ''}актуальное
      </button>
    </div>
  ) : null;

  const truncateString = (str, n) => str.length > n ? str.substr(0, n) + '…' : str;

  return (
    <div className="row">
      <Helmet title={truncateString(task.description, 50)} />
      <div className="col-sm-5 col-md-6">
        <table className="table table-noTopBorder">
          <tbody>
          <tr>
            <td><LinkToUser user={user} /></td>
            <td><TaskState task={task} /></td>
          </tr>
          <tr>
            <td>Дата создания</td>
            <td><Date value={task.createdAt} /></td>
          </tr>
          <tr>
            <td>{authorControls}</td>
            <td style={{textAlign: 'right'}}>
              <ShareButton action={task} />
              &nbsp;<VoteButton action={task} />
            </td>
          </tr>
          </tbody>
        </table>

        <div style={{whiteSpace: 'pre-wrap'}}>{task.description}</div>
        <CommentList actionId={task._id} comments={task.comments} showAll={true} />
      </div>
      <div className="col-sm-7 col-md-6">
        <h3>Предложения</h3>
        <ActionListContainer selector={{objectId: task._id, type: Actions.types.TASK_SUGGESTION}}
                             sort={{'rates.total': -1, createdAt: 1}}
                             baseType={Actions.types.TASK_SUGGESTION}
                             onEmptyMessage="Предложений нет" limit={1000} />
        {task.extra.state == TaskStates.ACTUAL ?
          <div className="panel panel-default panel-body">
            <strong>Добавить предложение к заданию</strong>
            <MessageInput handler={content => Meteor.call('task.suggestion', task._id, content)}
                          placeholder="Описание и стоимость предложения" buttonText="Сохранить" />
          </div> : null}
      </div>
    </div>
  );
};

TaskPage.propTypes = {
  task: React.PropTypes.object.isRequired,
  user: React.PropTypes.object.isRequired,
  router: React.PropTypes.object.isRequired,
};

export default withRouter(TaskPage);
