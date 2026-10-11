# itembox.site

Portfolio of Leigh Atkins, full-stack developer, built as a video-game item box. The landing page is a 3D living room (three.js): a CRT, an N64, a GameCube and an Xbox 360. Pick a game off the coffee table, watch it go into its console, and the camera dives through the screen into that game, where the same projects turn up in its inventory:

| Game | Homage to | What you do |
| --- | --- | --- |
| The Legend of Leigh | Ocarina of Time | Run a 3D field cutting grass and smashing pots for rupees, open project chests, then pause for the turning menu and dungeon maps |
| Resident Developer 4 | Resident Evil 4 | Drag, rotate and organize the attaché case; command menus; the merchant |
| Fullstack 3 | Fallout 3 | A Pip-Boy with S.P.E.C.I.A.L., quests, radio and V.A.T.S., then talk to Leigh face to face |
| Super Leigh 64 | Super Mario 64 | Run around the castle hall and jump into project paintings for their stars |
| Mass Deploy 2 | Mass Effect 2 | A Citadel elevator ride with the news covering each project, then the squad screen and conversation wheel |

`/resume` is the plain version for anyone in a hurry.

All artwork is drawn for this site (SVG item icons, CSS scenes) or processed from Leigh's own photos. Sound effects are synthesised with Web Audio. Fan homages; not affiliated with Nintendo, Capcom, Bethesda or Electronic Arts.

## Where things live

- `lib/data.js`: every project, skill and link, shared by all games and the résumé
- `lib/three/room.js`: the living room, consoles and the insert animation (loaded after the page's words render)
- `lib/three/world.js`: the small third-person engine behind the Ocarina field and the Mario hall
- `themes/*.js`: one file (plus a CSS module) per game
- `lib/arcade.js`: sound, secrets, the Konami code and saved inventory order
- `components/Shelf.js`: the 2D cartridge shelf, used when WebGL is unavailable
- `public/me/`: the portraits, one style per game

There are fifteen secrets. The count shows in the top bar.

## Performance notes

- Shaders compile with `compileAsync` and textures upload a frame at a time before a 3D scene fades in, so nothing stalls on first draw.
- The room's shadows only re-render while something on the table moves.
- Game code prefetches while the browser is idle; the game faces are not preloaded on the landing page.
- CSS animations stick to transform and opacity.

## Development

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # production build
```

Next.js 14 (Pages Router), React 18, Tailwind CSS 3, deployed on Vercel.
