import React from 'react';
import { Link } from 'react-router';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import Date from '../../../ui/components/Date';
import LinkToUser from '../../../ui/components/LinkToUser';

import { ConsultationParticipationStates } from '../action-types';
import Duration from './Duration';

const ConsultationParticipationAction = ({action, user, isNotification, userTo}) => {
  if (!userTo) return null;
  const {extra: {startAt, endAt, state, consultationId}} = action;

  switch (state) {
    case ConsultationParticipationStates.WAITING:
      return <span>
        предложил{user.isMale() ? '' : 'а'}
        {' '}{isNotification ? 'Вам' : <LinkToUser user={userTo} inflection={Meteor.users.inflectionTypes.DATIVE}/>}
        {' '}начать <Link to={'/consultations/' + consultationId}>консультацию</Link>
      </span>;
    case ConsultationParticipationStates.ACTIVE:
      return <span>
        начал{user.isMale() ? '' : 'а'} консультировать
        {' '}{isNotification ? 'Вас' : <LinkToUser user={userTo} inflection={Meteor.users.inflectionTypes.ACCUSATIVE}/>}
        {' '}<Date value={startAt} isRelative={true} />
      </span>;
    case ConsultationParticipationStates.COMPLETED:
      return <span>
        проконсультировал{user.isMale() ? '' : 'а'}
        {' '}{isNotification ? 'Вас' : <LinkToUser user={userTo} inflection={Meteor.users.inflectionTypes.ACCUSATIVE}/>}
        {' '}(<Duration beginAt={startAt} endAt={endAt} />)
      </span>;
  }
};

ConsultationParticipationAction.propTypes = {
  action: React.PropTypes.object.isRequired,
  user: React.PropTypes.object.isRequired,
  userTo: React.PropTypes.object,
  isNotification: React.PropTypes.bool,
};

export default createContainer(
  ({ action }) => ({userTo: Meteor.users.findOne(action.extra.userId)}),
  ConsultationParticipationAction
);
