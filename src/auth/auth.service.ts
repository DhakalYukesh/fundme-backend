import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { hash, compare } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
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

  loginUser(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  generateJWT(user: User) {
    const payload = { sub: user.id, fullName: user.fullName, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }
}
