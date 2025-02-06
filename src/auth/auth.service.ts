import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { hash, compare } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserService } from 'src/user/user.service';
import { SpeakeasyService } from './speakeasy.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private userService: UserService,
    private speakeasyService: SpeakeasyService,
  ) {}

  async registerUser(registerUserPayload: RegisterDto): Promise<User> {
    const { fullName, email, password } = registerUserPayload;

    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new HttpException(
        'Email already exists, please try other email.',
        HttpStatus.CONFLICT,
      );
    }

    // Hash password and save user
    const hashedPassword = await hash(password, 10);
    const user = this.userRepository.create({
      fullName,
      email,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  async validateUser(validateData: LoginDto): Promise<User | undefined> {
    const { email, password } = validateData;
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
    }

    // Compare password
    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      throw new HttpException('Invalid credentials.', HttpStatus.UNAUTHORIZED);
    }

    return user;
  }

  generateJWT(user: User) {
    const payload = { sub: user.id, fullName: user.fullName, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async loginUser(loginUserPayload: LoginDto) {
    // 1. Validate user
    const user = await this.validateUser(loginUserPayload);

    if (!user) {
      throw new HttpException(
        'Invalid credentials, please try again.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 2. Generate tokens
    return this.generateJWT(user);
  }

  async enable2FA(userId: number) {
    const user = await this.userService.getUserById(userId);
    if (!this.speakeasyService) {
      throw new HttpException(
        '2FA service not available',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const { secret, otpauthUrl } = this.speakeasyService.generateSecret(
      user.email,
    );

    if (typeof secret !== 'string') {
      throw new HttpException(
        'Invalid secret generated',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Store temporary secret
    user.twoFASecret = secret;
    await this.userRepository.save(user);

    return { secret, otpauthUrl };
  }

  async verify2FA(userId: number, code: string) {
    const user = await this.userService.getUserById(userId);

    if (!user.twoFASecret) {
      throw new HttpException('2FA not initiated', HttpStatus.BAD_REQUEST);
    }

    if (!this.speakeasyService) {
      throw new HttpException(
        '2FA service not available',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Add logging to debug the values
    console.log('Verifying 2FA with:', {
      secret: user.twoFASecret,
      code: code,
    });

    const isValid = this.speakeasyService.verifyToken(user.twoFASecret, code);

    console.log('Verification result:', isValid);

    if (!isValid) {
      throw new HttpException('Invalid 2FA code', HttpStatus.BAD_REQUEST);
    }

    user.is2FAEnabled = true;
    await this.userRepository.save(user);

    return { message: '2FA enabled successfully' };
  }
}
