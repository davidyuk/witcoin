import React from 'react';
import { Link } from 'react-router';
import Helmet from 'react-helmet';

import UserMenu from '../containers/UserMenuContainer';
import UserSearch from '../components/UserSearch';
import ConnectionStatus from '../components/ConnectionStatus';

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
          <ul className="nav navbar-nav hidden-xs hidden-sm">
            {App._menuItems.map((item, key) =>
              React.cloneElement(item, {...item.props, key})
            )}
          </ul>
          <ul className="nav navbar-nav visible-xs visible-sm">
            <li>
              <a className="dropdown-toggle" data-toggle="dropdown" href="#">
                Разделы <span className="caret"/>
              </a>
              <ul className="dropdown-menu">
                {App._menuItems.map((item, key) =>
                  React.cloneElement(item, {...item.props, key})
                )}
              </ul>
            </li>
          </ul>

          <UserSearch />
          <UserMenu />
          <ConnectionStatus />
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
          {/* Yandex.Metrika informer */}
          <a href="https://metrika.yandex.ru/stat/?id=37336595&amp;from=informer" target="_blank" rel="nofollow">
            <img src="https://informer.yandex.ru/informer/37336595/3_0_FFFFFFFF_EFEFEFFF_0_pageviews"
                 style={{width: '88px', height: '31px', border: 0}} alt="Яндекс.Метрика"
                 title="Яндекс.Метрика: данные за сегодня (просмотры, визиты и уникальные посетители)" />
          </a>
          {/* /Yandex.Metrika informer */}
        </div>
      </div>
    </footer>
  </div>;

App.propTypes = {
  children: React.PropTypes.element,
};

App._menuItems = [];

App.registerMenuItem = item => App._menuItems.push(item);

export default App;
