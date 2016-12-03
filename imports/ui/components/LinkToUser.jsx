import React from 'react';
import { Link } from 'react-router';

const LinkToUser = ({user, inflection}) =>
  <Link to={"/u/" + user._id}>
    {user.getFullName(inflection)}
  </Link>;

LinkToUser.propTypes = {
  user: React.PropTypes.object.isRequired,
  inflection: React.PropTypes.string,
};

export default LinkToUser;
