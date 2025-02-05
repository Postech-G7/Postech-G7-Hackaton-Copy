import { SignupUseCase } from '../../signup-users.usecase';
import { HashProvider } from '../../../../../shared/application/providers/implementations/hash-provider';
import { BadRequestError } from '../../../../../shared/application/errors/bad-request-error';
import { UserInMemoryRepository } from '../../../../infraestructure/database/in-memory/repositories/user-in-memory.repository';
import { ConflictError } from '../../../../../shared/domain/errors/conflict-error';

describe('UserSignupUseCase unit tests', () => {
  let sut: SignupUseCase.UseCase;
  let repository: UserInMemoryRepository;
  let hashProvider: HashProvider;
  beforeEach(() => {
    repository = new UserInMemoryRepository();
    hashProvider = new HashProvider();
    sut = new SignupUseCase.UseCase(repository, hashProvider);
  });

  it('should throw BadRequestError when name input data is not provided', async () => {
    await expect(
      sut.execute({ name: '', email: 'a@gmail.com', password: '123' })
    ).rejects.toThrow(new BadRequestError('Input data not provided'));
  });

  it('should throw BadRequestError when email input data is not provided', async () => {
    await expect(
      sut.execute({ name: 'entity name', email: '', password: '123' })
    ).rejects.toThrow(new BadRequestError('Input data not provided'));
  });

  it('should throw BadRequestError when password input data is not provided', async () => {
    await expect(
      sut.execute({ name: 'entity name', email: 'a@gmail.com', password: '' })
    ).rejects.toThrow(new BadRequestError('Input data not provided'));
  });

  it('should throw ConflictError when email input data is already in use', async () => {
    await sut.execute({
      name: 'entity name',
      email: 'a@gmail.com',
      password: '123',
    });
    await expect(
      sut.execute({
        name: 'entity name',
        email: 'a@gmail.com',
        password: '123',
      })
    ).rejects.toThrow(new ConflictError('Email already exists'));
  });

  it('should create a new user with hashed password', async () => {
    const spyInsert = jest.spyOn(repository, 'insert');
    const result = await sut.execute({
      name: 'entity name',
      email: 'a@gmail.com',
      password: '123',
    });
    expect(result).toBeDefined();
    expect(result.name).toBe('entity name');
    expect(result.email).toBe('a@gmail.com');
    expect(result.createdAt).toBeDefined();
    expect(result.password).not.toBe('123');
    expect(spyInsert).toHaveBeenCalledTimes(1);
  });
});
