import React from 'react';
import { Link } from 'react-router';
import Helmet from 'react-helmet';

import UserMenu from '../containers/UserMenuContainer';
import UserSearch from '../components/UserSearch';

const App = ({ children }) =>
  <div>
    <Helmet defaultTitle="Кленинка" titleTemplate="%s - Кленинка" />
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

          <UserSearch />
          <UserMenu />
        </div>
      </div>
    </nav>
    <main className="container">
      {children}
    </main>
    <footer className="container">
      <div className="row">
        <div className="col-xs-6">
          2016 Кленинка<br/>
          <a href="https://github.com/Davidyuk/witcoin/issues">Трекер ошибок</a>
          , <a href="http://vk.com/witcoin">VK</a>
        </div>
        <div className="col-xs-6 text-right">
          {/*informer.html*/}
        </div>
      </div>
    </footer>
  </div>;

App.propTypes = {
  children: React.PropTypes.element,
};

export default App;
