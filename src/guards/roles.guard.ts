import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { decomposeJwt } from "aws-jwt-verify/jwt";
import { CognitoAccessTokenPayload } from 'aws-jwt-verify/jwt-model';
import { ROLES_KEY } from './roles.decorator';
import { Role } from './roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {

    if (process.env.IS_OFFLINE === 'true') return true;

    const roles = this.reflector.get<Role[]>(ROLES_KEY, context.getHandler());
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];
    if (token === undefined) throw new UnauthorizedException();

    try {
      const payload = decomposeJwt(token).payload as CognitoAccessTokenPayload
      const userPoolId = payload.iss.split('com/')[1]
      console.log('check if it is a valid userPoolId')
      // if (false) {
      //   console.log('userPoolId is not a valid userPoolId')
      //   return false
      // }

      const clientId = payload.client_id
      const groups = payload['cognito:groups']

      if (groups === undefined && roles !== undefined) {
        return false
      }

      if (groups && roles && !(roles.find((role) => groups.includes(role)))) {
        return false
      }

      const verifier = CognitoJwtVerifier.create({
        userPoolId,
        tokenUse: "access",
        clientId,
      });

      await verifier.verify(token)

      return true;
    } catch (err) {
      console.error(err);
      return false
    }
  }
}