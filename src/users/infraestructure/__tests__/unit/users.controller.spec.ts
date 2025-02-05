import { ListUsersUseCase } from '../../../application/usecases/list-users.usecase';
import { SignupUseCase } from '../../../application/usecases/signup-users.usecase';
import {
  UserCollectionPresenter,
  UserPresenter,
} from '../../presenters/user.presenter';
import { UsersController } from '../../users.controller';

const userInputData: SignupUseCase.Input = {
  name: 'test name',
  email: 'a@a.com',
  password: '1234',
};

const userOutput: SignupUseCase.Output = {
  id: '177312f6-0b6e-4378-b62c-a4ac5e7eec3c',
  name: 'test name',
  email: 'a@a.com',
  password: '1234',
  createdAt: new Date(),
};

describe('UsersController', () => {
  let sut = new UsersController();
  const execute = jest.fn();
  const generateJwt = jest.fn();

  const mockExecute = {
    execute,
  } as any;

  const mockGenerateJwt = {
    generateJwt,
  } as any;

  beforeEach(async () => {
    sut = new UsersController();
    sut['signupUseCase'] = mockExecute;
    sut['signinUseCase'] = mockExecute;
    sut['getUserUseCase'] = mockExecute;
    sut['listUsersUseCase'] = mockExecute;
    sut['updateUserUseCase'] = mockExecute;
    sut['updatePasswordUseCase'] = mockExecute;
    sut['deleteUserUseCase'] = mockExecute;
    sut['authService'] = mockGenerateJwt;
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should create a user', async () => {
    execute.mockResolvedValueOnce(userOutput);
    const presenter = await sut.create(userInputData);
    expect(presenter).toStrictEqual(new UserPresenter(userOutput));
    expect(execute).toHaveBeenCalledWith(userInputData);
  });

  it('should signin/authenticate a user', async () => {
    const output = { accessToken: 'token' };
    execute.mockResolvedValueOnce(userOutput);
    generateJwt.mockResolvedValueOnce(output);
    const token = await sut.login(userInputData);
    expect(token).toEqual(output);
    expect(execute).toHaveBeenCalledWith(userInputData);
  });

  it('should update a user', async () => {
    execute.mockResolvedValueOnce({ ...userOutput, name: 'novo nome' });
    const presenter = await sut.update('1', { name: 'novo nome' });
    expect(presenter).toStrictEqual(
      new UserPresenter({ ...userOutput, name: 'novo nome' })
    );
    expect(execute).toHaveBeenCalledWith({ id: '1', name: 'novo nome' });
  });

  it('should update a user', async () => {
    execute.mockResolvedValueOnce({ ...userOutput, name: 'novo nome' });
    const presenter = await sut.update('1', { name: 'novo nome' });
    expect(presenter).toStrictEqual(
      new UserPresenter({ ...userOutput, name: 'novo nome' })
    );
    expect(execute).toHaveBeenCalledWith({ id: '1', name: 'novo nome' });
  });

  it('should update password', async () => {
    execute.mockResolvedValueOnce({ ...userOutput, password: '456' });
    const presenter = await sut.updatePassword('1', {
      password: '123',
      newPassword: '456',
    });
    expect(presenter).toStrictEqual(
      new UserPresenter({ ...userOutput, password: '456' })
    );
    expect(execute).toHaveBeenCalledWith({
      id: '1',
      password: '123',
      newPassword: '456',
    });
  });

  it('should delete a user', async () => {
    execute.mockResolvedValueOnce({});
    await sut.remove('1');
    expect(execute).toHaveBeenCalledWith({ id: '1' });
  });

  it('should find one user', async () => {
    execute.mockResolvedValueOnce(userOutput);
    const presenter = await sut.findOne('1');
    expect(presenter).toStrictEqual(new UserPresenter(userOutput));
    expect(execute).toHaveBeenCalledWith({ id: '1' });
  });

  it('should list users', async () => {
    const output: ListUsersUseCase.Output = {
      items: [userOutput],
      currentPage: 1,
      lastPage: 1,
      perPage: 1,
      total: 1,
    };
    const mockListUsersUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    sut['listUsersUseCase'] = mockListUsersUseCase as any;
    const searchParams = {
      page: 1,
      perPage: 1,
    };
    const presenter = await sut.search(searchParams);
    expect(presenter).toBeInstanceOf(UserCollectionPresenter);
    expect(presenter).toEqual(new UserCollectionPresenter(output));
    expect(mockListUsersUseCase.execute).toHaveBeenCalledWith(searchParams);
  });
});
