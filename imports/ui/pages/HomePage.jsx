import React from 'react';
import { FormattedPlural } from 'react-intl';
import Helmet from 'react-helmet';

import UserList from '../components/UserList';

const HomePage = ({counts, usersLast, usersOnline}) =>
  <div className="row">
    <Helmet title="Привет!" />
    <div className="col-sm-8">
    </div>
    <div className="col-sm-4">
      <div className="panel panel-default">
        <div className="panel-heading">Информация о системе</div>
        <table className="table">
          <tbody>
          <tr>
            <td>Зарегистрировано</td>
            <td>
              {counts.users}&nbsp;
              <FormattedPlural value={counts.users}
                               one="пользователь" few="пользователя" other="пользователей" />
            </td>
          </tr>
          <tr>
            <td>В сети</td>
            <td>
              {counts.usersOnline}&nbsp;
              <FormattedPlural value={counts.usersOnline}
                               one="пользователь" few="пользователя" other="пользователей" />
            </td>
          </tr>
          <tr>
            <td>Отправлено</td>
            <td>
              {counts.messages}&nbsp;
              <FormattedPlural value={counts.messages}
                               one="сообщение" few="сообщения" other="сообщений" />
            </td>
          </tr>
          <tr>
            <td>
              К серверу <FormattedPlural value={counts.connections} one="подключен" other="подключено" />
            </td>
            <td>
              {counts.connections}&nbsp;
              <FormattedPlural value={counts.connections}
                               one="клиент" few="клиента" other="клиентов" />
            </td>
          </tr>
          </tbody>
        </table>
      </div>
      <UserList users={usersOnline} title="В сети" />
      <UserList users={usersLast} title="Недавно зарегистрировавшиеся" />
    </div>
  </div>;

HomePage.propTypes = {
  counts: React.PropTypes.shape({
    users: React.PropTypes.number,
    usersOnline: React.PropTypes.number,
    messages: React.PropTypes.number,
    connections: React.PropTypes.number,
  }),
  usersLast: React.PropTypes.array,
  usersOnline: React.PropTypes.array,
};

HomePage.defaultProps = {
  counts: {
    users: 0,
    usersOnline: 0,
    messages: 0,
    connections: 0,
  },
  usersLast: [],
  usersOnline: [],
};

export default HomePage;
