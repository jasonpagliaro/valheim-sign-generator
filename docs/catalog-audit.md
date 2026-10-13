# Catalog audit

Checked **October 13, 2026** against installed **Valheim 1.0.17**, Steam build **25730771**. The catalog now covers current inventory across all released biomes, including Mistlands, Ashlands and the Deep North.

## Delivered coverage

The application has **943 labels**: **893 current inventory items**, **48 authored storage groups**, and **two preserved legacy/unverified original labels**. The default shows 941 labels, including progression items. Every accepted native prefab maps to exactly one individual catalog label. Quality levels and cosmetic styles of a single item do not need extra labels.

The complete [inventory census](inventory-census.json) accounts for all **1,519 ItemDrop prefabs** found in the installed build:

| Classification | Prefabs |
| --- | ---: |
| Accepted current inventory | 893 |
| Included seasonal / entitlement items | 5 of the 893 |
| Excluded internal, legacy, duplicate or route-less objects | 615 |
| Unresolved candidates held out | 11 |

Coverage includes materials, individual weapons and armor, tools, accessories, foods and uncooked states, mead bases and finished drinks, fish and bait, trophies, quest objects, trader stock, valuables, **29 moulds**, **29 casts**, **16 idols**, **15 trinkets**, **12 caught fish species**, and **nine feast inventory items**.

## Methods and evidence

The installation was inspected read-only. Native managed type definitions and temporary UnityPy/TypeTreeGenerator tooling enumerated 1,519 ItemDrop components, 481 recipe assets and 2,560 source components with **zero parse errors**. Both ObjectDB registrations contain internal objects, so registration alone was not treated as availability. Exact English names come from installed localization; compound idol names and accents are preserved. No game graphics, fonts, models, audio or descriptive prose are redistributed.

Accepted evidence consists of actual outputs: enabled new-item recipes; cooking, smoking, baking, hardening, fermenting, smelting, refining, milling and spinning conversions; positive creature/resource/container drops; world pickups; fishing and catch rewards; collectors; trader stock; breeding eggs; starting items; and seasonally enabled recipes. Ingredients, hand-in requirements, upgrade-only recipes and NPC loadouts are not sufficient acquisition evidence. All accepted recipe/conversion inputs resolve to accepted items, with no missing dependencies. The census records each accepted ID, name, conditions, and source relationships, plus all exclusion decisions.

Key inspected file hashes:

| Relative game file | SHA-256 |
| --- | --- |
| `valheim_Data/Managed/assembly_valheim.dll` | `25a0a107dce4d834c44c2b72d0eafd5cb7793933bda81816accfa1ea9543dace` |
| `valheim_Data/resources.assets` | `64f49c5bc65aaa39f387c795169b27a43cd940f794788bdfe3e906e91704f131` |
| `valheim_Data/StreamingAssets/SoftRef/Bundles/c4210710` | `d3c9f4418ec1d841de51082b4505d5f49de11b2e0346d071c88f399427a0ec3b` |

Iron Gate's [1.0 release announcement](https://www.valheim.com/news/valheim-1-0-has-arrived-/) and [1.0.17 patch notes](https://www.valheimgame.com/news/patch-1-0-17/) establish released scope. The [1.0.15 notes](https://www.valheimgame.com/news/patch-1-0-15/) confirm current armor-mould drops. The independently generated [Jotunn item list](https://valheim-modding.github.io/Jotunn/data/objects/item-list.html) and [recipe list](https://valheim-modding.github.io/Jotunn/data/objects/recipe-list.html) are version 1.0.7 cross-checks: all 1,517 public item IDs occur in the native census. The two newer IDs are NPC attacks; the three additional native recipes produce Protector armor. Current native data takes precedence over the older snapshot.

This is a complete native census with a configured-acquisition audit. Every route has **not** been played in a live world, and complete runtime reachability across all locations, settings and saves was not simulated. Five included items have explicit seasonal or entitlement conditions. Platform/version differences remain possible; unknown candidates are documented rather than invented.

## Important decisions

