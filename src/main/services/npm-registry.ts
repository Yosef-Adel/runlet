import type { NpmSearchResult } from '../../shared/types';

const REGISTRY_URL = 'https://registry.npmjs.org';

export async function searchPackages(query: string, limit = 20): Promise<NpmSearchResult[]> {
  const url = `${REGISTRY_URL}/-/v1/search?text=${encodeURIComponent(query)}&size=${limit}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`NPM registry search failed: ${response.statusText}`);
  }

  const data = (await response.json()) as {
    objects: Array<{
      package: {
        name: string;
        version: string;
        description: string;
        keywords?: string[];
      };
    }>;
  };

  return data.objects.map((obj) => ({
    name: obj.package.name,
    version: obj.package.version,
    description: obj.package.description ?? '',
    keywords: obj.package.keywords ?? [],
  }));
}
