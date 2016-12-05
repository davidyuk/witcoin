import React from 'react';
import { Link } from 'react-router';
import Helmet from 'react-helmet';
import { Meteor } from 'meteor/meteor';

import EmailSettings from '../components/EmailSettings';
import ServiceSettings from '../components/ServiceSettings';
import { injectUser } from '../hocs';

const SettingsPage = ({ user }) => {
  if (!user) return <span>Загрузка</span>;

  const updatePersonalData = event => {
    event.preventDefault();
    Meteor.users.update(Meteor.userId(), {$set: {
      'profile.firstName': event.target.firstName.value,
      'profile.lastName': event.target.lastName.value,
      'profile.gender': event.target.gender.value,
    }});
  };

  const textField = (placeholder, fieldName) =>
    <div className="form-group">
      <label className="col-sm-3 control-label" htmlFor={fieldName}>{placeholder}</label>
      <div className="col-sm-9">
        <input className="form-control" id={fieldName} name={fieldName} placeholder={placeholder} required="required"
               defaultValue={user.profile[fieldName]} />
      </div>
    </div>;

  const radioButton = (placeholder, name, value) => {
    const checked = user.profile[name] == value;
    return (
      <label className={'btn btn-default' + (checked ? ' active' : '')}>
        <input type="radio" name={name} id={name + '-' + value} value={value} defaultChecked={checked}/>{placeholder}
      </label>
    );
  };

  const updateReportsSettings = event => {
    event.preventDefault();
    Meteor.users.update(Meteor.userId(), {$set: {
      'profile.reports.send.news': event.target.news.checked,
      'profile.reports.send.notifications': event.target.notifications.checked,
      'profile.reports.send.chats': event.target.chats.checked,
      'profile.reports.interval': event.target.interval.value,
      'profile.reports.newsDate': new Date((new Date).getTime() + event.target.interval.value * 1000),
    }});
  };

  const checkboxField = (placeholder, name, value) => {
    return (
      <div className="checkbox">
        <label><input type="checkbox" name={name} defaultChecked={value} /> {placeholder}</label>
      </div>
    );
  };

  return <div>
    <Helmet title="Настройки" />
    <h2>Личные данные</h2>
    <form className="form-horizontal" onSubmit={updatePersonalData}>
      {textField('Имя', 'firstName')}
      {textField('Фамилия', 'lastName')}
      <div className="form-group">
        <label className="col-sm-3 control-label" htmlFor={'gender-' + Meteor.users.genderTypes.MALE}>Ваш пол</label>
        <div className="col-sm-9">
          <div className="btn-group" data-toggle="buttons">
            {radioButton('мужской', 'gender', Meteor.users.genderTypes.MALE)}
            {radioButton('женский', 'gender', Meteor.users.genderTypes.FEMALE)}
          </div>
        </div>
      </div>
      <div className="form-group">
        <div className="col-sm-offset-3 col-sm-9">
          <button className="btn btn-default" type="submit">Сохранить</button>
        </div>
      </div>
    </form>
    <EmailSettings user={user} />
    <h2>Уведомления</h2>
    Все уведомления приходят в одном письме на основной адрес электронной почты.
    <form className="form-horizontal" onSubmit={updateReportsSettings}>
      <div className="form-group">
        <label className="col-sm-3 control-label">Уведомлять о</label>
        <div className="col-sm-9">
          {checkboxField('действиях тех, на кого я подписан', 'news', user.profile.reports.send.news)}
          {checkboxField('ответах на мои действия', 'notifications', user.profile.reports.send.notifications)}
          {checkboxField('непрочитанных мною сообщениях', 'chats', user.profile.reports.send.chats)}
        </div>
      </div>
      <div className="form-group">
        <label className="col-sm-3 control-label">Отправлять письмо</label>
        <div className="col-sm-9">
          <select defaultValue={user.profile.reports.interval} className="form-control" name="interval">
            <option value={0}>как можно чаще</option>
            <option value={60 * 20}>один раз в 20 минут</option>
            <option value={60 * 60}>один раз в час</option>
            <option value={60 * 60 * 24}>один раз в день</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <div className="col-sm-offset-3 col-sm-9">
          <button className="btn btn-default" type="submit">Сохранить</button>
        </div>
      </div>
    </form>
    <ServiceSettings user={user} />
    <h2>Пароль</h2>
    <Link to="/change-password">Сменить пароль</Link>
  </div>;
};

SettingsPage.propTypes = {
  user: React.PropTypes.object,
};

export default injectUser(SettingsPage);
