import { UserEntity } from '../../../../../users/domain/entities/user.entity';
import { userDataBuilder } from '../../../../../users/domain/testing/helpers/user-data-builder';
import { UserOutputMapper } from '../../user-output';

describe('UserOutputMapper unit tests', () => {
  it('should convert a user in output', () => {
    const entity = new UserEntity(userDataBuilder({}));
    const sut = UserOutputMapper.toOutput(entity);
    expect(sut).toStrictEqual({
      id: entity.id,
      name: entity.name,
      email: entity.email,
      password: entity.password,
      createdAt: entity.createdAt,
    });
  });
});
