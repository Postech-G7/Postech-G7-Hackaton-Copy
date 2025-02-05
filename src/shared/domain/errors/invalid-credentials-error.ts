import { FieldsErrors } from '../validators/validator-fields.interface';

export class CredentialsValidationError extends Error {}

export class InvalidCredentialsError extends Error {
  constructor(public errors: FieldsErrors) {
    super('Invalid Credentials');
    this.name = 'InvalidCredentialsError';
  }
}
