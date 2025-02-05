import { HashProvider } from '../../hash-provider';

describe('BcryptHashProvider', () => {
  let sut: HashProvider;
  beforeEach(() => {
    sut = new HashProvider();
  });
  it('should be able to generate a hash', async () => {
    const password = '123456';

    const hash = await sut.generateHash(password);
    expect(hash).toBeDefined();
  });
  it('should be able to compare a hash on a valid password', async () => {
    const password = '123456';
    const hash = await sut.generateHash(password);

    const isValid = await sut.compareHash(password, hash);
    expect(isValid).toBeTruthy();
  });

  it('should return false when compare a hash on a invalid password', async () => {
    const password = '123456';
    const hash = await sut.generateHash(password);

    const isValid = await sut.compareHash('1234567', hash);
    expect(isValid).toBeFalsy();
  });
});
