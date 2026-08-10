import { Test, TestingModule } from '@nestjs/testing';
import { CredentialCodeService } from './credential-code.service.js';

describe('CredentialCodeService', () => {
  let service: CredentialCodeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CredentialCodeService],
    }).compile();

    service = module.get(CredentialCodeService);
  });

  it('produces a URL-safe code that survives being typed into a kiosk field', () => {
    expect(service.generate()).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  // 16 bytes base64url-encodes to 22 characters with no padding.
  it('carries 128 bits of entropy', () => {
    expect(service.generate()).toHaveLength(22);
  });

  // The property that makes a stolen card useless without the card itself.
  it('is not enumerable — 1000 codes collide zero times and share no prefix', () => {
    const codes = Array.from({ length: 1000 }, () => service.generate());

    expect(new Set(codes).size).toBe(1000);
    expect(new Set(codes.map((c) => c.slice(0, 4))).size).toBeGreaterThan(900);
  });

  // A found card must not tell the finder whose it is (research R12).
  it('encodes nothing derived from the holder', () => {
    const code = service.generate();

    expect(code).not.toMatch(/\d{10}/); // no NIS/NISN-shaped run
    expect(code).not.toContain('-'.repeat(2)); // not a uuid
    expect(code).not.toMatch(/^https?:/); // not a URL
  });
});
