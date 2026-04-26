import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string) {
    const exists = await this.prisma.accounts.findUnique({ where: { email } });

    if (exists) throw new Error('User already exists');

    const passwordHash = await bcrypt.hash(password, 10);
    

    const account = await this.prisma.accounts.create({
      data: {
        email,
        password_hash: passwordHash,
      },
    });

    return account;
  }

  async login(email: string, password: string) {
    const account = await this.prisma.accounts.findUnique({
      where: { email },
    });

    if (!account) {
      console.log(`Login failed for email: ${email} - User not found`);
      throw new UnauthorizedException('invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, account.password_hash);

    if (!isMatch) {
      console.log(`Login failed for email: ${email} - Invalid password`);
      throw new UnauthorizedException('invalid credentials');
    }

    const token = this.jwtService.sign({
      sub: account.id,
      email: account.email,
    });

    return {
      access_token: token,
    };
  }
}
