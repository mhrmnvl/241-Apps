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

  /**
   * A found card must not tell the finder whose it is (research R12).
   *
   * Proved from the signature rather than by inspecting a sample. `generate`
   * takes no arguments, so there is nothing about the holder for it to encode
   * — that is the guarantee, and it holds for every call rather than for the
   * one this test happened to draw.
   *
   * The sampled version asserted the code contained no `--`, meaning "not a
   * uuid". base64url includes `-`, so a random 22-character code carries `--`
   * roughly once in sixty, and this suite failed that often for a reason that
   * had nothing to do with the property being tested. Its sibling assertions
   * were a ten-digit run — the same trap, rarer — and a `https?:` prefix, which
   * base64url cannot produce at all.
   */
  it('takes nothing about the holder, so it can encode nothing about them', () => {
    expect(service.generate).toHaveLength(0);
  });

  it('draws again for the same holder rather than deriving twice', () => {
    expect(service.generate()).not.toBe(service.generate());
  });
});
