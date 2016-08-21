import { Meteor } from 'meteor/meteor';
import { browserHistory } from 'react-router';

T9n.setLanguage('ru');

AccountsTemplates.configure({
  onSubmitHook: function(error, state) {
    if (error || !Meteor.userId()) return;
    browserHistory.push('/u/' + Meteor.userId());
  },
});
