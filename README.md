# Toes Down

A mobile-friendly "Heads Up"-style word guessing game. Hold your phone to your forehead, tilt to answer — toes down for correct, toes up to skip.

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
2. Hold your phone up to your forehead with the screen facing out
3. Have someone give you clues for the word on screen
4. Tilt the phone **down** (toes down) when you get it correct
5. Tilt the phone **up** to skip
6. Score as many correct guesses as you can before the 60-second timer runs out

On desktop, use **Arrow Down** for correct and **Arrow Up** to skip.

## Word Packs

- **Animals** — common animals
- **Movies and Shows** — film and TV titles
- **Sports** — sports and athletic activities

## Controls

| Input | Correct | Skip |
|---|---|---|
| Gyroscope | Tilt down | Tilt up |
| Keyboard | Arrow Down | Arrow Up |

iOS requires a one-time motion sensor permission prompt on first launch.

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
