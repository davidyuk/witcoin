import React from 'react';
import { Meteor } from 'meteor/meteor';
import { jQuery } from 'meteor/jquery';
import { createContainer } from 'meteor/react-meteor-data';

import { Actions } from '../../../api/actions';

import TransactionCreatorModal from './TransactionCreatorModal';
import { registeredTransactionParentTypes } from '../internal';
import { PRECISION_FACTOR } from '../constants';

const TransactionActionButton = ({userId, action, payed}) => {
  if (!registeredTransactionParentTypes.includes(action.type)) return null;
  const modalId = 'transaction-modal-' + action._id;
  const disabled = action.userId == userId;
  const coinsCount = action.extra && action.extra.coinsCount / PRECISION_FACTOR;

  return <span>
    <div className="btn-group btn-group-xs">
      {coinsCount && <button className="btn btn-default disabled">{coinsCount}&nbsp;кл</button>}
      <button title="Перевести кленинки" data-toggle="modal" data-target={'#' + modalId}
              className={'btn btn-default' + (payed ? ' active' : '') + (disabled ? ' disabled' : '')}>
        <span className="glyphicon glyphicon-transfer" />
      </button>
    </div>
    {!disabled && <TransactionCreatorModal objectId={action._id} objectIsUser={false} id={modalId} />}
  </span>;
};

TransactionActionButton.propTypes = {
  action: React.PropTypes.object.isRequired,
  payed: React.PropTypes.bool.isRequired,
};

export default createContainer(
  ({action}) => ({
    payed: !!Actions.findOne({
      type: Actions.types.TRANSACTION,
      objectId: action._id, userId: Meteor.userId()
    }),
    userId: Meteor.userId(),
  }),
  TransactionActionButton
);
