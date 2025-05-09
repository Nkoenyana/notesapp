import { defineAuth, secret } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      google: {
        clientId: secret('679239044988-4i0htcjm6baa6kicpj6iqgn1jvlsr9m1.apps.googleusercontent.com'),
        clientSecret: secret('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'),
                
        attributeMapping: {
          email: 'email'
        }
      },
      callbackUrls: [
        'http://localhost:3000/profile',
        'https://mywebsite.com/profile'
      ],
      logoutUrls: ['http://localhost:3000/', 'https://mywebsite.com'],
    }
  }
});