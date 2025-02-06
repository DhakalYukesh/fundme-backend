import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';

@Injectable()
export class SpeakeasyService {
  generateSecret(email: string) {
    const secret = speakeasy.generateSecret({
      name: `${process.env.TOTP_SECRET}:${email}`,
      length: 20,
    });

    return {
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url,
    };
  }

  verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: token.replace(/\s+/g, ''),
      window: 1,
      step: 30,
    });
  }
}
