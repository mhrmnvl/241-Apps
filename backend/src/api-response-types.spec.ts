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
 * Handlers that owe a response type. Lower it; never raise it.
 *
 * 343 → 274 of that was correcting the count, not paying it down: 69 handlers
 * answer 204 and have no body to describe, and the first version of this called
 * them debt. A ratchet measuring the wrong thing is worse than none — that one
 * could have been satisfied by annotating deletes.
 *
 * 274 → 263 is the gate devices and the presence cards, whose response DTOs
 * already existed and matched their handlers' return types one for one.
 */
const UNTYPED_CEILING = 263;

interface Handler {
  controller: string;
  typed: boolean;
}

const ROUTE_DECORATOR = /^\s*@(?:Get|Post|Patch|Put|Delete)\(/;
const TYPED_SUCCESS = /@ApiResponse\(\s*\{[^)]*?status:\s*20[01][^)]*?type:/s;

/**
 * A handler that answers 204 has nothing to type, whether it says so through
 * `@ApiResponse` or through `@HttpCode`.
 */
const NO_CONTENT =
  /@ApiResponse\(\s*\{[^)]*?status:\s*204|@HttpCode\(\s*(?:HttpStatus\.NO_CONTENT|204)\s*\)/s;

export function handlersIn(source: string, controller: string): Handler[] {
  // Split at each route decorator, so a chunk is one handler: its decorator
  // block followed by its signature. Everything before `async` is the block,
  // which is where `@ApiResponse` lives — taking the whole chunk would let a
  // handler borrow the type off the one declared after it.
  const chunks = source.split(/\n(?=\s*@(?:Get|Post|Patch|Put|Delete)\()/);

  return chunks
    .filter((chunk) => ROUTE_DECORATOR.test(chunk))
    .map((chunk) => {
      const block = chunk.split('async ')[0] ?? chunk;
      return {
        controller,
        typed: TYPED_SUCCESS.test(block) || NO_CONTENT.test(block),
      };
    });
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

    it('asks nothing of a handler that answers 204', () => {
      const deleted = [
        `  @Delete(':id')`,
        `  @ApiResponse({ status: 204, description: 'Permission deleted' })`,
        `  async remove() {}`,
      ].join('\n');

      expect(handlersIn(deleted, 'x.controller.ts')).toEqual([
        { controller: 'x.controller.ts', typed: true },
      ]);
    });

    it('accepts 204 declared through @HttpCode instead', () => {
      const deleted = [
        `  @Delete(':id')`,
        `  @HttpCode(HttpStatus.NO_CONTENT)`,
        `  async remove() {}`,
      ].join('\n');

      expect(handlersIn(deleted, 'x.controller.ts')).toEqual([
        { controller: 'x.controller.ts', typed: true },
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
