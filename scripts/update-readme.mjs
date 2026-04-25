import { readFile, writeFile } from "node:fs/promises";

const username = "wjb127";
const repos = [
  {
    name: "codex-image",
    description:
      "Claude Code skill for AI image generation via Codex CLI OAuth. No API key needed.",
  },
  {
    name: "claude-smart-clear",
    description:
      "Save recent Claude Code context, run `/clear`, and restore the session without losing the thread.",
  },
  {
    name: "local-gemma-agent",
    description:
      "Local AI agent example powered by Ollama and Gemma, designed to run without external API keys.",
  },
  {
    name: "one-min-startup-kit",
    description:
      "AI-assisted MVP testing kit with landing page generation, fake checkout, lead capture, and analytics.",
  },
  {
    name: "nextjs-weight-calendar",
    description:
      "Mobile-first weight tracking app built with Next.js, Supabase, charts, and calendar UX.",
  },
  {
    name: "sysmon-gui",
    description:
      "macOS system monitor desktop app built with Tauri, React, and TypeScript.",
  },
];

const token = process.env.GITHUB_TOKEN;
const headers = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

if (token) {
  headers.Authorization = `Bearer ${token}`;
}

async function getStars(repo) {
  const response = await fetch(`https://api.github.com/repos/${username}/${repo}`, {
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${repo}: ${response.status}`);
  }

  const data = await response.json();
  return data.stargazers_count ?? 0;
}

const rows = await Promise.all(
  repos.map(async (repo) => ({
    ...repo,
    stars: await getStars(repo.name),
  })),
);

const today = new Date().toISOString().slice(0, 10);
const block = `${rows
  .map(
    (repo) => `### [${repo.name}](https://github.com/${username}/${repo.name}) ⭐ ${repo.stars}
${repo.description}`,
  )
  .join("\n\n")}

⭐ Star counts update daily via GitHub Actions · last sync: \`${today}\``;

const readme = await readFile("README.md", "utf8");
const nextReadme = readme.replace(
  /<!-- HIGHLIGHTS:START -->[\s\S]*<!-- HIGHLIGHTS:END -->/,
  `<!-- HIGHLIGHTS:START -->\n${block}\n<!-- HIGHLIGHTS:END -->`,
);

await writeFile("README.md", nextReadme);
