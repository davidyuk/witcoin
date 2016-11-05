import React from 'react';
import ReactMixin from 'react-mixin';
import { ReactMeteorData } from 'meteor/react-meteor-data';
import { Link } from 'react-router';

export default class UserSearch extends React.Component {
  constructor() {
    super();
    this.state = {query: '', resultVisible: false};
    this.handleFocus = this.handleFocus.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidUpdate() {
    if (this.state.resultVisible) window.addEventListener('click', this.handleClick);
    else window.removeEventListener('click', this.handleClick);
  }

  getMeteorData() {
    return {
      users: Meteor.users.index.search(this.state.query).fetch(),
    }
  }

  handleFocus(event) {
    event.target.select();
    this.setState({resultVisible: true});
  }

  handleClick(event) {
    if (!this._form.contains(event.target))
      this.setState({resultVisible: false});
  }

  render() {
    return (
      <form ref={c => this._form = c}
            className="navbar-form navbar-left">
        <div className="form-group" style={{position: 'relative'}}>
          <div className="input-group">
            <span className="input-group-addon">
              <span className="glyphicon glyphicon-search" />
            </span>
            <input onChange={event => this.setState({query: event.target.value})} onFocus={this.handleFocus}
                   value={this.state.query} type="search" className="form-control" placeholder="Имя пользователя" />
          </div>
          {this.state.resultVisible ? (
            <div className="list-group" style={{zIndex: 10, position: 'absolute', width: '100%'}}>
              {this.data && this.data.users && this.data.users.map(user =>
                <Link key={user._id} to={"/u/" + user.__originalId} className="list-group-item"
                      onClick={() => this.setState({resultVisible: false})}>
                  {user.getFullName()}</Link>
              )}
            </div>
          ) : null}
        </div>
      </form>
    );
  }
}

ReactMixin(UserSearch.prototype, ReactMeteorData);
