# CityMate Grenoble

Source for CityMate’s visitor app. Private place data and generated build output are intentionally not included in this public repository.

## Run locally

Before running or building the app, obtain the private data modules and place them at `src/lib/placesData.js` and `src/lib/placesRichData.js`. These files are excluded from Git, and the app cannot build without them.

With Node.js 22.12 or newer installed, run:

```sh
npm ci
npm run dev
```

For a production build, run `npm run build`, then `node serve.mjs`. OpenStreetMap tiles and external links use the internet. Near Me uses the device’s position after you grant permission. The app falls back to distance estimates from Grenoble École de Management when location is unavailable.

## Try the main flows

- Search for **Apna Market** and open its details to see the address, hours, phone, and directions link.
- Use the category chips and sort menu to change the places in the list and on the map.
- Choose **First 48h**, check off a place, and reload to confirm that its status persists.
- Use **Near Me** to recenter the map and sort nearby places. On a narrow screen, use the bottom bar to switch between the map, list, and search.
- Submit a message through **Feedback**. The local app confirms the save and keeps the submission in the current browser. You can inspect it under `citymate_local_feedback_v1` in the browser’s local storage. Checklist progress is stored under `pp_completed_v2`.

## Build

```sh
npm ci
npm run build
```

Vite prints the development address. `npm run build` regenerates `dist/` for `node serve.mjs`.

## Source layout

| Path | Contents |
| --- | --- |
| `src/pages/Home.jsx` | Search, filters, sorting, location, responsive layout, and checklist state |
| `src/components/map/` | Leaflet map, markers, cards, and detail drawer |
| `src/lib/placesData.js` and `src/lib/placesRichData.js` | Original static place records and details |
| `src/components/feedback/` | Feedback form and confirmation |
| `src/api/base44Client.js` | Local feedback storage and session analytics adapter |
| `dist/` | Production build served on the loopback address |

Base44’s app editor, hosted authentication, dashboard, and central analytics are platform services. This local build opens directly as a visitor. Feedback and checklist progress are scoped to the local browser profile and origin, and analytics stay in the current browser tab’s session storage.
