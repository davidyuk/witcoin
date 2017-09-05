import React from 'react';

import EmailSettings from '../../ui/components/EmailSettings';

import { isFefuEmail } from './utils';
import FefuAuthNotice from './ui/FefuAuthNotice';

EmailSettings.registerCanRemoveEmailChecker(email => !email.verified || !isFefuEmail(email.address));

EmailSettings.registerAddEmailErrorMessage(
  'fefu-email-already-added', 'Email студента ДВФУ уже добавлен к этой учётной записи'
);

EmailSettings.registerNoticeComponent(FefuAuthNotice);
