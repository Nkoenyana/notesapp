import { defineAuth, secret } from '@aws-amplify/backend';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
    // externalProviders: {
    //   google: {
    //     clientId: secret('gg_id'),
    //     clientSecret: secret('gg_client'),
                
    //     attributeMapping: {
    //       email: 'email'
    //     },
    //     scopes: ['email']
    //   },
    //   callbackUrls: [
    //     'http://localhost:5173/',
    //     'https://main.d10ods65dn82zv.amplifyapp.com/'
    //   ],
    //   logoutUrls: ['http://localhost:5173/', 'https://main.d10ods65dn82zv.amplifyapp.com/'],
    // }
  }
});
