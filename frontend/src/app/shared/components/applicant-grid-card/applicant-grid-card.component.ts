import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Applicant } from 'src/app/modules/applicants/models/applicant.model';
import { ApplicantSkillsVariant } from '../../../modules/applicants/enums/applicant-skills-variant.enum';
import { MATERIAL_SYMBOLS_OUTLINED_FONT_SET } from 'src/app/utilities/initializers/material-symbols-outlined-font.initializer';

@Component({
  selector: 'app-applicant-grid-card',
  templateUrl: './applicant-grid-card.component.html',
  styleUrls: ['./applicant-grid-card.component.scss'],
  standalone: false,
})
export class ApplicantGridCardComponent {
  @Input({ required: true }) public applicant!: Applicant;
  @Input() public animationDelayMs = 0;
  @Input() public clickable = false;
  @Input() public highlighted = false;
  @Input() public showDeleteAction = false;
  @Input() public showApplicationStatus = true;
  @Input() public showMetaDetails = true;
  @Input() public skillVariant: ApplicantSkillsVariant =
    ApplicantSkillsVariant.FilterChip;

  @Output() public readonly cardSelected = new EventEmitter<Applicant>();
  @Output() public readonly deleteRequested = new EventEmitter<Applicant>();
  @Output() public readonly skillSelected = new EventEmitter<string>();

  public readonly outlinedIconFontSet = MATERIAL_SYMBOLS_OUTLINED_FONT_SET;

  public onCardClick(event: MouseEvent): void {
    if (!this.clickable) {
      return;
    }
    const target = event.target as HTMLElement | null;
    if (target?.closest('.applicant-shared-card__delete')) {
      return;
    }
    this.cardSelected.emit(this.applicant);
  }

  public onDeleteClick(event: MouseEvent): void {
    event.stopPropagation();
    this.deleteRequested.emit(this.applicant);
  }

  public onSkillSelected(skill: string): void {
    this.skillSelected.emit(skill);
  }
}
