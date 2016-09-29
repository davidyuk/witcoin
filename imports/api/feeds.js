import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

const feedItemSchema = {
  _id: { type: String, regEx: SimpleSchema.RegEx.Id, denyUpdate: true },
  userId: { type: String, regEx: SimpleSchema.RegEx.Id, denyUpdate: true },
  actionId: { type: String, regEx: SimpleSchema.RegEx.Id, denyUpdate: true },
  createdAt: { type: Date, denyUpdate: true },
};

export const NewsItems = new Mongo.Collection('news');

NewsItems.schema = new SimpleSchema({
  ...feedItemSchema,
  authorId: { type: String, regEx: SimpleSchema.RegEx.Id, denyUpdate: true },
});

NewsItems.attachSchema(NewsItems.schema);

export const NotifyItems = new Mongo.Collection('notices');

NotifyItems.schema = new SimpleSchema({
  ...feedItemSchema,
  isRead: { type: Boolean, defaultValue: false },
});

NotifyItems.attachSchema(NotifyItems.schema);
