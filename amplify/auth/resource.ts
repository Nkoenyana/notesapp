import { defineAuth, secret } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      google: {
        clientId: secret('gg_id'),
        clientSecret: secret('gg_client'),
<<<<<<< HEAD
        attributeMapping: {
          email: 'email'
        },
        scopes: ['email']
=======
                
       
>>>>>>> parent of 4c10359 (up UI_2)
      },
      callbackUrls: [
        'http://localhost:5173',
        'https://main.d10ods65dn82zv.amplifyapp.com'
      ],
      logoutUrls: ['http://localhost:5173/', 'https://main.d10ods65dn82zv.amplifyapp.com/'],
    }
  }
});