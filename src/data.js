import {
  BLUEPRINTS,
  CONTENT_COUNTS,
  CROPS,
  DEVICES,
  ENEMIES,
  EQUIPMENT,
  FACILITIES,
  FULL_ITEMS,
  FULL_RECIPES,
  FURNITURE,
  INITIAL_BLUEPRINT_IDS,
  LIVESTOCK,
  LIVESTOCK_FEED_STAMINA_COST
} from "./content.js";
import { NPC_CONTENT } from "./npc-content.js";
import { BLUEPRINT_DESCRIPTIONS, ITEM_DESCRIPTIONS } from "./item-descriptions.js";
import { scopeStorageKey } from "./storage-scope.js";

export const SAVE_KEY = scopeStorageKey("dropped-into-survival-save");
export const ROLLBACK_KEY = scopeStorageKey("dropped-into-survival-rollback");
export const LEGACY_SAVE_KEYS = ["dropped-into-survival-save-v7", "dropped-into-survival-save-v6"].map(key => scopeStorageKey(key));
export const LEGACY_ROLLBACK_KEYS = ["dropped-into-survival-rollback-v7", "dropped-into-survival-rollback-v6"].map(key => scopeStorageKey(key));
export const WILD_SEED_DROP_CHANCES = Object.freeze({ crop: 0.1, tree: 0.1 });
export const CULTIVATED_SEED_DROP_CHANCE = 0.01;
export const GRASSLAND_HERB_CHANCE = 0.05;
export const HERB_SEED_REPLACEMENT_CHANCE = 0.1;
export const KAYAK_REQUIRED_AREAS = Object.freeze(new Set(["A7", "B6", "B7", "C7", "D7"]));

const CHARACTER_NAMES = [
  "匿名用户9527", "修仙是不可能的", "大漠孤烟直直直", "代码敲碎求生路", "铁血硬汉不流泪", "深海里的猫",
  "宇宙大烟花", "墨染青衫", "云端漫步者", "千面狐", "晨曦", "深渊凝视者", "木匠王师傅", "贫僧法号能吃",
  "重度火力不足恐惧症", "今夜不收税", "猫薄荷种植户", "考研不考求生", "云织", "熬夜掉头发", "张奶奶",
  "夭夭", "不服老的老兵", "隔壁王叔叔", "甜心软糖（已黑化）", "我真的是欧皇", "泡面没有调料包"
];

export const CHARACTERS = CHARACTER_NAMES.map((name, index) => ({
  id: `npc_${String(index + 1).padStart(2, "0")}`,
  name,
  avatarFile: `${String(index + 1).padStart(2, "0")}.gif`
}));
for (const character of CHARACTERS) Object.assign(character, NPC_CONTENT.find((entry) => entry.id === character.id));

const FIRST_CYCLE_TEMPERATURES = [
  // 1–9：常温准备期。
  20,21,19,22,24,23,26,22,20,
  // 10–20：逐步降温至5℃；21–25：维持5℃。
  19,17,16,15,13,12,10,9,8,6,5,
  ...Array(5).fill(5),
  // 26–35：逐步降温至−10℃；36–40：维持−10℃。
  4,2,1,-1,-3,-4,-6,-7,-9,-10,
  ...Array(5).fill(-10),
  // 41–48：继续逼近极寒；49–50：仅两天达到−18℃峰值。
  -11,-12,-13,-14,-15,-16,-17,-17,
  -18,-18,
  // 51–55：逐步恢复常温。
  -10,-3,5,12,20,
  // 56–61：首轮酸雨；后续每轮小雨、大雨、暴雨各延长1天，并可与温度灾害重叠。
  ...Array(6).fill(20),
  // 62–70：逐步升温至38℃；71–76：维持38℃。
  22,24,26,28,30,32,34,36,38,
  ...Array(6).fill(38),
  // 77–83：逐步升温至42℃；84–90：维持42℃。
  39,39,40,40,41,41,42,
  ...Array(7).fill(42),
  // 91–97：继续逼近极炎；98–99：仅两天达到55℃峰值。
  44,46,48,49,51,53,54,
  55,55,
  // 100–105：逐步恢复常温；106–112：常温强风暴。
  49,43,38,32,26,20,
  ...Array(7).fill(20)
];
export const BASE_TEMPERATURES = Object.freeze(Object.fromEntries(FIRST_CYCLE_TEMPERATURES.map((temperature,index)=>[index+1,temperature])));

export const AREA_NAMES = [
  ["雪山峰顶", "河流发源地", "石山", "铁矿矿地", "煤矿矿地", "南山峰顶", "南山"],
  ["雪山山脚", "河流源头", "铜矿矿地", "神秘山洞", "丘陵果树林", "南山脚下", "南山针叶林"],
  ["幽暗森林深处", "群鸟之地", "河流上游", "丘陵地边缘", "丘陵地", "草原西部", "草原蘑菇地"],
  ["黑水奔涌处", "森林", "河流中游", "营地", "草原北部", "草原中部", "狮子家族领地"],
  ["幽暗森林", "水边红树林", "河流入海口", "乱石地", "沙滩边缘", "水草丰美之处", "牛群聚居地"],
  ["岛屿边缘", "小岛", "沙滩", "沉船", "大沙地", "草原东部", "羊群聚居地"],
  ["火山岛", "双岛海峡", "海洋", "海洋", "浅海", "草甸海滨", "草原深处"]
];

