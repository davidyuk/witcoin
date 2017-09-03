import React from 'react';
import $ from 'meteor/jquery';

import InstanceEditor from '../../consultations/ui/InstanceEditor';
import FormCheckbox from '../../consultations/ui/FormCheckbox';
import { PRECISION_FACTOR } from '../../transactions/constants';

import { createLesson } from '../api';
import Duration from './Duration';

export default class extends InstanceEditor {
  getDefaultFields() {
    return {
      canParticipateForFree: true,
      canParticipateWithPaid: true,
    };
  }

  getFieldsByInstance(instance) {
    return {
      canParticipateForFree: instance.extra.canParticipateForFree,
      canParticipateWithPaid: instance.extra.canParticipateWithPaid,
      requiredParticipants: instance.extra.requiredParticipants,
      requiredCoins: instance.extra.requiredCoins,
      fixedCoinsPerParticipant: !!instance.extra.fixedCoinsPerParticipant,
      coinsPerParticipant: instance.extra.fixedCoinsPerParticipant || instance.extra.minCoinsPerParticipant,
      beginAt: instance.extra.beginAt,
      endAt: instance.extra.endAt,
      location: instance.extra.location,
      description: instance.description,
    }
  }

  componentDidMount() {
    $(this.refs.beginAt)
      .datetimepicker()
      .on("dp.change", e => {
        $(this.refs.endAt).data("DateTimePicker").minDate(e.date);
        this.setFieldValue('beginAt', e.date.toDate());
      });
    $(this.refs.endAt)
      .datetimepicker({useCurrent: false})
      .on("dp.change", e => {
        $(this.refs.beginAt).data("DateTimePicker").maxDate(e.date);
        this.setFieldValue('endAt', e.date.toDate());
      });
  }

  submitFields(fields) {
    const params = {
      canParticipateForFree: fields.canParticipateForFree,
      canParticipateWithPaid: fields.canParticipateWithPaid,
      requiredParticipants: fields.requiredParticipants,
      requiredCoins: fields.requiredCoins,
      beginAt: fields.beginAt,
      endAt: fields.endAt,
      location: fields.location,
      description: fields.description,
    };
    if (this.props.instance) params.actionId = this.props.instance._id;
    if (fields.canParticipateWithPaid && fields.coinsPerHour)
      params[`${fields.fixedCoinsPerParticipant ? 'fixed' : 'min'}CoinsPerParticipant`] = fields.coinsPerHour;
    createLesson.call(params);
  }

  isDisabled() {
    const {canParticipateForFree, canParticipateWithPaid} = this.state.fields;
    return !canParticipateForFree && !canParticipateWithPaid;
  }

  renderFields() {
    const {
      canParticipateForFree, canParticipateWithPaid,
      requiredParticipants, requiredCoins,
      fixedCoinsPerParticipant, coinsPerParticipant,
      beginAt, endAt, location,
      description,
    } = this.state.fields;
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
        Для проведения мастер-класса:
        <input type="number" className="form-control input-sm" style={style} placeholder="Требуется участников"
               onChange={event => this.setFieldValue('requiredParticipants', +event.target.value || null)}
               value={requiredParticipants || ''} />
        <fieldset disabled={!canParticipateWithPaid}>
          <input type="number" style={style} min="0.1" step="0.1" className="form-control input-sm"
                 onChange={event => this.setFieldValue('requiredCoins', event.target.value * PRECISION_FACTOR || null)}
                 placeholder="Требуется собрать кленинок" value={requiredCoins / PRECISION_FACTOR} />
          <FormCheckbox onChange={() => this.setFieldValue('fixedCoinsPerParticipant', !fixedCoinsPerParticipant)}
                        checked={fixedCoinsPerParticipant}>
            плата за участие фиксирована
          </FormCheckbox>
          <input type="number" style={style} min="0.1" step="0.1" className="form-control input-sm"
                 placeholder={fixedCoinsPerParticipant ? 'Плата за участие' : 'Минимальная плата за участие'}
                 onChange={event => this.setFieldValue('coinsPerParticipant', event.target.value * PRECISION_FACTOR || null)}
                 value={coinsPerParticipant / PRECISION_FACTOR || ''} />
        </fieldset>

        Дата начала и окончания, место проведения:
        <input type="text" className="form-control input-sm" style={style}
               placeholder="Дата и время начала" ref="beginAt" />
        <input type="text" className="form-control input-sm" style={style}
               placeholder="Дата и время окончания" ref="endAt" />
        {beginAt && endAt ? (
          <span className="text-muted" style={{fontSize: '12px'}}>
            Длительность: <Duration {...{beginAt, endAt}} />
          </span>
        ) : null}
        <input type="text" className="form-control input-sm" style={style} placeholder="Место проведения"
               value={location} onChange={event => this.setFieldValue('location', event.target.value)} />

        <hr style={{margin: '10px 0'}} />
        <textarea name="description" className="form-control input-sm" placeholder="Описание мастер-класса"
                  style={{minHeight: 150 + 'px', margin: '5px 0'}} required
                  value={description} onChange={event => this.setFieldValue('description', event.target.value)} />
      </fieldset>
    </div>;
  }
};
