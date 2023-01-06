import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, QueryUserDto, UpdateUserDto } from './dto';
import { User } from './entities/user.entity';

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}
@Injectable()
export class UsersService {
  private readonly users = new Map<string, User>;

  async create(createUserDto: CreateUserDto) {
    const id = getRandomInt(100).toString()
    this.users.set(id, {
      id,
      ...createUserDto
    });
    return {
      msg: 'Created a new user',
      id
    };
  }

  async findAll(query: QueryUserDto) {
    const userArr: User[] = []
    // this.users.forEach(user => { userArr.push(user); });
    const itr = this.users.entries()
    const keys = this.users.keys()
    let next
    let item: any
    let validPage = false
    let pageSize = query.pageSize || -1
    while (item = itr.next().value) {
      next = keys.next().value
      if (pageSize > 0 || pageSize <= -1) {
        if (item[0] === query.page || query.page === undefined) {
          validPage = true;
        }
        if (validPage) {
          userArr.push(item[1]);
          pageSize--
        }
      } else {
        break
      }
    }

    return {
      next,
      users: userArr
    };
  }

  async findOne(id: string) {
    const user = this.users.get(id);
    if (user === undefined) { throw new NotFoundException; }
    return user
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = this.users.get(id);
    if (user === undefined) { throw new NotFoundException; }
    this.users.set(id, { ...user, ...updateUserDto });
    return {
      msg: `User #${id} updated successfully`,
      user: this.users.get(id),
    };
  }

  async remove(id: string) {
    const res = this.users.delete(id);
    if (res === false) throw new NotFoundException;
    return {
      msg: `User #${id} deleted successfully`
    };
  }
}
