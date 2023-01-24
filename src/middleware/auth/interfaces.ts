
import { CognitoJwtVerifierMultiProperties, CognitoJwtVerifierMultiUserPool } from 'aws-jwt-verify/cognito-verifier';
import { Request } from 'express';

interface ApiKeys {
  [thirdParty: string]: any
}

export interface SecretsCache {
  [userPoolId: string]: ApiKeys
}

export interface TenantSecrets extends ApiKeys {
  cognito: {
    userPoolId: string
    clientId: string
  }
}

export interface AppSecrets extends ApiKeys {
  cognito: {
    userPoolId: string
    clientId: string[]
  }
}

export interface User {
  userId: string,
  groupSet: Set<string>,
}

export interface AuthReq extends Request {
  secrets: TenantSecrets
  user: User
}

export interface VerifierProps extends CognitoJwtVerifierMultiProperties { tokenUse: 'access' }
export type JwtVerifier = CognitoJwtVerifierMultiUserPool<VerifierProps>