import { Migrations } from 'meteor/percolate:migrations';

import { Actions } from '../../api/actions';

Migrations.config({logIfLatest: false});

Migrations.add({
  version: 1,
  name: 'Add rates.total to Actions',
  up() {
    Actions.find().map(a => a.rates && Actions.update(a._id, {$set: {'rates.total': a.rates.up - a.rates.down}}));
  },
  down() {
    Actions.update({}, {$unset: {'rates.total': ''}});
  }
});
