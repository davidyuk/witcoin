import React from 'react';
import { FormattedPlural } from 'react-intl';
import ReactMixin from 'react-mixin';
import TimerMixin from 'react-timer-mixin';
import { ReactMeteorData } from 'meteor/react-meteor-data';

export default class ConnectionStatus extends React.Component {
  constructor() {
    super();
    this.state = {open: false};
  }

  getMeteorData() {
    return {status: Meteor.status()}
  }

  render() {
    const { status } = this.data;

    if (status.connected) return null;

    const reconnectHandler = event => {
      event.preventDefault();
      Meteor.reconnect();
    };

    const dropDownToggle = event => {
      event.preventDefault();
      this.setState({open: !this.state.open});
    };

    let notice;
    switch (status.status) {
      case 'connected': notice = 'Соединение с сервером установлено.'; break;
      case 'connecting': notice = 'Выполняется подключение к серверу.'; break;
      case 'waiting':
        const s = Math.floor((Meteor.status().retryTime - Date.now()) / 1000);
        notice = <span>
          Не удалось подключиться к серверу.
          Повторное подключение произойдёт через {s}&nbsp;
          <FormattedPlural value={s} one="секунду" few="секунды" other="секунд" />.
          Всего{' '}
          <FormattedPlural value={status.retryCount}
                           one={`выполнена ${status.retryCount} попытка`}
                           few={`выполнено ${status.retryCount} попытки`}
                           other={`выполнено ${status.retryCount} попыток`} />
          {' '}подключения.
        </span>;
        break;
      case 'failed': notice = `Ошибка соединения с сервером (${status.reason}).`; break;
      case 'offline': notice = 'Соединение с сервером отключено.'; break;
    }

    const reconnectTitle = {
      connected: false,
      connecting: false,
      waiting: 'Переподключиться сейчас',
      failed: 'Повторное подключение',
      offline: 'Подключиться к серверу',
    }[status.status];

    const context = {
      connected: 'success',
      connecting: 'warning',
      waiting: 'danger',
      failed: 'danger',
      offline: 'danger',
    }[status.status];

    if (status.status == 'waiting')
      this.setTimeout(() => this.forceUpdate(), 1000);

    return (
      <ul className="nav navbar-nav navbar-right">
        <li className={`alert-${context} ${this.state.open ? 'open' : ''}`}>
          <a href="#" className="dropdown-toggle" style={{color: 'inherit'}} onClick={dropDownToggle}>
            <span className="glyphicon glyphicon-signal" />
          </a>
          <ul className="dropdown-menu" style={{minWidth: 0}}>
            <li className="dropdown-header" style={{whiteSpace: 'normal'}}>{notice}</li>
            {reconnectTitle ? <li>
              <a href="#" onClick={reconnectHandler}>
                {reconnectTitle}
              </a>
            </li> : null}
          </ul>
        </li>
      </ul>
    );
  }
}

ReactMixin(ConnectionStatus.prototype, ReactMeteorData);
ReactMixin(ConnectionStatus.prototype, TimerMixin);
