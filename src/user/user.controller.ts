import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';

@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get(':id')
  getUserById(id: number): Promise<User> {
    return this.userService.getUserById(id);
  }

  @Get()
  @UseGuards(RolesGuard)
  getAllUsers(): Promise<User[]> {
    return this.userService.getAllUsers();
  }
}
