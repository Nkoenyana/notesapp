import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "note-storage",
  access: (allow) => ({
    'protected/{user_identity_id}/*': [
      allow.authenticated.to(['read', 'write', 'delete']),
    ],
    'protected/*': [
      allow.guest.to(['read'])
    ]
  })
});
