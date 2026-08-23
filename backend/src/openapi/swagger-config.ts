import { DocumentBuilder } from '@nestjs/swagger';

/**
 * One description of the API, used by the docs page and by the generator that
 * hands its schemas to the frontend.
 *
 * Shared so the two cannot drift: a document built with a different title or
 * version than the one served is a small lie, and the generated types would
 * carry it.
 */
export function buildSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle('SIAKAD API')
    .setDescription('School Academic Information System REST API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
}
