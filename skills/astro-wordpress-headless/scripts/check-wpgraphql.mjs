const wordpressUrl = process.env.WORDPRESS_URL;

if (!wordpressUrl) {
  throw new Error("WORDPRESS_URL is required");
}

const endpoint = new URL("/graphql", wordpressUrl);

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
