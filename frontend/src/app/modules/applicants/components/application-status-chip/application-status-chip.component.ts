import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { ApplicationStatus } from '../../enums/application-status.enum';

@Component({
  selector: 'app-application-status-chip',
  template: `{{ translationKey | translate }}`,
  styleUrls: ['./application-status-chip.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.application-status-chip]': 'true',
    '[class.application-status-chip--received]':
      'status === applicationStatuses.Received',
    '[class.application-status-chip--screening]':
      'status === applicationStatuses.Screening',
    '[class.application-status-chip--interview_scheduled]':
      'status === applicationStatuses.InterviewScheduled',
    '[class.application-status-chip--shortlisted]':
      'status === applicationStatuses.Shortlisted',
    '[class.application-status-chip--offer_extended]':
      'status === applicationStatuses.OfferExtended',
    '[class.application-status-chip--rejected]':
      'status === applicationStatuses.Rejected',
    '[class.application-status-chip--withdrawn]':
      'status === applicationStatuses.Withdrawn',
    '[attr.aria-label]': 'ariaLabel',
  },
})
export class ApplicationStatusChipComponent {
  @Input() public status: ApplicationStatus | null = null;

  protected readonly applicationStatuses = ApplicationStatus;

  public get translationKey(): string {
    return this.status ? `applicationStatus.${this.status}` : '';
  }

  public get ariaLabel(): string | null {
    if (!this.status) {
      return null;
    }

    return `applicantList.applicationStatus: ${this.translationKey}`;
  }
}
