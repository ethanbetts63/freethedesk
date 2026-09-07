# Free the Desk guide publishing

This file is excluded from the public guide index. To publish a guide:

1. Add a kebab-case Markdown file to this directory, such as `dealer-website-seo.md`.
2. Begin the file with one `#` heading and a plain introductory paragraph.
3. Add its search title, description and publish date to `src/lib/articleMeta.ts`.

The filename becomes the root-level URL: `content/articles/dealer-website-seo.md` is published at `/dealer-website-seo` and appears automatically on `/guides` and in the sitemap.