export const ITEMS = {
  apple: { name: "苹果", type: "food", happiness: 0, shelfLifeNights: 5, cold: true },
  water: { name: "水", type: "drink", happiness: 0, preserved: true },
  wood: { name: "木材", type: "material", preserved: true },
  stone: { name: "石头", type: "material", preserved: true },
  grass: { name: "草", type: "material", preserved: true },
  clay: { name: "黏土", type: "material", preserved: true },
  limestone: { name: "石灰石", type: "material", preserved: true },
  mushroom: { name: "蘑菇", type: "food", happiness: 0, shelfLifeNights: 5, cold: true },
  carrot: { name: "胡萝卜", type: "food", happiness: 0, shelfLifeNights: 5, cold: true },
  potato: { name: "土豆", type: "food", happiness: 0, shelfLifeNights: 5, cold: true },
  seawater: { name: "海水", type: "material", preserved: true },
  fish: { name: "鱼", type: "foodIngredient", shelfLifeNights: 2, cold: true },
  rotten: { name: "腐坏物", type: "material", preserved: true, tradeable: false },
  rope: { name: "草绳", type: "material", preserved: true },
  firewood: { name: "木柴", type: "fuel", preserved: true },
  wood_stick: { name: "木棒", type: "weapon", attack: 5, preserved: true },
  stone_knife: { name: "石刀", type: "tool", toolType: "knife", preserved: true },
  stone_axe: { name: "石斧", type: "tool", toolType: "axe", preserved: true },
  stone_pick: { name: "石镐", type: "tool", toolType: "pick", preserved: true },
  iron_pick: { name: "铁镐", type: "tool", toolType: "pick", preserved: true },
  steel_pick: { name: "钢镐", type: "tool", toolType: "pick", preserved: true },
  hardwood: { name: "硬木", type: "material", preserved: true },
  sand: { name: "沙子", type: "material", preserved: true },
  iron_ore: { name: "铁矿石", type: "material", preserved: true },
  copper_ore: { name: "铜矿石", type: "material", preserved: true },
  coal: { name: "煤", type: "fuel", preserved: true },
  charcoal: { name: "木炭", type: "fuel", preserved: true },
  corundum: { name: "刚玉", type: "material", preserved: true },
  sulfur: { name: "硫磺", type: "material", preserved: true },
  crude_oil: { name: "原油", type: "material", preserved: true },
  clean_ice: { name: "干净冰", type: "material", shelfLifeNights: 1, cold: true },
  honeycomb: { name: "蜂巢", type: "material", preserved: true },
  tomato: { name: "番茄", type: "food", happiness: 0, shelfLifeNights: 5, cold: true },
  rice_grain: { name: "水稻", type: "foodIngredient", shelfLifeNights: 20, cold: true },
  corn: { name: "玉米", type: "food", happiness: 0, shelfLifeNights: 7, cold: true },
  wheat: { name: "小麦", type: "foodIngredient", shelfLifeNights: 20, cold: true },
  tea_leaf: { name: "茶叶", type: "foodIngredient", shelfLifeNights: 10, cold: true },
  coffee_bean: { name: "咖啡豆", type: "foodIngredient", shelfLifeNights: 20, cold: true },
  blueberry: { name: "蓝莓", type: "food", happiness: 1, shelfLifeNights: 3, cold: true },
  banana: { name: "香蕉", type: "food", happiness: 1, shelfLifeNights: 4, cold: true },
  pumpkin: { name: "南瓜", type: "food", happiness: 0, shelfLifeNights: 12, cold: true },
  onion: { name: "洋葱", type: "food", happiness: 0, shelfLifeNights: 10, cold: true },
  lemon: { name: "柠檬", type: "food", happiness: 1, shelfLifeNights: 8, cold: true },
  chick: { name: "小鸡", type: "livestock", preserved: true },
  lamb: { name: "羊羔", type: "livestock", preserved: true },
  calf: { name: "牛犊", type: "livestock", preserved: true },
  piglet: { name: "猪仔", type: "livestock", preserved: true },
  marten_pelt: { name: "貂皮", type: "material", preserved: true },
  lion_pelt: { name: "狮皮", type: "material", preserved: true },
  snow_leopard_pelt: { name: "雪豹皮", type: "unique", preserved: true, tradeable: false },
  eagle_feather: { name: "巨鹰羽毛", type: "unique", preserved: true, tradeable: false },
  return_core: { name: "归航核心", type: "unique", preserved: true, tradeable: false },
  iron_ingot: { name: "铁锭", type: "material", preserved: true },
  copper_ingot: { name: "铜锭", type: "material", preserved: true },
  steel: { name: "钢材", type: "material", preserved: true },
  glass: { name: "玻璃", type: "material", preserved: true },
  corundum_abrasive: { name: "刚玉磨料", type: "material", preserved: true },
  optical_lens: { name: "光学透镜", type: "material", preserved: true },
  battery: { name: "蓄电池", type: "material", preserved: true },
  thunder_glass: { name: "雷击玻璃", type: "rareMaterial", preserved: true }
};

export const RECIPES = {
  rope: { name: "草绳", output: { itemId: "rope", quantity: 1 }, inputs: { grass: 3 }, blueprintId: "rope" },
  firewood: { name: "木柴", output: { itemId: "firewood", quantity: 1 }, inputs: { wood: 1 }, blueprintId: "firewood" },
  wood_stick: { name: "木棒", output: { itemId: "wood_stick", quantity: 1 }, inputs: { wood: 3 }, blueprintId: "wood_stick" },
  stone_knife: { name: "石刀", output: { itemId: "stone_knife", quantity: 1 }, inputs: { stone: 2, wood: 1, rope: 1 }, blueprintId: "stone_knife" },
  stone_axe: { name: "石斧", output: { itemId: "stone_axe", quantity: 1 }, inputs: { wood: 2, stone: 3, rope: 1 }, blueprintId: "stone_axe" },
  stone_pick: { name: "石镐", output: { itemId: "stone_pick", quantity: 1 }, inputs: { wood: 2, stone: 3, rope: 1 }, blueprintId: "stone_pick" },
  charcoal: { name: "木炭×2", output: { itemId: "charcoal", quantity: 2 }, inputs: { wood: 3 }, blueprintId: "charcoal" },
  iron_ingot_charcoal: { name: "铁锭（木炭冶炼）", output: { itemId: "iron_ingot", quantity: 1 }, inputs: { iron_ore: 2, charcoal: 2 }, blueprintId: "iron_ingot" },
  iron_ingot_coal: { name: "铁锭（煤冶炼）", output: { itemId: "iron_ingot", quantity: 1 }, inputs: { iron_ore: 2, coal: 1 }, blueprintId: "iron_ingot" },
  iron_pick: { name: "铁镐", output: { itemId: "iron_pick", quantity: 1 }, inputs: { iron_ingot: 3, wood: 2, rope: 1 }, blueprintId: "iron_pick" },
  copper_ingot_charcoal: { name: "铜锭（木炭冶炼）", output: { itemId: "copper_ingot", quantity: 1 }, inputs: { copper_ore: 2, charcoal: 2 }, blueprintId: "copper_ingot" },
  copper_ingot_coal: { name: "铜锭（煤冶炼）", output: { itemId: "copper_ingot", quantity: 1 }, inputs: { copper_ore: 2, coal: 1 }, blueprintId: "copper_ingot" },
  steel: { name: "钢材", output: { itemId: "steel", quantity: 1 }, inputs: { iron_ingot: 2, coal: 2 }, blueprintId: "steel" },
  steel_pick: { name: "钢镐", output: { itemId: "steel_pick", quantity: 1 }, inputs: { steel: 3, wood: 2, rope: 1 }, blueprintId: "steel_pick" },
  glass: { name: "玻璃×2", output: { itemId: "glass", quantity: 2 }, inputs: { sand: 3, limestone: 1, charcoal: 1 }, blueprintId: "glass" },
  corundum_abrasive: { name: "刚玉磨料×2", output: { itemId: "corundum_abrasive", quantity: 2 }, inputs: { corundum: 1 }, blueprintId: "corundum_abrasive" },
  optical_lens: { name: "光学透镜", output: { itemId: "optical_lens", quantity: 1 }, inputs: { glass: 2, corundum_abrasive: 1 }, blueprintId: "optical_lens" },
  optical_lens_thunder: { name: "光学透镜×2（雷击玻璃）", output: { itemId: "optical_lens", quantity: 2 }, inputs: { thunder_glass: 1, corundum_abrasive: 1 }, blueprintId: "optical_lens" },
  battery: { name: "蓄电池×2", output: { itemId: "battery", quantity: 2 }, inputs: { copper_ingot: 2, iron_ingot: 2, sulfur: 1, glass: 2 }, blueprintId: "battery" },
  battery_thunder: { name: "蓄电池×4（雷击玻璃）", output: { itemId: "battery", quantity: 4 }, inputs: { copper_ingot: 2, iron_ingot: 2, sulfur: 1, thunder_glass: 2 }, blueprintId: "battery" }
};

