import { Injectable } from '@angular/core';

import { DefaultHttpUrlGenerator, Pluralizer } from '@ngrx/data';

import { recruitaEntityHttpResourceUrls } from './recruita-entity-http-resource-urls';

/** Maps NgRx Data entity names to Recruita REST collection paths. */
@Injectable({ providedIn: 'root' })
export class RecruitaHttpUrlGenerator extends DefaultHttpUrlGenerator {
  public constructor(pluralizer: Pluralizer) {
    super(pluralizer);
    this.registerHttpResourceUrls(recruitaEntityHttpResourceUrls);
  }
}
