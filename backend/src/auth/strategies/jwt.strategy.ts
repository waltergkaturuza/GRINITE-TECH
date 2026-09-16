import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { UserRole } from '../../users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    if (payload.role === UserRole.CLIENT || payload.role === 'client') {
      throw new UnauthorizedException('Client contacts cannot access the dashboard');
    }

    const user = await this.usersService.findOne(payload.sub);
    if (user?.role === UserRole.CLIENT || user?.role === 'client') {
      throw new UnauthorizedException('Client contacts cannot access the dashboard');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      user,
    };
  }
}