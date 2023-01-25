import { Injectable, Logger, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { decomposeJwt } from 'aws-jwt-verify/jwt';
import { CognitoAccessTokenPayload } from 'aws-jwt-verify/jwt-model';
import { NextFunction, Response } from 'express';
import constants from 'src/constants';
import { fetchSecrets } from './fetchSecrets';
import { AppSecrets, AuthReq, JwtVerifier, SecretsCache, VerifierProps } from './interfaces';

@Injectable()
export class AuthMiddleware implements NestMiddleware {

  logger = new Logger(AuthMiddleware.name);
  secretsCache: SecretsCache
  jwtCache = new Set<string>;
  jwtVerifier: JwtVerifier

  async use(req: AuthReq, res: Response, next: NextFunction) {
    if (constants.bypassAuth) return next();

    try {
      const jwt = req.headers.authorization?.split('Bearer ')[1];
      if (!jwt) throw new Error('missing authorization')

      // if jwt is cached
      if (this.jwtCache.has(jwt)) {
        const payload = decomposeJwt(jwt).payload as CognitoAccessTokenPayload
        if (Date.now() < payload.exp * 1000) {  // if jwt is not expired
          modifyReq(req, payload, this.secretsCache)
          return next()
        } else {
          this.jwtCache.delete(jwt)
          throw new Error('jwt expired')
        }
      }

      // if jwt is not cached
      if (!this.jwtVerifier) {
        const appSecrets = await fetchSecrets()
        const { secretsCache, verifier } = getCaches(appSecrets)
        this.secretsCache = secretsCache
        this.jwtVerifier = verifier
      }

      const payload = await this.jwtVerifier.verify(jwt)
      this.jwtCache.add(jwt)
      this.logger.warn('jwtCache may cause memory leak when not using aws lambda')

      modifyReq(req, payload, this.secretsCache)

      return next();
    } catch (err) {
      this.logger.error(err.message)
      throw new UnauthorizedException()
    }
  }
}

function modifyReq(req: AuthReq, payload: CognitoAccessTokenPayload, secretsCache: SecretsCache) {
  req.user = {
    userId: payload.sub,
    groupSet: new Set(payload['cognito:groups'])
  }
  const userPoolId = payload.iss.split('com/')[1]
  req.secrets = {
    cognito: {
      userPoolId,
      clientId: payload.client_id
    },
    ...secretsCache[userPoolId]
  }
}

function getCaches(appSecrets: AppSecrets[]) {

  const secretsCache: SecretsCache = {}
  const verifierProps: VerifierProps[] = []

  for (const item of appSecrets) {
    const { cognito, ...rest } = item
    secretsCache[cognito.userPoolId] = rest

    verifierProps.push({ userPoolId: cognito.userPoolId, clientId: cognito.clientId, tokenUse: 'access' })
  }

  const verifier = CognitoJwtVerifier.create(verifierProps)
  return { secretsCache, verifier }
}