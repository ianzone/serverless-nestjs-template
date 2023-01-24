import { Body, Controller, Delete, Get, Logger, Param, Patch, Post, Query, Redirect, UseGuards, Version } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Group, Groups, GroupsGuard } from 'src/guards';
import { CreateUserDto, QueryUserDto, UpdateUserDto } from './dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(GroupsGuard)
export class UsersController {
  logger = new Logger(UsersController.name)

  constructor(private readonly usersService: UsersService) { }

  /**
   * Create a user account
   */
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    this.logger.log(createUserDto)
    return await this.usersService.create(createUserDto);
  }

  @Groups(Group.admin)
  @Get()
  async findAll(@Query() query: QueryUserDto) {
    this.logger.log(query)
    return await this.usersService.findAll(query);
  }

  @Version('1')
  @Get()
  @Redirect(`${process.env.STAGE ? `/${process.env.STAGE}` : ''}/v2/users`, 302)
  async findAll1() { return 'version 1' }

  @Version('2')
  @Get()
  async findAll2() { return 'version 2' }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.usersService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.usersService.remove(id);
  }
}
