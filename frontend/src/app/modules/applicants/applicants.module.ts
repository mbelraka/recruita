import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { ApplicantsRoutingModule } from './applicants-routing.module';
import { ApplicantGridComponent } from './components/applicant-grid/applicant-grid.component';
import { ApplicantListComponent } from './components/applicant-list/applicant-list.component';
import { ApplicantComponent } from './components/applicant/applicant.component';
import { ApplicantsComponent } from './components/applicants/applicants.component';
import { ApplicantsPaginationComponent } from './components/applicants-pagination/applicants-pagination.component';
import { ConfirmDeleteApplicantDialogComponent } from './components/confirm-delete-applicant-dialog/confirm-delete-applicant-dialog.component';
import { NewApplicantComponent } from './components/new-applicant/new-applicant.component';

@NgModule({
  declarations: [
    ApplicantsComponent,
    ApplicantComponent,
    NewApplicantComponent,
    ApplicantGridComponent,
    ApplicantListComponent,
    ConfirmDeleteApplicantDialogComponent,
    ApplicantsPaginationComponent,
  ],
  imports: [CommonModule, ApplicantsRoutingModule, SharedModule],
})
export class ApplicantsModule {}
