import { readFile, writeFile } from "node:fs/promises";

const username = "wjb127";
// 큐레이션 목록. 렌더 순서는 여기 순서가 아니라 스타순 자동 정렬(아래) — 스타 많은 게 항상 위로.
const repos = [
  {
    name: "codex-image",
    description:
      "Claude Code skill for AI image generation via Codex CLI OAuth. No API key needed.",
  },
  {
    name: "claude-mem",
    description:
      "Per-project external memory for Claude Code. 8KB markdown chapters, recall by keyword to save context window.",
  },
  {
    name: "agy-image",
    description:
      "Claude Code skill for AI image generation via Antigravity CLI (Gemini). Google OAuth, no API key.",
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

// 스타 내림차순 정렬 → 1위는 히어로로 크게, 나머지는 접어서(details) 노출.
// ⭐ 0 은 아예 렌더하지 않는다 (0을 보여줄 이유가 없고, 대표작 광채만 깎아먹음).
const sorted = [...rows].sort((a, b) => b.stars - a.stars);
const star = (n) => (n > 0 ? ` ⭐ ${n}` : "");
const link = (repo) => `[${repo.name}](https://github.com/${username}/${repo.name})`;

const [hero, ...rest] = sorted;
const heroBlock = `### ${link(hero)}${star(hero.stars)}
${hero.description}`;

const restBlock = rest.length
  ? `

<details>
<summary><b>More projects</b> (${rest.length})</summary>

${rest.map((repo) => `- **${link(repo)}**${star(repo.stars)} — ${repo.description}`).join("\n")}

</details>`
  : "";

const today = new Date().toISOString().slice(0, 10);
const block = `${heroBlock}${restBlock}

⭐ Star counts update daily via GitHub Actions · last sync: \`${today}\``;

const readme = await readFile("README.md", "utf8");
const nextReadme = readme.replace(
  /<!-- HIGHLIGHTS:START -->[\s\S]*<!-- HIGHLIGHTS:END -->/,
  `<!-- HIGHLIGHTS:START -->\n${block}\n<!-- HIGHLIGHTS:END -->`,
);

await writeFile("README.md", nextReadme);
