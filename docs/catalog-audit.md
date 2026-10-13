# Catalog audit

Audit date: **October 12, 2026**. Scope: practical storage through Plains, with Ocean and shared resources. This is a curated sign-label catalog, not an exhaustive encyclopedia of every current game object.

## Evidence and version

- Iron Gate's [1.0 release announcement](https://www.valheim.com/news/valheim-1-0-has-arrived-/) confirms the September 9, 2026 release and Deep North content. The [official 1.0.17 patch notes](https://www.valheimgame.com/news/patch-1-0-17/) are dated October 6, 2026. Delivery can differ by platform; the patch notes explicitly describe delayed platform uploads.
- The installed Steam game was inspected **read-only**: build `25730771`, with `Version.CurrentVersion` initialized as `1.0.17` in `assembly_valheim.dll`. English name evidence below comes directly from the quoted localization rows embedded in `valheim_Data/resources.assets`. Its SHA-256 is `64f49c5bc65aaa39f387c795169b27a43cd940f794788bdfe3e906e91704f131`. No game assets are redistributed by this project.
- The publicly accessible [Jotunn generated item list](https://valheim-modding.github.io/Jotunn/data/objects/item-list.html) and [recipe list](https://valheim-modding.github.io/Jotunn/data/objects/recipe-list.html) are useful reproducible cross-checks. Both identify their source version as **1.0.7**, so they are supporting extracted data rather than an assertion that every 1.0.17 object or recipe was verified.
- Iron Gate's [Call to Arms release notes on Steam](https://store.steampowered.com/news/posts/?appgroupname=Valheim&appids=892970&enddate=1758199242&feed=steam_community_announcements) confirm that bears, Viles, their materials, ghost materials, and trinkets were released in September 2025. Bear-related baseline entries must not be dismissed as modded or unreleased content.

## Baseline integrity

The user supplied **184 entries**. Every original name, Unicode symbol, color, and category must remain represented in source data. Corrections belong in separate metadata, search aliases, and explanatory notes. Additional entries must have a distinguishable origin. An optional view can hide unsuitable entries without deleting them.

| Supplied category | Entries |
| --- | ---: |
| Meadows | 26 |
| Black Forest | 29 |
| Swamp | 23 |
| Mountains | 21 |
| Plains | 20 |
| Ocean | 7 |
| Food & Mead | 34 |
| Equipment & Misc | 24 |
| **Total** | **184** |

These counts were obtained from the original three-field tuples, not inferred from a later application catalog.

## Names to explain without overwriting

The following exact English names were read from the installed 1.0.17 localization. Casing can follow the application's normal display style; source baseline fields stay unchanged.

| Preserved baseline label | Current English name / useful alias | Local evidence key |
| --- | --- | --- |
| Fine wood | Finewood | `item_finewood` |
| Core wood | Corewood | `item_roundlog` |
| Raw boar meat | Boar Meat | `item_boar_meat` |
| Raw deer meat | Deer Meat | `item_deer_meat` |
| Oak seeds | Acorns | `item_oakseeds` |
| Bear pelt | Bear Hide | `item_bjornhide` |
| Elder trophy | The Elder Trophy | `item_trophy_elder` |
| Iron scrap | Scrap Iron | `item_ironscrap` |
| Ulve trophy | Ulv Trophy | `item_trophy_ulv` |
| Poison resist mead | Poison Resistance Mead | `item_mead_poisonres` |
| Frost resist mead | Frost Resistance Mead | `item_mead_frostres` |
| Fire resist mead | Fire Resistance Barley Wine | `item_barleywine` |

**Dragon tear is not a misspelling in this build:** `item_dragontear` is `Dragon Tear`, singular. Preserve it. Raspberries, Blueberries, Cloudberries, Grilled Neck Tail, Fenris Claw, and Serpent Scale also match current localized names apart from capitalization.

Plural ammunition labels such as `Wood arrows` are useful chest labels; their singular equivalents are useful search aliases. Treat this as a display convention, not invalid game content.

## Legacy, special, and storage-label distinctions

- **Yagluth thing:** preserve as a legacy label. In the installed game, the historical `item_yagluththing` token now resolves to **Torn Spirit**. Its baseline neighbor `Torn spirit` already supplies the current name, so do not present the two as separate modern resources.
- **Ooze trophy:** retain with an **unverified/legacy** note and exclude from the practical default. The installed localization and public extracted item list contain Blob Trophy; no distinct Ooze Trophy or Oozer Trophy was found. Absence from these searches is not proof that every platform or historic version never contained one.
- **Black metal chest:** `piece_chestblackmetal` is a build-piece name. It is a valid sign label for furniture or construction supplies, not a loose resource to stockpile in a chest. A `special` or `storage label` badge is appropriate.
- **Fish:** a generic storage grouping for caught fish. Keep it separate from Raw Fish, the processed ingredient. It should not imply that all caught species have the same inventory identity.
- **Mead base, Healing mead, Stamina mead:** useful broad storage groupings. They are not precise names for one recipe or one potency. Keep the groups and offer specific variants separately.
- **Arrows, Weapons, Armor, Shields, Tools, Potions, Trophies, Treasure, Seeds, Portal supplies, Building supplies, Dungeon loot, Extra gear, Repair supplies:** intentional storage labels. They need a grouping badge, not a false "invalid item" warning.
- **Bear pelt and Bear meat:** the supplied Meadows grouping is preserved for provenance. Their Black Forest association should be explained in metadata or cross-category search; do not silently reclassify or mark them as later-biome content merely because they arrived in a newer update.

Boss trophies and progression objects warrant a separate **special / progression** filter. This includes Eikthyr Trophy, Hard Antler, The Elder Trophy, Swamp Key, Bonemass Trophy, Wishbone, Moder Trophy, Dragon Tear, Yagluth Trophy, and Torn Spirit. Ancient Seed, Withered Bone, and Dragon Egg are also useful offering/progression annotations. These classifications are editorial spoiler controls, not claims that only one copy can ever exist.

Torn Spirit is the progression bridge at the end of Plains. Hide its identity along with other special drops until the user enables that content. No other baseline entry needs to be labeled as a confirmed Mistlands, Ashlands, or Deep North resource. The user-supplied catalog should not be expanded with late-biome discoveries merely because those names are now in the game files.

## Practical gaps and additions

The names in the following list are present in the installed 1.0.17 English localization. The list is a recommendation for a compact expansion; inclusion in this document does not assert that every candidate is shipped in the application. Source data should identify additions separately from baseline tuples.

| Suggested group | Useful missing labels |
| --- | --- |
| Shared / Meadows | Feathers |
| Black Forest | Fir Cone, Pine Cone, Ectoplasm, Ghost Trophy, Bear Paw, Bear Trophy |
| Plains | Vile Ribcage, Vile Trophy, Rotten Meat |
| Special / trader | Fuling Totem, Ymir Flesh, Thunder Stone |
| Food & Mead | Bread Dough, Unbaked Lox Pie, Minor Healing Mead, Medium Healing Mead, Minor Stamina Mead, Medium Stamina Mead |
| Ocean / fishing | Perch, Pike, Tuna, Trollfish, Giant Herring, Tetra, Grouper, Coral Cod |
| Fishing supplies | Mossy Fishing Bait, Sticky Fishing Bait, Cold Fishing Bait, Stingy Fishing Bait, Heavy Fishing Bait |

The official Call to Arms notes independently confirm Bear Paw, Bear Trophy, Ectoplasm, Ghost Trophy, Vile Ribcage, and Vile Trophy. The local asset confirms their current names. Exact acquisition tables were not exhaustively extracted, so the group assignments above are editorial browsing aids rather than a claim that an item occurs exclusively in one biome.

Useful **custom storage groups** include Fishing supplies, Trinkets, Cooking ingredients, Battle idols, and Protection idols. Mark these as authored grouping labels, not exact game-object names. The generated 1.0.7 recipe data explicitly uses progression-tier battle/protection idols; a generic grouping allows storage without exposing every later tier.

Trader ingredients, feasts, additional mead bases, individual trinkets, and quest rewards remain expansion opportunities. Distinguish unlock-dependent items from ordinary gathering materials. Existence in localization alone does not establish an unlock condition or prove ordinary survival acquisition.

## Evidence limits and maintenance

This audit verifies baseline preservation requirements, current names, release status, and selected practical gaps. It does **not** claim exhaustive coverage of all 1.0.17 inventory items, all platforms, localization variants, trader gates, drop probabilities, or complete survival availability. Localization contains internal and unused objects as well as player-facing items.

Before adding a disputed item, verify both its current English name and its acquisition route. Prefer shipped game data and Iron Gate release notes; use versioned generated data as a corroborating source. Preserve originals when making corrections, and retain visible provenance for additions. Keep optional late progression and legacy content out of the initial browsing view.
