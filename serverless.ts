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

  plugins: [
    'serverless-esbuild',
    'serverless-prune-plugin',
    'serverless-offline'
  ],

  custom: {
    esbuild: {
      // do not minify, because it will break the swagger,
      packager: 'pnpm',
      external: ["@nestjs/swagger"],
      exclude: [
        "class-transformer/storage",
        "cache-manager",
        "@nestjs/websockets/socket-module",
        "@nestjs/microservices/microservices-module",
        "@nestjs/microservices"
      ]
    },
    prune: { // https://github.com/claygregory/serverless-prune-plugin
      automatic: true,
      includeLayers: true,
      number: 5,
    },
  },
};

module.exports = serverlessConfiguration;
