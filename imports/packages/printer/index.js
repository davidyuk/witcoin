import { Actions } from '../../api/actions';
import { SchemaHelpers } from '../../api/common';
import Action from '../../ui/components/Action';

/*import ServiceAction from './ui/DocumentPage';

Actions.types.SERVICE = 'service';
Actions.relevantTypes.push(Actions.types.SERVICE);
Actions.simpleTypes.push(Actions.types.SERVICE);
Actions.typesTree['Услуги'] = Actions.types.SERVICE;

Action.registerActionRender(Actions.types.SERVICE, ServiceAction);*/

export const Printers = new Mongo.Collection('printers');

Printers.states = {
  OK: 'ok',
  NO_PAPER: 'no_paper',
  NO_TONER: 'no_toner',
  UNKNOWN: 'unknown',
  OFFLINE: 'offline',
};

Printers.schema = new SimpleSchema({
  location: {type: String},
  model: {type: String},
  imageUrl: {type: String},
  state: {type: String, allowedValues: Object.values(Printers.states)},
  paper: {type: Object},
  'paper.current': {type: Number},
  'paper.max': {type: Number},
});

Printers.attachSchema(Printers.schema);

if (Meteor.isServer) {
  if (Printers.find({}).count() == 0) {
    Printers.insert({
      location: 'ДВФУ, переход рядом с D742',
      model: 'ECOSYS M2035dn',
      imageUrl: 'there!',
      state: Printers.states.OK,
      paper: {current: 42, max: 250},
    });
  }
}

export const Documents = new FilesCollection({
  collectionName: 'documents',
  allowClientCode: false, // Disallow remove files from Client
  onBeforeUpload: file => {
    if (!Documents.allowedExtensions.includes(file.extension))
      return `Файл неподдерживаемого типа. Поддерживаются файлы типов: ${Documents.allowedExtensions.join(', ')}.`;
    if (file.size > Documents.maxFileSize)
      return `Размер файла больше больше ${Documents.maxFileSize / (1024 * 1024)}MB.`;
    return true;
  },
});

Documents.maxFileSize = 128 * 1024 * 1024;
Documents.allowedExtensions = ['jpg', 'png', 'jpeg', 'html', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];

if (Meteor.isClient) require('./client');
if (Meteor.isServer) require('./server');
