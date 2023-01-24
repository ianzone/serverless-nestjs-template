import {
  IsEmail,
  IsNotEmpty
} from 'class-validator';

export class CreateUserDto {
  /**
  * Sign up email
  * @example 'test@example.com'
  */
  @IsEmail()
  email: string;

  /**
  * Don't be too simple
  * @example 'asdf'
  */
  @IsNotEmpty()
  password: string;
}
