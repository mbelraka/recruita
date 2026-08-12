import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from 'src/app/shared/shared.module';
import { ApplicantSkillsComponent } from './applicant-skills.component';
import { ApplicantSkillsVariant } from '../../enums/applicant-skills-variant.enum';

describe('ApplicantSkillsComponent', () => {
  let component: ApplicantSkillsComponent;
  let fixture: ComponentFixture<ApplicantSkillsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApplicantSkillsComponent],
      imports: [TranslateModule.forRoot(), SharedModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicantSkillsComponent);
    component = fixture.componentInstance;
  });

  it('should render chip variant by default', () => {
    component.skills = ['Angular'];
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Angular');
  });

  it('should emit selected skill and stop propagation for interactive variants', () => {
    component.skills = ['Angular'];
    component.variant = ApplicantSkillsVariant.InlineLink;
    fixture.detectChanges();

    spyOn(component.skillSelected, 'emit');
    const button = fixture.nativeElement.querySelector(
      'button'
    ) as HTMLButtonElement;
    const event = new MouseEvent('click');
    spyOn(event, 'stopPropagation');

    button.dispatchEvent(event);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(component.skillSelected.emit).toHaveBeenCalledWith('Angular');
  });
});
