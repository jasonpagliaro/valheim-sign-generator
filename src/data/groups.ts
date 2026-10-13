import type { CatalogItem } from './catalog'

// Authored chest labels, separate from actual game inventory objects.
// Membership search terms are drawn only from the verified catalog.
const definitions = [
  { name: 'Wood & bark', symbol: '🪵', color: 'CCA772', match: /^(wood|finewood|corewood|ancient bark|yggdrasil wood|ashwood|timberwood)$/i, terms: ['wood types', 'logs', 'lumber', 'timber', 'bark'], note: 'One chest label for wood types and ancient bark, from ordinary wood to later-biome timber.' },
  { name: 'Hides & leather', symbol: '◆', color: 'CCA98B', match: /^(deer hide|troll hide|bear hide|wolf pelt|lox pelt|scale hide|asksvin hide|moose hide|seal pelt|leather scraps|leather straps)$/i, terms: ['hides', 'leather', 'pelts', 'skins', 'fur'], note: 'A shared label for animal hides, pelts, leather scraps, and leather straps.' },
  { name: 'Mushrooms', symbol: '🍄', color: 'E9C28D', match: /^(mushroom|yellow mushroom|jotun puffs|magecap|smoke puff|toadstool)$/i, terms: ['fungi', 'mushrooms'], note: 'Edible and crafting mushrooms across biomes. The unobtainable blue mushroom is excluded.' },
  { name: 'Berries', symbol: '●', color: 'DFA6B7', match: /^(raspberries|blueberries|cloudberries|vineberry cluster|lingonberries)$/i, terms: ['berries', 'fruit'], note: 'Food berries from the Meadows through the Deep North. Bukeperries remain a separate purge consumable.' },
  { name: 'Ores & scrap', symbol: '⛏', color: 'B9CAD5', match: /^(copper ore|tin ore|iron ore|silver ore|scrap iron|black metal scrap|copper scrap|scrap bronze|flametal ore|petrified tissue)$/i, terms: ['ores', 'scrap metal', 'smelting'], note: 'Unrefined metals and smelting materials.' },
  { name: 'Metal bars', symbol: '⛏', color: 'D5C0A2', match: /^(copper|tin|bronze|iron|silver|black metal|flametal|bloodgold)$/i, terms: ['ingots', 'metal bars', 'refined metals'], note: 'Refined metal storage; keep ores and scrap separate if that suits your workshop.' },
  { name: 'Stone & minerals', symbol: '◆', color: 'B9C4C9', match: /^(stone|rock|flint|obsidian|black marble|crystal|grausten|ice|sulfur)$/i, terms: ['rocks', 'stone', 'minerals'], note: 'Building stone, flint, obsidian, crystals, sulfur, and ice.' },
  { name: 'Gems', symbol: '◆', color: 'CBA7DF', match: /^(bloodstone|iolite|jade|ruby|amber|amber pearl|draumyx|grimvarn|solryth|veydris|crown jewel)$/i, terms: ['gemstones', 'jewels'], note: 'A broad gem and jewel label, including valuables and crafting gems.' },
  { name: 'Cores & essences', symbol: '◆', color: 'B8AFDF', match: /core$|essence$|^refined eitr$/i, terms: ['cores', 'essences'], note: 'Crafting cores, refined eitr, and essences across progression tiers.' },
  { name: 'Cloth & thread', symbol: '◆', color: 'CBAAC4', match: /^(red jute|blue jute|linen thread|flax|fenris hair|elaking hair bundle|nornathread)$/i, terms: ['fabric', 'textiles', 'cloth', 'thread'], note: 'Fabric, flax, linen thread, jute, and other textile supplies.' },
  { name: 'Bones & teeth', symbol: '☠', color: 'DAD0AB', match: /^(bone fragments|withered bone|charred bone|wolf fang|fenris claw|long claws|bonemaw tooth|vile ribcage|hard antler|asksvin (neck|pelvis|ribcage|skull)|kindled ribs)$/i, terms: ['bones', 'teeth', 'fangs', 'claws'], note: 'Animal and creature parts for crafting and offerings.' },
  { name: 'Raw meat', symbol: '🥩', color: 'DA9B8D', match: /^(?!cooked|rotten).*meat$|^(neck tail|asksvin tail|seal blubber)$/i, terms: ['meats', 'raw meat'], note: 'Uncooked meats, tails, and seal blubber. Raw fish has its own label.' },
  { name: 'Cooked meat', symbol: '🥩', color: 'D2AA7B', match: /^(cooked|smoked).*(meat|tail|blubber)$|^grilled neck tail$/i, terms: ['cooked meat', 'grilled meat'], note: 'Cooked and smoked meats kept ready for an expedition.' },
  { name: 'Vegetables', symbol: '✿', color: 'A5C980', match: /^(carrot|turnip|onion|kale|poteitr)$/i, terms: ['vegetables', 'vegetable', 'crops', 'produce'], note: 'Harvested vegetables. Seeds and prepared meals have separate labels.' },
  { name: 'Grain & flour', symbol: '✿', color: 'E3C68D', match: /^(barley|barley flour|oats|oat flour)$/i, terms: ['grains', 'flour', 'milling'], note: 'Grain and milled ingredients for the kitchen.' },
  { name: 'Food', symbol: '🍞', color: 'E6C58E', terms: ['food', 'provisions', 'rations'], note: 'A catch-all pantry or travel-food label.' },
  { name: 'Feasts', symbol: '🍞', color: 'E6B781', match: /feast/i, terms: ['feasts', 'banquet'], note: 'Prepared feasts and feast ingredients for your great hall.' },
  { name: 'Uncooked food', symbol: '🍞', color: 'D9C49F', match: /uncooked|unbaked|dough|batter|raw kale chips/i, terms: ['oven', 'baking', 'dough', 'uncooked food'], note: 'Dough, unbaked pies, and other food waiting to be cooked.' },
  { name: 'All fishing bait', symbol: '◈', color: 'ACCCA1', match: /bait/i, terms: ['bait', 'baits', 'fishing lures'], note: 'Ordinary fishing bait and every biome-specific bait in one place.' },
  { name: 'Eitr supplies', symbol: '◆', color: 'BDACDF', match: /eitr|soft tissue|^sap$|royal jelly/i, terms: ['magic', 'eitr', 'refinery'], note: 'Ingredients and refined eitr for a magic workshop.' },
  { name: 'Capes', symbol: '◆', color: 'B7B3CF', match: /cape|cloak/i, terms: ['capes', 'cloaks'], note: 'A shared label for capes and cloaks.' },
  { name: 'Bolts', symbol: '◆', color: 'C5C9A1', match: /bolt$/i, terms: ['bolts', 'crossbow ammunition'], note: 'Crossbow ammunition, with individual bolt types available separately.' },
  { name: 'Moulds & casts', symbol: '◆', color: 'AACDDF', match: /^(mould|cast):/i, terms: ['moulds', 'molds', 'casts', 'casting'], note: 'Deep North casting components, separate from the finished equipment.' },
  { name: 'Quest items', symbol: '◆', color: 'E1C27C', match: /chest|quest|hildir|bog witch/i, terms: ['quests', 'quest rewards', 'quest items'], note: 'A flexible label for quest objects and rewards; individual items remain searchable.' },
]

