import { globSync, readFileSync } from 'node:fs';
import { join, sep } from 'node:path';

/**
 * A ratchet on endpoints that document no response shape.
 *
 * `@ApiResponse` without `type:` records a description and nothing else, so the
 * OpenAPI document says the endpoint returns an unspecified body — and anything
 * generated from it says the same. Most of this API is in that state, which is
 * why the frontend still hand-writes its response types, and why the three type
 * lies that shipped this week were caught by people rather than by a compiler.
 *
 * Naming 105 controllers would be a list nobody reads. One number is a fact
 * anybody can act on: it may fall, and it may not rise. Annotate a handler,
 * lower the ceiling, and the endpoint you fixed cannot quietly come back.
 *
 * Lowering it is the point. `pnpm --filter backend openapi:emit` rebuilds the
 * document so the schema can be seen appearing.
 */

/**
 * Handlers whose success response carries no `type:`, as of the promotion
 * endpoints being annotated. Lower it; never raise it.
 */
const UNTYPED_CEILING = 343;

interface Handler {
  controller: string;
  typed: boolean;
}

const ROUTE_DECORATOR = /^\s*@(?:Get|Post|Patch|Put|Delete)\(/;
const TYPED_SUCCESS = /@ApiResponse\(\s*\{[^)]*?status:\s*20[01][^)]*?type:/s;

export function handlersIn(source: string, controller: string): Handler[] {
  // Split at each route decorator, so a chunk is one handler: its decorator
  // block followed by its signature. Everything before `async` is the block,
  // which is where `@ApiResponse` lives — taking the whole chunk would let a
  // handler borrow the type off the one declared after it.
  const chunks = source.split(/\n(?=\s*@(?:Get|Post|Patch|Put|Delete)\()/);

  return chunks
    .filter((chunk) => ROUTE_DECORATOR.test(chunk))
    .map((chunk) => ({
      controller,
      typed: TYPED_SUCCESS.test(chunk.split('async ')[0] ?? chunk),
    }));
}

describe('endpoints document what they return', () => {
  const root = join(process.cwd(), 'src');
  const files = globSync('**/*.controller.ts', { cwd: root }).filter(
    (file) => !file.endsWith('.spec.ts'),
  );

  const handlers = files.flatMap((file) =>
    handlersIn(
      readFileSync(join(root, file), 'utf8'),
      file.split(sep).join('/'),
    ),
  );

  it('finds the controllers', () => {
    expect(files.length).toBeGreaterThan(100);
    expect(handlers.length).toBeGreaterThan(500);
  });

  it('never adds an endpoint that documents no response type', () => {
    const untyped = handlers.filter((handler) => !handler.typed);

    // A new endpoint without `type:` pushes this over. Annotating one lets the
    // ceiling come down — edit the constant in the same commit.
    expect(untyped.length).toBeLessThanOrEqual(UNTYPED_CEILING);
  });

  /**
   * Guards the guard. A matcher that recognised nothing would hold the count at
   * zero and pass for ever, so assert it reads each shape that occurs.
   */
  describe('the matcher itself', () => {
    it('counts a handler whose success response names a type', () => {
      const typed = [
        `  @Post('recommend')`,
        `  @ApiResponse({ status: 200, description: 'x', type: RecommendationDto })`,
        `  async recommend() {}`,
      ].join('\n');

      expect(handlersIn(typed, 'x.controller.ts')).toEqual([
        { controller: 'x.controller.ts', typed: true },
      ]);
    });

    it('counts one that only describes it', () => {
      const described = [
        `  @Get()`,
        `  @ApiResponse({ status: 200, description: 'List attendances' })`,
        `  async findAll() {}`,
      ].join('\n');

      expect(handlersIn(described, 'x.controller.ts')).toEqual([
        { controller: 'x.controller.ts', typed: false },
      ]);
    });

    it('counts one with no @ApiResponse at all, which is most of them', () => {
      const bare = [
        `  @Get()`,
        `  @ApiOperation({ summary: 'List attendances' })`,
        `  async findAll() {}`,
      ].join('\n');

      expect(handlersIn(bare, 'x.controller.ts')).toEqual([
        { controller: 'x.controller.ts', typed: false },
      ]);
    });

    it('does not let a handler borrow the type off the next one', () => {
      const two = [
        `  @Get()`,
        `  @ApiOperation({ summary: 'bare' })`,
        `  async findAll() {}`,
        ``,
        `  @Post()`,
        `  @ApiResponse({ status: 201, description: 'y', type: Thing })`,
        `  async create() {}`,
      ].join('\n');

      expect(handlersIn(two, 'x.controller.ts').map((h) => h.typed)).toEqual([
        false,
        true,
      ]);
    });
  });
});
