import React from 'react';
import { Meteor } from 'meteor/meteor';

import { injectUser } from '../hocs';

const EmailReportSettings = ({ user }) => {
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
  </div>;
};

EmailReportSettings.propTypes = {
  user: React.PropTypes.object.isRequired,
};

export default injectUser(EmailReportSettings);
