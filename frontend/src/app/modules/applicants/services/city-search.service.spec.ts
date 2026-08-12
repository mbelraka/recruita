import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { Languages } from '../../../enums/language.enum';
import { CitySearchService } from './city-search.service';

describe('CitySearchService', () => {
  let service: CitySearchService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CitySearchService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(CitySearchService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('returns empty results for short queries', async () => {
    const labels = await firstValueFrom(
      service.searchCityLabels('z', Languages.English)
    );
    expect(labels).toEqual([]);
  });

  it('caches repeated geocode queries', async () => {
    const first = firstValueFrom(
      service.searchCityLabels('Zurich', Languages.English)
    );
    const req = httpMock.expectOne((request) =>
      request.url.includes('geocoding-api.open-meteo.com')
    );
    req.flush({ results: [{ name: 'Zurich', country: 'Switzerland' }] });
    await expectAsync(first).toBeResolvedTo(['Zurich, Switzerland']);

    const second = await firstValueFrom(
      service.searchCityLabels('Zurich', Languages.English)
    );
    httpMock.expectNone((request) =>
      request.url.includes('geocoding-api.open-meteo.com')
    );
    expect(second).toEqual(['Zurich, Switzerland']);
  });
});
