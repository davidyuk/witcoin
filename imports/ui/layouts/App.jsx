import React, { Component } from 'react';
import { Link } from 'react-router';

import UserMenu from '../components/UserMenu';

export default class App extends Component {
  render() {
    return (
      <div>
        <nav className="navbar navbar-default">
          <div className="container">
            <div className="navbar-header">
              <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar">
                <span className="icon-bar"/>
                <span className="icon-bar"/>
                <span className="icon-bar"/>
              </button>
              <Link to="/" className="navbar-brand">Кленинка</Link>
            </div>
            <div id="navbar" className="collapse navbar-collapse">
              <ul className="nav navbar-nav">
              </ul>

              <UserMenu user={this.props.user}/>
            </div>
          </div>
        </nav>
        <main className="container text-wrapped">
          {this.props.children}
        </main>
      </div>
    );
  }
}

App.propTypes = {
  children: React.PropTypes.element,
};
