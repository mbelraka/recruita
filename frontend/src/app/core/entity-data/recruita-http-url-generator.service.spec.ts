import { TestBed } from '@angular/core/testing';
import { HttpUrlGenerator, Pluralizer } from '@ngrx/data';

import { APP_CONFIG } from '../../config/app.config';
import { RecruitaEntityNames } from './recruita-entity-names';
import { recruitaEntityHttpResourceUrls } from './recruita-entity-http-resource-urls';
import { RecruitaHttpUrlGenerator } from './recruita-http-url-generator.service';

describe('RecruitaHttpUrlGenerator', () => {
  let generator: RecruitaHttpUrlGenerator;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RecruitaHttpUrlGenerator,
        { provide: HttpUrlGenerator, useExisting: RecruitaHttpUrlGenerator },
        Pluralizer,
      ],
    });
    generator = TestBed.inject(RecruitaHttpUrlGenerator);
  });

  it('uses collection URLs without a trailing slash', () => {
    expect(
      generator.collectionResource(RecruitaEntityNames.Applicant, '')
    ).toBe(APP_CONFIG.APPLICANTS.API.BASE_PATH);
    expect(generator.collectionResource(RecruitaEntityNames.Profile, '')).toBe(
      APP_CONFIG.PROFILE.API.BASE_PATH
    );
  });

  it('registers entity base URLs with a trailing slash for id concatenation', () => {
    const urls = (
      generator as unknown as {
        knownHttpResourceUrls: Record<
          string,
          { entityResourceUrl: string; collectionResourceUrl: string }
        >;
      }
    ).knownHttpResourceUrls;

    expect(urls[RecruitaEntityNames.Applicant]).toEqual(
      recruitaEntityHttpResourceUrls[RecruitaEntityNames.Applicant]
    );
    expect(urls[RecruitaEntityNames.Profile]).toEqual(
      recruitaEntityHttpResourceUrls[RecruitaEntityNames.Profile]
    );
  });
});
