import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router';
import Helmet from 'react-helmet';
import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';

export default class AccountsPage extends React.Component {
  componentDidMount() {
    this.view = Blaze.render(
      Template.atForm,
      ReactDOM.findDOMNode(this.refs.container)
    );
  }

  componentWillUnmount() {
    Blaze.remove(this.view);
  }

  render() {
    const location = this.props.location;
    const state = Object.keys(AccountsTemplates.routes).find(n =>
      location.pathname.startsWith(AccountsTemplates.getRoutePath(n))
    );

    AccountsTemplates.state.form.set('state', state);

    AccountsTemplates.state.form.set('error', location.state && location.state.nextPathname ?
      [AccountsTemplates.texts.errors.mustBeLoggedIn] : null);

    AccountsTemplates.getparamToken = () => this.props.params.token;

    if (state == 'verifyEmail' && Meteor.isClient) {
      Accounts.verifyEmail(this.props.params.token, function(error) {
        AccountsTemplates.setDisabled(false);
        AccountsTemplates.submitCallback(error, state, () =>
          AccountsTemplates.state.form.set("result", AccountsTemplates.texts.info.emailVerified)
        );
      });
    }

    return (
      <div className="row">
        <Helmet title={T9n.get(AccountsTemplates.texts.title[state], false)} />
        <div className="col-md-6 col-md-offset-3">
          {state == 'signIn' ? (
            <div className="alert alert-info" style={{overflow: 'hidden'}}>
              <Link className="alert-link" to="/">19 ноября 2016</Link> сайт был обновлён. Если последний раз вы
              заходили на старую версию, то, вероятно, вам нужно
              {' '}<Link className="alert-link" to="/forgot-password">сбросить пароль</Link>.
            </div>
          ) : null}
          <span ref="container" />
        </div>
      </div>
    );
  }
}

AccountsPage.propTypes = {
  location: React.PropTypes.shape({
    pathname: React.PropTypes.string.isRequired,
    state: React.PropTypes.object,
  }),
  params: React.PropTypes.shape({
    token: React.PropTypes.string,
  }),
};
