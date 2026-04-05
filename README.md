# Toes Down

A mobile-first "Heads Up"-style party game with fullscreen swipe controls, built-in packs, and custom pack creation.

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
2. (Optional) Create your own custom pack
3. Tap **Go fullscreen & start**
4. Have someone give you clues for the word on screen
5. Swipe **up or down** for a correct guess
6. Swipe **left or right** to skip
7. Score as many correct guesses as you can before the 60-second timer runs out

## Current Features

- Fullscreen party-play flow with swipe controls
- Mobile-optimized layouts across selection, countdown, gameplay, and results
- End-game confirmation when exiting/gesturing back during a round
- Audio feedback for correct and skip actions
- Custom pack creator (name + one prompt per line)
- Poster-style home screen branding with o_toe title treatment
- Built-in pack names rendered in Title Case
- Desktop keyboard controls (arrow keys)

## Word Packs

- **Animals** — common animals
- **Movies and Shows** — film and TV titles
- **UC Davis Trivia** — campus and Aggie-themed prompts
- **Sports** — sports and athletic activities

Custom packs are added at runtime from the home screen and merged with selected built-in packs for each game.

## Controls

| Input | Correct | Skip |
|---|---|---|
| Touch swipe (fullscreen) | Swipe up/down | Swipe left/right |
| Keyboard arrows (desktop) | Arrow up/down | Arrow left/right |

## UX Notes

- On phones, gameplay is designed for fullscreen landscape play.
- If fullscreen is interrupted, the app prompts to end or resume cleanly.
- Back gesture/navigation during a round triggers a confirmation dialog.

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

### Static Assets

Audio and image resources used by the game are in `public/resources/`.

## Deployment

Deployed via Vercel. Any push to `main` triggers an automatic redeploy.

To deploy your own instance:
1. Fork the repo
2. Import it at [vercel.com](https://vercel.com)
3. Vercel auto-detects Next.js — just click Deploy

## Adding Word Packs

Add a `.txt` file to `src/data/` with one word or phrase per line. It will automatically appear as a selectable pack.

If you want a specific display order, adjust the ordering logic in `src/utils/game.ts`.
