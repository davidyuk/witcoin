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

    const title = {
      connected: 'Соединение с сервером установлено.',
      connecting: 'Выполняется подключение к серверу.',
      waiting: 'Не удалось подключиться к серверу.',
      failed: 'Ошибка соединения с сервером.',
      offline: 'Соединение с сервером отключено.',
    }[status.status];

    let description = '';
    switch (status.status) {
      case 'waiting':
        const s = Math.floor((Meteor.status().retryTime - Date.now()) / 1000);
        description = <span>
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
      case 'failed': description = `(${status.reason})`; break;
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
        <li className={`connection-status ${this.state.open ? 'open' : ''}`}>
          <a href="#" className={context + ' dropdown-toggle'} onClick={dropDownToggle}>
            <span className="glyphicon glyphicon-signal" />
            <span className="visible-xs-inline"> {title}</span>
          </a>
          <ul className="dropdown-menu">
            <li className="dropdown-header" style={{whiteSpace: 'normal'}}>
              <span className="hidden-xs">{title} </span>{description}
            </li>
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
