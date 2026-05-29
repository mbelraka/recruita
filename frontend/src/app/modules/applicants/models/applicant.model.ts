import { APPLICANT } from '../constants/applicant.constants';

export class Applicant {
  public readonly id!: string;
  public readonly name?: string;
  public readonly email?: string;
  public readonly phone?: string;
  public readonly location?: string;
  public readonly yearsOfExperience?: number;
  public readonly applicationStatus?: string;
  public readonly currentJobTitle?: string;
  public readonly availableFrom?: Date;
  public readonly skills?: string[];
  public readonly notes?: string;

  public constructor(
    init?: Partial<Applicant> & { firstName?: string; lastName?: string }
  ) {
    if (!init) {
      return;
    }
    const { firstName, lastName, yearsOfExperience, availableFrom, ...rest } =
      init;
    Object.assign(this, rest);
    const fromLegacy =
      `${firstName ?? APPLICANT.EMPTY_TEXT}${APPLICANT.NAME_PART_SEPARATOR}${lastName ?? APPLICANT.EMPTY_TEXT}`.trim();
    if (fromLegacy && !this.name?.trim()) {
      (this as { name?: string }).name = fromLegacy;
    }
    if (yearsOfExperience !== undefined && yearsOfExperience !== null) {
      const n = Number(yearsOfExperience);
      if (Number.isFinite(n)) {
        (this as { yearsOfExperience?: number }).yearsOfExperience = n;
      }
    }
    if (availableFrom !== undefined && availableFrom !== null) {
      const d =
        availableFrom instanceof Date
          ? availableFrom
          : new Date(availableFrom as string | number);
      if (!Number.isNaN(d.getTime())) {
        (this as { availableFrom?: Date }).availableFrom = d;
      }
    }
  }

  public isValid(): boolean {
    return (
      !!this.id &&
      !!this.name?.trim() &&
      !!this.email?.trim() &&
      !!this.phone?.trim() &&
      Array.isArray(this.skills) &&
      this.skills.length >= APPLICANT.MIN_SKILL_COUNT
    );
  }

  public hasSkill(skill: string): boolean {
    return this.skills?.includes(skill) ?? false;
  }
}
