import { Actions } from '../../api/actions';

export const registeredTransactionTypes = [];

export const registerTransactionType = type => {
  registeredTransactionTypes.push(type);
  Actions.typesTree['Операции'] = registeredTransactionTypes;
  Actions.notificationTypesTree['Операции'] = registeredTransactionTypes;
};
