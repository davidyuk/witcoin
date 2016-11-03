import React from 'react';
import { Link } from 'react-router';

import LinkMenu from './LinkMenu';
import { injectUser } from '../injectors';

const UserMenu = ({ user, chatsUnreadCount, notificationsUnreadCount }) => {
  const renderBadge = count => count ? <span className="badge">{count}</span> : null;

  return user ? (
    <ul className="nav navbar-nav navbar-right">
      <li>
        <a className="dropdown-toggle" data-toggle="dropdown" href="#">
          {user.getFullName()}
          &nbsp;{renderBadge(chatsUnreadCount + notificationsUnreadCount) || <b className="caret"/>}
        </a>
        <ul className="dropdown-menu">
          <LinkMenu to={'/u/' + user._id}>Моя страница</LinkMenu>
          <LinkMenu to="/feed">Новости</LinkMenu>
          <LinkMenu to="/notifications">Уведомления {renderBadge(notificationsUnreadCount)}</LinkMenu>
          <LinkMenu to="/im">Сообщения {renderBadge(chatsUnreadCount)}</LinkMenu>
          <LinkMenu to="/settings">Настройки</LinkMenu>
          <li className="divider"/>
          <li><Link onClick={() => AccountsTemplates.logout()} to="/">Выход</Link></li>
        </ul>
      </li>
    </ul>
  ) : (
    <ul className="nav navbar-nav navbar-right">&nbsp;
      <Link to="/sign-in" className="btn btn-default navbar-btn">Войти</Link>&nbsp;
      <Link to="/sign-up" className="btn btn-success navbar-btn">Регистрация</Link>
    </ul>
  );
};

UserMenu.propTypes = {
  user: React.PropTypes.object,
  chatsUnreadCount: React.PropTypes.number,
  notificationsUnreadCount: React.PropTypes.number,
};

export default injectUser(UserMenu);
