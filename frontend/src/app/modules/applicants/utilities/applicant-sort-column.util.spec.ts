import {
  APPLICANT_AVAILABILITY_SORT_UI_COLUMN,
  APPLICANT_AVAILABLE_FROM_SORT_KEY,
  applicantSortStoreKeyFromUiColumn,
  applicantSortUiColumnFromStoreKey,
} from './applicant-sort-column.util';

describe('applicant-sort-column.util', () => {
  it('maps availability alias both ways', () => {
    expect(
      applicantSortUiColumnFromStoreKey(APPLICANT_AVAILABLE_FROM_SORT_KEY)
    ).toBe(APPLICANT_AVAILABILITY_SORT_UI_COLUMN);
    expect(
      applicantSortStoreKeyFromUiColumn(APPLICANT_AVAILABILITY_SORT_UI_COLUMN)
    ).toBe(APPLICANT_AVAILABLE_FROM_SORT_KEY);
  });

  it('passes through other columns', () => {
    expect(applicantSortUiColumnFromStoreKey('name')).toBe('name');
    expect(applicantSortStoreKeyFromUiColumn('email')).toBe('email');
    expect(applicantSortUiColumnFromStoreKey(null)).toBe('');
  });
});
