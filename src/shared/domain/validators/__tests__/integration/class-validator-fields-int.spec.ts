import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ClassValidatorFields } from '../../class-validator-fields';

interface StubEntity {
  name: string;
  price: number;
}

const data: StubEntity = {
  name: 'value',
  price: 10,
};

class StubRules implements StubEntity {
  //crio uma classe com as regras
  @MinLength(1)
  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  constructor(data: StubEntity) {
    Object.assign(this, data);
    // this.name = data.name;
    // this.price = data.price;
  }
}

class StubClassValidatorFields extends ClassValidatorFields<StubRules> {
  validate(data: any): boolean {
    return super.validate(data);
  }
}

let sut = new StubClassValidatorFields();
let dataWithRules = new StubRules(data);

describe('ClassValidatorFields integration tests', () => {
  beforeEach(() => {
    sut = new StubClassValidatorFields();
    dataWithRules = new StubRules(data);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should inicialize errors as null', () => {
    expect(sut.errors).toBeNull();
  });

  it('should inicialize validatedData as null', () => {
    expect(sut.validatedData).toBeNull();
  });

  it('should return true if data is valid', () => {
    const validationResult = sut.validate(dataWithRules);
    expect(validationResult).toBeTruthy();

    expect(sut.errors).toBeNull();
    expect(sut.validatedData).toStrictEqual(dataWithRules);
  });

  it('should return false if data name or price are invalid', () => {
    const wrongData = {
      name: '',
      price: 'ten',
    };

    const wrongDataWithRules = new StubRules(wrongData as any);

    const validationResult = sut.validate(wrongDataWithRules);

    expect(validationResult).toBeFalsy();
    expect(sut.errors).toBeDefined();
    expect(sut.errors).toStrictEqual({
      name: [
        'name should not be empty',
        'name must be longer than or equal to 1 characters',
      ],
      price: ['price must be a number conforming to the specified constraints'],
    });
    expect(sut.validatedData).toBeNull();
  });
});
