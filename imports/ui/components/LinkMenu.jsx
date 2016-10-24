import React from 'react';
import { Link } from 'react-router';

const LinkMenu = (props, { router }) =>
  <li className={router.isActive(props.to) ? 'active' : ''}><Link {...props} /></li>;

LinkMenu.propTypes = {
  to: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.object]),
};

LinkMenu.contextTypes = {
  router: React.PropTypes.object.isRequired,
};

export default LinkMenu;
