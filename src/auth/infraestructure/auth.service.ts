import { EnvConfigService } from '../../shared/infraestructure/env-config/env-config.service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

type GenerateJwtProps = {
  accessToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private envConfigService: EnvConfigService
  ) {}

  async generateJwt(userId: string): Promise<GenerateJwtProps> {
    const accessToken = await this.jwtService.signAsync({
      payload: { id: userId },
      options: {},
    });
    return { accessToken };
  }

  async verifyJwt<T>(token: string): Promise<T> {
    const payload = await this.jwtService.verifyAsync(token, {
      secret: this.envConfigService.getJwtSecret(),
    });
    return payload as T;
  }
}
