import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { IntlProvider } from 'react-intl';
import { Router, RouterContext, Route, match } from 'react-router';

import { htmlTemplate } from './templates';
import { Actions } from '../api/actions';
import { Chats } from '../api/chats';
import { FeedItems } from '../api/feeds';
import MailReport from '../ui/components/MailReport';

const syncMatch = Meteor.wrapAsync((data, cb) =>
  match(data, (error, redirectLocation, renderProps) => cb(error, {redirectLocation, renderProps}))
);

// fixme: should be exported only for tests
export const getActions = (userId, isNotifications, markAsMailed = true) => {
  const selector = {
    userId, isNotification: isNotifications, isRead: false, isMailed: false,
  };
  if (!isNotifications) selector.type = {$in: Actions.relevantTypes};

  const feedItems = FeedItems.find(selector, {sort: {createdAt: -1}})
    .map(fi => Actions.findOne(fi.actionId));
  if (markAsMailed) FeedItems.update(selector, {$set: {isMailed: true}}, {multi: true});
  return feedItems;
};

// fixme: should be exported only for tests
export const getMessages = (userId, markAsMailed = true) => {
  const selector = {
    userIds: userId,
    'lastMessage.userId': {$ne: userId},
    'lastMessage.isRead': false,
    'lastMessage.isMailed': false,
  };

  const messages = Chats.find(selector, {sort: {'lastMessage.createdAt': -1}}).fetch().map(chat => {
    const message = chat.lastMessage;
    message.user = Meteor.users.findOne(message.userId);
    return message;
  });
  if (markAsMailed) Chats.update(selector, {$set: {'lastMessage.isMailed': true}}, {multi: true});
  return messages;
};

const renderMail = props => {
  const renderProps = syncMatch({
    routes: <Router><Route path="/" component={() => <MailReport {...props} />} /></Router>,
    location: '/',
    basename: Meteor.absoluteUrl()
  }).renderProps;

  return htmlTemplate(ReactDOMServer.renderToStaticMarkup(
    <IntlProvider locale="ru">
      <RouterContext {...renderProps} />
    </IntlProvider>
  ));
};

export const generateMessage = (user, markAsMailed = true) => {
  const newsItems = user.profile.reports.send.news ? getActions(user._id, false, markAsMailed) : [];
  const notificationItems = user.profile.reports.send.notifications ? getActions(user._id, true, markAsMailed) : [];
  const messages = user.profile.reports.send.chats ? getMessages(user._id, markAsMailed) : [];

  if (newsItems.length + notificationItems.length + messages.length == 0) return;

  return renderMail({ user, newsItems, notificationItems, messages });
};

export const sendMails = () => {
  Meteor.users.find({
    'emails.primary': true,
    'profile.reports.nextDate': {$lt: new Date()},
    $or: [
      {'profile.reports.send.news': true},
      {'profile.reports.send.notifications': true},
      {'profile.reports.send.chats': true}
    ],
  }).forEach(user => {
    const content = generateMessage(user);
    if (content) {
      Email.send({
        to: user.emails.filter(e => e.primary)[0].address,
        from: 'Кленинка <no-reply@witcoin.ru>',
        subject: 'События за последнее время',
        html: content,
      });
    }
    const date = new Date();
    date.setSeconds(date.getSeconds() + user.profile.reports.interval);
    Meteor.users.update(user._id, {$set: {'profile.reports.nextDate': date}});
  });
};
