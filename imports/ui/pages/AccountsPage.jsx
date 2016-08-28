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
    let location = this.props.location;

    let state = null;
    Object.keys(AccountsTemplates.routes).forEach(function(s) {
      state = AccountsTemplates.getRoutePath(s) == location.pathname ? s : state;
    });
    AccountsTemplates.state.form.set('state', state);

    return (
      <div className="row">
        <div className="col-md-6 col-md-offset-3">
          <span ref="container" />
        </div>
      </div>
    );
  }
}
