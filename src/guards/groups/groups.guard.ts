import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthReq } from 'src/middleware';
import { Group, GROUPS_KEY } from './groups.decorator';

@Injectable()
export class GroupsGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {

    if (process.env.IS_OFFLINE === 'true') return true;

    const groups = this.reflector.get<Group[] | undefined>(GROUPS_KEY, context.getHandler());

    if (groups?.length) {
      const groupSet = context.switchToHttp().getRequest<AuthReq>().user.groupSet;
      if (groupSet.size) {
        for (const group of groups) {
          if (groupSet.has(group)) return true;
        }
      }
      return false
    } else {
      return true
    }
  }
}