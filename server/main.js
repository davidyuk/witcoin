import { Meteor } from 'meteor/meteor';
import Intl from 'intl';

import '../imports/startup/accounts-config';

import '../imports/api/users';
import '../imports/api/chats';
import '../imports/api/actions';
import '../imports/api/feeds';
import '../imports/api/userpage';

import '../imports/api/testData';
import { sendMails } from '../imports/mails/report';

global.Intl = Intl;

Meteor.startup(() => {
  if (Meteor.isProduction) Meteor.setInterval(sendMails, 5 * 60 * 1000);
});
