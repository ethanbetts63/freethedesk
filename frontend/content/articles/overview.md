# Free the Desk guide publishing

This file is excluded from the public guide index. To publish a guide:

1. Add a kebab-case Markdown file to this directory, such as `dealer-website-seo.md`.
2. Start it with front matter carrying at least a publish date:

   ```
   ---
   published: 2026-09-08
   updated: 2026-09-20
   title: Dealer website SEO that actually moves stock
   description: What to fix first on a dealership site, and how to tell it worked.
   ---
   ```

   Only `published` is required, and it must be `YYYY-MM-DD`. `updated` defaults
   to the publish date. `title` and `description` override the `#` heading and
   the first paragraph, which are otherwise used for search listings.
3. Follow the front matter with one `#` heading and a plain introductory paragraph.

Dates are read from the front matter rather than the file's timestamps, because
a CI checkout gives every file the same creation time — that would date every
guide to the deploy and rewrite the sitemap on each build. A guide with a missing
or malformed `published` date fails the build rather than publishing a wrong
`datePublished` into its Article schema.

The filename becomes the root-level URL: `content/articles/dealer-website-seo.md` is published at `/dealer-website-seo` and appears automatically on `/guides` and in the sitemap.
