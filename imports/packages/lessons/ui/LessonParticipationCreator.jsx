import React from 'react';

import { injectUser } from '../../../ui/hocs';

import CoinsAmount from '../../transactions/ui/CoinsAmount';
import { PRECISION_FACTOR } from '../../transactions/constants';

import { createParticipation } from '../api';

const LessonParticipationCreator = ({user, lesson}) => {
  const onSubmit = event => {
    event.preventDefault();
    Meteor.call('consultation.participation',
      event.target.user.value,
      event.target.amount.value * PRECISION_FACTOR,
      event.target.description.value,
    );
    event.target.amount.value = '';
    event.target.description.value = '';
  };

  const style = {margin: '5px 0'};
  const balance = user ? user.balance : 0;

  return (
    <div className="panel panel-default panel-body">
      <form onSubmit={onSubmit}>
        {lesson.extra.canParticipateWithPaid ? <div>
          <strong>Участвовать в мастер-классе</strong>
          {lesson.extra.fixedCoinsPerHour ? <div>
            <div className="checkbox" style={style}>
              <label>
                <input type="checkbox" defaultChecked={!lesson.extra.canParticipateForFree}
                       disabled={!lesson.extra.canParticipateForFree} />
                перевести <CoinsAmount value={lesson.extra.paid} isAccusative={true} />
                {' '}(доступно: <CoinsAmount value={balance} />)
              </label>
            </div>
          </div> : <div>
            <div className="input-group input-group-sm" style={style}>
              <span className="input-group-addon">Перевести</span>
              <input type="number" name="amount" className="form-control"
                     required={!lesson.extra.canParticipateForFree} max={balance / PRECISION_FACTOR} step="0.1"
                     defaultValue={!lesson.extra.canParticipateForFree && lesson.extra.paid / PRECISION_FACTOR || ''}
                     min={lesson.extra.paid / PRECISION_FACTOR || '0'} />
              <span className="input-group-addon">кленинок</span>
            </div>
            <span className="text-muted" style={{fontSize: '12px', display: 'block', paddingBottom: '4px'}}>Доступно: <CoinsAmount value={balance} /></span>
          </div>}
        </div> : null}

        <button className="btn btn-primary btn-sm">
          Участвовать
        </button>
      </form>
    </div>
  );
};

LessonParticipationCreator.propTypes = {
  user: React.PropTypes.object,
  lesson: React.PropTypes.object,
};

export default injectUser(LessonParticipationCreator);
