import React from 'react';

import { PRECISION_FACTOR } from '../../transactions/constants';

import { createConsultation } from '../api';
import InstanceEditor from './InstanceEditor';
import FormCheckbox from './FormCheckbox';

export default class ConsultationEditor extends InstanceEditor {
  getDefaultFields() {
    return {
      canParticipateForFree: false,
      canParticipateWithPaid: true,
    };
  }

  getFieldsByInstance(instance) {
    return {
      canParticipateForFree: instance.extra.canParticipateForFree,
      canParticipateWithPaid: instance.extra.canParticipateWithPaid,
      fixedPaid: !!instance.extra.fixedCoinsPerHour,
      coinsPerHour: instance.extra.fixedCoinsPerHour || instance.extra.minCoinsPerHour,
      description: instance.description,
    };
  }

  submitFields(fields) {
    const params = {
      description: fields.description,
      canParticipateForFree: fields.canParticipateForFree,
      canParticipateWithPaid: fields.canParticipateWithPaid,
    };
    if (this.props.instance) params.actionId = this.props.instance._id;
    if (fields.canParticipateWithPaid && fields.coinsPerHour)
      params[`${fields.fixedPaid ? 'fixed' : 'min'}CoinsPerHour`] = fields.coinsPerHour;
    createConsultation.call(params);
  }

  isDisabled() {
    const {canParticipateForFree, canParticipateWithPaid} = this.state.fields;
    return !canParticipateForFree && !canParticipateWithPaid;
  }

  renderFields() {
    const {canParticipateForFree, canParticipateWithPaid, fixedPaid, coinsPerHour, description} = this.state.fields;
    const style = {margin: '5px 0'};

    return <div>
      <div style={{paddingTop: '5px'}}>Разрешено участвовать:</div>
      <FormCheckbox onChange={() => this.setFieldValue('canParticipateForFree', !canParticipateForFree)}
                    checked={canParticipateForFree}>
        бесплатно
      </FormCheckbox>
      <FormCheckbox onChange={() => this.setFieldValue('canParticipateWithPaid', !canParticipateWithPaid)}
                    checked={canParticipateWithPaid}>
        за кленинки
      </FormCheckbox>
      <fieldset disabled={this.isDisabled()}>
        <fieldset disabled={!canParticipateWithPaid}>
          <FormCheckbox checked={fixedPaid} onChange={() => this.setFieldValue('fixedPaid', !fixedPaid)}>
            плата за участие фиксирована
          </FormCheckbox>
          <input type="number" style={style} min="0.1" step="0.1" className="form-control input-sm"
                 placeholder={fixedPaid ? 'Плата за участие' : 'Минимальная плата за участие'}
                 onChange={event => this.setFieldValue('coinsPerHour', event.target.value * PRECISION_FACTOR)}
                 value={coinsPerHour / PRECISION_FACTOR || ''} />
        </fieldset>

        <textarea className="form-control input-sm" style={{minHeight: 75 + 'px', margin: '5px 0'}} required
                  value={description || ''} onChange={event => this.setFieldValue('description', event.target.value)}
                  placeholder="Укажите тему консультации, средство связи (личные сообщения на сайте, Skype, встреча
                  в вузе и т.д.)" />
      </fieldset>
    </div>;
  }
};
