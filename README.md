# mgstructure.com

Static website for **Mega Structure Contracting & Trading Co.** — manpower supply,
heavy equipment rental, construction, and specialized mechanical & electrical
maintenance across the Kingdom of Saudi Arabia.

## Stack

Plain static HTML + CSS. No build step, no framework runtime.

- `index.html` and one `index.html` per route directory
- `_next/static/css/` — compiled stylesheet (Tailwind output)
- `assets/site.js` — ~2KB vanilla JS: scroll reveals, mega-menu, mobile nav, accordions
- `images/projects/` — project photography
- `documents/` — company profile PDF

## Deploying on Vercel

Import the repo and deploy. No framework preset is required — select
**Other / No Framework**, leave the build command empty, and set the output
directory to the repository root.

`vercel.json` handles clean URLs, trailing slashes, and long-lived caching
for static assets.

## Local preview

```bash
python3 -m http.server 8080
```

Then open <http://localhost:8080/>.

## Pages

| Route | Description |
|---|---|
| `/` | Home |
| `/about/` | Company overview, leadership, vision & mission, core values |
| `/services/` | All service lines |
| `/services/<slug>/` | 11 individual service pages |
| `/equipment/` | Equipment fleet |
| `/industries/` | Sectors served |
| `/careers/` | Talent pool CV submission |
| `/request-a-quote/` | Contact and quote request |

## Notes

- The homepage statistics (projects delivered, workforce, equipment types) are
  placeholder figures and should be confirmed before launch.
- Contact forms are markup only; they need a backend or form service wired up.
