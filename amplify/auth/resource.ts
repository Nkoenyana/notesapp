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
      signInWithApple: {
        clientId: secret('SIWA_CLIENT_ID'),
        keyId: secret('SIWA_KEY_ID'),
        privateKey: secret('SIWA_PRIVATE_KEY'),
        teamId: secret('SIWA_TEAM_ID')
      },
      loginWithAmazon: {
        clientId: secret('LOGINWITHAMAZON_CLIENT_ID'),
        clientSecret: secret('LOGINWITHAMAZON_CLIENT_SECRET')
      },
      facebook: {
        clientId: secret('FACEBOOK_CLIENT_ID'),
        clientSecret: secret('FACEBOOK_CLIENT_SECRET')
      },
      callbackUrls: [
        'http://localhost:3000/profile',
        'https://mywebsite.com/profile'
      ],
      logoutUrls: ['http://localhost:3000/', 'https://mywebsite.com'],
    }
  }
});