export const INITIAL_BLUEPRINTS = [
  "rope", "firewood", "wood_stick", "stone_knife", "stone_axe", "stone_pick", "bonfire", "workbench", "storage_chest"
];

export const LOTTERY_BLUEPRINTS = [
  ["warm_grass_armor", "保暖草甲"], ["rain_grass_armor", "蓑衣套装"],
  ["shade_grass_armor", "遮阳草甲"],
  ["cooking_table", "料理台"], ["stone_pot", "木锅"],
  ["planting_bed", "栽培地"], ["chicken_coop", "鸡舍"], ["warehouse", "仓库"],
  ["grass_curtain", "保温草帘"], ["grass_bed", "柴草床"], ["wood_table", "木桌椅"],
  ["wood_bowl", "木碗筷"], ["shovel", "木铲"],
  ["fishing_net", "渔网"], ["trap", "捕兽笼"],
  ["charcoal", "木炭", 2], ["iron_ingot", "铁锭", 2], ["iron_pick", "铁镐", 2],
  ["copper_ingot", "铜锭", 2], ["steel", "钢材", 3], ["steel_pick", "钢镐", 3],
  ["glass", "玻璃", 2], ["corundum_abrasive", "刚玉磨料", 3], ["optical_lens", "光学透镜", 4], ["battery", "蓄电池", 4],
  ["bread", "面包"], ["rice", "米饭"], ["roast_potato", "烤土豆"],
  ["boiled_egg", "水煮蛋"], ["roast_mushroom", "烤蘑菇"]
].map(([id, name, tier = 1]) => ({ id, name, tier }));

export const BUILDINGS = {
  bonfire: { name: "篝火", steps: 2, stamina: 1, inputs: { stone: 2, wood: 2 }, blueprintId: "bonfire" },
  remote_tent: { name: "茅草帐篷", steps: 4, stamina: 1.5, inputs: { wood: 3, grass: 4 }, houseLevel: 1 },
  wood_house: {
    name: "木屋", steps: 8, stamina: 2, inputs: { plank: 2, rope: 2, soil: 2, stone: 1 }, houseLevel: 2
  }
};

export const HOUSE_LEVELS = {
  0: { name: "无房屋", space: 0, warmth: 0, acidRainFacilityProtection: 0, stormFacilityProtection: 0 },
  1: { name: "茅草帐篷", space: 6, warmth: 2, acidRainFacilityProtection: 5, stormFacilityProtection: 5 },
  2: { name: "木屋", space: 12, warmth: 6, acidRainFacilityProtection: 10, stormFacilityProtection: 10 },
  3: { name: "石屋", space: 20, warmth: 10, acidRainFacilityProtection: 20, stormFacilityProtection: 20 },
  4: { name: "砖房", space: 40, warmth: 14, acidRainFacilityProtection: 30, stormFacilityProtection: 30 },
  5: { name: "永久避难所", space: 80, warmth: 18, acidRainFacilityProtection: 40, stormFacilityProtection: 40 }
};

