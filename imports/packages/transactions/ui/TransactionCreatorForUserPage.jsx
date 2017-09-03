import React from 'react';
import { jQuery } from 'meteor/jquery';

import TransactionCreatorModal from './TransactionCreatorModal';

const TransactionCreatorForUserPage = ({userToId}) => <li>
  <a href="#" data-toggle="modal" data-target="#transaction-modal">
    <span className="glyphicon glyphicon-transfer" /> Перевести кленинки
  </a>
  <TransactionCreatorModal objectId={userToId} objectIsUser={true} id="transaction-modal" />
</li>;

TransactionCreatorForUserPage.propTypes = {
  userToId: React.PropTypes.string.isRequired,
};

export default TransactionCreatorForUserPage;