const existingMembership: Record<string, RegExp> = {
  Fish: /^(perch|pike|tuna|trollfish|giant herring|tetra|grouper|coral cod|anglerfish|magmafish|northern salmon|pufferfish)$/i,
  'Mead base': /mead base|barley wine base/i,
  'Healing mead': /healing mead/i,
  'Stamina mead': /stamina mead/i,
  Potions: /mead|barley wine/i,
  Arrows: /arrow$/i,
  Shields: /shield|buckler/i,
  Trophies: /trophy/i,
  Seeds: /seeds|cone$|acorns|seed poteitr/i,
  Treasure: /^(coins|amber|amber pearl|ruby|silver necklace)$/i,
  'Fishing supplies': /fish|bait|rod/i,
  'Battle idols': /battle idol/i,
  'Protection idols': /protection idol/i,
  Tools: /pickaxe|^hammer$|^hoe$|cultivator|scythe|serving tray|fishing rod/i,
}

const typeMembership: Record<string, (item: CatalogItem) => boolean> = {
  Weapons: item => /Weapon|Bow/.test(item.itemType ?? ''),
  Armor: item => ['Chest', 'Legs', 'Helmet', 'Shoulder'].includes(item.itemType ?? ''),
  Trinkets: item => item.itemType === 'Trinket',
  Food: item => item.category === 'Food & Mead' && item.itemType === 'Consumable',
  Feasts: item => !!item.prefabs?.some(prefab => /^Feast.*_Material$/.test(prefab)),
  'Cooking ingredients': item => item.category === 'Food & Mead' && item.itemType === 'Material',
}

export function withStorageGroups(items: CatalogItem[]): CatalogItem[] {
  const members = (name: string, pattern?: RegExp) => items.filter(item => !item.kind && item.status !== 'legacy' && (pattern?.test(item.alias ?? item.name) || typeMembership[name]?.(item))).map(item => item.alias ?? item.name)
  return [
    ...items.map(item => item.kind ? { ...item, searchTerms: [...(item.searchTerms ?? []), ...members(item.name, existingMembership[item.name])] } : item),
    ...definitions.map(({ name, symbol, color, match, terms, note }): CatalogItem => ({ id: `group-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, name, symbol, color, category: 'Equipment & Misc', source: 'addition', status: 'practical', kind: 'storage', searchTerms: [...terms, ...members(name, match)], note })),
  ]
}
