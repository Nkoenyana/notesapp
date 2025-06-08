import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

export const schema = a.schema({
  Note: a
    .model({
      id: a.id().required(),
      name:a.string(),
      description: a.string(),
      image: a.string(),
      tag: a.string().array(),
      categories: a.string().array(),
      createdAt: a.timestamp(),
      updatedAt: a.timestamp(),
      deletedAt: a.timestamp(),
      categoryId: a.id(),
      category: a.belongsTo('Category', 'categoryId'),
      completed: a.boolean(),
      media: a.json(),
    })
    .authorization((allow) => [allow.owner()]),
    Tag: a.model({
      name: a.string(),
      description: a.string(),
      color: a.string(),
      author: a.string(),
      createdAt: a.timestamp(),
      updatedAt: a.timestamp(),
    }).authorization((allow) => [allow.owner()]),
    Category: a.model({
      id: a.id().required(),
      name: a.string(),
      description: a.string(),
      color: a.string(),
      notes: a.hasMany('Note', 'categoryId'),
    })
    .authorization((allow) => [allow.guest(), allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
