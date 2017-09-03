import React from 'react';
import Helmet from 'react-helmet';
import { FormattedPlural } from 'react-intl';
import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import ProgressBar from '../../../ui/components/ProgressBar';

import { Printers } from '../index';
import PrinterState from './PrinterState';
import DocumentList from './DocumentList';

const PrinterPage = ({ printers }) => {
  if (printers.length != 1) return <span>Принтер настроен неправильно</span>;
  const printer = printers[0];

  return <div className="row">
    <Helmet title="Принтер" />
    <div className="col-sm-5">
      Фотография принтера
      <table className="table table-noTopBorder">
        <tbody>
        <tr><td>Состояние</td><td><PrinterState printer={printer} /></td></tr>
        <tr><td>Местоположение</td><td>{printer.location}</td></tr>
        <tr><td>Модель</td><td>{printer.model}</td></tr>
        </tbody>
      </table>
      <ProgressBar value={printer.paper.current / printer.paper.max}
                   contextCallback={value =>
                     value >= 0.5
                       ? ProgressBar.contexts.SUCCESS
                       : value >= 0.25 ? ProgressBar.contexts.WARNING : ProgressBar.contexts.DANGER}>
        <FormattedPlural value={printer.paper.current}
                         one={`Остался ${printer.paper.current} лист`}
                         few={`Осталось ${printer.paper.current} листа`}
                         other={`Осталось ${printer.paper.current} листов`} />
      </ProgressBar>
      <DocumentList />
    </div>
    <div className="col-sm-7">
      <h4>Очередь печати</h4>
      <table className="table">
        <thead>
        <tr>
          <td/>
          <td>Количество страниц</td>
          <td>Статус</td>
        </tr>
        </thead>
        <tbody>
        <tr>
          <td>Имя Фамилия</td>
          <td>Количество страниц</td>
          <td>Статус</td>
        </tr>
        <tr>
          <td>Имя Фамилия</td>
          <td>Количество страниц</td>
          <td>Статус</td>
        </tr>
        <tr>
          <td>Имя Фамилия</td>
          <td>Количество страниц</td>
          <td>Статус</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
};

export default createContainer(() => {
  Meteor.subscribe('printers');

  return {
    printers: Printers.find().fetch(),
  };
}, PrinterPage);
