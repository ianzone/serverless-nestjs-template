import { CognitoJwtVerifier } from "aws-jwt-verify";
import { decomposeJwt } from "aws-jwt-verify/jwt";
import { CognitoAccessTokenPayload } from 'aws-jwt-verify/jwt-model';
import { APIGatewayAuthorizerResult, APIGatewayRequestAuthorizerEvent, Handler } from 'aws-lambda';
import { AppContext, config } from './config';

export const handler: Handler = async (event: APIGatewayRequestAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
  if (process.env.IS_OFFLINE === 'true') console.log(event)
  const path = '/' + event.path.split('/')[2]  // /users ...
  const token = event.headers?.Authorization || event.headers?.authorization
  const accessToken = token?.split(' ')[1]

  const policy = policyMaker(event.methodArn);

  let principalId = 'unknown'
  let appContext

  try {
    switch (path) {
      case `${config.swagger.path}-json`:
        if (event.queryStringParameters?.token === config.swagger.accessToken) {
          principalId = 'developer'
        } else {
          throw new Error('Invalid developer')
        }
        break;

      default: // other protected paths
        if (accessToken === undefined) {
          throw new Error('Invalid user')
        } else {
          const payload = decomposeJwt(accessToken).payload as CognitoAccessTokenPayload
          const userPoolId = payload.iss.split('com/')[1]
          const clientId = payload.client_id
          principalId = payload.sub

          appContext = await getContext(userPoolId) // if throw, the user pool is not valid

          const verifier = CognitoJwtVerifier.create({
            userPoolId,
            tokenUse: "access",
            clientId,
          });

          await verifier.verify(accessToken)
        }
        break;
    }

    return policy.allow(principalId, appContext)
  } catch (err) {
    console.error(err);
    return policy.deny(principalId)
  }
}

async function getContext(userPoolId: string): Promise<AppContext> {
  // fetch third party keys by userPoolId, throw exception if keys not found
  return { thirdPartyKey: 'asdf' }
}

function policyMaker(resource: string) {
  return {
    allow: (principalId: string, context?: AppContext) => getPolicy(principalId, 'Allow', resource, context),
    deny: (principalId: string) => getPolicy(principalId, 'Deny', resource)
  }
}

function getPolicy(principalId: string, effect: 'Allow' | 'Deny', resource: string, context?: AppContext) {
  // https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-lambda-authorizer-output.html
  return {
    principalId: principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource
        }
      ]
    },
    context,
    // usageIdentifierKey: "{api-key}"
  }
}
