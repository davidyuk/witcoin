import 'bootstrap-sass';
import moment from 'moment';
import 'moment/locale/ru';
import 'eonasdan-bootstrap-datetimepicker';

import '../imports/startup/accounts-config';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import { renderRoutes } from '../imports/startup/client/routes.jsx';

moment.locale('ru');

Meteor.startup(() => {
  render(renderRoutes(), document.getElementById('app'));
});
