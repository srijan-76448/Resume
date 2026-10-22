import fs from "node:fs/promises";

const username = process.env.GITHUB_PROFILE_USERNAME || "srijan-76448";
const token = process.env.GITHUB_TOKEN;
if (!token) throw new Error("Missing GITHUB_TOKEN environment variable.");

const query = `
  query PinnedRepositories($login: String!) {
    user(login: $login) {
      pinnedItems(first: 6, types: REPOSITORY) {
        nodes {
          ... on Repository {
            name nameWithOwner url description updatedAt stargazerCount
            fork isArchived isTemplate
            repositoryTopics(first: 10) { nodes { topic { name } } }
          }
        }
      }
    }
  }
`;
const response = await fetch("https://api.github.com/graphql", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/vnd.github+json",
    "User-Agent": "portfolio-pinned-project-sync"
  },
  body: JSON.stringify({ query, variables: { login: username } })
});
if (!response.ok) throw new Error(`GitHub GraphQL returned HTTP ${response.status}`);
const result = await response.json();
if (result.errors?.length) throw new Error(result.errors.map(e => e.message).join("; "));
const nodes = result.data?.user?.pinnedItems?.nodes;
if (!Array.isArray(nodes)) throw new Error(`No pinnedItems data returned for ${username}`);
const payload = {
  schemaVersion: 1,
  username,
  generatedAt: new Date().toISOString(),
  source: "GitHub GraphQL user.pinnedItems",
  projects: nodes.filter(Boolean).map(repo => ({
    name: repo.name,
    repository: repo.nameWithOwner,
    url: repo.url,
    description: repo.description || "",
    updatedAt: repo.updatedAt,
    stars: repo.stargazerCount,
    fork: repo.fork,
    archived: repo.isArchived,
    isTemplate: repo.isTemplate,
    topics: (repo.repositoryTopics?.nodes || []).map(item => item.topic.name)
  }))
};
const output = new URL("../assets/github-projects.json", import.meta.url);
await fs.writeFile(output, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(`Wrote ${payload.projects.length} pinned repositories.`);
