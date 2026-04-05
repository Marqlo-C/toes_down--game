# Toes Down

A mobile-friendly "Heads Up"-style word guessing game with fullscreen swipe controls.

**Live:** https://toesdown.vercel.app

## Collaborators (Google Student Developer Team):

| Name | GitHub |
|---|---|
| Marq Lott | @Marqlo-C |
| SolAbrian | @P0RTSIDE |
| J | — |
| Vespa | — |

## How to Play

1. Select one or more word packs
2. Tap **Go fullscreen & start**
3. Have someone give you clues for the word on screen
4. Swipe **up or down** for a correct guess
5. Swipe **left or right** to skip
6. Score as many correct guesses as you can before the 60-second timer runs out

## Word Packs

- **Animals** — common animals
- **Movies and Shows** — film and TV titles
- **Sports** — sports and athletic activities

## Controls

| Input | Correct | Skip |
|---|---|---|
| Touch swipe (fullscreen) | Swipe up/down | Swipe left/right |

## Tech Stack

- [Next.js 15](https://nextjs.org) (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Deployed on [Vercel](https://vercel.com)

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

Deployed via Vercel. Any push to `main` triggers an automatic redeploy.

To deploy your own instance:
1. Fork the repo
2. Import it at [vercel.com](https://vercel.com)
3. Vercel auto-detects Next.js — just click Deploy

## Adding Word Packs

Add a `.txt` file to `src/data/` with one word or phrase per line. It will automatically appear as a selectable pack.
