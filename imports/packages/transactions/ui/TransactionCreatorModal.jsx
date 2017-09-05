import React from 'react';
import { jQuery } from 'meteor/jquery';

import { injectUser } from '../../../ui/hocs';

import CoinsAmount from './CoinsAmount';
import { PRECISION_FACTOR } from '../constants';

const TransactionCreatorModal = ({user, id, objectId, objectIsUser}) => {
  let modal;
  const onSubmit = event => {
    event.preventDefault();
    Meteor.call(
      'transaction.create',
      objectId,
      event.target.amount.value * PRECISION_FACTOR,
      event.target.description.value,
      objectIsUser,
    );
    event.target.amount.value = '';
    event.target.description.value = '';
    jQuery(modal).modal('hide');
  };
  const balance = user ? user.balance : 0;

  return (
    <div className="modal fade" id={id} ref={c => modal = c}>
      <div className="modal-dialog">
        <form className="modal-content" onSubmit={onSubmit}>
          <div className="modal-header">
            <button type="button" className="close" data-dismiss="modal">&times;</button>
            <h4 className="modal-title">Перевести кленинки</h4>
          </div>
          <div className="modal-body">
            <div className="form-horizontal">
              <div className="form-group">
                <label htmlFor="amount" className="col-sm-2 control-label">Сумма</label>
                <div className="col-sm-10">
                  <input type="number" name="amount" id="amount" className="form-control" placeholder="Сумма" required
                         min="0.1" max={balance / PRECISION_FACTOR} step="0.1" />
                  <span className="help-block">Доступно: <CoinsAmount value={balance} /></span>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="description" className="col-sm-2 control-label">Причина перевода</label>
                <div className="col-sm-10">
                  <textarea name="description" id="description" className="form-control" required={objectIsUser}
                            placeholder={'Причина перевода' + (objectIsUser ? ''
                              : ' (необязвательное поле, созданная операция будет связана с действием)')} />
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-default" data-dismiss="modal">Отмена</button>
            <button type="submit" className="btn btn-primary">Перевести</button>
          </div>
        </form>
      </div>
    </div>
  );
};

TransactionCreatorModal.propTypes = {
  user: React.PropTypes.object,
  id: React.PropTypes.string,
  objectId: React.PropTypes.string.isRequired,
  objectIsUser: React.PropTypes.bool.isRequired,
};

export default injectUser(TransactionCreatorModal);
