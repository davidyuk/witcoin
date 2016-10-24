import React from 'react';
import { Link } from 'react-router';

import UserName from './UserName';
import LinkMenu from './LinkMenu';
import { injectUser } from '../injectors';

const UserMenu = ({ user }) => {
  return user ? (
    <ul className="nav navbar-nav navbar-right">
      <li>
        <a className="dropdown-toggle" data-toggle="dropdown" href="#">
          <UserName user={user}/>&nbsp;
          <b className="caret"/>
        </a>
        <ul className="dropdown-menu">
          <LinkMenu to={'/u/' + user._id}>Моя страница</LinkMenu>
          <LinkMenu to="/feed">Новости</LinkMenu>
          <LinkMenu to="/notifications">Уведомления</LinkMenu>
          <LinkMenu to="/im">Сообщения</LinkMenu>
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
};

export default injectUser(UserMenu);
