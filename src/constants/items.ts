// Item definitions from Minecraft craft data
// Image paths are relative to /textures/

export interface ItemData {
  id: string;
  name: string;
  image: string;
  maxStack: number;
}

export const ITEMS: Record<string, ItemData> = {
  // Blocks
  'dirt': { id: 'dirt', name: 'Dirt', image: 'blocks/dirt.png', maxStack: 64 },
  'cobblestone': { id: 'cobblestone', name: 'Cobblestone', image: 'blocks/stone.png', maxStack: 64 },
  'stone': { id: 'stone', name: 'Stone', image: 'blocks/stonebricksmooth.png', maxStack: 64 },
  'sand': { id: 'sand', name: 'Sand', image: 'blocks/sand.png', maxStack: 64 },
  'gravel': { id: 'gravel', name: 'Gravel', image: 'blocks/gravel.png', maxStack: 64 },
  'oak_plank': { id: 'oak_plank', name: 'Oak Plank', image: 'blocks/wood.png', maxStack: 64 },
  'oak_log': { id: 'oak_log', name: 'Oak Log', image: 'blocks/tree_side.png', maxStack: 64 },
  'birch_plank': { id: 'birch_plank', name: 'Birch Plank', image: 'blocks/wood_birch.png', maxStack: 64 },
  'spruce_plank': { id: 'spruce_plank', name: 'Spruce Plank', image: 'blocks/wood_spruce.png', maxStack: 64 },
  'jungle_plank': { id: 'jungle_plank', name: 'Jungle Plank', image: 'blocks/wood_jungle.png', maxStack: 64 },
  'glass': { id: 'glass', name: 'Glass', image: 'blocks/glass.png', maxStack: 64 },
  'brick': { id: 'brick', name: 'Brick Block', image: 'blocks/brick.png', maxStack: 64 },
  'bookshelf': { id: 'bookshelf', name: 'Bookshelf', image: 'blocks/bookshelf.png', maxStack: 64 },
  'obsidian': { id: 'obsidian', name: 'Obsidian', image: 'blocks/obsidian.png', maxStack: 64 },
  'diamond_block': { id: 'diamond_block', name: 'Diamond Block', image: 'blocks/blockDiamond.png', maxStack: 64 },
  'gold_block': { id: 'gold_block', name: 'Gold Block', image: 'blocks/blockGold.png', maxStack: 64 },
  'iron_block': { id: 'iron_block', name: 'Iron Block', image: 'blocks/blockIron.png', maxStack: 64 },
  'emerald_block': { id: 'emerald_block', name: 'Emerald Block', image: 'blocks/blockEmerald.png', maxStack: 64 },
  'lapis_block': { id: 'lapis_block', name: 'Lapis Block', image: 'blocks/blockLapis.png', maxStack: 64 },
  'redstone_block': { id: 'redstone_block', name: 'Redstone Block', image: 'blocks/blockRedstone.png', maxStack: 64 },
  'coal_ore': { id: 'coal_ore', name: 'Coal Ore', image: 'blocks/oreCoal.png', maxStack: 64 },
  'iron_ore': { id: 'iron_ore', name: 'Iron Ore', image: 'blocks/oreIron.png', maxStack: 64 },
  'gold_ore': { id: 'gold_ore', name: 'Gold Ore', image: 'blocks/oreGold.png', maxStack: 64 },
  'diamond_ore': { id: 'diamond_ore', name: 'Diamond Ore', image: 'blocks/oreDiamond.png', maxStack: 64 },
  'emerald_ore': { id: 'emerald_ore', name: 'Emerald Ore', image: 'blocks/oreEmerald.png', maxStack: 64 },
  'lapis_ore': { id: 'lapis_ore', name: 'Lapis Ore', image: 'blocks/oreLapis.png', maxStack: 64 },
  'redstone_ore': { id: 'redstone_ore', name: 'Redstone Ore', image: 'blocks/oreRedstone.png', maxStack: 64 },
  'furnace': { id: 'furnace', name: 'Furnace', image: 'blocks/furnace_front.png', maxStack: 64 },
  'crafting_table': { id: 'crafting_table', name: 'Crafting Table', image: 'blocks/workbench_front.png', maxStack: 64 },
  'chest': { id: 'chest', name: 'Chest', image: 'blocks/grass_side.png', maxStack: 64 },
  'torch': { id: 'torch', name: 'Torch', image: 'blocks/torch.png', maxStack: 64 },
  'tnt': { id: 'tnt', name: 'TNT', image: 'blocks/tnt_side.png', maxStack: 64 },
  'ladder': { id: 'ladder', name: 'Ladder', image: 'blocks/ladder.png', maxStack: 64 },
  'rail': { id: 'rail', name: 'Rail', image: 'blocks/rail.png', maxStack: 64 },
  'flower': { id: 'flower', name: 'Flower', image: 'blocks/flower.png', maxStack: 64 },
  'rose': { id: 'rose', name: 'Rose', image: 'blocks/rose.png', maxStack: 64 },
  'leaves': { id: 'leaves', name: 'Leaves', image: 'blocks/leaves.png', maxStack: 64 },
  'grass': { id: 'grass', name: 'Grass Block', image: 'blocks/grass_side.png', maxStack: 64 },
  'grass_side': { id: 'grass_side', name: 'Grass Block', image: 'blocks/grass_side.png', maxStack: 64 },
  'snow': { id: 'snow', name: 'Snow', image: 'blocks/snow.png', maxStack: 64 },
  'ice': { id: 'ice', name: 'Ice', image: 'blocks/ice.png', maxStack: 64 },
  'clay': { id: 'clay', name: 'Clay Block', image: 'blocks/clay.png', maxStack: 64 },
  'pumpkin': { id: 'pumpkin', name: 'Pumpkin', image: 'blocks/pumpkin_face.png', maxStack: 64 },
  'melon': { id: 'melon', name: 'Melon', image: 'blocks/melon_side.png', maxStack: 64 },
  'cactus': { id: 'cactus', name: 'Cactus', image: 'blocks/cactus_side.png', maxStack: 64 },
  'sandstone': { id: 'sandstone', name: 'Sandstone', image: 'blocks/sandstone_side.png', maxStack: 64 },
  'nether_brick': { id: 'nether_brick', name: 'Nether Brick', image: 'blocks/netherBrick.png', maxStack: 64 },
  'glowstone': { id: 'glowstone', name: 'Glowstone', image: 'blocks/lightgem.png', maxStack: 64 },
  'quartz_block': { id: 'quartz_block', name: 'Block of Quartz', image: 'blocks/quartzblock_side.png', maxStack: 64 },

  // Tools
  'wooden_pickaxe': { id: 'wooden_pickaxe', name: 'Wooden Pickaxe', image: 'items/pickaxeWood.png', maxStack: 1 },
  'stone_pickaxe': { id: 'stone_pickaxe', name: 'Stone Pickaxe', image: 'items/pickaxeStone.png', maxStack: 1 },
  'iron_pickaxe': { id: 'iron_pickaxe', name: 'Iron Pickaxe', image: 'items/pickaxeIron.png', maxStack: 1 },
  'gold_pickaxe': { id: 'gold_pickaxe', name: 'Gold Pickaxe', image: 'items/pickaxeGold.png', maxStack: 1 },
  'diamond_pickaxe': { id: 'diamond_pickaxe', name: 'Diamond Pickaxe', image: 'items/pickaxeDiamond.png', maxStack: 1 },
  'wooden_axe': { id: 'wooden_axe', name: 'Wooden Axe', image: 'items/hatchetWood.png', maxStack: 1 },
  'stone_axe': { id: 'stone_axe', name: 'Stone Axe', image: 'items/hatchetStone.png', maxStack: 1 },
  'iron_axe': { id: 'iron_axe', name: 'Iron Axe', image: 'items/hatchetIron.png', maxStack: 1 },
  'gold_axe': { id: 'gold_axe', name: 'Gold Axe', image: 'items/hatchetGold.png', maxStack: 1 },
  'diamond_axe': { id: 'diamond_axe', name: 'Diamond Axe', image: 'items/hatchetDiamond.png', maxStack: 1 },
  'wooden_shovel': { id: 'wooden_shovel', name: 'Wooden Shovel', image: 'items/shovelWood.png', maxStack: 1 },
  'stone_shovel': { id: 'stone_shovel', name: 'Stone Shovel', image: 'items/shovelStone.png', maxStack: 1 },
  'iron_shovel': { id: 'iron_shovel', name: 'Iron Shovel', image: 'items/shovelIron.png', maxStack: 1 },
  'gold_shovel': { id: 'gold_shovel', name: 'Gold Shovel', image: 'items/shovelGold.png', maxStack: 1 },
  'diamond_shovel': { id: 'diamond_shovel', name: 'Diamond Shovel', image: 'items/shovelDiamond.png', maxStack: 1 },
  'wooden_hoe': { id: 'wooden_hoe', name: 'Wooden Hoe', image: 'items/hoeWood.png', maxStack: 1 },
  'stone_hoe': { id: 'stone_hoe', name: 'Stone Hoe', image: 'items/hoeStone.png', maxStack: 1 },
  'iron_hoe': { id: 'iron_hoe', name: 'Iron Hoe', image: 'items/hoeIron.png', maxStack: 1 },
  'gold_hoe': { id: 'gold_hoe', name: 'Gold Hoe', image: 'items/hoeGold.png', maxStack: 1 },
  'diamond_hoe': { id: 'diamond_hoe', name: 'Diamond Hoe', image: 'items/hoeDiamond.png', maxStack: 1 },
  'wooden_sword': { id: 'wooden_sword', name: 'Wooden Sword', image: 'items/swordWood.png', maxStack: 1 },
  'stone_sword': { id: 'stone_sword', name: 'Stone Sword', image: 'items/swordStone.png', maxStack: 1 },
  'iron_sword': { id: 'iron_sword', name: 'Iron Sword', image: 'items/swordIron.png', maxStack: 1 },
  'gold_sword': { id: 'gold_sword', name: 'Gold Sword', image: 'items/swordGold.png', maxStack: 1 },
  'diamond_sword': { id: 'diamond_sword', name: 'Diamond Sword', image: 'items/swordDiamond.png', maxStack: 1 },
  'bow': { id: 'bow', name: 'Bow', image: 'items/bow.png', maxStack: 1 },
  'fishing_rod': { id: 'fishing_rod', name: 'Fishing Rod', image: 'items/fishingRod.png', maxStack: 1 },
  'flint_and_steel': { id: 'flint_and_steel', name: 'Flint and Steel', image: 'items/flintAndSteel.png', maxStack: 1 },
  'shears': { id: 'shears', name: 'Shears', image: 'items/shears.png', maxStack: 1 },

  // Armor
  'leather_helmet': { id: 'leather_helmet', name: 'Leather Helmet', image: 'items/helmetCloth.png', maxStack: 1 },
  'leather_chestplate': { id: 'leather_chestplate', name: 'Leather Chestplate', image: 'items/chestplateCloth.png', maxStack: 1 },
  'leather_leggings': { id: 'leather_leggings', name: 'Leather Leggings', image: 'items/leggingsCloth.png', maxStack: 1 },
  'leather_boots': { id: 'leather_boots', name: 'Leather Boots', image: 'items/bootsCloth.png', maxStack: 1 },
  'chain_helmet': { id: 'chain_helmet', name: 'Chain Helmet', image: 'items/helmetChain.png', maxStack: 1 },
  'chain_chestplate': { id: 'chain_chestplate', name: 'Chain Chestplate', image: 'items/chestplateChain.png', maxStack: 1 },
  'chain_leggings': { id: 'chain_leggings', name: 'Chain Leggings', image: 'items/leggingsChain.png', maxStack: 1 },
  'chain_boots': { id: 'chain_boots', name: 'Chain Boots', image: 'items/bootsChain.png', maxStack: 1 },
  'iron_helmet': { id: 'iron_helmet', name: 'Iron Helmet', image: 'items/helmetIron.png', maxStack: 1 },
  'iron_chestplate': { id: 'iron_chestplate', name: 'Iron Chestplate', image: 'items/chestplateIron.png', maxStack: 1 },
  'iron_leggings': { id: 'iron_leggings', name: 'Iron Leggings', image: 'items/leggingsIron.png', maxStack: 1 },
  'iron_boots': { id: 'iron_boots', name: 'Iron Boots', image: 'items/bootsIron.png', maxStack: 1 },
  'gold_helmet': { id: 'gold_helmet', name: 'Gold Helmet', image: 'items/helmetGold.png', maxStack: 1 },
  'gold_chestplate': { id: 'gold_chestplate', name: 'Gold Chestplate', image: 'items/chestplateGold.png', maxStack: 1 },
  'gold_leggings': { id: 'gold_leggings', name: 'Gold Leggings', image: 'items/leggingsGold.png', maxStack: 1 },
  'gold_boots': { id: 'gold_boots', name: 'Gold Boots', image: 'items/bootsGold.png', maxStack: 1 },
  'diamond_helmet': { id: 'diamond_helmet', name: 'Diamond Helmet', image: 'items/helmetDiamond.png', maxStack: 1 },
  'diamond_chestplate': { id: 'diamond_chestplate', name: 'Diamond Chestplate', image: 'items/chestplateDiamond.png', maxStack: 1 },
  'diamond_leggings': { id: 'diamond_leggings', name: 'Diamond Leggings', image: 'items/leggingsDiamond.png', maxStack: 1 },
  'diamond_boots': { id: 'diamond_boots', name: 'Diamond Boots', image: 'items/bootsDiamond.png', maxStack: 1 },

  // Materials
  'stick': { id: 'stick', name: 'Stick', image: 'items/stick.png', maxStack: 64 },
  'coal': { id: 'coal', name: 'Coal', image: 'items/coal.png', maxStack: 64 },
  'diamond': { id: 'diamond', name: 'Diamond', image: 'items/diamond.png', maxStack: 64 },
  'emerald': { id: 'emerald', name: 'Emerald', image: 'items/emerald.png', maxStack: 64 },
  'iron_ingot': { id: 'iron_ingot', name: 'Iron Ingot', image: 'items/ingotIron.png', maxStack: 64 },
  'gold_ingot': { id: 'gold_ingot', name: 'Gold Ingot', image: 'items/ingotGold.png', maxStack: 64 },
  'gold_nugget': { id: 'gold_nugget', name: 'Gold Nugget', image: 'items/goldNugget.png', maxStack: 64 },
  'redstone': { id: 'redstone', name: 'Redstone', image: 'items/redstone.png', maxStack: 64 },
  'string': { id: 'string', name: 'String', image: 'items/string.png', maxStack: 64 },
  'leather': { id: 'leather', name: 'Leather', image: 'items/leather.png', maxStack: 64 },
  'feather': { id: 'feather', name: 'Feather', image: 'items/feather.png', maxStack: 64 },
  'flint': { id: 'flint', name: 'Flint', image: 'items/flint.png', maxStack: 64 },
  'bone': { id: 'bone', name: 'Bone', image: 'items/bone.png', maxStack: 64 },
  'slimeball': { id: 'slimeball', name: 'Slimeball', image: 'items/slimeball.png', maxStack: 64 },
  'clay_ball': { id: 'clay_ball', name: 'Clay', image: 'items/clay.png', maxStack: 64 },
  'brick_item': { id: 'brick_item', name: 'Brick', image: 'items/brick.png', maxStack: 64 },
  'paper': { id: 'paper', name: 'Paper', image: 'items/paper.png', maxStack: 64 },
  'book': { id: 'book', name: 'Book', image: 'items/book.png', maxStack: 64 },
  'blaze_rod': { id: 'blaze_rod', name: 'Blaze Rod', image: 'items/blazeRod.png', maxStack: 64 },
  'blaze_powder': { id: 'blaze_powder', name: 'Blaze Powder', image: 'items/blazePowder.png', maxStack: 64 },
  'ender_pearl': { id: 'ender_pearl', name: 'Ender Pearl', image: 'items/enderPearl.png', maxStack: 16 },
  'nether_star': { id: 'nether_star', name: 'Nether Star', image: 'items/netherStar.png', maxStack: 64 },
  'nether_quartz': { id: 'nether_quartz', name: 'Nether Quartz', image: 'items/netherquartz.png', maxStack: 64 },
  'gunpowder': { id: 'gunpowder', name: 'Gunpowder', image: 'items/sulphur.png', maxStack: 64 },
  'sugar': { id: 'sugar', name: 'Sugar', image: 'items/sugar.png', maxStack: 64 },
  'egg': { id: 'egg', name: 'Egg', image: 'items/egg.png', maxStack: 16 },
  'wheat': { id: 'wheat', name: 'Wheat', image: 'items/wheat.png', maxStack: 64 },
  'seeds': { id: 'seeds', name: 'Seeds', image: 'items/seeds.png', maxStack: 64 },

  // Food
  'apple': { id: 'apple', name: 'Apple', image: 'items/apple.png', maxStack: 64 },
  'golden_apple': { id: 'golden_apple', name: 'Golden Apple', image: 'items/appleGold.png', maxStack: 64 },
  'bread': { id: 'bread', name: 'Bread', image: 'items/bread.png', maxStack: 64 },
  'raw_beef': { id: 'raw_beef', name: 'Raw Beef', image: 'items/beefRaw.png', maxStack: 64 },
  'steak': { id: 'steak', name: 'Steak', image: 'items/beefCooked.png', maxStack: 64 },
  'raw_pork': { id: 'raw_pork', name: 'Raw Porkchop', image: 'items/porkchopRaw.png', maxStack: 64 },
  'cooked_pork': { id: 'cooked_pork', name: 'Cooked Porkchop', image: 'items/porkchopCooked.png', maxStack: 64 },
  'raw_chicken': { id: 'raw_chicken', name: 'Raw Chicken', image: 'items/chickenRaw.png', maxStack: 64 },
  'cooked_chicken': { id: 'cooked_chicken', name: 'Cooked Chicken', image: 'items/chickenCooked.png', maxStack: 64 },
  'raw_fish': { id: 'raw_fish', name: 'Raw Fish', image: 'items/fishRaw.png', maxStack: 64 },
  'cooked_fish': { id: 'cooked_fish', name: 'Cooked Fish', image: 'items/fishCooked.png', maxStack: 64 },
  'cookie': { id: 'cookie', name: 'Cookie', image: 'items/cookie.png', maxStack: 64 },
  'cake': { id: 'cake', name: 'Cake', image: 'items/cake.png', maxStack: 1 },
  'melon_slice': { id: 'melon_slice', name: 'Melon Slice', image: 'items/melon.png', maxStack: 64 },
  'carrot': { id: 'carrot', name: 'Carrot', image: 'items/carrots.png', maxStack: 64 },
  'potato': { id: 'potato', name: 'Potato', image: 'items/potato.png', maxStack: 64 },
  'baked_potato': { id: 'baked_potato', name: 'Baked Potato', image: 'items/potatoBaked.png', maxStack: 64 },
  'pumpkin_pie': { id: 'pumpkin_pie', name: 'Pumpkin Pie', image: 'items/pumpkinPie.png', maxStack: 64 },
  'mushroom_stew': { id: 'mushroom_stew', name: 'Mushroom Stew', image: 'items/mushroomStew.png', maxStack: 1 },

  // Misc
  'bucket': { id: 'bucket', name: 'Bucket', image: 'items/bucket.png', maxStack: 16 },
  'water_bucket': { id: 'water_bucket', name: 'Water Bucket', image: 'items/bucketWater.png', maxStack: 1 },
  'lava_bucket': { id: 'lava_bucket', name: 'Lava Bucket', image: 'items/bucketLava.png', maxStack: 1 },
  'milk_bucket': { id: 'milk_bucket', name: 'Milk Bucket', image: 'items/milk.png', maxStack: 1 },
  'bowl': { id: 'bowl', name: 'Bowl', image: 'items/bowl.png', maxStack: 64 },
  'arrow': { id: 'arrow', name: 'Arrow', image: 'items/arrow.png', maxStack: 64 },
  'minecart': { id: 'minecart', name: 'Minecart', image: 'items/minecart.png', maxStack: 1 },
  'boat': { id: 'boat', name: 'Boat', image: 'items/boat.png', maxStack: 1 },
  'saddle': { id: 'saddle', name: 'Saddle', image: 'items/saddle.png', maxStack: 1 },
  'compass': { id: 'compass', name: 'Compass', image: 'items/compass.png', maxStack: 64 },
  'clock': { id: 'clock', name: 'Clock', image: 'items/clock.png', maxStack: 64 },
  'map': { id: 'map', name: 'Map', image: 'items/map.png', maxStack: 64 },
  'sign': { id: 'sign', name: 'Sign', image: 'items/sign.png', maxStack: 16 },
  'door': { id: 'door', name: 'Wooden Door', image: 'items/doorWood.png', maxStack: 64 },
  'iron_door': { id: 'iron_door', name: 'Iron Door', image: 'items/doorIron.png', maxStack: 64 },
  'bed': { id: 'bed', name: 'Bed', image: 'items/bed.png', maxStack: 1 },
  'painting': { id: 'painting', name: 'Painting', image: 'items/painting.png', maxStack: 64 },

  // Dyes
  'white_dye': { id: 'white_dye', name: 'Bone Meal', image: 'items/dyePowder_white.png', maxStack: 64 },
  'red_dye': { id: 'red_dye', name: 'Rose Red', image: 'items/dyePowder_red.png', maxStack: 64 },
  'green_dye': { id: 'green_dye', name: 'Cactus Green', image: 'items/dyePowder_green.png', maxStack: 64 },
  'brown_dye': { id: 'brown_dye', name: 'Cocoa Beans', image: 'items/dyePowder_brown.png', maxStack: 64 },
  'blue_dye': { id: 'blue_dye', name: 'Lapis Lazuli', image: 'items/dyePowder_blue.png', maxStack: 64 },
  'purple_dye': { id: 'purple_dye', name: 'Purple Dye', image: 'items/dyePowder_purple.png', maxStack: 64 },
  'cyan_dye': { id: 'cyan_dye', name: 'Cyan Dye', image: 'items/dyePowder_cyan.png', maxStack: 64 },
  'light_gray_dye': { id: 'light_gray_dye', name: 'Light Gray Dye', image: 'items/dyePowder_silver.png', maxStack: 64 },
  'gray_dye': { id: 'gray_dye', name: 'Gray Dye', image: 'items/dyePowder_gray.png', maxStack: 64 },
  'pink_dye': { id: 'pink_dye', name: 'Pink Dye', image: 'items/dyePowder_pink.png', maxStack: 64 },
  'lime_dye': { id: 'lime_dye', name: 'Lime Dye', image: 'items/dyePowder_lime.png', maxStack: 64 },
  'yellow_dye': { id: 'yellow_dye', name: 'Dandelion Yellow', image: 'items/dyePowder_yellow.png', maxStack: 64 },
  'light_blue_dye': { id: 'light_blue_dye', name: 'Light Blue Dye', image: 'items/dyePowder_lightBlue.png', maxStack: 64 },
  'magenta_dye': { id: 'magenta_dye', name: 'Magenta Dye', image: 'items/dyePowder_magenta.png', maxStack: 64 },
  'orange_dye': { id: 'orange_dye', name: 'Orange Dye', image: 'items/dyePowder_orange.png', maxStack: 64 },
  'black_dye': { id: 'black_dye', name: 'Ink Sac', image: 'items/dyePowder_black.png', maxStack: 64 },

  // Wool
  'white_wool': { id: 'white_wool', name: 'White Wool', image: 'blocks/cloth_0.png', maxStack: 64 },
  'orange_wool': { id: 'orange_wool', name: 'Orange Wool', image: 'blocks/cloth_1.png', maxStack: 64 },
  'magenta_wool': { id: 'magenta_wool', name: 'Magenta Wool', image: 'blocks/cloth_2.png', maxStack: 64 },
  'light_blue_wool': { id: 'light_blue_wool', name: 'Light Blue Wool', image: 'blocks/cloth_3.png', maxStack: 64 },
  'yellow_wool': { id: 'yellow_wool', name: 'Yellow Wool', image: 'blocks/cloth_4.png', maxStack: 64 },
  'lime_wool': { id: 'lime_wool', name: 'Lime Wool', image: 'blocks/cloth_5.png', maxStack: 64 },
  'pink_wool': { id: 'pink_wool', name: 'Pink Wool', image: 'blocks/cloth_6.png', maxStack: 64 },
  'gray_wool': { id: 'gray_wool', name: 'Gray Wool', image: 'blocks/cloth_7.png', maxStack: 64 },
  'light_gray_wool': { id: 'light_gray_wool', name: 'Light Gray Wool', image: 'blocks/cloth_8.png', maxStack: 64 },
  'cyan_wool': { id: 'cyan_wool', name: 'Cyan Wool', image: 'blocks/cloth_9.png', maxStack: 64 },
  'purple_wool': { id: 'purple_wool', name: 'Purple Wool', image: 'blocks/cloth_10.png', maxStack: 64 },
  'blue_wool': { id: 'blue_wool', name: 'Blue Wool', image: 'blocks/cloth_11.png', maxStack: 64 },
  'brown_wool': { id: 'brown_wool', name: 'Brown Wool', image: 'blocks/cloth_12.png', maxStack: 64 },
  'green_wool': { id: 'green_wool', name: 'Green Wool', image: 'blocks/cloth_13.png', maxStack: 64 },
  'red_wool': { id: 'red_wool', name: 'Red Wool', image: 'blocks/cloth_14.png', maxStack: 64 },
  'black_wool': { id: 'black_wool', name: 'Black Wool', image: 'blocks/cloth_15.png', maxStack: 64 },

  // Mushrooms
  'brown_mushroom': { id: 'brown_mushroom', name: 'Brown Mushroom', image: 'blocks/mushroom_brown.png', maxStack: 64 },
  'red_mushroom': { id: 'red_mushroom', name: 'Red Mushroom', image: 'blocks/mushroom_red.png', maxStack: 64 },

  // Potions
  'glass_bottle': { id: 'glass_bottle', name: 'Glass Bottle', image: 'items/glassBottle.png', maxStack: 64 },
  'potion': { id: 'potion', name: 'Potion', image: 'items/potion.png', maxStack: 1 },

  // Records
  'music_disc': { id: 'music_disc', name: 'Music Disc', image: 'items/record_13.png', maxStack: 1 },
};

// Helper function to get item image URL
export function getItemImageUrl(itemId: string): string {
  const item = ITEMS[itemId];
  if (item) {
    return `/textures/${item.image}`;
  }
  return '';
}

// Helper function to get item name
export function getItemName(itemId: string): string {
  return ITEMS[itemId]?.name || itemId;
}

// Helper function to get max stack size
export function getMaxStack(itemId: string): number {
  return ITEMS[itemId]?.maxStack || 64;
}
