import { UserInMemoryRepository } from '../../../../infraestructure/database/in-memory/repositories/user-in-memory.repository';
import { NotFoundError } from '../../../../../shared/domain/errors/not-found-error';
import { UpdatePasswordUseCase } from '../../update-password.usecase';
import { BadRequestError } from '../../../../../shared/application/errors/bad-request-error';
import { HashProvider } from '../../../../../shared/application/providers/implementations/hash-provider';
import { InvalidPasswordError } from '../../../../../shared/application/errors/invalid-password-error';
import { UserEntity } from '../../../../domain/entities/user.entity';
import { userDataBuilder } from '../../../../domain/testing/helpers/user-data-builder';

describe('UpdatePasswordUseCase unit tests', () => {
  let sut: UpdatePasswordUseCase.UseCase;
  let repository: UserInMemoryRepository;
  let hashProvider: HashProvider;

  beforeEach(() => {
    repository = new UserInMemoryRepository();
    hashProvider = new HashProvider();
    sut = new UpdatePasswordUseCase.UseCase(repository, hashProvider);
  });

  it('Should throws error if id is not provided', async () => {
    await expect(() =>
      sut.execute({ id: '', password: 'test1', newPassword: 'test2' })
    ).rejects.toThrow(new BadRequestError('Input data not provided'));
  });
  it('Should throws error if password is not provided', async () => {
    await expect(() =>
      sut.execute({ id: 'fakeId', password: '', newPassword: 'test2' })
    ).rejects.toThrow(
      new InvalidPasswordError('Password and new password must be provided')
    );
  });
  it('Should throws error if new password is not provided', async () => {
    await expect(() =>
      sut.execute({ id: 'fakeId', password: 'test1', newPassword: '' })
    ).rejects.toThrow(
      new InvalidPasswordError('Password and new password must be provided')
    );
  });
  it('Should throws error if password is wrong', async () => {
    const hashPassword = await hashProvider.generateHash('wrongPassword1');
    const user = userDataBuilder({ password: hashPassword });
    const entity = new UserEntity(user);
    await repository.insert(entity);

    await expect(() =>
      sut.execute({
        id: entity._id,
        password: 'wrongPassword2',
        newPassword: 'test2',
      })
    ).rejects.toThrow(new InvalidPasswordError('Invalid password'));
  });
  it('Should throws error if new password is equal to old password', async () => {
    const hashPassword = await hashProvider.generateHash('equalPassword');
    const user = userDataBuilder({ password: hashPassword });
    const entity = new UserEntity(user);
    await repository.insert(entity);
    repository.items = [entity];
    await expect(() =>
      sut.execute({
        id: entity._id,
        password: 'equalPassword',
        newPassword: 'equalPassword',
      })
    ).rejects.toThrow(
      new InvalidPasswordError(
        'New password must be different than old password'
      )
    );
  });
  it('Should throws error when entity not found', async () => {
    await expect(() =>
      sut.execute({ id: 'fakeId', password: 'test1', newPassword: 'test2' })
    ).rejects.toThrow(new NotFoundError('Entity not found'));
  });
  it('Should update a password', async () => {
    const updateSpyOn = jest.spyOn(repository, 'update');
    const hashPassword = await hashProvider.generateHash('oldPassword');
    const user = userDataBuilder({ password: hashPassword });
    const entity = new UserEntity(user);
    await repository.insert(entity);
    repository.items = [entity];
    const result = await sut.execute({
      id: entity._id,
      password: 'oldPassword',
      newPassword: 'newPassword',
    });
    expect(result).toBeDefined();
    expect(updateSpyOn).toHaveBeenCalledTimes(1);
    expect(result.name).toBe(entity.name);
    expect(result.email).toBe(entity.email);
    expect(result.createdAt).toBeDefined();
    expect(result.password).not.toBe('newPassword');
  });
});
