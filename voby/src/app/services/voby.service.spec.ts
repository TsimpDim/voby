import { TestBed } from '@angular/core/testing';

import { VobyService } from './voby.service';

describe('VobyService', () => {
  let service: VobyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VobyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
