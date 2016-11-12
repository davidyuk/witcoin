import { Meteor } from 'meteor/meteor';
import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import { Actions } from '../../api/actions';

const ShareButton = ({ action, shared }) => {
  let input;
  const share = () => Meteor.call('action.share', action._id, input.value);
  const modalId = 'share_modal_' + action._id;

  return <span>
    <div className="modal fade" id={modalId} style={{textAlign: 'left'}}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <button type="button" className="close" data-dismiss="modal">&times;</button>
            <h4 className="modal-title">Поделиться действием</h4>
          </div>
          <div className="modal-body">
            <textarea ref={c => input = c} className="form-control" placeholder="Ваш комментарий" />
          </div>
          <div className="modal-footer">
            <button onClick={share} className="btn btn-primary" data-dismiss="modal">
              Сохранить
            </button>
            <button className="btn btn-default" data-dismiss="modal">Отмена</button>
          </div>
        </div>
      </div>
    </div>
    <div className="btn-group btn-group-xs">
      {action.sharesCount ? (
        <button className="btn btn-default disabled">{action.sharesCount}</button>
      ) : null}
      <button title="Поделиться" data-toggle="modal" data-target={'#' + modalId}
              className={'btn btn-default' + (shared ? ' active' : '')}>
        <span className="glyphicon glyphicon-share-alt" />
      </button>
    </div>
  </span>;
};

ShareButton.propTypes = {
  action: React.PropTypes.object.isRequired,
  shared: React.PropTypes.bool.isRequired,
};

export default createContainer(
  ({ action }) => ({
    shared: !!Actions.findOne({
      type: Actions.types.SHARE,
      objectId: action._id, userId: Meteor.userId()
    }),
  }),
  ShareButton
);
