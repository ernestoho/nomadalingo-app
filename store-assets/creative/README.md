# Creative assets — product page header & search results

Apple's App Store "creative assets" placements. Optional, but they replace the
empty "Header and search results" components on the product page.

## Files

| File | Placement | Spec |
| --- | --- | --- |
| `header-en.png` | Product page header, `en-US` | 3840 × 1646 (21:9), PNG, no alpha |
| `header-es.png` | Product page header, `es-ES` | 3840 × 1646 (21:9), PNG, no alpha |
| `search-en.png` | Search results, `en-US` | 3840 × 2560 (3:2), PNG, no alpha |
| `search-es.png` | Search results, `es-ES` | 3840 × 2560 (3:2), PNG, no alpha |

Apple also accepts a single universal 5244 × 2950 (16:9) PNG for both
placements; we use dedicated per-locale artwork instead so the headline is
translated.

## Status in App Store Connect

All four are uploaded to the app's **Asset Library**
(`category: CREATIVE_ASSETS`, state `PREPARE_FOR_SUBMISSION`).

Placements are not created yet: App Store Connect rejects placement creation
while the App Store version is `WAITING_FOR_REVIEW`
(`STATE_ERROR.INVALID_STATE`). Once 1.0 is approved, the placements can be
created against the version localizations — one placement per asset per
localization:

- `placementType: PRODUCT_PAGE_HEADER_ASSET`, `placementGroup: DEFAULT_PROFILE`
- `placementType: APP_STORE_SEARCH_RESULTS_ASSET`, `placementGroup: DEFAULT_PROFILE`

## How they were generated

HTML/CSS rendered headlessly at exact pixel sizes, using the app's real
screenshots (`02-personas`, `06-chat`) inside device frames, the brand palette
from `lib/brand.ts`, and the app's own typefaces (Bricolage Grotesque,
Plus Jakarta Sans). Text is drawn, not baked into a screenshot, so it can be
re-rendered in any language.
