# Studio Based Upon — Nuxt Frontend

This repository contains **only** the Nuxt frontend for the Studio Based Upon project.

- **GitHub**: https://github.com/madebyanalogue/studiobasedupon-holding.git
- **Sanity project ID**: `b6xol4su`

The Sanity Studio (`basedupon-studio`) is kept separately and is **not** part of this repository.

## Setup

```bash
npm install
cp .env.example .env
```

### Mailchimp (holding page newsletter)

Signups sync names via the embedded-form fields `MMERGE2` / `MMERGE1`. **Tags are not applied** by `post-json` alone — set `NUXT_MAILCHIMP_API_KEY` in `.env` (see `.env.example`) and restart the server. The API applies tag `3531655` (**Holding Page**), or set `NUXT_MAILCHIMP_TAG_NAME` explicitly.

## Development

```bash
npm run dev
```

Runs at `http://localhost:3000`.

## Production

```bash
npm run build
npm run preview
```
