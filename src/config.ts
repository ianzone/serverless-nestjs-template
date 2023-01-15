import { APIGatewayAuthorizerResultContext } from 'aws-lambda'

export const config = {
  swagger: {
    path: '/docs',
    accessToken: 'this_is_api_docs_access_token'
  }
}

export interface AppContext extends APIGatewayAuthorizerResultContext {
  thirdPartyKey: string
}