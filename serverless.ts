import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  app: 'app-name',
  service: 'lambda-name',

  frameworkVersion: '3',
  configValidationMode: 'error',

  provider: {
    name: 'aws',
    runtime: 'nodejs18.x',
    architecture: 'arm64',
    tags: {
      developer: 'devName',
      project: '${self:app}',
      service: '${self:service}',
    },
    logRetentionInDays: 60,
    // iamRoleStatements: [
    //   {
    //     Effect: 'Allow',
    //     Action: 's3:GetObject',
    //     Resource: bucketARN,
    //   },
    // ],
    environment: {
      STAGE: '${sls:stage}',
      NODE_OPTIONS: '--enable-source-maps',
    },
  },

  package: {
    individually: true,
  },

  functions: {
    api: {
      handler: 'dist/lambda.handler',
      events: [
        {
          http: {
            method: 'ANY',
            path: '{proxy+}',
          }
        },
      ]
    },
  },

  plugins: ['serverless-offline'],

  // custom: {
  //   prune: {
  //     automatic: true,
  //     includeLayers: true,
  //     number: 3,
  //   },
  // },
};

module.exports = serverlessConfiguration;
