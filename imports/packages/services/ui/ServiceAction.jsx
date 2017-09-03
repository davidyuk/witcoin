import React from 'react';

import { Actions } from '../../../api/actions';

const ServiceAction = ({ baseType, user }) =>
  Actions.types.SERVICE != baseType ? <span>опубликовал{user.isMale() ? '' : 'а'} услугу</span> : null
;

ServiceAction.propTypes = {
  user: React.PropTypes.object.isRequired,
  baseType: React.PropTypes.string,
};

export default ServiceAction;
