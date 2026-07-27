export async function resolveOnceByKey<TKey, TValue>(
  values: (TKey | undefined)[],
  resolve: (key: TKey) => Promise<TValue>,
): Promise<Map<TKey, TValue>> {
  const uniqueKeys = [...new Set(values.filter((v): v is TKey => !!v))];
  const entries = await Promise.all(
    uniqueKeys.map(async (key) => [key, await resolve(key)] as const),
  );
  return new Map(entries);
}
