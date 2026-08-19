/**
 * Whether to hand `PrismaPg` a TLS option, decided from the connection string.
 *
 * Every adapter in this repository used to pass `ssl: { rejectUnauthorized:
 * false }` unconditionally, which is right for the managed Postgres the school
 * runs — it requires TLS — and wrong everywhere else, because passing the
 * option at all makes the driver attempt a TLS handshake. A server that does
 * not speak TLS answers with `P1011 TlsConnectionError`, which reads like a
 * certificate problem and is really "there is no TLS here at all".
 *
 * That is exactly what a throwaway Postgres in CI looks like, and it is why the
 * seed step failed the first time the end-to-end job was given a database.
 *
 * `sslmode=disable` in the URL is the standard way to say so, so this honours
 * it rather than inventing a flag. Anything else keeps the previous behaviour:
 * TLS on, certificate verification off, which is what a managed provider with
 * its own CA needs.
 */
export function pgSslOptions(
  connectionString: string | undefined,
): { ssl: { rejectUnauthorized: false } } | Record<string, never> {
  const disabled = /[?&]sslmode=disable(&|$)/i.test(connectionString ?? '');
  return disabled ? {} : { ssl: { rejectUnauthorized: false } };
}
