import React from 'react';
import { Link } from 'react-router';
import { FormattedPlural } from 'react-intl';
import Helmet from 'react-helmet';

import UserList from '../components/UserList';

const HomePage = ({counts, usersLast, usersOnline}) =>
  <div className="row">
    <Helmet title="Привет!" />
    <div className="col-sm-8">
      <h3>Добрый день!</h3>
      <p>
        Изначально этот сервис реализован для учёта взаимопомощи студентов.
      </p>
      <p>
        Зарегистрировавшись <Link to="/sign-up">здесь</Link>, вы сможете обмениваться кленинками (виртуальной
        валютой). На сайте может зарегистрироваться каждый, но получить 10 кленинок могут только студенты ДВФУ
        {' '}(<Link to="/settings">зарегистрировав адрес электронной почты из домена @students.dvfu.ru</Link>).
      </p>
      <p>
        В настоящий момент, по одному студенческому адресу электронной почты только один пользователь сайта может
        один раз получить 10 кленинок, при этом имя пользователя в домене ДВФУ будет опубликовано на странице
        пользователя. Новые кленинки производятся только таким образом.
        Все передачи кленинок отображаются в разделе <Link to="/transactions">Операции</Link>.
      </p>
      <p>
        Данный сайт одинаково доступен по адресам <a href="http://кленинка.рф/">кленинка.рф</a> и
        {' '}<a href="http://witcoin.ru/">witcoin.ru</a>. Электронная почта отправляется с адреса
        no-reply@witcoin.ru. Интерфейс адаптируется при работе с мобильного устройства.
        Исходный код проекта <a href="https://github.com/Davidyuk/witcoin">опубликован</a> под лицензией AGPLv3.
      </p>
      <hr />
      Реализованы разделы:
      <ul>
        <li><Link to="/tasks">Задания</Link> — запросы помощи и вопросы</li>
        <li><Link to="/services">Услуги</Link> — предложения произвольных услуг</li>
      </ul>
      Новые разделы:
      <ul>
        <li><Link to="/im">Сообщения</Link> — обмен личными сообщениями внутри сайта</li>
        <li><Link to="/notifications">Уведомления</Link> — лента из ответов на ваши действия</li>
      </ul>
      Планируется реализовать:
      <ul>
        <li>Мастер-классы — различные лекции и сбор кленинок для их проведения</li>
        <li>
          Принтер — возможность за кленинки отправить документ, который будет распечатан на принтере в корпусе D
        </li>
      </ul>
      Предложения реализации дополнительных разделов и улучшений существующих приветствуются!
      <hr />
      <p>
        <i>Обновление от 19 ноября 2016</i>
      </p>
      <p>
        До настоящего момента использовалась версия сайта, написанная на основе каркаса Django.
        Сейчас в основе используется JavaScript библиотека React, позволившая реализовать сервис в виде
        {' '}<i>одностраничного приложения</i> (пример: переход между разделами сайта не требует перезагрузки
        страницы).
        Кроме этого, каркас Meteor делает данный сервис <i>приложением реального времени</i>
        {' '}(пример: новые комментарии других пользователей появляются без обновления страницы).
        Существенная проблема данного перехода заключается в том, что Django и Meteor по-разному шифруют пароли
        пользователей для хранения в базе данных. Выбранный мною вариант решения этой проблемы: <i>попросить
        пользователей воспользоваться ссылкой <Link to="/forgot-password">сброс пароля</Link> в новой версии
        сайта</i>. <a href="http://stackoverflow.com/questions/22612091/meteor-about-password-encryption/22612538">
        Подробнее на Stack Overflow.
      </a>
      </p>
      <h4>Улучшения по сравнению с версией на основе Django</h4>
      <ul>
        <li>
          <i>Социальная авторизация</i>
          {' '}(сейчас работает только на <a href="http://witcoin.ru/">witcoin.ru</a>)
          <p>
            Теперь на сайт можно заходить с помощью аккаунта социальной сети (можно привязать несколько аккаунтов).
            Если вы уже зарегистрированы с помощью email, то всё равно можете добавить аккаунт социальной сети в
            {' '}<Link to="/settings">настройках</Link>.
          </p>
        </li>
        <li>
          <i>Уведомления о новых ответах и сообщениях на всех страницах сайта</i>
          <p>
            Количество таких ответов и сообщений отображается в меню пользователя (справа сверху).
          </p>
        </li>
        <li>
          <i>Email ДВФУ регистрируется так же, как и обычный email</i>
          <p>
            После регистрации, email ДВФУ можно использовать для получения уведомлений, входа на сайт и
            восстановления пароля.
          </p>
        </li>
        <li>
          <i>В одном письме может быть несколько событий</i>
          <p>
            В <Link to="/settings">настройках</Link> можно указать частоту отправки писем на ваш <i>основной</i>
            {' '}email адрес. События, которые произошли за это время будут отправлены в одном письме.
          </p>
        </li>
        <li>
          <i>Улучшены ленты новостей и уведомлений</i>
          <p>
            Бесконечная прокрутка, фильтры по типам действий, склонение имён пользователей и прочие улучшения.
          </p>
        </li>
      </ul>
      <p className="text-right">
        <Link to="/u/vRRrdmxvCzE5TtvFZ">Денис Давидюк</Link>
      </p>
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
