# Dylan's website

This is my personal website.

## Local development

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Writing

Projects and Notes are MDX folders under `content/projects/` and `content/notes/`. Prefer the generators:

```bash
npm run new:note -- "Your note title"
npm run new:project -- "Your project title"
```

See [docs/authoring.md](docs/authoring.md) for frontmatter, components, drafts, and publishing.
