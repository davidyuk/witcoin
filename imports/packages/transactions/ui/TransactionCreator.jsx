import React from 'react';

import SelectUser from '../../../ui/components/SelectUser';
import { injectUser } from '../../../ui/hocs';

import CoinsAmount from './CoinsAmount';
import { PRECISION_FACTOR } from '../constants';

const TransactionCreator = ({ user }) => {
  const onSubmit = event => {
    event.preventDefault();
    Meteor.call('transaction.create',
      event.target.user.value,
      event.target.amount.value * PRECISION_FACTOR,
      event.target.description.value,
    );
    event.target.amount.value = '';
    event.target.description.value = '';
  };

  const style = {margin: '5px 0'};
  const balance = user ? user.balance : 0;

  return (
    <form onSubmit={onSubmit}>
      <SelectUser className="form-control input-sm" style={style} placeholder="Кому" name="user" required
                  canSelectYourself={false} />
      <input type="number" name="amount" className="form-control input-sm" placeholder="Сумма" style={style} required
             min="0.1" max={balance / PRECISION_FACTOR} step="0.1" />
      <span className="text-muted" style={{fontSize: '12px'}}>Доступно: <CoinsAmount value={balance} /></span>
      <textarea name="description" className="form-control input-sm" placeholder="Причина перевода"
                style={{minHeight: 50 + 'px', margin: '5px 0'}} required />
      <button className="btn btn-primary btn-sm">Перевести</button>
    </form>
  );
};

TransactionCreator.propTypes = {
  user: React.PropTypes.object,
};

export default injectUser(TransactionCreator);
