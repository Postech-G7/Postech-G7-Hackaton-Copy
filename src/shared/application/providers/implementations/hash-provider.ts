import { HashProviderContract } from '../hash-provider-interface';
import { compare, hash } from 'bcryptjs';

export class HashProvider implements HashProviderContract {
  private readonly SALT_ROUNDS = 6;

  async generateHash(payload: string): Promise<string> {
    return hash(payload, this.SALT_ROUNDS);
  }

  async compareHash(payload: string, hash: string): Promise<boolean> {
    return compare(payload, hash);
  }
}
