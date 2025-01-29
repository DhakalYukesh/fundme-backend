import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async registerUser(@Body() registerDto: RegisterDto) {
    return this.authService.registerUser(registerDto);
  }

  @Post('login')
  async loginUser(@Body() loginDto: LoginDto) {
    // 1. Validate user
    const user = await this.authService.validateUser(loginDto);

    if (!user) {
      throw new HttpException(
        'Invalid credentials, please try again.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 2. Generate tokens
    return this.authService.loginUser(user);
  }
}
