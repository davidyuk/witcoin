import React from 'react';

const FefuAuthAction = ({ action, user }) => <span>
  подтвердил{user.isMale() ? '' : 'а'}, что является студентом ДВФУ<br/>
  Имя пользователя в домене ДВФУ: <i>{action.extra.fefuUserName}</i>
</span>;

FefuAuthAction.propTypes = {
  action: React.PropTypes.object.isRequired,
  user: React.PropTypes.object.isRequired,
};

export default FefuAuthAction;
