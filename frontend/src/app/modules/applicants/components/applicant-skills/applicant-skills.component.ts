import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { ApplicantSkillsVariant } from '../../enums/applicant-skills-variant.enum';

@Component({
  selector: 'app-applicant-skills',
  templateUrl: './applicant-skills.component.html',
  styleUrls: ['./applicant-skills.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicantSkillsComponent {
  @Input() public skills: readonly string[] | null | undefined = [];

  @Input() public variant: ApplicantSkillsVariant = ApplicantSkillsVariant.Chip;

  public readonly skillsVariant = ApplicantSkillsVariant;

  @Output() public readonly skillSelected = new EventEmitter<string>();

  public onSkillClick(event: MouseEvent, skill: string): void {
    event.stopPropagation();
    this.skillSelected.emit(skill);
  }
}