export const NODES = {
  tree: {
    name: "树", stamina: 1.5, maxCharges: 12, respawnDays: 0,
    methods: [{ toolType: "axe", yields: { stone_axe: 3 } }], output: "wood"
  },
  stone_pile: {
    name: "石头堆", stamina: 1.5, maxCharges: 10, respawnDays: 0,
    methods: [{ toolType: "pick", yields: { stone_pick: 2 } }], output: "stone"
  },
  apple_tree: {
    name: "苹果树", stamina: 0.5, maxCharges: 8, respawnDays: 0,
    methods: [{ hand: 2 }, { toolType: "knife", yields: { stone_knife: 3 } }], output: "apple"
  },
  grassland: { name: "草地", stamina: 1, maxCharges: 8, respawnDays: 0, methods: [{ hand: 1 }, { toolType: "knife", yields: { stone_knife: 3 } }], output: "grass" },
  soil_patch: { name: "泥土地", stamina: 1, maxCharges: 10, respawnDays: 0, methods: [{ hand: 2 }, { toolType: "shovel", yields: { wood_shovel: 5, iron_shovel: 8, steel_shovel: 12 } }], output: "soil" },
  manure_pile: { name: "粪便堆", stamina: 1, maxCharges: 8, respawnDays: 0, repeatInitial: false, methods: [{ toolType: "shovel", yields: { wood_shovel: 3, iron_shovel: 5, steel_shovel: 8 } }], output: "manure" },
  mushroom_ring: { name: "蘑菇圈", stamina: 0.5, maxCharges: 4, respawnDays: 0, methods: [{ hand: 2 }], output: "mushroom" },
  wild_carrot: { name: "野生胡萝卜", stamina: 0.5, maxCharges: 4, respawnDays: 0, methods: [{ hand: 2 }, { toolType: "knife", yields: { stone_knife: 3 } }], output: "carrot" },
  wild_potato: { name: "野生土豆", stamina: 0.5, maxCharges: 4, respawnDays: 0, methods: [{ hand: 2 }, { toolType: "knife", yields: { stone_knife: 3 } }], output: "potato" },
  clay_pit: { name: "粘土坑", stamina: 1, maxCharges: 8, respawnDays: 0, methods: [{ hand: 1 }], output: "clay" },
  freshwater: { name: "淡水取水点", stamina: 0.5, maxCharges: 30, respawnDays: 0, methods: [{ hand: 3 }], output: "water" },
  fish_school: { name: "鱼群", stamina: 1, maxCharges: 5, respawnDays: 0, methods: [], missingToolItem: "iron_hook", output: "fish" },
  large_fish_school: { name: "大鱼群", stamina: 2, maxCharges: 4, respawnDays: 0, methods: [], output: "fish" },
  hardwood_tree: { name: "硬木树", stamina: 2, maxCharges: 6, respawnDays: 0, methods: [], output: "hardwood" },
  sand_pile: { name: "沙子堆", stamina: 1, maxCharges: 10, respawnDays: 0, methods: [{ hand: 1 }], output: "sand" },
  limestone: {
    name: "石灰石矿", stamina: 2, maxCharges: 8, respawnDays: 0,
    methods: [{ toolType: "pick", yields: { iron_pick: 2, steel_pick: 5 } }], output: "limestone"
  },
  iron_ore_pile: {
    name: "铁矿堆", stamina: 2, maxCharges: 10, respawnDays: 0,
    methods: [{ toolType: "pick", yields: { stone_pick: 1, iron_pick: 3, steel_pick: 6 } }], output: "iron_ore"
  },
  copper_ore_pile: {
    name: "铜矿堆", stamina: 2, maxCharges: 8, respawnDays: 0,
    methods: [{ toolType: "pick", yields: { iron_pick: 2, steel_pick: 5 } }], output: "copper_ore"
  },
  coal_mine: {
    name: "煤矿点", stamina: 2, maxCharges: 10, respawnDays: 0,
    methods: [{ toolType: "pick", yields: { iron_pick: 3, steel_pick: 6 } }], output: "coal"
  },
  sulfur_pile: {
    name: "硫磺堆", stamina: 2, maxCharges: 8, respawnDays: 0,
    methods: [{ toolType: "pick", yields: { iron_pick: 2, steel_pick: 5 } }], output: "sulfur"
  },
  corundum_mine: {
    name: "刚玉矿", stamina: 2.5, maxCharges: 6, respawnDays: 0,
    methods: [{ toolType: "pick", yields: { steel_pick: 2 } }], output: "corundum"
  },
  rock_salt_mine: {
    name: "岩盐矿", stamina: 2, maxCharges: 8, respawnDays: 0,
    methods: [{ toolType: "pick", yields: { iron_pick: 2, steel_pick: 5 } }], output: "rock_salt"
  },
  clean_ice_layer: {
    name: "干净冰层", stamina: 1, maxCharges: 8, respawnDays: 0,
    methods: [{ toolType: "pick", yields: { stone_pick: 2, iron_pick: 4, steel_pick: 7 } }], output: "clean_ice"
  },
  seawater_source: { name: "海水取水点", stamina: 0.5, maxCharges: 30, respawnDays: 0, methods: [{ hand: 3 }], output: "seawater" },
  oil_seep: { name: "石油口", stamina: 1, maxCharges: 20, respawnDays: 0, methods: [], output: "crude_oil" },
  beehive: { name: "蜂窝", stamina: 1, maxCharges: 3, respawnDays: 0, methods: [{ toolType: "knife", yields: { stone_knife: 1 } }], output: "honeycomb" },
  wild_tomato: { name: "野生番茄", stamina: 0.5, maxCharges: 4, respawnDays: 0, methods: [{ hand: 2 }], output: "tomato" },
  wild_rice: { name: "野生水稻", stamina: 0.5, maxCharges: 6, respawnDays: 0, methods: [{ hand: 2 }], output: "rice_grain" },
  wild_corn: { name: "野生玉米", stamina: 0.5, maxCharges: 4, respawnDays: 0, methods: [{ hand: 2 }], output: "corn" },
  wild_wheat: { name: "野生小麦", stamina: 0.5, maxCharges: 4, respawnDays: 0, methods: [{ hand: 2 }], output: "wheat" },
  wild_cotton: { name: "野生棉花", stamina: 0.5, maxCharges: 4, respawnDays: 0, methods: [{ hand: 2 }], output: "cotton" },
  wild_flax: { name: "野生亚麻", stamina: 0.5, maxCharges: 4, respawnDays: 0, methods: [{ hand: 2 }], output: "flax" },
  wild_tea: { name: "野生茶树", stamina: 0.5, maxCharges: 3, respawnDays: 0, methods: [{ hand: 3 }], output: "tea_leaf" },
  wild_coffee: { name: "野生咖啡", stamina: 0.5, maxCharges: 4, respawnDays: 0, methods: [{ hand: 2 }], output: "coffee_bean" },
  wild_blueberry: { name: "野生蓝莓", stamina: 0.5, maxCharges: 4, respawnDays: 0, methods: [{ hand: 2 }], output: "blueberry" },
  wild_banana: { name: "野生香蕉", stamina: 0.5, maxCharges: 4, respawnDays: 0, methods: [{ hand: 2 }], output: "banana" },
  wild_pumpkin: { name: "野生南瓜", stamina: 0.5, maxCharges: 4, respawnDays: 0, methods: [{ hand: 2 }], output: "pumpkin" },
  wild_onion: { name: "野生洋葱", stamina: 0.5, maxCharges: 4, respawnDays: 0, methods: [{ hand: 2 }], output: "onion" },
  wild_lemon: { name: "野生柠檬", stamina: 0.5, maxCharges: 4, respawnDays: 0, methods: [{ hand: 2 }], output: "lemon" },
  chicken_flock: { name: "鸡群", stamina: 2, maxCharges: 3, respawnDays: 0, methods: [], output: "chicken_meat", huntAttack: 15, combatLevel: 1, weakness: "melee", huntDrops: { chicken_meat:[1,1], feather:[1,1], egg:[1,.3] }, captureTool: "trap", captureOutput: "chick", captureChance: .1 },
  sheep_flock: { name: "羊群", stamina: 3, maxCharges: 2, respawnDays: 0, methods: [], output: "mutton", huntAttack: 25, combatLevel: 2, weakness: "melee", huntDrops: { mutton:[2,1], tendon:[1,.6], large_bone:[1,.4] }, captureTool: "largeTrap", captureOutput: "lamb", captureChance: .1 },
  cattle_herd: { name: "牛群", stamina: 4, maxCharges: 2, respawnDays: 0, methods: [], output: "beef", huntAttack: 40, combatLevel: 3, weakness: "ranged", huntDrops: { beef:[3,1], cattle_pelt:[1,.7], animal_fat:[2,.6], tendon:[1,.7], large_bone:[1,.6] }, captureTool: "largeTrap", captureOutput: "calf", captureChance: .1 },
  wild_boar_herd: { name: "野猪群", stamina: 3, maxCharges: 2, respawnDays: 0, methods: [], output: "pork", huntAttack: 40, combatLevel: 3, weakness: "melee", huntDrops: { pork:[2,1], pig_pelt:[1,.5], animal_fat:[1,.6], large_bone:[1,.25] }, captureTool: "largeTrap", captureOutput: "piglet", captureChance: .1 },
  marten: { name: "貂", stamina: 2, maxCharges: 1, respawnDays: 0, methods: [], output: "marten_pelt" },
  lion_pride: { name: "狮群", stamina: 4, maxCharges: 1, respawnDays: 0, methods: [], output: "lion_pelt" },
  snow_leopard_boss: { name: "雪豹", stamina: 4, maxCharges: 1, respawnDays: 0, methods: [], output: "snow_leopard_pelt", uniqueSite: true },
  giant_eagle_boss: { name: "巨鹰", stamina: 4, maxCharges: 1, respawnDays: 0, methods: [], output: "eagle_feather", uniqueSite: true },
  shipwreck_debris: {
    name: "沉船残骸", stamina: 1.5, maxCharges: 9, respawnDays: 0,
    methods: [{ toolType: "axe", yields: { stone_axe: 1 } }], output: "wood",
    randomOutputs: Object.freeze([
      Object.freeze({ itemId: "wood", chance: .7 }),
      Object.freeze({ itemId: "rusty_iron", chance: .2 }),
      Object.freeze({ itemId: "gear", chance: .1 })
    ])
  },
  shipwreck_chest: { name: "沉船宝箱", stamina: 1, maxCharges: 1, respawnDays: 0, methods: [], output: "precision_part", uniqueSite: true },
  mysterious_facility: { name: "神秘设施", stamina: 0, maxCharges: 1, respawnDays: 0, methods: [{ hand: 1 }], output: "return_core", uniqueSite: true, interactionLabel: "探索" },
  thunder_stone_circle: {
    name: "雷鸣石阵", stamina: 3, maxCharges: 2, initialCharges: 2, respawnDays: 0,
    methods: [{ toolType: "pick", yields: { steel_pick: 1 } }], output: "thunder_glass", special: true, unlockAtExploration: 100
  }
};

