import React from 'react';

import MessageInput from '../../../ui/components/MessageInput';

export default () =>
  <MessageInput handler={content => Meteor.call('task.create', content)}
                placeholder="Описание задания" buttonText="Сохранить" />;
