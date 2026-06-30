# WPGraphQL Strategy And Validation

Use this reference when the project might benefit from WPGraphQL, needs strongly typed nested WordPress data, or must prove that the headless data contract is stable and performant.

## Decision Rule

Start with REST for simple data. Use WPGraphQL when it removes real complexity.

Choose REST when:
- One endpoint returns the needed data with `_fields`.
- The project uses custom normalized endpoints such as `headless/v1/site`.
- The route is simple, public, and trivially cacheable.
- The team does not want another WordPress plugin or GraphQL schema maintenance.

Choose WPGraphQL when:
- REST needs several requests for one page.
- The route needs posts plus authors plus media plus categories plus menus.
- SCF/ACF shapes need stronger schema guarantees.
- The component model benefits from fragments that mirror Astro props.
- Cursor pagination is better than page-number pagination for the dataset.
- GraphiQL/schema introspection improves developer confidence during development.

Keep both when useful: REST for custom normalized operational endpoints, WPGraphQL for rich content graph reads.

## WordPress Setup

Install and enable WPGraphQL. For custom post types and taxonomies, expose them explicitly.

```php
register_post_type('product', [
  'public' => true,
  'show_in_rest' => true,
  'show_in_graphql' => true,
  'graphql_single_name' => 'Product',
  'graphql_plural_name' => 'Products',
  'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'revisions'],
]);

register_taxonomy('product_category', ['product'], [
  'public' => true,
  'show_in_rest' => true,
  'show_in_graphql' => true,
  'graphql_single_name' => 'ProductCategory',
  'graphql_plural_name' => 'ProductCategories',
]);
```

For SCF/ACF, use the maintained GraphQL integration available for the field plugin stack and verify the fields appear in GraphiQL before writing Astro queries.

## Astro GraphQL Client

```ts
// src/lib/wordpress-graphql.ts
const WP_URL = import.meta.env.WORDPRESS_URL;

if (!WP_URL) {
  throw new Error("WORDPRESS_URL is required");
}

type GraphQLError = {
  message: string;
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: GraphQLError[];
};

export async function wpGraphQL<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const response = await fetch(new URL("/graphql", WP_URL), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`WPGraphQL request failed: ${response.status}`);
  }

  const payload = await response.json() as GraphQLResponse<T>;

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join("; "));
  }

  if (!payload.data) {
    throw new Error("WPGraphQL response did not include data");
  }

  return payload.data;
}
```

Keep GraphQL calls server-side in Astro unless the browser truly needs live client querying.

## Query Example

Use one route query that mirrors the page requirements.

```ts
import { wpGraphQL } from "./wordpress-graphql";

type BlogIndexQuery = {
  posts: {
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
    nodes: Array<{
      id: string;
      databaseId: number;
      slug: string;
      title: string;
      date: string;
      author?: {
        node?: {
          name: string;
        };
      };
      featuredImage?: {
        node?: {
          sourceUrl: string;
          altText: string;
          mediaDetails?: {
            width?: number;
            height?: number;
          };
        };
      };
    }>;
  };
};

const BLOG_INDEX_QUERY = /* GraphQL */ `
  query BlogIndex($first: Int!, $after: String) {
    posts(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        databaseId
        slug
        title
        date
        author {
          node {
            name
          }
        }
        featuredImage {
          node {
            sourceUrl
            altText
            mediaDetails {
              width
              height
            }
          }
        }
      }
    }
  }
`;

export function getBlogIndex(after?: string) {
  return wpGraphQL<BlogIndexQuery>(BLOG_INDEX_QUERY, {
    first: 20,
    after: after ?? null,
  });
}
```

## Component Fragments

Use fragments to keep queries aligned with Astro component props.

```graphql
fragment HeroBlockFields on AcfHero {
  eyebrow
  title
  summary
  variant
  tone
  showCta
  ctaLabel
  ctaUrl
}
```

Rules:
- Fragments should map to one Astro component or one shared data type.
- Include `id` and `databaseId` for cache identity and debugging.
- Avoid querying deeply nested relationships unless the route renders them.
- Split optional heavy data into a second query or use GraphQL directives such as `@include`.

## Cursor Pagination