function makeResourceSites(nodeIds) {
  const seen = {};
  return nodeIds.map((nodeId) => {
    const occurrence = (seen[nodeId] ?? 0) + 1;
    seen[nodeId] = occurrence;
    const definition = NODES[nodeId];
    return {
      id: occurrence === 1 ? nodeId : `${nodeId}__${occurrence}`,
      nodeId,
      siteLabel: occurrence === 1 ? definition.name : `${definition.name}·${occurrence}`,
      maxCharges: definition.maxCharges,
      initialCharges: definition.initialCharges ?? definition.maxCharges
    };
  });
}

function makeResourceSitesFromCounts(counts) {
  return makeResourceSites(Object.entries(counts).flatMap(([nodeId,count])=>Array.from({length:count},()=>nodeId)));
}

export const AREAS = {
  A1:{name:"雪山峰顶",bias:-25,nodes:makeResourceSitesFromCounts({clean_ice_layer:5,stone_pile:4,snow_leopard_boss:1}),houseBuildable:true},
  A2:{name:"雪山山脚",bias:-12,nodes:makeResourceSitesFromCounts({tree:3,stone_pile:3,marten:3,clean_ice_layer:1}),houseBuildable:true},
  A3:{name:"幽暗森林深处",bias:0,nodes:makeResourceSitesFromCounts({hardwood_tree:5,tree:3,manure_pile:1,chicken_flock:1}),houseBuildable:true},
  A4:{name:"黑水奔涌处",bias:5,nodes:makeResourceSitesFromCounts({tree:2,oil_seep:4,hardwood_tree:4}),houseBuildable:true},
  A5:{name:"幽暗森林",bias:0,nodes:makeResourceSitesFromCounts({tree:3,hardwood_tree:4,wild_blueberry:3}),houseBuildable:true},
  A6:{name:"岛屿边缘",bias:0,nodes:makeResourceSitesFromCounts({fish_school:4,seawater_source:5,tree:1}),houseBuildable:true},
  A7:{name:"火山岛",bias:20,nodes:makeResourceSitesFromCounts({sulfur_pile:5,stone_pile:4,giant_eagle_boss:1}),houseBuildable:false},
  B1:{name:"河流发源地",bias:-12,nodes:makeResourceSitesFromCounts({freshwater:3,wild_rice:3,stone_pile:2,clean_ice_layer:2}),houseBuildable:true},
  B2:{name:"河流源头",bias:0,nodes:makeResourceSitesFromCounts({stone_pile:5,corundum_mine:4,clean_ice_layer:1}),houseBuildable:true},
  B3:{name:"群鸟之地",bias:0,nodes:makeResourceSitesFromCounts({chicken_flock:4,manure_pile:1,beehive:1,wild_tea:1,tree:3}),houseBuildable:true},
  B4:{name:"森林",bias:0,nodes:makeResourceSitesFromCounts({tree:4,beehive:2,wild_tea:2,chicken_flock:1,manure_pile:1}),houseBuildable:true},
  B5:{name:"水边红树林",bias:0,nodes:makeResourceSitesFromCounts({wild_banana:4,tree:2,clay_pit:2,fish_school:2}),houseBuildable:true},
  B6:{name:"小岛",bias:0,nodes:makeResourceSitesFromCounts({sand_pile:2,fish_school:2,seawater_source:3,wild_coffee:3}),houseBuildable:true},
  B7:{name:"双岛海峡",bias:0,nodes:makeResourceSitesFromCounts({seawater_source:5,large_fish_school:5}),houseBuildable:false},
  C1:{name:"石山",bias:-6,nodes:makeResourceSitesFromCounts({stone_pile:4,limestone:4,clean_ice_layer:2}),houseBuildable:true},
  C2:{name:"铜矿矿地",bias:0,nodes:makeResourceSitesFromCounts({stone_pile:5,copper_ore_pile:5}),houseBuildable:true},
  C3:{name:"河流上游",bias:0,nodes:makeResourceSitesFromCounts({freshwater:1,wild_rice:2,clay_pit:7}),houseBuildable:true},
  C4:{name:"河流中游",bias:0,nodes:makeResourceSitesFromCounts({freshwater:3,tree:3,clay_pit:2,fish_school:2}),houseBuildable:true},
  C5:{name:"河流入海口",bias:0,nodes:makeResourceSitesFromCounts({sand_pile:4,fish_school:4,seawater_source:1,freshwater:1}),houseBuildable:true},
  C6:{name:"沙滩",bias:0,nodes:makeResourceSitesFromCounts({sand_pile:4,seawater_source:4,fish_school:2}),houseBuildable:true},
  C7:{name:"海洋",bias:0,nodes:makeResourceSitesFromCounts({seawater_source:7,large_fish_school:3}),houseBuildable:false},
  D1:{name:"铁矿矿地",bias:-6,nodes:makeResourceSitesFromCounts({iron_ore_pile:5,stone_pile:4,tree:1}),houseBuildable:true},
  D2:{name:"神秘山洞",bias:0,nodes:makeResourceSitesFromCounts({stone_pile:6,mysterious_facility:1,wild_potato:3}),houseBuildable:true},
  D3:{name:"丘陵地边缘",bias:0,nodes:makeResourceSitesFromCounts({stone_pile:3,tree:2,apple_tree:4,wild_potato:1}),houseBuildable:true},
  D4:{name:"营地",bias:0,nodes:makeResourceSitesFromCounts({stone_pile:2,tree:2,apple_tree:2,grassland:2,soil_patch:2}),houseBuildable:true},
  D5:{name:"乱石地",bias:0,nodes:makeResourceSitesFromCounts({stone_pile:3,sand_pile:2,limestone:5}),houseBuildable:true},
  D6:{name:"沉船",bias:0,nodes:makeResourceSites(["sand_pile","sand_pile","shipwreck_debris","sand_pile","sand_pile","shipwreck_debris","sand_pile","shipwreck_debris","sand_pile","shipwreck_chest"]),fixedDiscoveryOrder:true,houseBuildable:true},
  D7:{name:"海洋",bias:0,nodes:makeResourceSitesFromCounts({seawater_source:4,fish_school:3,large_fish_school:3}),houseBuildable:false},
  E1:{name:"煤矿矿地",bias:0,nodes:makeResourceSitesFromCounts({coal_mine:5,stone_pile:5}),houseBuildable:true},
  E2:{name:"丘陵果树林",bias:0,nodes:makeResourceSitesFromCounts({tree:5,wild_lemon:3,wild_tomato:2}),houseBuildable:true},
  E3:{name:"丘陵地",bias:0,nodes:makeResourceSitesFromCounts({tree:1,wild_lemon:4,wild_tomato:4,mushroom_ring:1}),houseBuildable:true},
  E4:{name:"草原北部",bias:0,nodes:makeResourceSitesFromCounts({grassland:7,mushroom_ring:1,wild_carrot:1,manure_pile:1}),houseBuildable:true},
  E5:{name:"沙滩边缘",bias:0,nodes:makeResourceSitesFromCounts({grassland:3,sand_pile:4,wild_carrot:3}),houseBuildable:true},
  E6:{name:"大沙地",bias:0,nodes:makeResourceSitesFromCounts({sand_pile:1}),houseBuildable:true},
  E7:{name:"浅海",bias:0,nodes:makeResourceSitesFromCounts({sand_pile:1,seawater_source:5,fish_school:3,large_fish_school:1}),houseBuildable:true},
  F1:{name:"南山峰顶",bias:-12,nodes:makeResourceSitesFromCounts({clean_ice_layer:5,stone_pile:3,rock_salt_mine:2}),houseBuildable:true},
  F2:{name:"南山脚下",bias:-6,nodes:makeResourceSitesFromCounts({stone_pile:3,tree:3,wild_flax:2,wild_lemon:2}),houseBuildable:true},
  F3:{name:"草原西部",bias:0,nodes:makeResourceSitesFromCounts({grassland:2,wild_corn:4,wild_flax:4}),houseBuildable:true},
  F4:{name:"草原中部",bias:0,nodes:makeResourceSitesFromCounts({grassland:2,wild_wheat:2,wild_cotton:4,sheep_flock:1,manure_pile:1}),houseBuildable:true},
  F5:{name:"水草丰美之处",bias:0,nodes:makeResourceSitesFromCounts({grassland:1,sheep_flock:3,manure_pile:1,wild_wheat:4,wild_cotton:1}),houseBuildable:true},
  F6:{name:"草原东部",bias:0,nodes:makeResourceSitesFromCounts({grassland:7,sand_pile:1,sheep_flock:1,wild_wheat:1}),houseBuildable:true},
  F7:{name:"草甸海滨",bias:0,nodes:makeResourceSitesFromCounts({seawater_source:2,grassland:3,sand_pile:1,clay_pit:2,soil_patch:2}),houseBuildable:true},
  G1:{name:"南山",bias:0,nodes:makeResourceSitesFromCounts({clean_ice_layer:3,stone_pile:3,limestone:4}),houseBuildable:true},
  G2:{name:"南山针叶林",bias:0,nodes:makeResourceSitesFromCounts({tree:3,hardwood_tree:3,mushroom_ring:2,wild_pumpkin:2}),houseBuildable:true},
  G3:{name:"草原蘑菇地",bias:0,nodes:makeResourceSitesFromCounts({grassland:3,mushroom_ring:4,wild_pumpkin:1,wild_corn:1,wild_flax:1}),houseBuildable:true},
  G4:{name:"狮子家族领地",bias:0,nodes:makeResourceSitesFromCounts({lion_pride:1,cattle_herd:2,manure_pile:1,grassland:2,wild_wheat:1,wild_cotton:1,wild_pumpkin:1,mushroom_ring:1}),houseBuildable:true},
  G5:{name:"牛群聚居地",bias:0,nodes:makeResourceSitesFromCounts({cattle_herd:5,grassland:1,wild_onion:3,manure_pile:1}),houseBuildable:true},
  G6:{name:"羊群聚居地",bias:0,nodes:makeResourceSitesFromCounts({sheep_flock:5,grassland:1,manure_pile:1,wild_onion:3}),houseBuildable:true},
  G7:{name:"草原深处",bias:0,nodes:makeResourceSitesFromCounts({grassland:4,wild_boar_herd:4,manure_pile:1,thunder_stone_circle:1}),houseBuildable:true}
};

