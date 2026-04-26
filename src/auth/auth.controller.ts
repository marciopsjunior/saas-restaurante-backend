import { Body, Controller, Post, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
@Throttle({ default: { limit: 5, ttl: 60000 } }) // limit 5 requests per minute for all auth routes
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    this.logger.log(
      JSON.stringify({
        event: 'register_attempt',
        email: body.email,
        timestamp: new Date().toISOString(),
      }),
    );
    return this.authService.register(body.email, body.password);
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    this.logger.log(
      JSON.stringify({
        event: 'login_attempt',
        email: body.email,
        timestamp: new Date().toISOString(),
      }),
    );
    return this.authService.login(body.email, body.password);
  }
}