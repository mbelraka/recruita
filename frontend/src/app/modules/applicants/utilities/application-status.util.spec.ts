import {
  isApplicationStatus,
  parseApplicationStatus,
} from './application-status.util';
import { ApplicationStatus } from '../enums/application-status.enum';

describe('application-status.util', () => {
  it('recognizes enum values', () => {
    expect(isApplicationStatus(ApplicationStatus.Received)).toBeTrue();
    expect(parseApplicationStatus(ApplicationStatus.Screening)).toBe(
      ApplicationStatus.Screening
    );
  });

  it('rejects unknown values', () => {
    expect(isApplicationStatus('new')).toBeFalse();
    expect(parseApplicationStatus('invalid')).toBeUndefined();
    expect(parseApplicationStatus('')).toBeUndefined();
  });
});