export const CONTINUED_EXPLORATION_SPECIAL_NODE_CHANCES=Object.freeze({});

export const CONTINUED_EXPLORATION_NODE_WEIGHTS=Object.freeze({
  A1:Object.freeze({clean_ice_layer:50,stone_pile:50}),A2:Object.freeze({tree:30,stone_pile:30,marten:30,clean_ice_layer:10}),
  A3:Object.freeze({hardwood_tree:50,tree:30,manure_pile:10,chicken_flock:10}),A4:Object.freeze({tree:20,oil_seep:40,hardwood_tree:40}),
  A5:Object.freeze({tree:30,hardwood_tree:40,wild_blueberry:30}),A6:Object.freeze({fish_school:40,seawater_source:50,tree:10}),A7:Object.freeze({sulfur_pile:50,stone_pile:50}),
  B1:Object.freeze({freshwater:30,stone_pile:20,clean_ice_layer:20,wild_rice:30}),B2:Object.freeze({stone_pile:50,corundum_mine:40,clean_ice_layer:10}),
  B3:Object.freeze({chicken_flock:40,manure_pile:10,beehive:10,wild_tea:10,tree:30}),B4:Object.freeze({tree:60,beehive:15,wild_tea:15,chicken_flock:5,manure_pile:5}),
  B5:Object.freeze({wild_banana:40,tree:20,clay_pit:20,fish_school:20}),B6:Object.freeze({sand_pile:20,fish_school:20,seawater_source:30,wild_coffee:30}),B7:Object.freeze({seawater_source:50,large_fish_school:50}),
  C1:Object.freeze({stone_pile:40,limestone:40,clean_ice_layer:20}),C2:Object.freeze({stone_pile:30,copper_ore_pile:70}),
  C3:Object.freeze({freshwater:10,wild_rice:20,clay_pit:70}),C4:Object.freeze({freshwater:30,tree:30,clay_pit:20,fish_school:20}),
  C5:Object.freeze({sand_pile:40,fish_school:40,seawater_source:10,freshwater:10}),C6:Object.freeze({sand_pile:40,seawater_source:40,fish_school:20}),C7:Object.freeze({seawater_source:70,large_fish_school:30}),
  D1:Object.freeze({iron_ore_pile:70,stone_pile:24,tree:6}),D2:Object.freeze({stone_pile:80,wild_potato:20}),
  D3:Object.freeze({stone_pile:30,tree:20,apple_tree:40,wild_potato:10}),D4:Object.freeze({stone_pile:20,tree:20,apple_tree:10,grassland:20,soil_patch:20}),
  D5:Object.freeze({stone_pile:30,limestone:50,sand_pile:20}),D6:Object.freeze({shipwreck_debris:30,sand_pile:70}),D7:Object.freeze({seawater_source:40,fish_school:30,large_fish_school:30}),
  E1:Object.freeze({coal_mine:70,stone_pile:30}),E2:Object.freeze({tree:50,wild_lemon:30,wild_tomato:20}),
  E3:Object.freeze({tree:10,wild_lemon:40,wild_tomato:40,mushroom_ring:10}),E4:Object.freeze({grassland:70,mushroom_ring:10,wild_carrot:10,manure_pile:10}),
  E5:Object.freeze({sand_pile:40,grassland:30,wild_carrot:30}),E6:Object.freeze({sand_pile:100}),E7:Object.freeze({sand_pile:10,seawater_source:50,fish_school:30,large_fish_school:10}),
  F1:Object.freeze({clean_ice_layer:50,stone_pile:30,rock_salt_mine:20}),F2:Object.freeze({stone_pile:30,tree:30,wild_flax:20,wild_lemon:20}),
  F3:Object.freeze({grassland:20,wild_corn:40,wild_flax:40}),F4:Object.freeze({grassland:20,wild_wheat:20,wild_cotton:40,sheep_flock:10,manure_pile:10}),
  F5:Object.freeze({grassland:10,sheep_flock:30,manure_pile:10,wild_wheat:40,wild_cotton:10}),F6:Object.freeze({grassland:70,sand_pile:10,sheep_flock:10,wild_wheat:10}),
  F7:Object.freeze({seawater_source:20,grassland:30,sand_pile:10,clay_pit:20,soil_patch:20}),
  G1:Object.freeze({clean_ice_layer:30,stone_pile:30,limestone:40}),G2:Object.freeze({tree:30,hardwood_tree:30,mushroom_ring:20,wild_pumpkin:20}),
  G3:Object.freeze({grassland:30,mushroom_ring:40,wild_pumpkin:10,wild_corn:10,wild_flax:10}),
  G4:Object.freeze({lion_pride:10,cattle_herd:20,manure_pile:10,grassland:20,wild_wheat:10,wild_cotton:10,wild_pumpkin:10,mushroom_ring:10}),
  G5:Object.freeze({cattle_herd:50,grassland:10,wild_onion:30,manure_pile:10}),G6:Object.freeze({sheep_flock:50,grassland:10,wild_onion:30,manure_pile:10}),
  G7:Object.freeze({grassland:40,wild_boar_herd:40,manure_pile:10,thunder_stone_circle:10})
});

