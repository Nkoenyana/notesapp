import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

export const schema = a.schema({
  Note: a
    .model({
      id: a.id().required(),
      name:a.string(),
      description: a.string(),
      image: a.string(),
      tag: a.string().array(),
      deleted: a.boolean(),
      categoryId: a.id(),
      category: a.belongsTo('Category', 'categoryId'),
      completed: a.boolean(),
      media: a.json(),
      subtask: a.json(),
      repeat: a.json(),
      reminder: a.json(),
      shared: a.hasMany('NoteShare', 'noteId'),
    })
    .authorization((allow) => [allow.owner(), allow.guest()]),
    Tag: a.model({
      name: a.string(),
      description: a.string(),
      color: a.string(),
      author: a.string(),
    }).authorization((allow) => [allow.owner()]),
    Category: a.model({
      id: a.id().required(),
      name: a.string(),
      description: a.string(),
      color: a.string(),
      notes: a.hasMany('Note', 'categoryId'),
    }).authorization((allow) => [allow.guest(), allow.owner()]),
    NoteShare: a.model({
      id: a.id(),
      noteId: a.id(),
      note: a.belongsTo('Note', 'noteId'),
      sharedWith: a.string().required(),
      sharedBy: a.string().required(),
    }).authorization((allow) => [allow.owner()]),
    User: a.model({
      id: a.id(),
      email: a.string(),
      avatar: a.string(),
      birthday: a.timestamp(),
      displayName: a.string()
    }).authorization((allow) =>  [allow.owner(), allow.guest()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
