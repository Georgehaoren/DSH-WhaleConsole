# Original Artwork

English | [简体中文](ARTWORK.zh-CN.md)

The Preview includes AI-assisted original assets. They do not use official DeepSeek or DSH logos. The project-wide disclosure is available in [AI_DISCLOSURE.md](../AI_DISCLOSURE.md).

## Harness Engineer

An adult technical character with graphite-black hair, electric-cyan eyes, engineering uniform, Cordis cube, plugin cartridge belt, black-whale utility robot, normal human legs, and a separate horizontal whale fluke tail.

## Medium Harness Engineer

A compact, medium-proportion form between the full adult key art and the chibi form. It preserves the navy-to-cyan ponytail, oversized engineering jacket, functional harness, normal human legs, and separate horizontal whale fluke. Repeated whale badges and brand-like marks are replaced with neutral graphite hardware and abstract cyan circuit details.

Source asset: `assets/skins/harness-engineer/harness-engineer-medium-delogo-v1.png`.

## Chibi Harness Engineer

A 2.5-to-3-head-tall Q/chibi form based on the whale-tail character sheet. It keeps the character's hairstyle, equipment silhouette, whale-tail hair ornament, normal human legs, and separate whale fluke while removing repeated logos, titles, and brand marks.

The current runtime key art is based on the ChatGPT-redrawn v2 full-body illustration, with the matching v2 character sheet retained as a design reference. The earlier v1 cutout remains in the repository for provenance and comparison.

Source assets:

- `assets/skins/harness-engineer/harness-engineer-chibi-keyart-v2.png`
- `assets/skins/harness-engineer/harness-engineer-chibi-character-sheet-v2.png`
- `assets/skins/harness-engineer/harness-engineer-chibi-delogo-v1.png` (archived v1)

## Deep Sea Maid

An adult technical assistant with deep-to-light blue hair, fin-shaped ear ornaments, navy and white maid uniform, data slate, normal human legs, and a separate horizontal blue whale fluke tail.

## Application Icon

An angular black whale orbiting a luminous cyan engineering cube on a graphite macOS icon plate.

## Optional Icon Packs

AI-assisted character alternatives are stored under `assets/icon-packs`. The first anime pack includes Harness Chibi and Deep Sea Maid Chibi PNG source illustrations with matching multi-resolution macOS ICNS files. These assets are optional and do not replace the default application icon automatically.

See [Anime Extra Icon Pack](../assets/icon-packs/anime/README.md).

## Skin Thumbnails

The five skin cards use independent 1280x720 previews rendered from the real WhaleConsole interface styles and the matching original character assets. They are fixed images rather than miniature interfaces assembled inside each card, so the launcher and plugin show the same composition.

PNG source masters are stored in `packages/skins/assets/thumbnails/source`. Runtime WebP files are stored one level above and are mapped by the shared skin registry's `thumbnailKey`.

Run `pnpm artwork:thumbnails` on macOS to regenerate all five PNG masters and runtime WebP files from the shared WhaleConsole composition script.

The original PNG generations for some full-size character assets are retained outside the repository. Runtime copies are compressed WebP assets; Tauri icon derivatives are generated from the square source. The medium and chibi PNG masters are retained under `assets/skins`, and thumbnail source masters are retained with the shared skin package.

License: CC BY 4.0. Attribution: "DSH WhaleConsole contributors".
