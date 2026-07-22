// ponytail: no memoization under SSR — every request should see fresh WordPress content.
// Re-add a short TTL here if WordPress load ever becomes a problem.
export function cached<T>(_key: string, loader: () => Promise<T>): Promise<T> {
  return loader();
}
