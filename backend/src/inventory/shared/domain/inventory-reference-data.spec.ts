import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { glob } from 'node:fs/promises';

/**
 * Every reference row the inventory code looks up by name must be a row some
 * migration actually creates.
 *
 * The loan lifecycle does not hold ids. It asks for "the status whose role is
 * AVAILABLE" and "the transaction type coded TX-LOAN-OUT", and those strings
 * are the entire contract between the code and the database. Nothing checks
 * them: a lookup that finds nothing type-checks, builds, deploys, and fails at
 * the moment a person clicks Approve.
 *
 * Which is what happened. `20260722000000_inventory_status_system_key` added
 * the `system_key` column and left every row NULL, on the plan that an admin
 * would assign the roles through the status screen. For the transaction types
 * that plan was not merely unfollowed but impossible — inventory-web renders
 * them and offers no way to create one. The live database ended up with one
 * status carrying no role and no transaction types at all, so approve, reject
 * and return each failed on their first query.
 *
 * This sweep is syntactic on purpose: it needs no database, and it fails on the
 * mismatch rather than on the consequence. Add a lookup for a new code and the
 * suite goes red until a migration ships the row.
 */

const SRC = join(process.cwd(), 'src', 'inventory');
const MIGRATIONS = join(process.cwd(), 'prisma', 'migrations');

/** `systemKey: 'AVAILABLE'` and friends — the status role a query asks for. */
const STATUS_KEY = /systemKey:\s*'([A-Z_]+)'/g;

/** `code: 'TX-LOAN-OUT'` — the transaction type a query asks for. */
const TX_CODE = /code:\s*'(TX-[A-Z-]+)'/g;

/**
 * Comments are stripped before scanning, so a file may name a code it warns
 * about without being read as using it.
 */
function code(text: string): string {
  return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

/**
 * Enum declarations are removed before scanning, and this is the whole
 * difficulty of the check.
 *
 * `CREATE TYPE "InventoryStatusKey" AS ENUM ('AVAILABLE', …)` names every role
 * the schema permits while creating no row that holds one — which is precisely
 * the state that shipped. Searching the raw SQL would find 'AVAILABLE' there
 * and call the role present, so the sweep would have passed against the broken
 * database it exists to catch.
 */
function withoutEnumDeclarations(sql: string): string {
  return sql.replace(/CREATE\s+TYPE[\s\S]*?;/gi, '');
}

async function read(dir: string, pattern: string): Promise<string> {
  const parts: string[] = [];
  for await (const entry of glob(pattern, { cwd: dir })) {
    parts.push(await readFile(join(dir, entry), 'utf8'));
  }
  return parts.join('\n');
}

function referenced(text: string, pattern: RegExp): string[] {
  const found = new Set<string>();
  for (const match of text.matchAll(new RegExp(pattern.source, 'g'))) {
    found.add(match[1]);
  }
  return [...found].sort();
}

describe('inventory reference data exists for every code the source asks for', () => {
  let source: string;
  let migrations: string;

  beforeAll(async () => {
    source = code(await read(SRC, '**/*.ts'));
    migrations = withoutEnumDeclarations(await read(MIGRATIONS, '**/*.sql'));
  });

  it('finds the sources and the migrations', () => {
    expect(source.length).toBeGreaterThan(1000);
    expect(migrations.length).toBeGreaterThan(1000);
  });

  it('ships a status for every system role the code looks up', () => {
    const asked = referenced(source, STATUS_KEY);
    expect(asked.length).toBeGreaterThan(0);

    const unshipped = asked.filter((key) => !migrations.includes(`'${key}'`));
    expect(unshipped).toEqual([]);
  });

  it('ships a transaction type for every code the code looks up', () => {
    const asked = referenced(source, TX_CODE);
    expect(asked.length).toBeGreaterThan(0);

    const unshipped = asked.filter((code) => !migrations.includes(`'${code}'`));
    expect(unshipped).toEqual([]);
  });

  /**
   * Guards the guard. A regex that matches nothing would pass every assertion
   * above while checking nothing at all, so assert it still finds the two
   * shapes the inventory repositories actually use.
   */
  it('recognises the shapes it is looking for', () => {
    expect(
      referenced(`where: { systemKey: 'LOAN_APPROVED' }`, STATUS_KEY),
    ).toEqual(['LOAN_APPROVED']);
    expect(referenced(`where: { code: 'TX-LOAN-OUT' }`, TX_CODE)).toEqual([
      'TX-LOAN-OUT',
    ]);
  });

  /**
   * The declaration of the enum is not the creation of a row, and mistaking one
   * for the other is how this would silently stop checking anything.
   */
  it('does not count a role as shipped because the enum names it', () => {
    const declarationOnly = `CREATE TYPE "InventoryStatusKey" AS ENUM ('AVAILABLE', 'LOANED');`;

    expect(withoutEnumDeclarations(declarationOnly)).not.toContain('AVAILABLE');
    expect(
      withoutEnumDeclarations(
        `${declarationOnly}\nINSERT INTO "inventory_statuses" VALUES ('AVAILABLE');`,
      ),
    ).toContain('AVAILABLE');
  });
});
