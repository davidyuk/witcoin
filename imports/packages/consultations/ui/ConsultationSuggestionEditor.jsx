import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import { Actions } from '../../../api/actions';

import CoinsAmount from '../../transactions/ui/CoinsAmount';
import FormattedPluralCoins from '../../transactions/ui/FormattedPluralCoins';
import { PRECISION_FACTOR } from '../../transactions/constants';

import { createSuggestion } from '../api';
import FormattedPluralMinutes from './FormattedPluralMinutes';
import InstanceEditor from './InstanceEditor';
import FormHelpText from './FormHelpText';
import FormCheckbox from './FormCheckbox';

class ConsultationSuggestionEditor extends InstanceEditor {
  getDefaultFields(instance) {
    const {canParticipateForFree, fixedCoinsPerHour} = this.props.consultation.extra;
    return {
      coinsPerHour: !canParticipateForFree && fixedCoinsPerHour || null,
    };
  }

  getFieldsByInstance(instance) {
    const {canParticipateWithPaid, canParticipateForFree, fixedCoinsPerHour} = this.props.consultation.extra;
    const coinsPerHour = !canParticipateForFree && fixedCoinsPerHour ||
        canParticipateWithPaid && instance.extra.coinsPerHour || null;
    return {
      coinsPerHour,
      minutes: instance.extra.minutes,
      description: instance.description,
    };
  }

  submitFields(fields) {
    createSuggestion.call({
      description: fields.description,
      coinsPerHour: fields.coinsPerHour,
      minutes: fields.minutes,
      actionId: this.props.consultation._id,
    });
  }

  renderFields() {
    const {
      user,
      consultation: {extra: {
        canParticipateWithPaid, canParticipateForFree, fixedCoinsPerHour, minCoinsPerHour,
      }}
    } = this.props;
    const style = {margin: '5px 0'};
    const {coinsPerHour, minutes, description} = this.state.fields;
    const balance = user ? user.balance : 0;
    const cost = Math.round(coinsPerHour * minutes / 60);

    return <div>
      {canParticipateWithPaid ? <div>
        {fixedCoinsPerHour ? (
          <FormCheckbox onChange={() => this.setFieldValue('coinsPerHour', coinsPerHour ? null : fixedCoinsPerHour)}
                        checked={!!coinsPerHour} disabled={!canParticipateForFree}>
            участовать по цене <CoinsAmount value={fixedCoinsPerHour} /> в час
          </FormCheckbox>
        ) : <div>
          <div className="input-group input-group-sm" style={style}>
            <input type="number" className="form-control" step="0.1"
                   required={!canParticipateForFree}
                   min={minCoinsPerHour / PRECISION_FACTOR || '0'}
                   onChange={event => this.setFieldValue('coinsPerHour', event.target.value * PRECISION_FACTOR || null)}
                   value={coinsPerHour / PRECISION_FACTOR || ''} />
            <span className="input-group-addon">
              <FormattedPluralCoins value={coinsPerHour / PRECISION_FACTOR || 0} /> в час
            </span>
          </div>
          {minCoinsPerHour ? <FormHelpText>
            Минимальная цена: <CoinsAmount value={minCoinsPerHour} /> в час.
          </FormHelpText> : null}
        </div>}
      </div> : null}

      <div className="input-group input-group-sm" style={style}>
        <span className="input-group-addon">Требуется</span>
        <input type="number" className="form-control" min="1" value={minutes || ''}
               onChange={event => this.setFieldValue('minutes', +event.target.value || null)} />
        <span className="input-group-addon">
          <FormattedPluralMinutes value={minutes || 0} />
        </span>
      </div>

      {canParticipateWithPaid ? <FormHelpText>
        Доступно: <CoinsAmount value={balance}/>
        {cost ? <span> (стоимость: <CoinsAmount value={cost}/>)</span> : null}
        .
      </FormHelpText> : null}

      <textarea className="form-control input-sm" style={{minHeight: 50 + 'px', margin: '5px 0'}}
                value={description || ''} onChange={event => this.setFieldValue('description', event.target.value)}
                placeholder="Комментарий. Например, уточнение темы." />
    </div>;
  }
}

ConsultationSuggestionEditor.propTypes = {
  user: React.PropTypes.object,
  consultation: React.PropTypes.object.isRequired,
  instance: React.PropTypes.object,
};

export default createContainer(({ consultation }) => {
  const selector = {
    objectId: consultation._id,
    type: Actions.types.CONSULTATION_SUGGESTION,
    userId: Meteor.userId(),
    'extra.actual': true,
  };
  Meteor.subscribe('actions', selector, {}, 1);

  return {
    user: Meteor.user(),
    instance: Actions.findOne(selector),
  }
}, ConsultationSuggestionEditor);
