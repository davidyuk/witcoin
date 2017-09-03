import React from 'react';

import { isFefuEmail } from '../utils';

const FefuAuthNotice = ({ user }) => {
  const emails = user.emails || [];
  const hasVerifiedFefuMail = emails.find(email => email.verified && isFefuEmail(email.address));
  const showLinkToFefuWebMail = emails.find(
    email => email.verifyEmailSend && !email.verified && isFefuEmail(email.address)
  );

  return <div>
    {showLinkToFefuWebMail ? (
      <div className="alert alert-info">
        Вы можете проверить электронную почту ДВФУ по адресу:
        {' '}<a className="alert-link" href="http://mail.dvfu.ru/" target="_blank">mail.dvfu.ru</a>.
      </div>
    ) : null}
    {hasVerifiedFefuMail ? null : (
      <div className="alert alert-info">
        Получите 10 кленинок, зарегистрировав почту с домена students.dvfu.ru.<br />
        <i>
          К учётной записи email студента ДВФУ можно подключить только один раз,
          после этого его нельзя будет отключить.
        </i>
      </div>
    )}
  </div>;
};

FefuAuthNotice.propTypes = {
  user: React.PropTypes.object.isRequired,
};

export default FefuAuthNotice;
