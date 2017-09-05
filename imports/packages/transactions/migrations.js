import { Migrations } from 'meteor/percolate:migrations';

import { Actions } from '../../api/actions';

Migrations.add({
  version: 3,
  name: 'Rename objectId to extra.userId of Transaction',
  up() {
    Actions.update(
      {type: Actions.types.TRANSACTION}, {
        $rename: {objectId: 'extra.userId'},
      }, {multi: true, validate: false},
    );
  },
  down() {
    Actions.update(
      {type: Actions.types.TRANSACTION}, {
        $rename: {'extra.userId': 'objectId'},
      }, {multi: true, validate: false},
    );
  }
});

Migrations.add({
  version: 4,
  name: 'Set unDeletable flag to true for all transactions',
  up() {
    Actions.update({type: Actions.types.TRANSACTION}, {$set: {unDeletable: true}}, {multi: true});
  },
  down() {
    Actions.update({type: Actions.types.TRANSACTION}, {$unset: {unDeletable: null}}, {multi: true});
  }
});
