import React from 'react';
import { FormattedPlural } from 'react-intl';
import Helmet from 'react-helmet';

import UserList from '../components/UserList';

const HomePage = ({lastUsers, usersCount}) =>
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
              {usersCount}&nbsp;
              <FormattedPlural value={usersCount}
                               one="пользователь" few="пользователя" other="пользователей" />
            </td>
          </tr>
          </tbody>
        </table>
      </div>
      <UserList users={lastUsers} title="Недавно зарегистрировавшиеся" />
    </div>
  </div>;

HomePage.propTypes = {
  lastUsers: React.PropTypes.array,
  usersCount: React.PropTypes.number,
};

export default HomePage;
