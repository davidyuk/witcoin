import { Printers, Documents } from './index';

Meteor.publish('printers', () => Printers.find({}));

Meteor.publish('printers.documents', function () {
  return Documents.find().cursor;
});
