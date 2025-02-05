import { UserInMemoryRepository } from '../../../../infraestructure/database/in-memory/repositories/user-in-memory.repository';
import { SigninUseCase } from '../../signin-users.usecase';
import { HashProviderContract } from '../../../../../shared/application/providers/hash-provider-interface';
import { HashProvider } from '../../../../../shared/application/providers/implementations/hash-provider';
import { userDataBuilder } from '../../../../domain/testing/helpers/user-data-builder';
import { BadRequestError } from '../../../../..//shared/application/errors/bad-request-error';
import { InvalidCredentialsError } from '../../../../../shared/application/errors/Invalid-credentials-error';
import { UserEntity } from '../../../../domain/entities/user.entity';
import { NotFoundError } from '../../../../../shared/domain/errors/not-found-error';

describe('SigninUseCase unit tests', () => {
  let sut: SigninUseCase.UseCase;
  let repository: UserInMemoryRepository;
  let hashProvider: HashProviderContract;

  beforeEach(() => {
    repository = new UserInMemoryRepository();
    hashProvider = new HashProvider();
    sut = new SigninUseCase.UseCase(repository, hashProvider);
  });

  it('Should authenticate a user', async () => {
    const spyFindByEmail = jest.spyOn(repository, 'findByEmail');
    const hashPassword = await hashProvider.generateHash('1234');
    const entity = new UserEntity(
      userDataBuilder({ email: 'a@a.com', password: hashPassword })
    );
    repository.items = [entity];

    const result = await sut.execute({
      email: entity.email,
      password: '1234',
    });
    expect(spyFindByEmail).toHaveBeenCalledTimes(1);
    expect(result).toStrictEqual(entity.toJson());
  });

  it('Should throws error when email not provided', async () => {
    await expect(() =>
      sut.execute({ email: null, password: '1234' })
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('Should throws error when password not provided', async () => {
    await expect(() =>
      sut.execute({ email: 'a@a.com', password: null })
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('Should not be able authenticate with wrong email', async () => {
    await expect(() =>
      sut.execute({ email: 'a@a.com', password: '1234' })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('Should not be able authenticate with wrong password', async () => {
    const hashPassword = await hashProvider.generateHash('1234');
    const entity = new UserEntity(
      userDataBuilder({ email: 'a@a.com', password: hashPassword })
    );
    repository.items = [entity];

    await expect(() =>
      sut.execute({ email: 'a@a.com', password: 'fake' })
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });
});
