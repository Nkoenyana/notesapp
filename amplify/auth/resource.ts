import { defineAuth, secret } from '@aws-amplify/backend';
// clientId and clientSecret are stored in .env file

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      google: {
        clientId: secret("gg_id"),
        clientSecret: secret("gg_client"),
                
        attributeMapping: {
          email: 'email'
        },
        scopes: ['email']
      },
      callbackUrls: [
        'http://localhost:9002/',
        'https://master.d1280v8obq6r42.amplifyapp.com/'
      ],
      logoutUrls: ['http://localhost:9002/', 'https://master.d1280v8obq6r42.amplifyapp.com/'],
    }
  }
});
