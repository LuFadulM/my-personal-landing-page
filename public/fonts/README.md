# Grift Font Files

Drop your Grift font files here. The dashboard looks for them at `/fonts/[filename]` at runtime.

## Easiest option — just use the Variable file

If you have **Grift Variable**, this single file covers all weights 100-900:

```
Grift-Variable.woff2
```

That's it. One file. Everything works.

## Full set (if you want every weight as a separate file)

Convert your OTF/TTF files to WOFF2 (smaller + faster) at https://cloudconvert.com/otf-to-woff2 or https://transfonter.org.

Then place them here with these **exact filenames** (case-sensitive):

| Weight | Normal | Italic |
|---|---|---|
| 100 Thin | `Grift-Thin.woff2` | `Grift-ThinItalic.woff2` |
| 200 Extra Light | `Grift-ExtraLight.woff2` | `Grift-ExtraLightItalic.woff2` |
| 300 Light | `Grift-Light.woff2` | `Grift-LightItalic.woff2` |
| 400 Regular | `Grift-Regular.woff2` | `Grift-Italic.woff2` |
| 500 Medium | `Grift-Medium.woff2` | `Grift-MediumItalic.woff2` |
| 600 Semi Bold | `Grift-SemiBold.woff2` | `Grift-SemiBoldItalic.woff2` |
| 700 Bold | `Grift-Bold.woff2` | `Grift-BoldItalic.woff2` |
| 800 Extra Bold | `Grift-ExtraBold.woff2` | `Grift-ExtraBoldItalic.woff2` |
| 900 Black | `Grift-Black.woff2` | `Grift-BlackItalic.woff2` |

(`.woff` files with the same names also work as a fallback if a browser doesn't support `.woff2`.)

## Practical recommendation

Just drop these **4 files** and you're set (covers 95% of the UI):

- `Grift-Regular.woff2` (400)
- `Grift-Medium.woff2` (500)
- `Grift-SemiBold.woff2` (600)
- `Grift-Bold.woff2` (700)

OR just the single `Grift-Variable.woff2` file.

## If files are missing

The browser silently falls back to Outfit (Google Fonts) then system fonts. The dashboard still works, just without Grift.

## Where to put them

Place them directly in this folder: `public/fonts/`

Then commit + push:

```bash
git add public/fonts/
git commit -m "Add Grift font files"
git push
```

Vercel auto-deploys and the fonts go live.