export const SHIPWRECK_CHEST_PACKS=Object.freeze([
  Object.freeze({blueprint:"weather_station",items:Object.freeze([]),extra:Object.freeze(["precision_part",2])})
]);

export const WEATHER_LABELS = {
  calm: "平稳",
  cold_wave: "寒潮",
  rain: "酸雨",
  heat: "酷暑",
  storm: "强风暴"
};

// 将旧原型表替换为正式全量表；保留同一导出名以兼容存档迁移和界面模块。
Object.assign(ITEMS, FULL_ITEMS);
for (const id of Object.keys(RECIPES)) delete RECIPES[id];
Object.assign(RECIPES, FULL_RECIPES);
for (const recipe of Object.values(RECIPES)) if (!recipe.output && recipe.outputs?.length) recipe.output = recipe.outputs[0];
const locallyCollectedItems=new Set(Object.values(NODES).flatMap(node=>node.randomOutputs?.map(output=>output.itemId)??[node.output]).filter(Boolean));
const recipeOutputs=new Set(Object.values(RECIPES).flatMap(recipe=>(recipe.outputs??[recipe.output]).filter(Boolean).map(output=>output.itemId)));
for(const [id,item] of Object.entries(ITEMS)){
  const defaultWeights={seed:6,tool:8,furniture:10,device:10,weapon:15,armor:15,backpack:15,rareMaterial:20,livestock:6};
  item.barterWeight=defaultWeights[item.type]
    ?? (["food","drink","foodIngredient"].includes(item.type)?(recipeOutputs.has(id)?4:2)
      : (["material","fuel"].includes(item.type)?(locallyCollectedItems.has(id)?1:4):4));
}
RECIPES.optical_lens_thunder = { ...RECIPES.optical_lens, id: "optical_lens_thunder", name: "光学透镜×2（雷击玻璃）", inputs: { thunder_glass: 1, corundum_abrasive: 1 }, output: { itemId: "optical_lens", quantity: 2 }, alternatives: undefined, alternativeQuantity: undefined, hidden: true };
RECIPES.battery_thunder = { ...RECIPES.battery, id: "battery_thunder", name: "蓄电池×4（雷击玻璃）", inputs: { copper_ingot: 2, iron_ingot: 2, sulfur: 1, thunder_glass: 2 }, output: { itemId: "battery", quantity: 4 }, alternatives: undefined, alternativeQuantity: undefined, hidden: true };
RECIPES.salt_rock = { id:"salt_rock",name:"岩盐加工盐",inputs:{rock_salt:1},output:{itemId:"salt",quantity:1},blueprintId:"salt",category:"process",station:"workbench",tier:1 };
RECIPES.lime_crab_shell = { id:"lime_crab_shell",name:"蟹壳烧制石灰",inputs:{crab_shell:1},output:{itemId:"lime",quantity:1},blueprintId:"lime",category:"process",station:"brick_kiln",tier:2 };
RECIPES.corundum_abrasive_scorpion = { id:"corundum_abrasive_scorpion",name:"巨蝎甲壳研磨刚玉磨料×2",inputs:{scorpion_chitin:1},output:{itemId:"corundum_abrasive",quantity:2},blueprintId:"corundum_abrasive",category:"process",station:"stone_mill",tier:4 };
RECIPES.leather_small_fur = { id:"leather_small_fur",name:"小块皮毛鞣制皮革",inputs:{small_fur:3,salt:1},output:{itemId:"leather",quantity:1},blueprintId:"leather",category:"process",station:"tanning_rack",tier:2 };
for(const recipeId of ["dried_meat"]){
  const recipe=RECIPES[recipeId];
  recipe.alternatives=recipe.variants
    .filter((itemId)=>itemId!=="pork")
    .map((itemId)=>({[itemId]:1}));
}

