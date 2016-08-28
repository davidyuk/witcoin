import { Meteor } from 'meteor/meteor';
import { browserHistory } from 'react-router';

T9n.setLanguage('ru');

AccountsTemplates.routes = {
  signIn: {path: '/sign-in'},
  signUp: {path: '/sign-up'},
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
  onSubmitHook: function(error, state) {
    if (error || !Meteor.userId()) return;
    browserHistory.push('/u/' + Meteor.userId());
  },
});
