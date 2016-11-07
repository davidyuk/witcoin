import React from 'react';
import { Link } from 'react-router';
import { FormattedPlural } from 'react-intl';

import LinkToUser from './LinkToUser';
import ActionList from './ActionList';
import Message from './Message';

const MailReport = ({ user, newsItems, notificationItems, messages }) =>
  <div>
    {newsItems && newsItems.length ? <div>
      <h3>Новые записи в ленте новостей</h3>
      <ActionList actions={newsItems} isNewsItem={true} isMail={true} />
    </div> : null}

    {notificationItems && notificationItems.length ? <div>
      <h3>
        {notificationItems.length}&nbsp;
        <FormattedPlural value={notificationItems.length}
                         one="новое уведомление"
                         few="новых уведомления"
                         other="новых уведомлений" />
      </h3>
      <ActionList actions={notificationItems} isNotification={true} isMail={true} />
    </div> : null}

    {messages && messages.length ? <div>
      <h3>
        {messages.length}&nbsp;
        <FormattedPlural value={messages.length}
                         one="непрочитанное сообщение"
                         few="непрочитанных сообщения"
                         other="непрочитанных сообщений" />
      </h3>
      {messages.map((message, i) => <div key={message._id}>
        {i ? <hr style={{margin: '10px 0'}} /> : null}
        <Message message={message} isMail={true} />
      </div>)}
    </div> : null}
    <hr />
    <LinkToUser user={user} />, вы можете ограничить или отменить уведомления на email
    в <Link to="/settings">настройках</Link>.
  </div>;

MailReport.propTypes = {
  user: React.PropTypes.object,
  newsItems: React.PropTypes.arrayOf(React.PropTypes.object),
  notificationItems: React.PropTypes.arrayOf(React.PropTypes.object),
  messages: React.PropTypes.arrayOf(React.PropTypes.object),
};

export default MailReport;
