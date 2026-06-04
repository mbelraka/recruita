/** NgRx Data entity type names (must match `{Name}DataService` classes). */
export const RecruitaEntityNames = {
  Applicant: 'Applicant',
  Profile: 'Profile',
} as const;

export type RecruitaEntityName =
  (typeof RecruitaEntityNames)[keyof typeof RecruitaEntityNames];