- **Iron Ore** is included. Giant Herring has a positive bonus-drop entry, and `FishingFloat.Catch` consumes that table and adds the reward to inventory or drops it when full. Older unused-item lists are misleading for this build.
- **Charcoal Resin** and **Rock** have active vegetation/world-pickup sources. **Mandible** has a current Seeker Soldier drop route.
- **Kindled Ribs** is the current `FaderDrop` name; **Fader Relic** remains searchable as an alias.
- **Pointy Hat** has a Halloween recipe window of October 1–November 6. **Midsummer Crown** has a June 1–July 6 window. The normal disabled-recipe flag alone would miss them.
- **Cape of Oden**, **Hood of Oden**, and **Mead Horn of Oden** require the original beta entitlement. Their labels explicitly state this condition.
- Current canonical identities include `SwordDyrnwyn`, `TrophyFrostTroll`, `FishRaw`, and `Ectoplasm`; inactive same-name alternatives are excluded. Placed feast states use their corresponding inventory label.
- **Blue Mushroom** is excluded because Iron Gate explicitly calls it unobtainable in the [1.0.16 notes](https://www.valheimgame.com/news/patch-1-0-16/). Old Ancient Metal and Glowing Metal Ore lack current acquisition routes; the current materials are `FlametalNew` and `FlametalOreNew`.

The 615 exclusions comprise 416 NPC/internal equipment or attacks, 114 character customization objects, 53 presentation variants, 12 objects without a current acquisition route, nine placed feast states, five inactive duplicates, three developer/test objects, two legacy metals, and Blue Mushroom. No-route findings are evidence limits, not claims that old-save or developer-spawned possession is impossible.

The 11 unresolved objects are `IceShoes`, `IceSkates`, `Larva`, `MoldSmallParts`, `Pot_Shard_Red`, `LastBossGate_RuneTile`, `GenericMoldUncooked`, `SmallPartsGoldUncooked`, `TorchMist`, `TrophyDeerWhite`, and `TurretBoltBone`. Their English name tokens do not resolve. Ten also lack acquisition outputs; White Deer Trophy has a creature drop reference but no confirmed active ordinary spawn route.

## Original data and browsing categories

All **184 supplied tuples** retain their exact name, symbol, color and category. Original category counts remain **26, 29, 23, 21, 20, 7, 34, 24**. A SHA-256 unit test protects normalized source JSON: `dae042445707aab515f2f34d4f15efc9e92feddec0c1f2f738838cea12705abd`.

Corrections live in aliases: Fine wood → Finewood, Core wood → Corewood, Raw boar/deer meat → Boar/Deer Meat, Oak seeds → Acorns, Bear pelt → Bear Hide, Elder trophy → The Elder Trophy, Iron scrap → Scrap Iron, Ulve trophy → Ulv Trophy, and the full resistance-drink names. Dragon Tear is singular in this build. Plural arrow labels remain useful original chest labels and find the singular current item names.

Yagluth thing is an obsolete original; Torn Spirit is the current item. Ooze trophy remains unverified. Both originals require the legacy scope toggle. Black metal chest is an authored furniture/storage label, not an inventory item.

Eleven browsing categories cover the biomes plus Ocean, Food & Mead, and Equipment & Misc. Categories are editorial browsing homes, not exclusive location claims. Raids and fishing bonuses can put items in unexpected direct-source biomes. Original categories remain intact; individual equipment uses Equipment & Misc, while prepared meals and brewing ingredients use Food & Mead. Raw food and materials generally follow progression biomes.

## Storage groups and custom input

The Groups view offers **48 broader chest labels**. Requested group membership includes:

| Label | Included resources |
| --- | --- |
| Wood & bark | Wood, Finewood, Corewood, Ancient Bark, Yggdrasil Wood, Ashwood, Timberwood |
| Hides & leather | Deer/Troll/Bear/Scale/Asksvin/Moose hides, Wolf/Lox/Seal pelts, Leather Scraps and Leather Straps |
| Mushrooms | Mushroom, Yellow Mushroom, Jotun Puffs, Magecap, Smoke Puff, Toadstool |
| Berries | Raspberries, Blueberries, Cloudberries, Vineberry Cluster, Lingonberries |
| Fish | All 12 caught species; Raw Fish, Cooked Fish and prepared fish dishes stay separate |

Other groups include ores, metal bars, stone, gems, cores, textiles, raw/cooked meat, vegetables, flour, mead, feasts, seeds, bait, trinkets, armor, weapons, capes, ammunition, moulds/casts and quest items. Groups are clearly marked; member-name searches can find both the specific item and its broad group.

Any search can become a temporary custom sign, and a blank custom label is always available. Custom text, names and symbols are held only in React state. Reload/closing clears the draft; it is never added to the catalog, favorites, recents, local storage or session storage. Existing version 1 saved draft content is removed during preference migration. Formatting and catalog choices can still persist. JSON export and a share URL preserve text only when explicitly chosen by the user.

## Maintenance checks

Tests compare all accepted prefab IDs with actual catalog membership, enforce the complete 1,519-ID partition, protect original tuples, check late-biome and conditional families, verify requested group members, and prevent excluded identities from entering the catalog. Browser tests cover group discovery, later-biome selection, arbitrary custom text, real clipboard output, non-persistence, migration-independent preferences, and reload behavior.
