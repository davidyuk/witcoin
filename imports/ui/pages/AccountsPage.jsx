import React from 'react';
import ReactDOM from 'react-dom';
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

    return (
      <div className="row">
        <div className="col-md-6 col-md-offset-3">
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
