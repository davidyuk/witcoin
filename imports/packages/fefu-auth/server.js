import { Meteor } from 'meteor/meteor';

import { Actions } from '../../api/actions';

import { isFefuEmail } from './utils';

const _emailAdd = Meteor.server.method_handlers['user.email.add'];
Meteor.server.method_handlers['user.email.add'] = function(email) {
  if (isFefuEmail(email)) {
    const user = Meteor.users.findOne(this.userId);
    if (user.emails.find(email => isFefuEmail(email.address)))
      throw new Meteor.Error('fefu-email-already-added');
  }
  _emailAdd.apply(this, arguments);
};

const _emailRemove = Meteor.server.method_handlers['user.email.remove'];
Meteor.server.method_handlers['user.email.remove'] = function(email) {
  if (isFefuEmail(email)) {
    const user = Meteor.users.findOne(this.userId);
    if (user.emails.find(email => isFefuEmail(email.address)).verified)
      throw new Meteor.Error('verified-fefu-email-cannot-be-removed');
  }
  _emailRemove.apply(this, arguments);
};

// fixme: should be exported only for tests
export const createFefuAuthOnFefuEmailVerify = function (func, token) {
  const user = Meteor.users.findOne({'services.email.verificationTokens.token': token});
  const tokenRecord = user && user.services.email.verificationTokens.find(tr => tr.token == token);
  const emailRecord = tokenRecord && user.emails.find(er => er.address == tokenRecord.address);
  const isFefuAndNotVerified = emailRecord && isFefuEmail(emailRecord.address) && !emailRecord.verified;

  const cbArgs = Array.from(arguments);
  cbArgs.shift();
  const res = func.apply(this, cbArgs);

  if (isFefuAndNotVerified)
    Actions.insert({
      type: Actions.types.FEFU_AUTH,
      extra: {fefuUserName: emailRecord.address.split('@')[0]},
      userId: user._id,
      unDeletable: true,
    });

  return res;
};

const _verifyEmail = Meteor.server.method_handlers['verifyEmail'];
Meteor.server.method_handlers['verifyEmail'] = function() {
  return createFefuAuthOnFefuEmailVerify.apply(this, [_verifyEmail, ...arguments]);
};
