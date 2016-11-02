import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { browserHistory } from 'react-router';

import { capitalize } from '../helpers/capitalize';
import {
  resetPasswordSubject, resetPasswordHtmlTemplate,
  verifyEmailSubject, verifyEmailHtmlTemplate
} from '../mails/templates';
import '../api/users';

const GT = Meteor.users.genderTypes;

T9n.setLanguage('ru');

AccountsTemplates.routes = {
  signIn: {path: '/sign-in'},
  signUp: {path: '/sign-up'},
  changePwd: {path: '/change-password'},
  forgotPwd: {path: '/forgot-password'},
  resetPwd: {path: '/reset-password'},
  verifyEmail: {path: '/verify-email'},
};

AccountsTemplates.getRoutePath = function(route) {
  if (route in this.routes) {
    return this.routes[route].path;
  }
  return "#";
};

const _linkClick = AccountsTemplates.linkClick;
AccountsTemplates.linkClick = function(route) {
  if (route in this.routes) {
    return browserHistory.push(this.getRoutePath(route));
  }
  return _linkClick.call(this, route);
};

AccountsTemplates.configure({
  enablePasswordChange: true,
  showForgotPasswordLink: true,
  onSubmitHook: function(error, state) {
    if (!error && Meteor.userId() && ['signIn', 'signUp'].includes(state))
      browserHistory.push('/u/' + Meteor.userId());
  },
});


const _oauthServices = AccountsTemplates.oauthServices;

AccountsTemplates.oauthServices = function () {
  const services = _oauthServices.apply(this, arguments);

  const vkServiceIndex = services.reduce((prev, next, i) => next._id == 'vk' ? i : prev, -1);
  if (vkServiceIndex != -1)
    services.splice(0, 0, services.splice(vkServiceIndex, 1)[0]);

  return services;
};

if (Meteor.isClient) {
  AccountsTemplates.getServiceVerboseName = serviceName => {
    serviceName = capitalize(serviceName);
    return serviceName == 'Vk' ? 'ВКонтакте' : serviceName;
  };

  const _buttonText = AccountsTemplates.atSocialHelpers.buttonText;

  AccountsTemplates.atSocialHelpers.buttonText = function () {
    const arr = _buttonText.apply(this, arguments).split(' ');
    arr.push(AccountsTemplates.getServiceVerboseName(arr.pop()));
    return arr.join(' ');
  };

  Template.atSocial.helpers({
    buttonText: AccountsTemplates.atSocialHelpers.buttonText,
  });
}

if (Meteor.isServer) {
  Accounts.urls.resetPassword = token => Meteor.absoluteUrl('reset-password/' + token);

  Accounts.urls.verifyEmail = token => Meteor.absoluteUrl('verify-email/' + token);

  Object.assign(Accounts.emailTemplates, {
    from: 'Кленинка <no-reply@witcoin.ru>',

    resetPassword: {
      subject: () => resetPasswordSubject,
      html: (user, url) => resetPasswordHtmlTemplate(
        user.getFullName(), Meteor.absoluteUrl(), url),
    },

    verifyEmail: {
      subject: () => verifyEmailSubject,
      html: (user, url) => verifyEmailHtmlTemplate(
        user.getFullName(), Meteor.absoluteUrl(), url),
    },
  });

  Accounts.onCreateUser(function(options, user) {
    const allServices = AccountsTemplates.oauthServices().map(s => s._id);
    const servicesData = {};
    Object.keys(user.services).forEach(k => allServices.includes(k) && Object.assign(servicesData, user.services[k]));

    const p = user.profile = options.profile || user.profile || {};
    p.firstName = p.firstName || servicesData.first_name || servicesData.given_name;
    p.lastName = p.lastName || servicesData.last_name || servicesData.family_name;
    p.gender = p.gender ||
      servicesData.gender && (servicesData.gender == 'male' ? GT.MALE : GT.FEMALE) ||
      servicesData.sex && (servicesData.sex == 2 ? GT.MALE : GT.FEMALE);

    return user;
  });
}

AccountsTemplates.addFields([
  {
    _id: 'firstName',
    displayName: 'Имя',
    placeholder: 'Имя',
    type: 'text',
    required: true,
  }, {
    _id: 'lastName',
    displayName: 'Фамилия',
    placeholder: 'Фамилия',
    type: 'text',
    required: true,
  }, {
    _id: 'gender',
    displayName: 'Ваш пол',
    type: 'radio',
    required: true,
    select: [{
      text: "мужской",
      value: GT.MALE,
    }, {
      text: "женский",
      value: GT.FEMALE,
    }],
  }
]);
