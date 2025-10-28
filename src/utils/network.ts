export async function parseResponse<T>(res: Response): Promise<T | undefined> {
  const ct = res.headers.get('content-type');
  if (!ct?.includes('application/json')) return undefined;
  try {
    return (await res.json()) as T;
  } catch {
    return undefined;
  }
}
