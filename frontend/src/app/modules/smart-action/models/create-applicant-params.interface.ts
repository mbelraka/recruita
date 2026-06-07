export interface CreateApplicantParams {
  readonly name: string;
  readonly email: string;
  readonly phone?: string;
  readonly skills: readonly string[];
  readonly yearsOfExperience: number;
  readonly currentJobTitle: string;
}
