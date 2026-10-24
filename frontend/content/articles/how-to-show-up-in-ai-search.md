---
published: 2026-10-14
updated: 2026-10-24
title: How to Show Up in ChatGPT and AI Search Results
description: How a small business gets its website read and cited by ChatGPT, Google's AI Overviews, Copilot and Perplexity, with a checklist to work through.
---

# How to show up in ChatGPT and AI search results

More of your customers now ask an AI instead of typing a search. They ask ChatGPT who fixes hot water systems near them, or read Google's AI Overview before the links. Those answers name businesses and link to websites. The question is whether yours is one of them.

There is no secret trick to this. Google says outright that there are [no additional requirements to appear in AI Overviews or AI Mode](https://developers.google.com/search/docs/appearance/ai-features), and no special optimisation needed. Most of the work is what gets you found on Google anyway, plus a few checks most sites have never had. This guide goes through them and ends with a checklist.

## Where AI answers get their information

An AI tool has to find a page before it can quote it, and most lean on a search index:

- **Google's AI Overviews and AI Mode** use Google's own index. To be shown as a supporting link, a page must be indexed and eligible to appear in Google Search with a snippet.
- **Microsoft Copilot** runs on Bing. Bing says its search and Copilot [rely on the same crawling, indexing and ranking foundation](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a).
- **ChatGPT search** has its own crawler, OAI-SearchBot, and OpenAI says it also uses third-party search providers. For its Enterprise and Edu workspaces, OpenAI [names Bing](https://help.openai.com/en/articles/10093903-chatgpt-search-for-enterprise-and-edu) as the search engine it sends searches to.
- **Perplexity** has its own crawler, PerplexityBot, which it says exists to surface and link websites in its results.

So if your site is in Google's and Bing's indexes, and the AI crawlers are allowed in, you have covered most of the ground.

## The bare minimum: pass the PageSpeed Insights checks

Start with Google's free [PageSpeed Insights](https://pagespeed.web.dev/). Put in your home page and your main service pages. As well as the familiar scores, it now reports a category called **Agentic Browsing**, which checks how well AI agents can read and use the page. It is shown as a fraction, such as 3/3, rather than a score out of 100, and Google describes it as [experimental and still changing](https://developer.chrome.com/docs/lighthouse/agentic-browsing/scoring).

As of October 2026 it checks:

- **Accessibility tree is well-formed.** AI agents read a page the way a screen reader does, through the structure the browser builds from it. Buttons and links need names, form fields need labels, and images need descriptions. If a page is hard to use with a screen reader, it is likely hard for an agent too.
- **Cumulative Layout Shift.** Whether things jump around while the page loads.
- **llms.txt follows recommendations.** This only applies if you have an llms.txt file. No file means the check is marked not applicable. A file that returns a server error, or has no Markdown heading or links, fails.
- **WebMCP and ai-catalog.json checks.** These are for sites that let AI agents take actions, like booking or ordering, and are built on proposed standards. On most small business sites they show as not applicable, and that is fine for now.

Then the **SEO** category, where most checks are about whether a machine can read the page at all: the page isn't blocked from indexing, it returns a successful status, robots.txt is valid, it has a title and a meta description, links are crawlable and have descriptive text, images have alt text, and the canonical tag is valid. It also lists "Structured data is valid" as something to check yourself, which we cover below.

Passing won't get you quoted on its own. It means nothing on the page stops a machine reading it, which is the floor everything else stands on.

## Let the AI crawlers in

Your robots.txt file tells crawlers where they may go. Open `yourbusiness.com.au/robots.txt` in a browser and look for any of these names followed by `Disallow: /`.

Most AI companies run **separate crawlers for search and for training**, and you can treat them differently:

- **Google.** Googlebot crawls for Google Search, AI Overviews included. Google-Extended is a separate setting that controls whether your content is used to train and ground Google's Gemini models, and Google says it [does not affect inclusion or ranking in Google Search](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers).
- **OpenAI.** [OAI-SearchBot is for ChatGPT search; GPTBot is for training](https://developers.openai.com/api/docs/bots). A site that blocks OAI-SearchBot will not be shown in ChatGPT search answers. The two settings are independent, so you can block training and still appear in search.
- **Anthropic (Claude).** Claude-SearchBot crawls to improve Claude's search results, Claude-User fetches a page when someone asks Claude a question, and [ClaudeBot collects training data](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler).
- **Perplexity.** [PerplexityBot](https://docs.perplexity.ai/guides/bots) is for its search results, and Perplexity says it is not used to train AI models.
- **Bing.** Bingbot feeds Bing and Copilot. Bing lists blocking it in robots.txt as something to avoid.

Our own default on the sites we build is to let all of them in, training crawlers included, because being cited is the point. If you would rather keep your content out of AI training, block the training crawlers and leave the search ones alone.

Two other places can shut AI tools out without you knowing:

- **Your hosting or security service.** Google's advice is to make sure crawling is allowed in robots.txt "and by any CDN or hosting infrastructure". Firewalls and bot protection can block crawlers that robots.txt welcomes. Cloudflare, for one, [changed its defaults for new sites from 15 September 2026](https://blog.cloudflare.com/content-independence-day-ai-options/) to block AI training and agent bots on pages that show ads. If your site sits behind one of these services, check its bot settings.
- **Search Console.** Google added a [Search generative AI setting](https://support.google.com/webmasters/answer/16908024) under Settings. If it is set to exclude your site, your pages can't appear in AI Overviews or AI Mode. Leave it set to include your site.

## Make sure your words are in the page, not only in JavaScript

Some websites send the browser an almost empty page and build the text with JavaScript after it arrives. Google can usually handle that, but it also says [not all bots can run JavaScript](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) and that server-side rendering or pre-rendering is still a great idea. Bing is blunter: it lists hiding critical content behind client-side rendering as something to avoid.

A quick test: open one of your service pages, press Ctrl+U (or right-click and choose View Page Source), and search for a sentence you can see on the page. If the sentence is there, a crawler can read it. If the source is mostly code with none of your words in it, your content depends on JavaScript, and some AI crawlers may see a blank page.

The sites we [build](/website-development) are rendered on the server, so every page arrives with its full text.

## Get into Bing, not only Google

Most small businesses set up Google Search Console and never look at Bing. With Copilot running on Bing, and OpenAI naming Bing as the search engine behind ChatGPT in its Enterprise and Edu workspaces, that gap matters more than it used to.

- **Set up Bing Webmaster Tools.** It's free, and you can import your site and sitemaps straight from Google Search Console instead of verifying again.
- **Turn on IndexNow if your platform supports it.** [IndexNow](https://www.indexnow.org/) tells Bing and a handful of other search engines when a page is added, changed or removed, so they don't wait to find out. Google isn't one of them.
- **Claim Bing Places for Business.** It's free, and it's where you keep the address, hours and contact details Bing shows for your business up to date.

## Tell machines who you are

Structured data is a small block of code that tells search engines, in a fixed format, what your business is: name, address, phone, website, logo, opening hours and links to your other profiles. Google uses [Organization markup](https://developers.google.com/search/docs/appearance/structured-data/organization) to tell your business apart from others with similar names, and recommends the most specific LocalBusiness type that fits.

Google says you don't need special markup for its AI answers, but it is still worth having for ordinary search. Two rules matter:

- **It must match what the page shows.** Google's policies say structured data must be a true representation of the page, not hidden content.
- **It must match your Business Profile.** Same name, same phone number, same area.

Check it with Google's [Rich Results Test](https://search.google.com/test/rich-results) and the [Schema Markup Validator](https://validator.schema.org/). This is the manual check PageSpeed Insights points you to.

## Write pages that answer the question

When an AI tool picks a source, it wants a passage that answers the question plainly. Bing's guidelines say it directly: put essential information near the top, avoid long introductions, and keep each page focused on one topic. A Microsoft post on [optimising content for AI search answers](https://about.ads.microsoft.com/en/blog/post/october-2025/optimizing-your-content-for-inclusion-in-ai-search-answers) also suggests clear headings, comparison tables and question-and-answer sections.

Google says you don't need to write specially for AI or break pages into tiny pieces. Its advice is to write for your customers and offer something of your own, not repeat what every other site says. The two fit together:

- **Start each service page with the answer.** What you do, where, for whom, and roughly what it costs, in the first paragraph.
- **One page per main service.** A page covering ten services answers none of them well. Our guide on [why a business isn't showing up on Google](/business-not-showing-up-on-google) goes into this.
- **Say what only you can say.** Your prices, your process, the suburbs you actually cover, the questions customers actually ask you.

## Be the same business everywhere

AI answers pull from more than your website: your Business Profile, directories, review sites, social pages. If they disagree about your name, phone number or location, there's less reason to trust any of them. Bing asks for clear and consistent naming of businesses and places, and [Google's guide to its AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) says a Business Profile can help you appear in AI responses as well as ordinary results.

Make your business name, phone number and address or service area match exactly on your website, your Google Business Profile, Bing Places, Facebook and any directory you're listed in. Keep one Business Profile for one business, and one phone number everywhere.

## Reviews and other people talking about you

For local results, Google says [more reviews and positive ratings can help](https://support.google.com/business/answer/7091), and that how well-known a business is depends partly on how many websites link to it. Ask every happy customer for a review, reply to them, and look for real local mentions: suppliers, associations, local news, partners.

Google also warns that chasing inauthentic mentions across the web is less helpful than it might seem. A few genuine ones beat a pile of manufactured ones.

## What about llms.txt?

An llms.txt file is a plain summary of your site written for AI tools. Google says its search [ignores these files](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), so one will neither help nor harm you there, and the PageSpeed Insights check only asks whether the file works, not whether anything reads it. We add one to the sites we build because it costs almost nothing, but don't expect it to change anything by itself.

## How to check where you appear

- **Search Console's Generative AI report.** Under Performance, it shows how often links to your site were [shown in AI Overviews and AI Mode](https://support.google.com/webmasters/answer/16984139), by page, country, device and date. It has been available to all sites since 31 August 2026. It shows impressions only: no clicks, and no searches.
- **Bing Webmaster Tools' AI Performance report.** It shows how often your pages are [cited in Copilot and Bing's AI summaries](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview), and the phrases the AI used to find them. A citation is not a visit.
- **Your analytics.** Look for visits from chatgpt.com, perplexity.ai, copilot.microsoft.com and similar sites. Microsoft Clarity groups them as an AI platform channel. Some AI visits arrive without saying where they came from and are counted as direct. Visits from Google's AI Overviews and AI Mode count as ordinary Google search traffic, so they can't be picked out this way.
- **Ask the tools yourself.** Ask ChatGPT, Copilot, Perplexity and Google the questions your customers would ask, and note who gets named. Treat it as a spot check, not a measurement: the same question can get a different answer next time.

## The checklist

Work through these in order. The first two groups are usually the quickest to fix.

**The minimum**

1. PageSpeed Insights: Agentic Browsing passes on your home page and main service pages.
2. PageSpeed Insights: every SEO check passes on the same pages.

**Access**

3. robots.txt doesn't block Googlebot, Bingbot, OAI-SearchBot, Claude-SearchBot or PerplexityBot.
4. If you block training crawlers (GPTBot, ClaudeBot, Google-Extended), that's a choice you made, not an accident.
5. Your hosting, CDN or firewall isn't blocking AI crawlers that robots.txt allows.
6. Search Console's Search generative AI setting includes your site.

**Readable pages**

7. Your page text appears in View Page Source, not only after JavaScript runs.
8. Every important page is indexed in Google (Search Console's Page indexing report).
9. Your site is in Bing Webmaster Tools, with your sitemap submitted.
10. IndexNow is on, if your platform supports it.

**Who you are**

11. Organization or LocalBusiness structured data passes the Rich Results Test.
12. The structured data matches the page and your Business Profile.
13. Your name, phone number and address or area are identical across your site, Google Business Profile, Bing Places and directories.
14. One Business Profile, one phone number.

**What you say**

15. Each main service has its own page that answers the question in its first paragraph.
16. Pages say things only you can say: prices, process, area, real questions.

**Reputation**

17. You ask every happy customer for a review, and you reply.
18. You have some genuine mentions from local sites, suppliers or associations.

**Measuring**

19. You check the Generative AI report in Search Console and AI Performance in Bing Webmaster Tools.
20. Your analytics shows visits from AI platforms, and you look at which pages they land on.

## If you would like it checked for you

Our [SEO audits](/seo) check your site against the SEO fundamentals the research backs, including whether AI crawlers can reach you, read your Search Console and, from the Plus audit up, your Business Profile and analytics, and look at what AI answers say about your business. Audits start at $550, paid once. If you just want a quick read first, the free AI readiness check on our home page takes your website and email, and we send you the result.
