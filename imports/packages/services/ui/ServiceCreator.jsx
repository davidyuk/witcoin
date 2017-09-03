import React from 'react';

import { Actions } from '../../../api/actions';
import MessageInput from '../../../ui/components/MessageInput';

export default () =>
  <MessageInput handler={content => Meteor.call('action.create', content, Actions.types.SERVICE)}
                placeholder="Описание и стоимость услуги" buttonText="Сохранить" />;