// 改名野生动物的专属掉落物，可在全部对应配方中等量替代原有畜产素材。
const equivalentMaterials = Object.freeze({
  mutton: ["snow_sheep_meat"],
  tendon: ["snow_sheep_tendon", "snow_elephant_tendon", "tough_tentacle"],
  large_bone: ["snow_sheep_bone", "giant_python_bone", "snow_elephant_bone", "lion_fang"],
  venom: ["giant_python_venom", "scorpion_venom"],
  beef: ["snow_elephant_meat", "wandering_lion_meat"],
  lion_pelt: ["wandering_lion_pelt"],
  cattle_pelt: ["giant_python_pelt", "snow_elephant_pelt"],
  animal_fat: ["snow_elephant_fat"]
});
for (const recipe of Object.values(RECIPES)) {
  const inputOptions = [recipe.inputs, ...(recipe.alternatives ?? [])].filter(Boolean);
  const existing = new Set(inputOptions.map((inputs) => JSON.stringify(inputs)));
  const additions = [];
  inputOptions.forEach((inputs, optionIndex) => {
    for (const [originalId, substituteIds] of Object.entries(equivalentMaterials)) {
      if (!inputs[originalId]) continue;
      for (const substituteId of substituteIds) {
        const variantInputs = { ...inputs, [substituteId]: inputs[originalId] };
        delete variantInputs[originalId];
        const signature = JSON.stringify(variantInputs);
        if (existing.has(signature)) continue;
        existing.add(signature);
        const efficient = recipe.rareAlternativeIndex !== undefined
          ? optionIndex === recipe.rareAlternativeIndex
          : optionIndex > 0 && Boolean(recipe.alternativeQuantity);
        additions.push({
          inputs: variantInputs,
          outputQuantity: efficient
            ? recipe.alternativeQuantity
            : Number(recipe.output?.quantity ?? recipe.outputs?.[0]?.quantity ?? 1)
        });
      }
    }
  });
  if (!additions.length) continue;
  recipe.alternatives = [...(recipe.alternatives ?? []), ...additions.map((entry) => entry.inputs)];
  additions.forEach((entry, index) => {
    const optionIndex = 1 + recipe.alternatives.length - additions.length + index;
    recipe.alternativeOutputQuantities = { ...(recipe.alternativeOutputQuantities ?? {}), [optionIndex]:entry.outputQuantity };
  });
}
LOTTERY_BLUEPRINTS.splice(0, LOTTERY_BLUEPRINTS.length, ...BLUEPRINTS.filter((blueprint) => !blueprint.fixedOnly));
INITIAL_BLUEPRINTS.splice(0, INITIAL_BLUEPRINTS.length, ...INITIAL_BLUEPRINT_IDS);
for (const id of Object.keys(BUILDINGS)) delete BUILDINGS[id];
Object.assign(BUILDINGS, FACILITIES, {
  remote_tent: { name: "茅草帐篷", steps: 4, stamina: 1.5, inputs: { wood: 3, grass: 4 }, houseLevel: 1 },
  wood_house: { name: "木屋", steps: 8, stamina: 2, inputs: { plank: 2, rope: 2, soil: 2, stone: 1 }, houseLevel: 2 },
  stone_house: { name: "石屋", steps: 10, stamina: 2.5, inputs: { stone_brick: 4, plank: 2, stone: 2 }, houseLevel: 3 },
  brick_house: { name: "砖房", steps: 12, stamina: 3, inputs: { brick: 5, plank: 2, glass: 1 }, houseLevel: 4 },
  permanent_shelter: { name: "永久避难所", steps: 15, stamina: 3, inputs: { concrete: 4, steel: 2, glass_panel: 1, lime: 1 }, houseLevel: 5, completionBlueprints: ["hydro_generator"] }
});

// 唯一物及所有制作路线都必须消耗唯一原料的成品，共用交易与地面保护规则。
export const UNIQUE_DEPENDENT_ITEM_IDS=Object.freeze((()=>{
  const ids=new Set(Object.entries(ITEMS).filter(([,item])=>item.unique||item.type==="unique").map(([id])=>id));
  const inputOptionsByOutput=new Map();
  for(const recipe of Object.values(RECIPES)){
    const inputOptions=[recipe.inputs,...(recipe.alternatives??[])].filter(Boolean);
    const outputs=[...(recipe.outputs??(recipe.output?[recipe.output]:[])),...(recipe.bonusOutput?[recipe.bonusOutput]:[])];
    for(const output of outputs){
      if(!output?.itemId||!ITEMS[output.itemId])continue;
      const options=inputOptionsByOutput.get(output.itemId)??[];
      options.push(...inputOptions);
      inputOptionsByOutput.set(output.itemId,options);
    }
  }
  let changed=true;
  while(changed){
    changed=false;
    for(const [itemId,inputOptions] of inputOptionsByOutput){
      if(ids.has(itemId)||!inputOptions.length||!inputOptions.every(inputs=>Object.keys(inputs).some(id=>ids.has(id))))continue;
      ids.add(itemId);changed=true;
    }
  }
  return [...ids];
})());
for(const itemId of UNIQUE_DEPENDENT_ITEM_IDS)ITEMS[itemId].tradeable=false;

export { BLUEPRINTS, CONTENT_COUNTS, CROPS, DEVICES, ENEMIES, EQUIPMENT, FURNITURE, LIVESTOCK, LIVESTOCK_FEED_STAMINA_COST };
// 正式采集手段；草药仅由草地附加取得，虾由鱼群附加取得。
NODES.grassland.methods = [{hand:1},{toolType:"knife",yields:{stone_knife:3,iron_knife:5,steel_knife:8}}];
NODES.tree.methods = [{hand:1},{toolType:"axe",yields:{stone_axe:3,iron_axe:6,steel_axe:10}}];
for(const id of ["wild_carrot","wild_potato","wild_tomato","wild_rice","wild_corn","wild_wheat","wild_cotton","wild_flax","wild_coffee","wild_blueberry","wild_banana","wild_pumpkin","wild_onion","wild_lemon"])NODES[id].methods=[{hand:2},{toolType:"knife",yields:{stone_knife:3,iron_knife:3,steel_knife:3}}];
NODES.wild_tea.methods=[{hand:3},{toolType:"knife",yields:{stone_knife:3,iron_knife:3,steel_knife:3}}];
NODES.apple_tree.methods=[{hand:2},{toolType:"knife",yields:{stone_knife:4,iron_knife:4,steel_knife:4}}];
NODES.beehive.methods=[{toolType:"knife",yields:{stone_knife:1,iron_knife:2,steel_knife:3}}];
NODES.stone_pile.methods=[{hand:1},{toolType:"pick",yields:{stone_pick:2,iron_pick:4,steel_pick:7}}];
for(const id of ["freshwater","seawater_source"])NODES[id].methods=[{hand:3},{toolType:"waterContainer",yields:{wood_bucket:6,iron_bucket:10,steel_bucket:15}}];
for(const id of ["clay_pit","sand_pile"])NODES[id].methods=[{hand:1},{toolType:"shovel",yields:{wood_shovel:3,iron_shovel:5,steel_shovel:8}}];
NODES.soil_patch.methods=[{hand:2},{toolType:"shovel",yields:{wood_shovel:5,iron_shovel:8,steel_shovel:12}}];
NODES.fish_school.methods = [{ requiredItem: "stone_spear", quantity: 1 }, { toolType: "hook", yields: { iron_hook: 2 } }, { toolType: "net", yields: { fishing_net: 5 } }];
NODES.large_fish_school.methods = [{ toolType: "net", yields: { fishing_net: 5 } }];
NODES.hardwood_tree.methods = [{ toolType: "axe", yields: { iron_axe: 2, steel_axe: 5 } }];
NODES.oil_seep.methods = [{ toolType: "pump", yields: { oil_pump: 5 } }];
for(const id of ["chicken_flock","sheep_flock","cattle_herd","wild_boar_herd"])NODES[id].methods=[{hunt:1}];
NODES.shipwreck_chest.methods = [{ hand: 1 }];
NODES.mysterious_facility.methods = [{ hand: 1 }];
NODES.shipwreck_debris.methods = [{ toolType: "axe", yields: { stone_axe: 1, iron_axe: 3, steel_axe: 5 } }];

// 物资格中的每一件物品都直接读取手写说明，不在运行时拼接文案。
for (const [itemId, item] of Object.entries(ITEMS)) item.description = ITEM_DESCRIPTIONS[itemId];
for (const blueprint of BLUEPRINTS) blueprint.description = BLUEPRINT_DESCRIPTIONS[blueprint.id];
