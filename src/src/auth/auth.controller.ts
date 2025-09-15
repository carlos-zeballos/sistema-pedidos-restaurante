import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    console.log('🔐 AuthController.login - Iniciando login...');
    console.log('📤 LoginDto:', { username: loginDto.username, password: '***' });

    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );

    if (!user) {
      console.log('❌ AuthController.login - Usuario no validado');
      throw new UnauthorizedException('Credenciales inválidas');
    }

    console.log('✅ AuthController.login - Usuario validado, generando token...');
    const result = await this.authService.login(user);
    console.log('✅ AuthController.login - Login completado');
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    return req.user;
  }
}
