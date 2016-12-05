import React from 'react';
import { Meteor } from 'meteor/meteor';

import { injectUser } from '../hocs';

const EmailReportSettings = ({ user }) => {
  const checkboxField = (placeholder, name, value) => {
    return (
      <div className="checkbox">
        <label>
          <input type="checkbox" checked={value} onChange={event =>
            Meteor.users.update(user._id, {$set: {[name]: event.target.checked}})
          } />
          {placeholder}
        </label>
      </div>
    );
  };

  const send = user.profile.reports.send;
  const enabled = Object.values(send).find(a => a);

  return <div>
    <h2>Уведомления</h2>
    Все уведомления приходят в одном письме на основной адрес электронной почты.
    <div className="form-horizontal">
      <div className="form-group">
        <label className="col-sm-3 control-label">Уведомлять о</label>
        <div className="col-sm-9">
          {checkboxField('действиях тех, на кого я подписан', 'profile.reports.send.news', send.news)}
          {checkboxField('ответах на мои действия', 'profile.reports.send.notifications', send.notifications)}
          {checkboxField('непрочитанных мною сообщениях', 'profile.reports.send.chats', send.chats)}
        </div>
      </div>
      <div className="form-group">
        <label className="col-sm-3 control-label">Отправлять письмо</label>
        <div className="col-sm-9">
          <select className="form-control" disabled={!enabled} value={user.profile.reports.interval}
                  onChange={event =>
                    Meteor.users.update(Meteor.userId(), {$set: {
                      'profile.reports.interval': event.target.value,
                      'profile.reports.newsDate': new Date(Date.now() + event.target.value * 1000),
                    }})
                  }>
            <option value={0}>как можно чаще</option>
            <option value={60 * 20}>один раз в 20 минут</option>
            <option value={60 * 60}>один раз в час</option>
            <option value={60 * 60 * 24}>один раз в день</option>
          </select>
        </div>
      </div>
    </div>
  </div>;
};

EmailReportSettings.propTypes = {
  user: React.PropTypes.object.isRequired,
};

export default injectUser(EmailReportSettings);
