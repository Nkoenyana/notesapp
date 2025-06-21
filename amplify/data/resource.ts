import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { title } from 'process';

const schema = a.schema({
  Note: a
    .model({
      title:a.string(),
      content: a.string(),
      image: a.string(),
      attachments: a.json(),
      tags: a.string().array(),
      isPinned: a.boolean(),
      color: a.string(),
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
