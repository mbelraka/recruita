import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import {
  TranslateFakeLoader,
  TranslateLoader,
  TranslateModule,
} from '@ngx-translate/core';

import { StateFeatures } from 'src/app/containers/root/enums/state-features.enum';
import { Languages } from 'src/app/enums/language.enum';
import { initialAppState } from 'src/app/state/app.reducer';
import { SharedModule } from 'src/app/shared/shared.module';
import { ExportComponent } from './export.component';
import { ExportFormats } from '../../enums/export-formats.enum';
import { exportApplicants } from '../../state/export.actions';

describe('ExportComponent', () => {
  let component: ExportComponent;
  let fixture: ComponentFixture<ExportComponent>;
  let store: Store;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExportComponent],
      imports: [
        SharedModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader },
        }),
      ],
      providers: [
        provideMockStore({
          initialState: {
            app: { ...initialAppState, language: Languages.English },
            [StateFeatures.Export]: { loading: false, error: null },
          },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExportComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(Store);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch exportApplicants for the selected format', () => {
    const dispatchSpy = spyOn(store, 'dispatch');

    component.export(ExportFormats.PDF);

    expect(dispatchSpy).toHaveBeenCalledWith(
      exportApplicants({ format: ExportFormats.PDF })
    );
  });
});
