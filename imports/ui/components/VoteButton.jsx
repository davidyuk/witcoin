import { Meteor } from 'meteor/meteor';
import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import { Actions } from '../../api/actions';

const VoteButton = ({ action, rate }) => {
  const getVoteHandler = rate => () => Meteor.call('action.rate', action._id, rate);

  return (
    <div className="btn-group btn-group-xs">
      {action.rates.up || action.rates.down ? (
        <button className="btn btn-default disabled"
                title={`Нравится: ${action.rates.up}, не нравится: ${action.rates.down}`}>
          {action.rates.total}
        </button>
      ) : null}
      <button onClick={getVoteHandler(rate == 1 ? 0 : 1)} title="Нравится"
              className={'btn btn-default' + (rate == 1 ? ' active' : '')}>
        <span className="glyphicon glyphicon-arrow-up" />
      </button>
      <button onClick={getVoteHandler(rate == -1 ? 0 : -1)} title="Не нравится"
              className={'btn btn-default' + (rate == -1 ? ' active' : '')}>
        <span className="glyphicon glyphicon-arrow-down" />
      </button>
    </div>
  );
};

VoteButton.propTypes = {
  action: React.PropTypes.object.isRequired,
  rate: React.PropTypes.number.isRequired,
};

export default createContainer(({ action }) => {
  const rateAction = Actions.findOne({
    type: Actions.types.RATE,
    objectId: action._id, userId: Meteor.userId(),
  });
  return {
    rate: rateAction ? rateAction.rate : 0,
  };
}, VoteButton);
