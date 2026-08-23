import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../app.module.js';
import { buildSwaggerConfig } from './swagger-config.js';

/**
 * Writes the OpenAPI document the frontend generates its response types from.
 *
 * Two things about how this runs are load-bearing.
 *
 * It runs from the compiled output, never through `tsx`. Swagger reads
 * `design:type` metadata that `tsc` emits under `emitDecoratorMetadata`, and
 * esbuild — which `tsx` uses — does not emit it at all. Without it every
 * `@ApiProperty` that leaves its type implicit resolves to nothing, and the
 * build fails claiming a circular dependency on a plain `string`.
 *
 * And it creates the app in preview mode, so no provider is instantiated and
 * nothing connects to a database. The document is built from decorator
 * metadata, which is present whether or not anything is running.
 */
async function main(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    preview: true,
    logger: false,
  });

  const document = SwaggerModule.createDocument(app, buildSwaggerConfig());
  const target = resolve(process.cwd(), 'openapi.json');

  await writeFile(target, `${JSON.stringify(document, null, 2)}\n`, 'utf8');
  await app.close();

  const paths = Object.keys(document.paths ?? {}).length;
  const schemas = Object.keys(document.components?.schemas ?? {}).length;
  console.log(`openapi.json written: ${paths} paths, ${schemas} schemas`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