```ts
export async function getAllPostSlugs() {
  const slugs: string[] = [];
  let after: string | null = null;

  do {
    const result = await wpGraphQL<{
      posts: {
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
        nodes: Array<{ slug: string }>;
      };
    }>(
      `query PostSlugs($after: String) {
        posts(first: 100, after: $after) {
          pageInfo { hasNextPage endCursor }
          nodes { slug }
        }
      }`,
      { after },
    );

    slugs.push(...result.posts.nodes.map((post) => post.slug));
    after = result.posts.pageInfo.endCursor;

    if (!result.posts.pageInfo.hasNextPage) {
      after = null;
    }
  } while (after);

  return slugs;
}
```

## Caching

For build-time SSG:
- Cache repeated GraphQL calls in module-level promises.
- Keep query strings stable.
- Rebuild on WordPress publish/update/delete.

For runtime SSR:
- Prefer GET or persisted operations only for public read-only queries when the stack supports CDN caching.
- Use POST for authenticated preview and mutations.
- Consider WPGraphQL Smart Cache when the site needs edge caching and tag-based invalidation.
- Never cache draft, preview, authenticated, or user-specific GraphQL responses in public caches.

## Security

GraphQL is powerful, so keep it deliberately bounded.

- Keep public introspection disabled in production unless there is a clear reason to expose it.
- Keep GraphiQL/admin tooling restricted to authenticated WordPress users.
- Use authentication only server-side for previews, drafts, private content, or mutations.
- Do not expose JWTs, application passwords, cookies, or nonces in public Astro bundles.
- Avoid public mutations unless the endpoint has a real abuse-prevention strategy.
- Watch nested query depth and expensive fields; split queries when a page starts asking for too much.
- Keep WPGraphQL and extensions updated.

## Validation Gates

Use these checks to guarantee the integration works instead of trusting the architecture.

Project setup:
- `/graphql` responds in the target environment.
- Required post types/taxonomies appear in the schema.
- SCF/ACF fields appear in GraphiQL with expected names and types.
- Public introspection setting is deliberate for the environment.

Contract checks:
- Keep critical GraphQL operations in files or constants, not inline strings scattered across pages.
- Add a smoke script that executes core operations against staging: site settings, route slugs, one page by slug, one post by slug, menus, and a representative custom block page.
- Fail CI or deployment if any operation returns GraphQL errors.
- Validate response shape with TypeScript types plus a runtime parser when the data controls layout-critical components.

Performance checks:
- Compare REST and GraphQL for any route being migrated.
- Record request count, transferred bytes, TTFB, and total build time.
- GraphQL wins only if it reduces roundtrips, payload, or contract risk without creating a slower resolver.
- Use production-like content volume when testing.

Preview checks:
- Draft preview uses authenticated server-side GraphQL.
- Preview response uses `Cache-Control: no-store`.
- Preview route renders the same Astro component registry as production.

## Minimal Smoke Script

```js
// scripts/check-wpgraphql.mjs
const endpoint = new URL("/graphql", process.env.WORDPRESS_URL);

const query = `
  query Smoke {
    generalSettings {
      title
      description
    }
    posts(first: 1) {
      nodes {
        id
        databaseId
        slug
        title
      }
    }
  }
`;

const response = await fetch(endpoint, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query }),
});

if (!response.ok) {
  throw new Error(`GraphQL HTTP ${response.status}`);
}

const payload = await response.json();

if (payload.errors?.length) {
  throw new Error(payload.errors.map((error) => error.message).join("; "));
}

if (!payload.data?.generalSettings?.title) {
  throw new Error("Missing generalSettings.title");
}

console.log("WPGraphQL smoke check passed");
```

Run before deployment when GraphQL is part of the data path:

```bash
WORDPRESS_URL=https://cms.example.com node scripts/check-wpgraphql.mjs
```

## Common Failure Modes

- Adopting GraphQL but still querying too much nested data.
- Leaving operations scattered inline, making contract changes hard to audit.
- Assuming GraphQL is faster without measuring the real page.
- Forgetting to expose CPTs with `show_in_graphql`.
- GraphQL field names drifting from SCF/ACF field configuration.
- Caching authenticated preview responses.
- Depending on public introspection in production builds.

