# itembox.site

Portfolio of Leigh Atkins, full-stack developer, built as a video-game item box. Pick a game from the shelf and the same projects turn up in that game's inventory:

| Game | Homage to | What you do |
| --- | --- | --- |
| The Legend of Leigh | Ocarina of Time | Turn the pause menu, equip items to C buttons, read each project as a dungeon map |
| Resident Developer 4 | Resident Evil 4 | Drag items around the attaché case, rotate them with R, find the merchant |
| Fullstack 3 | Fallout 3 | Browse the wrist terminal: S.P.E.C.I.A.L., quests, radio, V.A.T.S. |
| Super Leigh 64 | Super Mario 64 | Jump into project paintings, collect stars, stretch Leigh's face |
| Mass Deploy 2 | Mass Effect 2 | Dossier, powers and a conversation wheel |

`/resume` is the plain version for anyone in a hurry.

All artwork is drawn for this site (SVG item icons, CSS scenes) or processed from Leigh's own photos. Sound effects are synthesised with Web Audio. Fan homages; not affiliated with Nintendo, Capcom, Bethesda or Electronic Arts.

## Where things live

- `lib/data.js`: every project, skill and link, shared by all games
- `lib/arcade.js`: sound, secrets, the Konami code and saved inventory order
- `themes/*.js`: one file (plus a CSS module) per game
- `components/Shelf.js`: the cartridge shelf on the landing page
- `public/me/`: the portraits, one style per game

There are eleven secrets. The count shows in the top bar.

## Development

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # production build
```

Next.js 14 (Pages Router), React 18, Tailwind CSS 3, deployed on Vercel.
