import { Body, Controller, Post, Query, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guards/auth.guard';
import { GetUser } from 'src/shared/decorators/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async registerUser(@Body() registerDto: RegisterDto) {
    return this.authService.registerUser(registerDto);
  }

  @Post('login')
  async loginUser(@Body() loginDto: LoginDto) {
    return this.authService.loginUser(loginDto);
  }

  @Post('2fa/enable')
  @UseGuards(AuthGuard)
  async enable2FA(@GetUser() user: { id: number }) {
    return this.authService.enable2FA(user.id);
  }

  @Post('2fa/verify')
  @UseGuards(AuthGuard)
  async verify2FA(
    @GetUser() user: { id: number },
    @Query('verifyCode') verifyCode: string,
  ) {
    return this.authService.verify2FA(user.id, verifyCode);
  }
}
