import { Meteor } from 'meteor/meteor';
import { Migrations } from 'meteor/percolate:migrations';
import Intl from 'intl';
import { Inject } from 'meteor/meteorhacks:inject-initial';

import '../imports/startup/accounts-config';
import '../imports/startup/server/migrations';

import '../imports/api/users';
import '../imports/api/chats';
import '../imports/api/actions';
import '../imports/api/feeds';
import '../imports/api/userpage';
import '../imports/api/homepage';

import '../imports/api/testData';
import { sendMails } from '../imports/mails/report';

import '../imports/packages';

global.Intl = Intl;

Inject.rawBody('body', Assets.getText('body.html'));

Meteor.startup(() => {
  Migrations.migrateTo('latest');
  if (Meteor.isProduction) Meteor.setInterval(sendMails, 5 * 60 * 1000);
});
