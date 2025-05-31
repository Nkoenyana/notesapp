import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Note: a
    .model({
      name:a.string(),
      description: a.string(),
      image: a.string(),
      createdAt: a.timestamp(),
      updatedAt: a.timestamp(),
      deletedAt: a.timestamp(),
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
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
