import { Migrations } from 'meteor/percolate:migrations';

import { Actions } from '../../api/actions';

Migrations.add({
  version: 5,
  name: 'Set unDeletable flag to true for all fefu auth actions',
  up() {
    Actions.update({type: Actions.types.FEFU_AUTH}, {$set: {unDeletable: true}}, {multi: true});
  },
  down() {
    Actions.update({type: Actions.types.FEFU_AUTH}, {$unset: {unDeletable: null}}, {multi: true});
  }
});
