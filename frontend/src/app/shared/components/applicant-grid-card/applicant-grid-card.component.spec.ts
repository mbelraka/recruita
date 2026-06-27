import { Applicant } from 'src/app/modules/applicants/models/applicant.model';
import { createApplicant } from '../../../modules/applicants/utilities/applicant-domain.util';

import { ApplicantGridCardComponent } from './applicant-grid-card.component';

describe('ApplicantGridCardComponent', () => {
  let component: ApplicantGridCardComponent;
  let applicant: Applicant;

  beforeEach(() => {
    component = new ApplicantGridCardComponent();
    applicant = createApplicant({
      id: '1',
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+4912345',
      skills: ['Angular', 'TypeScript'],
    });
    component.applicant = applicant;
  });

  it('does not emit card selection when card is not clickable', () => {
    const emitSpy = spyOn(component.cardSelected, 'emit');
    component.clickable = false;

    component.onCardClick(new MouseEvent('click'));

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('does not emit card selection when delete action is clicked', () => {
    const emitSpy = spyOn(component.cardSelected, 'emit');
    component.clickable = true;

    const deleteButton = document.createElement('button');
    deleteButton.className = 'applicant-shared-card__delete';
    const icon = document.createElement('span');
    deleteButton.append(icon);

    const event = {
      target: icon,
    } as unknown as MouseEvent;

    component.onCardClick(event);

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('emits card selection when clickable and target is valid', () => {
    const emitSpy = spyOn(component.cardSelected, 'emit');
    component.clickable = true;

    const regularTarget = document.createElement('div');
    const event = {
      target: regularTarget,
    } as unknown as MouseEvent;

    component.onCardClick(event);

    expect(emitSpy).toHaveBeenCalledWith(applicant);
  });

  it('emits delete request and stops propagation', () => {
    const emitSpy = spyOn(component.deleteRequested, 'emit');
    const stopPropagation = jasmine.createSpy('stopPropagation');
    const event = {
      stopPropagation,
    } as unknown as MouseEvent;

    component.onDeleteClick(event);

    expect(stopPropagation).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalledWith(applicant);
  });

  it('emits selected skill', () => {
    const emitSpy = spyOn(component.skillSelected, 'emit');

    component.onSkillSelected('Angular');

    expect(emitSpy).toHaveBeenCalledWith('Angular');
  });
});
