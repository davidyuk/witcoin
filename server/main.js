import { Meteor } from 'meteor/meteor';

import '../imports/startup/accounts-config';

import '../imports/api/users';
import '../imports/api/chats';
import '../imports/api/actions';
import '../imports/api/feeds';
import '../imports/api/userpage';

import '../imports/api/testData';

Meteor.startup(() => {
  // code to run on server at startup
});
