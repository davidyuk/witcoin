import React from 'react';

import { Printers } from '../index';

const PrinterState = ({ printer }) => {
  const {title, className} = {
    [Printers.states.OK]: {title: 'Всё в порядке', className: 'glyphicon glyphicon-ok text-success'},
    [Printers.states.NO_PAPER]: {title: 'Закончилась бумага', className: 'glyphicon glyphicon-file text-danger'},
    [Printers.states.NO_TONER]: {title: 'Закончился тоннер', className: 'glyphicon glyphicon-wrench text-danger'},
    [Printers.states.UNKNOWN]: {title: 'Неизвестная ошибка', className: 'glyphicon glyphicon-wrench text-danger'},
    [Printers.states.OFFLINE]: {title: 'Принтер отключен', className: 'glyphicon glyphicon-remove text-danger'},
  }[printer.state];
  return <span>
    <span title={title} className={className}
          style={{verticalAlign: 'middle', fontSize: '18px'}} />
    &nbsp;{title}
  </span>
};

PrinterState.propTypes = {
  printer: React.PropTypes.object.isRequired,
};

export default PrinterState;
