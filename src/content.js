// 正式内容总表。所有可制作内容均由这里的数据驱动，策划案中的分类数量是自动验收项。

const makeId = (name) => name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

export const FULL_ITEMS = {};
function addItem(id, name, type = "material", extra = {}) {
  FULL_ITEMS[id] = { name, type, preserved: !extra.shelfLifeNights, cold: Boolean(extra.shelfLifeNights), barterWeight: extra.barterWeight ?? 10, ...extra };
}
addItem("ordinary_clothes", "普通衣物", "armor", { slot: "body", env: { warmth: 2 }, unique: true, tradeable: false });
addItem("system_small_backpack", "系统小背包", "backpack", { slot: "backpack", backpackCapacity: { ordinary: 10, cold: 3 }, unique: true, tradeable: false });
addItem("water", "水", "drink", { happiness: 0, directUse: true });
addItem("seawater", "海水", "material");

const materialRows = [
  ["soil","泥土"],["plank","木板"],["brick","砖"],["stone_brick","石砖"],["lime","石灰"],["cement","水泥"],["concrete","混凝土"],["rusty_iron","锈铁"],["rock_salt","岩盐"],
  ["glass_panel","玻璃板"],["copper_wire","铜线"],["gear","齿轮"],["precision_part","精密零件"],["insulated_cable","绝缘电缆"],
  ["rubber","橡胶"],["fuel","燃油","fuel"],["honey","蜂蜜"],["beeswax","蜂蜡"],["salt","盐"],["leather","皮革"],["wool_cloth","羊毛布"],["cotton_cloth","棉布"],["linen_cloth","麻布"],
  ["bone_glue","骨胶"],["fertilizer","肥料"],["feed","饲料"],["simple_poultice","简陋膏药"],["bandage","绷带"],["advanced_wound_medicine","高级伤药"],["medicine","药剂"],["cooking_oil","食用油"],["alcohol","酒","drink"],
  ["shrimp","虾","foodIngredient"],["egg","鸡蛋","foodIngredient"],["milk","牛奶","drink"],["wool","羊毛"],["feather","羽毛"],["small_fur","小块皮毛"],
  ["tendon","动物筋"],["large_bone","大骨"],["animal_fat","动物脂肪"],["manure","粪便"],["venom","毒液"],["marten_meat","貂肉","foodIngredient"],
  ["crab_meat","蟹肉","foodIngredient"],["crab_shell","蟹壳"],
  ["giant_octopus_meat","巨型章鱼肉","foodIngredient"],["tough_tentacle","强韧触腕"],
  ["scorpion_venom","巨蝎毒液"],["scorpion_chitin","巨蝎甲壳"],
  ["wandering_lion_meat","雄狮肉","foodIngredient"],["wandering_lion_pelt","雄狮皮"],["lion_fang","雄狮獠牙"],
  ["snow_sheep_meat","雪羊肉","foodIngredient"],["snow_sheep_pelt","雪羊皮"],["snow_sheep_tendon","雪羊筋"],["snow_sheep_bone","雪羊骨"],
  ["giant_python_venom","巨蟒毒液"],["giant_python_pelt","巨蟒皮"],["giant_python_bone","巨蟒骨"],
  ["snow_elephant_meat","雪象肉","foodIngredient"],["snow_elephant_pelt","雪象皮"],["snow_elephant_fat","雪象脂肪"],["snow_elephant_tendon","雪象筋"],["snow_elephant_bone","雪象骨"],
  ["chicken_meat","鸡肉","foodIngredient"],["mutton","羊肉","foodIngredient"],["beef","牛肉","foodIngredient"],["pork","猪肉","foodIngredient"],
  ["cattle_pelt","牛皮"],["pig_pelt","猪皮"],["glossy_feather","亮泽羽簇","rareMaterial"],
  ["complete_tendon","完整兽筋","rareMaterial"],["thick_pelt","厚实兽皮","rareMaterial"],["dense_bone","致密大骨","rareMaterial"],
  ["flour","面粉"],["corn_flour","玉米粉"],["coffee_powder","咖啡粉"],["butter","黄油","foodIngredient"],["cheese","奶酪","foodIngredient"],
  ["vinegar","醋"],["apple_jam","苹果酱"],["blueberry_jam","蓝莓酱"],["tomato_sauce","番茄酱"],
  ["space_module","空间稳定模块","unique"],["coordinate_module","世界坐标模块","unique"]
];
for (const [id,name,type="material"] of materialRows) { const life=id==="chicken_meat"?5:(["milk","marten_meat","mutton","beef","pork","crab_meat","giant_octopus_meat","wandering_lion_meat","snow_sheep_meat","snow_elephant_meat"].includes(id)?2:(["egg","butter"].includes(id)?5:undefined)); addItem(id,name,type,{ unique:type==="unique", tradeable:type!=="unique", shelfLifeNights:life, cold:Boolean(life) }); }
FULL_ITEMS.alcohol.happiness=2;
FULL_ITEMS.simple_poultice.injuryHealing=1;
FULL_ITEMS.bandage.injuryHealing=2;
FULL_ITEMS.advanced_wound_medicine.injuryHealing=3;
export const FOOD_PROCESSING_TRADE_ITEM_IDS=Object.freeze(["honey","salt","cooking_oil","flour","corn_flour","coffee_powder","vinegar","apple_jam","blueberry_jam","tomato_sauce"]);
for(const id of ["simple_poultice","bandage","advanced_wound_medicine","medicine",...FOOD_PROCESSING_TRADE_ITEM_IDS])FULL_ITEMS[id].tradeCategories=["food"];
addItem("cheese","奶酪","foodIngredient",{shelfLifeNights:1,cold:true,directUse:false});

const cropRows = [
  ["carrot","胡萝卜",3,2],["potato","土豆",4,3],["corn","玉米",4,3],["mushroom","蘑菇",4,3],
  ["tomato","番茄",5,3],["blueberry","蓝莓",5,3],["wheat","小麦",5,3],["rice_grain","水稻",5,3],["cotton","棉花",5,3],["flax","亚麻",4,3],["pumpkin","南瓜",6,3],
  ["onion","洋葱",6,3],["tea_leaf","茶叶",7,2],["coffee_bean","咖啡豆",7,2],["lemon","柠檬",7,2],["banana","香蕉",7,3],["herb","草药",5,2]
];
export const CROPS = {};
for (const [id,name,growth,yieldBase] of cropRows) {
  const seedId = id === "mushroom" ? "mushroom_spawn" : `${id}_seed`;
  CROPS[id] = { id, name, seedId, growthDays:growth, regrowDays:growth, stock:yieldBase===2?12:15, yieldBase };
  const cropItemType=["cotton","flax"].includes(id)?"material":(["wheat","rice_grain","tea_leaf","coffee_bean","herb"].includes(id)?"foodIngredient":"food");
  addItem(id,name,cropItemType,cropItemType==="material"?{}:{happiness:0,shelfLifeNights:5,cold:true,directUse:cropItemType==="food"});
  addItem(seedId, id === "mushroom" ? "蘑菇菌种" : `${name}种子`, "seed");
}
for(const [id,name,type="food"] of [["apple","苹果"],["honeycomb","蜂巢","foodIngredient"]])addItem(id,name,type,{happiness:0,shelfLifeNights:5,cold:true,directUse:type==="food"});
CROPS.apple={id:"apple",name:"苹果树",seedId:"apple_seed",growthDays:8,regrowDays:8,stock:18,yieldBase:4};
CROPS.wood={id:"wood",name:"树",seedId:"tree_seed",growthDays:5,regrowDays:5,stock:10,yieldBase:10,wildSeedChance:.01,wildSeedPerGather:true};
CROPS.grass={id:"grass",name:"草",seedId:"grass_seed",growthDays:3,regrowDays:3,stock:8,yieldBase:3,wildSeedChance:.01,wildSeedPerGather:true,cultivatedSeedPerHarvest:true};
addItem("apple_seed","苹果树种子","seed");
addItem("tree_seed","树种","seed");
addItem("grass_seed","草种","seed");
for(const [id,name] of [["fish","鱼"],["shrimp","虾"]])addItem(id,name,"foodIngredient",{shelfLifeNights:2,cold:true});

for (const [id,name] of [
  ["rice","米饭"],["bread","面包"],["yogurt","酸奶"],["dried_meat","干肉"],["dried_fish","干鱼"]
]) {
  const preserved=id.startsWith("dried_");
  addItem(id,name,id==="yogurt"?"drink":"food",{happiness:id.startsWith("dried_")?1:(id==="yogurt"?4:2),shelfLifeNights:preserved?undefined:1,directUse:true});
}

const dishRows = [
  [1,"roast_potato","烤土豆"],[1,"boiled_egg","水煮蛋"],[1,"roast_mushroom","烤蘑菇"],[1,"roast_pumpkin","烤南瓜"],[1,"roast_fish","烤鱼"],[1,"roast_shrimp","烤虾"],[1,"roast_marten","烤貂肉"],[1,"sashimi","生鱼片"],
  [2,"honey_apple","蜂蜜苹果"],[2,"honey_blueberry","蜂蜜蓝莓"],[2,"honey_banana","蜂蜜香蕉"],[2,"mushroom_soup","蘑菇汤"],[2,"fish_soup","鱼汤"],[3,"tomato_egg_soup","番茄蛋花汤"],[2,"corn_cake","玉米饼"],
  [3,"apple_jam_bread","苹果酱面包"],[3,"blueberry_jam_bread","蓝莓酱面包"],[3,"roast_chicken","烤鸡"],[3,"fish_rice","烤鱼饭"],[3,"egg_sandwich","鸡蛋三明治"],[3,"butter_bread","黄油面包"],[3,"corn_chowder","玉米浓汤"],
  [4,"roast_beef","烤牛肉"],[4,"roast_mutton","烤羊肉"],[4,"rice_ball","寿司"],[4,"honey_chicken","蜂蜜鸡翅"],[4,"cheese_sandwich","芝士三明治"],[4,"apple_pie","苹果派"],[4,"cream_potato","奶油焗土豆"],
  [5,"roast_pork","烤猪肉"],[5,"tomato_meat_noodle","番茄肉酱面"],[5,"chicken_burger","鸡肉汉堡"],[5,"mushroom_pizza","蘑菇披萨"],[5,"seafood_fried_rice","海鲜炒饭"],[5,"beef_stew","土豆炖牛肉"],[5,"chicken_stew","土豆炖鸡"],[5,"fried_chicken","炸鸡"],
  [6,"beef_pizza","牛肉披萨"],[6,"cream_chicken_stew","奶油鸡肉炖菜"],[6,"beef_rice","肥牛饭"],[7,"vinaigrette_salad","油醋蔬菜沙拉"],[7,"lamb_platter","烤羊排拼盘"],[8,"crab_soup","蟹肉浓汤",2],[8,"honey_pork_ribs","蜜汁烤猪肋排"],[8,"island_feast","荒岛宴席"],[11,"banana_boat","香蕉船"],[11,"blueberry_yogurt_cup","蓝莓酸奶杯"],[12,"return_feast","归航庆祝宴"]
];
for (const [h,id,name] of dishRows) addItem(id,name,"food",{happiness:h,shelfLifeNights:1,directUse:true});

const drinkRows = [
  [0,"hot_water","热水"],[0,"ice_water","冰水"],
  [4,"apple_juice","苹果汁",2],[4,"carrot_juice","胡萝卜汁",2],[4,"corn_juice","玉米汁",2],[4,"blueberry_juice","蓝莓汁",2],
  [4,"sweet_milk","甜牛奶"],[2,"green_tea","绿茶",3],[6,"coffee","咖啡"],[6,"apple_shake","苹果奶昔"],[6,"blueberry_shake","蓝莓奶昔"],[6,"banana_shake","香蕉奶昔"],
  [6,"rice_wine","米酒"],[8,"ice_cream","冰激淋"],[8,"milk_tea","奶茶"],[8,"latte","拿铁"],[10,"honey_lemon_tea","蜂蜜柠檬茶"],[12,"apple_milk_tea","苹果奶绿"]
];
for (const [h,id,name] of drinkRows) addItem(id,name,"drink",{happiness:h,shelfLifeNights:1,directUse:true});

// 今日结束时吃下的食物与饮料，会把这些效果带到第二天。
// 攻击类高阶食物与高阶饮料同时食用时，还会组成可挑战高一级敌人的“强攻组合”。
const NEXT_DAY_DIET_EFFECTS = {
  roast_chicken:{attack:2,rain:15},
  carrot_juice:{attack:2,heat:2},
  lamb_platter:{attack:4,attackTier:"high"},
  latte:{attack:4,attackTier:"high"},
  mushroom_soup:{warmth:4},
  fish_soup:{warmth:4},
  tomato_egg_soup:{warmth:4},
  corn_chowder:{warmth:4},
  crab_soup:{warmth:4},
  cream_chicken_stew:{warmth:8},
  green_tea:{warmth:2},
  milk_tea:{warmth:4},
  hot_water:{warmth:2},
  honey_blueberry:{heat:4},
  ice_water:{heat:4},
  apple_juice:{heat:2},
  corn_juice:{heat:2},
  blueberry_juice:{heat:4},
  apple_shake:{heat:4},
  blueberry_shake:{heat:6},
  banana_shake:{heat:4},
  ice_cream:{heat:8},
  banana_boat:{heat:8},
  fried_chicken:{rain:30},
  yogurt:{rain:15},
  honey_lemon_tea:{rain:30},
  corn_cake:{storm:15},
  beef_stew:{storm:30},
  sweet_milk:{storm:15},
  rice_wine:{storm:30}
};
for(const [itemId,effect] of Object.entries(NEXT_DAY_DIET_EFFECTS))FULL_ITEMS[itemId].nextDayEffect=effect;

const toolRows = [
  ["stone_knife","石刀","knife"],["stone_axe","石斧","axe"],["stone_pick","石镐","pick"],
  ["iron_knife","铁刀","knife"],["steel_knife","钢刀","knife"],["iron_axe","铁斧","axe"],["steel_axe","钢斧","axe"],
  ["iron_pick","铁镐","pick"],["steel_pick","钢镐","pick"],
  ["wood_bucket","木制水桶","waterContainer"],["iron_bucket","铁皮水桶","waterContainer"],["steel_bucket","钢制水桶","waterContainer"],
  ["wood_shovel","木铲","shovel"],["iron_shovel","铁铲","shovel"],["steel_shovel","钢铲","shovel"],
  // 沿用 iron_hook 内部ID兼容既有存档，玩家界面与配方均已改为木鱼钩。
  ["iron_hook","木鱼钩","hook"],
  ["wood_needle","木针","sewingNeedle"],["iron_needle","铁针","sewingNeedle"],
  ["fishing_net","渔网","net"],["trap","捕兽笼","trap"],["large_trap","大型捕兽笼","largeTrap"],["oil_pump","抽油泵","pump"],["kayak","皮划艇","watercraft"]
];
for (const [id,name,toolType] of toolRows) addItem(id,name,"tool",{toolType});
for (const [id,waterYield] of [["wood_bucket",6],["iron_bucket",10],["steel_bucket",15]]) FULL_ITEMS[id].waterYield=waterYield;
FULL_ITEMS.wood_needle.dailyProductionCapacity=1;
FULL_ITEMS.iron_needle.dailyProductionCapacity=10;
addItem("rope","草绳");
addItem("firewood","木柴","fuel");

export const FULL_RECIPES = {};
function addRecipe(id,name,inputs,output,category,station="hand",tier=1,extra={}) {
  const out = typeof output === "string" ? {itemId:output,quantity:1} : output;
  FULL_RECIPES[id] = {id,name,inputs,output:out,blueprintId:id,category,station,tier,...extra};
  if (out?.itemId && !FULL_ITEMS[out.itemId]) addItem(out.itemId,name.replace(/×\d+.*$/,"").trim(),category==="food"?"food":"material",category==="food"?{happiness:extra.happiness??0,shelfLifeNights:1,directUse:true}:{});
}

// 工具与基础制作
const toolRecipes = [
  ["rope","草绳",{grass:3},{itemId:"rope",quantity:1},"hand"],["plank","木板",{wood:2},{itemId:"plank",quantity:1},"workbench"],["firewood","木柴",{wood:1},{itemId:"firewood",quantity:1},"hand"],
  ["wood_bucket","木制水桶",{plank:2,rope:1},"wood_bucket","workbench"],["iron_bucket","铁皮水桶",{wood_bucket:1,iron_ingot:2},"iron_bucket","smithy",2],["steel_bucket","钢制水桶",{iron_bucket:1,steel:2},"steel_bucket","machine_shop",4],
  ["stone_knife","石刀",{stone:2,wood:1,rope:1},"stone_knife","hand"],["iron_knife","铁刀",{stone_knife:1,iron_ingot:2,hardwood:1},"iron_knife","smithy",2],["steel_knife","钢刀",{iron_knife:1,steel:2,hardwood:1},"steel_knife","machine_shop",4],
  ["stone_axe","石斧",{wood:2,stone:3,rope:1},"stone_axe","hand"],["iron_axe","铁斧",{stone_axe:1,iron_ingot:3,wood:2},"iron_axe","smithy",2],["steel_axe","钢斧",{iron_axe:1,steel:3,hardwood:1},"steel_axe","machine_shop",4],
  ["stone_pick","石镐",{wood:2,stone:3,rope:1},"stone_pick","hand"],["iron_pick","铁镐",{stone_pick:1,iron_ingot:4,hardwood:1},"iron_pick","smithy",2],["steel_pick","钢镐",{iron_pick:1,steel:4,hardwood:1},"steel_pick","machine_shop",4],
  ["wood_shovel","木铲",{wood:3,rope:1},"wood_shovel","hand"],["iron_shovel","铁铲",{wood_shovel:1,iron_ingot:2,hardwood:1},"iron_shovel","smithy",2],["steel_shovel","钢铲",{iron_shovel:1,steel:2},"steel_shovel","machine_shop",4],
  ["iron_hook","木鱼钩",{wood:1},"iron_hook","workbench",1],
  ["wood_needle","木针",{wood:1},"wood_needle","workbench",1],["iron_needle","铁针",{iron_ingot:1},"iron_needle","smithy",2],["fishing_net","渔网",{flax:8},"fishing_net","workbench",2],
  ["trap","捕兽笼",{wood:4,rope:2},"trap","workbench"],["large_trap","大型捕兽笼",{plank:4,rope:6},"large_trap","workbench",2],["oil_pump","抽油泵",{steel:4,gear:2,copper_wire:2},"oil_pump","smithy",3],["kayak","皮划艇",{plank:5,rope:2,leather:10},"kayak","boatwright_bench",2]
];
for (const [id,name,inputs,output,station,tier=1] of toolRecipes) addRecipe(id,name,inputs,output,"craft",station,tier,{progression:["plank","wood_needle","iron_axe","iron_pick","oil_pump"].includes(id),fixedOnly:id==="kayak"});

// 40项核心加工；高效替代路线共用原蓝图，不增加计数。
const coreRecipes = [
  ["dried_meat","干肉",{pork:1},{itemId:"dried_meat",quantity:1},"smokehouse",2,{variants:["marten_meat","chicken_meat","mutton","beef","pork","crab_meat","giant_octopus_meat","wandering_lion_meat","snow_sheep_meat","snow_elephant_meat"]}],["dried_fish","干鱼",{fish:1},{itemId:"dried_fish",quantity:1},"smokehouse",2],
  ["charcoal","木炭×2",{wood:3},{itemId:"charcoal",quantity:2},"brick_kiln",2],["stone_brick","石砖×2",{stone:3},{itemId:"stone_brick",quantity:2},"masonry_table",1],["brick","砖×2",{clay:3},{itemId:"brick",quantity:2},"brick_kiln",2],["lime","石灰×2",{limestone:2},{itemId:"lime",quantity:2},"brick_kiln",2],
  ["cement","水泥×2",{lime:1,sand:2,clay:1},{itemId:"cement",quantity:2},"brick_kiln",3],["concrete","混凝土×2",{cement:1,sand:1,stone:2},{itemId:"concrete",quantity:2},"masonry_table",3],
  ["iron_ingot","铁锭",{iron_ore:2},"iron_ingot","smelter",2,{alternatives:[{rusty_iron:1}],progression:true}],["copper_ingot","铜锭",{copper_ore:2},"copper_ingot","smelter",2,{progression:true}],["steel","钢材",{iron_ingot:2},"steel","smelter",3,{progression:true}],
  ["copper_wire","铜线×2",{copper_ingot:1},{itemId:"copper_wire",quantity:2},"smithy",2],["glass","玻璃×2",{sand:3,limestone:1},{itemId:"glass",quantity:2},"glass_furnace",3,{progression:true}],["glass_panel","玻璃板",{glass:2},"glass_panel","glass_furnace",3],
  ["optical_lens","光学透镜",{glass:2,corundum_abrasive:1},"optical_lens","machine_shop",4,{alternatives:[{thunder_glass:1,corundum_abrasive:1}],alternativeQuantity:2}],["corundum_abrasive","刚玉磨料×2",{corundum:1},{itemId:"corundum_abrasive",quantity:2},"stone_mill",4],
  ["coffee_powder","咖啡粉×2",{coffee_bean:1},{itemId:"coffee_powder",quantity:2},"stone_mill",2],["honey","蜂蜜与蜂蜡",{honeycomb:1},{itemId:"honey",quantity:2},"cooking_table",1,{bonusOutput:{itemId:"beeswax",quantity:1}}],
  ["bone_glue","骨胶×2",{large_bone:1,water:1},{itemId:"bone_glue",quantity:2},"stone_pot",2,{alternatives:[{dense_bone:1,water:1}],alternativeQuantity:4}],
  ["salt","盐×2",{seawater:3},{itemId:"salt",quantity:2},"bonfire",1],["leather","皮革",{marten_pelt:1,salt:1},"leather","tanning_rack",2,{alternatives:[{lion_pelt:1,salt:1},{snow_sheep_pelt:1,salt:1},{cattle_pelt:1,salt:1},{pig_pelt:1,salt:1},{thick_pelt:1,salt:1}],rareAlternativeIndex:5,alternativeQuantity:2}],
  ["wool_cloth","羊毛布",{wool:2},"wool_cloth","workbench",2],["cotton_cloth","棉布",{cotton:2},"cotton_cloth","textile_table",2],["linen_cloth","麻布",{flax:2},"linen_cloth","textile_table",2],["rubber","橡胶×4",{crude_oil:4,sulfur:1},{itemId:"rubber",quantity:4},"chemical_table",3],["fuel","燃油×2",{crude_oil:3},{itemId:"fuel",quantity:2},"chemical_table",3],
  ["gear","齿轮×2",{iron_ingot:2},{itemId:"gear",quantity:2},"smithy",2],["precision_part","精密零件",{steel:2,copper_wire:1,corundum_abrasive:1},"precision_part","machine_shop",4],["insulated_cable","绝缘电缆×2",{copper_wire:2,rubber:1},{itemId:"insulated_cable",quantity:2},"smithy",3,{progression:true}],
  ["battery","蓄电池×2",{copper_ingot:2,iron_ingot:2,sulfur:1,glass:2},{itemId:"battery",quantity:2},"chemical_table",4,{alternatives:[{copper_ingot:2,iron_ingot:2,sulfur:1,thunder_glass:2}],alternativeQuantity:4}],
  ["desalinated_water","海水净化水×2",{seawater:3},{itemId:"water",quantity:2},"wood_stove",2],["melted_water","融冰水×2",{clean_ice:2},{itemId:"water",quantity:2},"bonfire",1],
  ["feed","饲料",{grass:2},"feed","workbench",1,{fixedOnly:true}],
  ["fertilizer_manure","粪肥×5",{manure:5,grass:2},{itemId:"fertilizer",quantity:5},"compost",2,{fixedOnly:true}],["fertilizer_rotten","腐坏物堆肥×2",{rotten:2,grass:2},{itemId:"fertilizer",quantity:2},"compost",2,{fixedOnly:true}],
  ["simple_poultice","简陋膏药",{herb:1,grass:1},"simple_poultice","workbench",1],["bandage","绷带×2",{wool_cloth:1},{itemId:"bandage",quantity:2},"needle",2],["medicine","药剂",{herb:2,honey:1,water:1},"medicine","cooking_table",2],["advanced_wound_medicine","高级伤药",{herb:4,honey:2,alcohol:1,bandage:1},"advanced_wound_medicine","cooking_table",3],
  ["cooking_oil","食用油×2",{animal_fat:2},{itemId:"cooking_oil",quantity:2},"stone_pot",2],["alcohol","酒×2",{rice:1,honey:1,water:1},{itemId:"alcohol",quantity:2},"brewing_table",3]
];
for (const [id,name,inputs,output,station,tier=1,extra={}] of coreRecipes) addRecipe(id,name,inputs,output,"process",station,tier,extra);

const basicFood = [
  ["rice","米饭",{rice_grain:1,water:1},{itemId:"rice",quantity:1},"stone_pot",2,2],["flour","面粉×2",{wheat:1},{itemId:"flour",quantity:2},"stone_mill",2],
  ["corn_flour","玉米粉×2",{corn:1},{itemId:"corn_flour",quantity:2},"stone_mill",2],["bread","面包×2",{flour:2,water:1},{itemId:"bread",quantity:2},"oven",3,2],
  ["butter","黄油",{milk:2},"butter","juicer",2],["cheese","奶酪×2",{milk:2,salt:1,vinegar:1},{itemId:"cheese",quantity:2},"cooking_table",3],["yogurt","酸奶",{milk:2},"yogurt","brewing_table",3,4],
  ["vinegar","醋×2",{rice:1,water:1},{itemId:"vinegar",quantity:2},"brewing_table",3],["apple_jam","苹果酱×2",{apple:2,honey:1},{itemId:"apple_jam",quantity:2},"stone_pot",2],
  ["blueberry_jam","蓝莓酱×2",{blueberry:2,honey:1},{itemId:"blueberry_jam",quantity:2},"stone_pot",2],["tomato_sauce","番茄酱×2",{tomato:2,salt:1},{itemId:"tomato_sauce",quantity:2},"stone_pot",2]
];
for (const [id,name,inputs,output,station,tier=1,happiness=0] of basicFood) addRecipe(`food_${id}`,name,inputs,output,"food",station,tier,{happiness});

const dishInputs = {
  roast_potato:{potato:1},boiled_egg:{egg:1,water:1},roast_mushroom:{mushroom:1},roast_pumpkin:{pumpkin:1},roast_fish:{fish:1},roast_shrimp:{shrimp:1},roast_marten:{marten_meat:1},sashimi:{fish:1},
  honey_apple:{apple:1,honey:1},honey_blueberry:{blueberry:1,honey:1},honey_banana:{banana:1,honey:1},mushroom_soup:{mushroom:1,water:1},fish_soup:{fish:1,water:1},tomato_egg_soup:{tomato:1,egg:1,water:1},corn_cake:{corn_flour:1,water:1},
  apple_jam_bread:{bread:1,apple_jam:1},blueberry_jam_bread:{bread:1,blueberry_jam:1},roast_chicken:{chicken_meat:1},fish_rice:{roast_fish:1,rice:1},egg_sandwich:{bread:1,boiled_egg:1},butter_bread:{butter:1,bread:1},corn_chowder:{corn:1,potato:1,milk:1},
  roast_pork:{pork:1},roast_beef:{beef:1},roast_mutton:{mutton:1},rice_ball:{vinegar:1,rice:1,fish:1},honey_chicken:{chicken_meat:1,honey:1},cheese_sandwich:{bread:1,cheese:1},apple_pie:{flour:1,butter:1,apple_jam:1,honey:1},cream_potato:{butter:1,cheese:1,potato:1},
  tomato_meat_noodle:{flour:1,tomato_sauce:1,beef:1},chicken_burger:{chicken_meat:1,bread:1,tomato:1},mushroom_pizza:{flour:1,tomato_sauce:1,cheese:1,mushroom:1},seafood_fried_rice:{shrimp:1,fish:1,carrot:1,rice:1},beef_stew:{potato:1,beef:1,onion:1},chicken_stew:{potato:1,chicken_meat:1,onion:1},fried_chicken:{chicken_meat:1,flour:1,cooking_oil:1},
  beef_pizza:{flour:1,tomato_sauce:1,cheese:1,beef:1,mushroom:1},cream_chicken_stew:{butter:1,chicken_meat:1,carrot:1,potato:1,onion:1},beef_rice:{beef:1,onion:1,rice:1},vinaigrette_salad:{tomato:1,carrot:1,onion:1,vinegar:1,cooking_oil:1},lamb_platter:{mutton:2,potato:1,carrot:1,lemon:1},crab_soup:{crab_meat:2,crab_shell:1,water:1,salt:1,lemon:1},honey_pork_ribs:{pork:2,honey:1,salt:1},island_feast:{beef:1,chicken_meat:1,fish:1,pumpkin:1,rice:1},banana_boat:{ice_cream:1,banana:1},blueberry_yogurt_cup:{blueberry:1,yogurt:1,honey:1},return_feast:{island_feast:1,apple_pie:1,milk_tea:1,coffee:1}
};
const ovenFoods = new Set(["corn_cake","apple_pie","cream_potato","mushroom_pizza","beef_pizza","lamb_platter","honey_pork_ribs"]);
const tableFoods = new Set(["sashimi","honey_apple","honey_blueberry","honey_banana","apple_jam_bread","blueberry_jam_bread","fish_rice","rice_ball","egg_sandwich","butter_bread","cheese_sandwich","chicken_burger","vinaigrette_salad","island_feast","banana_boat","blueberry_yogurt_cup","return_feast"]);
const potFoods = new Set(["boiled_egg","mushroom_soup","fish_soup","tomato_egg_soup","corn_chowder","crab_soup","beef_stew","chicken_stew"]);
const panFoods = new Set(["honey_chicken","tomato_meat_noodle","seafood_fried_rice","fried_chicken","beef_rice"]);
for (const [h,id,name,quantity=1] of dishRows) addRecipe(`dish_${id}`,`${name}${quantity>1?`×${quantity}`:""}`,dishInputs[id],{itemId:id,quantity},"food",panFoods.has(id)?"frying_pan":ovenFoods.has(id)?"oven":tableFoods.has(id)?"cooking_table":potFoods.has(id)?"stone_pot":"bonfire",h>=6?4:(h>=4?3:2),{happiness:h});

const drinkInputs = {hot_water:{water:1},ice_water:{clean_ice:1},apple_juice:{apple:1},carrot_juice:{carrot:1},corn_juice:{corn:1},blueberry_juice:{blueberry:1},sweet_milk:{milk:1,honey:1},green_tea:{tea_leaf:1,water:1},coffee:{coffee_powder:1,water:1},apple_shake:{apple:1,milk:1,honey:1},blueberry_shake:{blueberry:1,milk:1,honey:1},banana_shake:{banana:1,milk:1,honey:1},rice_wine:{alcohol:1,rice:1},ice_cream:{clean_ice:1,milk:1,honey:1},milk_tea:{tea_leaf:1,milk:1,honey:1},latte:{coffee_powder:1,milk:1,honey:1},honey_lemon_tea:{honey:1,lemon:1,tea_leaf:1,water:1},apple_milk_tea:{tea_leaf:1,milk:1,honey:1,apple:1,apple_jam:1}};
for (const [h,id,name,recipeTier] of drinkRows) {
  const station=id==="ice_water"?"cooking_table":["apple_juice","carrot_juice","corn_juice","blueberry_juice","apple_shake","blueberry_shake","banana_shake","ice_cream"].includes(id)?"juicer":"stone_pot";
  const tier=recipeTier??(id==="hot_water"?1:id==="ice_water"?2:h>=8?4:h>=4?3:2);
  addRecipe(`drink_${id}`,name,drinkInputs[id],id,"food",station,tier,{happiness:h});
}

// 饮料幸福度按当前隐藏价值分档；酸奶、冰激淋、拿铁、奶茶、蜂蜜柠檬茶和苹果奶绿使用指定的固定值。
export const DRINK_HAPPINESS_BY_ITEM_ID = Object.freeze({
  water:0,
  hot_water:1,
  ice_water:2,green_tea:2,
  alcohol:3,
  rice_wine:4,corn_juice:4,apple_juice:4,blueberry_juice:4,carrot_juice:4,coffee:4,
  milk:4,sweet_milk:4,banana_shake:4,apple_shake:4,blueberry_shake:4,
  honey_lemon_tea:5,
  milk_tea:6,
  apple_milk_tea:7,
  yogurt:8,
  latte:9,
  ice_cream:10
});
for(const [itemId,happiness] of Object.entries(DRINK_HAPPINESS_BY_ITEM_ID))FULL_ITEMS[itemId].happiness=happiness;
for(const recipe of Object.values(FULL_RECIPES)){
  const itemId=recipe.output?.itemId;
  if(itemId in DRINK_HAPPINESS_BY_ITEM_ID)recipe.happiness=DRINK_HAPPINESS_BY_ITEM_ID[itemId];
}

// 食物幸福度按当前隐藏价值分档，水煮蛋、土豆炖鸡、烤牛肉、烤羊肉、寿司、海鲜炒饭、蟹肉浓汤、苹果派、香蕉船和归航庆祝宴采用特殊设定；饮料沿用独立设定，蓝图等级也不随幸福度变化。
export const FOOD_HAPPINESS_BY_ITEM_ID = Object.freeze({
  lemon:0,tomato:0,banana:0,corn:0,apple:0,blueberry:0,onion:0,carrot:0,mushroom:0,potato:0,
  sashimi:1,pumpkin:1,roast_fish:1,rice:1,fish_soup:1,dried_fish:1,roast_mushroom:1,roast_potato:1,roast_pumpkin:1,mushroom_soup:1,
  honey_banana:2,honey_apple:2,honey_blueberry:2,roast_shrimp:2,
  fish_rice:3,dried_meat:3,roast_chicken:3,roast_marten:3,
  bread:4,corn_cake:4,beef_stew:4,corn_chowder:4,
  apple_jam_bread:5,blueberry_jam_bread:5,honey_chicken:5,boiled_egg:4,tomato_egg_soup:5,
  chicken_stew:6,chicken_burger:6,roast_pork:6,lamb_platter:6,beef_rice:6,tomato_meat_noodle:6,island_feast:6,
  seafood_fried_rice:7,egg_sandwich:7,fried_chicken:7,vinaigrette_salad:7,cheese_sandwich:7,mushroom_pizza:7,blueberry_yogurt_cup:7,
  roast_beef:4,roast_mutton:4,rice_ball:4,
  crab_soup:8,apple_pie:8,
  honey_pork_ribs:10,beef_pizza:10,cream_chicken_stew:10,butter_bread:10,
  banana_boat:11,cream_potato:11,
  return_feast:16
});
for(const [itemId,happiness] of Object.entries(FOOD_HAPPINESS_BY_ITEM_ID))FULL_ITEMS[itemId].happiness=happiness;
for(const recipe of Object.values(FULL_RECIPES)){
  const itemId=recipe.output?.itemId;
  if(itemId in FOOD_HAPPINESS_BY_ITEM_ID)recipe.happiness=FOOD_HAPPINESS_BY_ITEM_ID[itemId];
}

export const EQUIPMENT = {};
function equipment(id,name,slot,env={},tier=1,inputs={},station="needle",kind="armor") {
  EQUIPMENT[id]={id,name,slot,env,tier,kind}; addItem(id,name,kind,{env,slot}); addRecipe(id,name,inputs,id,"equipment",station,tier);
}
EQUIPMENT.system_small_backpack={id:"system_small_backpack",name:"系统小背包",slot:"backpack",tier:0,kind:"backpack",backpackCapacity:{ordinary:10,cold:3}};
for(const [id,name,tier,capacity,inputs] of [
  ["cotton_travel_backpack","棉布旅行包",2,{ordinary:14,cold:4},{cotton_cloth:4,leather:2,rope:2}],
  ["leather_hiking_backpack","皮革登山包",3,{ordinary:20,cold:6},{leather:6,linen_cloth:3,iron_ingot:2,rope:2}],
  ["insulated_expedition_backpack","保温远征包",4,{ordinary:28,cold:10},{wool_cloth:4,rubber:3,leather:4,insulated_cable:2}],
  ["modular_survival_backpack","模块化生存包",5,{ordinary:36,cold:15},{steel:2,rubber:4,cotton_cloth:4,insulated_cable:3,precision_part:1}]
]){
  EQUIPMENT[id]={id,name,slot:"backpack",tier,kind:"backpack",backpackCapacity:capacity};
  addItem(id,name,"backpack",{slot:"backpack",backpackCapacity:capacity});
  addRecipe(id,name,inputs,id,"equipment","needle",tier);
}
for (const [id,name,attack,weaponStyle,weaponLevel,tier,inputs,station] of [
  ["wood_stick","木棒",5,"melee",1,1,{wood:3},"workbench"],
  ["stone_spear","石矛",15,"melee",2,1,{wood_stick:1,stone:2,rope:2},"workbench"],
  ["iron_spear","铁矛",30,"melee",3,2,{stone_spear:1,iron_ingot:3,hardwood:1,leather:1},"smithy"],
  ["iron_weapon","精钢长刀",50,"melee",4,3,{iron_spear:1,steel:3,hardwood:2,leather:1,bone_glue:1},"smithy"],
  ["venom_halberd","淬毒战戟",75,"melee",5,4,{iron_weapon:1,steel:4,hardwood:2,venom:2,gear:1},"machine_shop"],
  ["alloy_venom_blade","精密合金毒刃",105,"melee",6,5,{venom_halberd:1,steel:6,corundum_abrasive:2,venom:3,precision_part:1},"machine_shop"],
  ["short_bow","短弓",15,"ranged",2,1,{wood:2,rope:2,tendon:1},"workbench"],
  ["hunting_bow","猎弓",30,"ranged",3,2,{short_bow:1,hardwood:3,tendon:2,rope:2},"workbench"],
  ["iron_crossbow","铁弩",50,"ranged",4,3,{hunting_bow:1,iron_ingot:4,hardwood:2,tendon:2,gear:1},"smithy"],
  ["steel_crossbow","钢弩",75,"ranged",5,4,{iron_crossbow:1,steel:5,hardwood:3,tendon:3,precision_part:1},"machine_shop"],
  ["venom_repeater","蚀骨追魂弩",105,"ranged",6,5,{steel_crossbow:1,steel:6,venom:3,gear:2,precision_part:2,insulated_cable:1},"machine_shop"]
]) {
  EQUIPMENT[id]={id,name,slot:"weapon",attack,weaponStyle,weaponLevel,tier,kind:"weapon"};
  addItem(id,name,"weapon",{attack,weaponStyle,weaponLevel,slot:"weapon"});
  addRecipe(id,name,inputs,id,"equipment",station,tier,{progression:true});
}

const armorSlots=["head","body","legs","feet","hands"], armorSlotNames=["头部","上身","下身","足部","手部"], armorWeights=[.15,.35,.25,.15,.10];
const fittedClothSuitInputs=(clothId)=>({
  head:{[clothId]:3,rope:1},body:{[clothId]:5,rope:1},legs:{[clothId]:5,rope:1},feet:{[clothId]:3,rope:1},hands:{[clothId]:3,rope:1}
});
const featherWarmSuitInputs={
  head:{feather:5,rope:1},body:{feather:8,rope:1},legs:{feather:8,rope:1},feet:{feather:5,rope:1},hands:{feather:5,rope:1}
};
const suitRows = [
  ["warm_grass_armor","保暖草甲",{warmth:12},1,{grass:12,rope:5},"needle"],["rain_grass_armor","蓑衣套装",{rain:100},1,{grass:12,rope:4},"needle"],["wind_grass_armor","防风草甲",{storm:100},1,{grass:12,rope:5,feather:5},"needle"],["shade_grass_armor","遮阳草甲",{heat:12},1,{grass:10,rope:3},"needle"],
  ["wool_leather_armor","羽绒温暖套装",{warmth:20},2,{},"needle",{},featherWarmSuitInputs],["breathable_leather_armor","麻布单衣",{heat:20},2,{},"needle",{},fittedClothSuitInputs("linen_cloth")],
  ["fur_iron_armor","加绒铁甲",{warmth:28},3,{iron_ingot:7,leather:4,wool_cloth:8,feather:10},"needle",{feather:2}],["storm_iron_armor","抗风保温钢甲",{warmth:28,storm:100},3,{fur_iron_armor_set:1,steel:10,rubber:5,cotton_cloth:5},"needle"],["vented_iron_armor","通风铁甲",{heat:28},3,{iron_ingot:7,leather:4,rope:4,linen_cloth:2},"needle"],
  ["heat_steel_armor","防雨耐热钢甲",{heat:28,rain:100},3,{vented_iron_armor_set:1,steel:10,rubber:5,beeswax:5},"needle",{linen_cloth:1}]
];
function splitArmorMaterial(quantity){
  const whole=Math.max(1,Math.floor(Number(quantity)||1));
  if(whole<armorSlots.length)return armorSlots.map(()=>1);
  const result=armorSlots.map(()=>1),remaining=whole-armorSlots.length,raw=armorWeights.map(weight=>remaining*weight);
  raw.forEach((value,index)=>{result[index]+=Math.floor(value);});
  let extras=remaining-raw.reduce((sum,value)=>sum+Math.floor(value),0);
  const ranked=raw.map((value,index)=>({index,fraction:value-Math.floor(value)})).sort((left,right)=>right.fraction-left.fraction||left.index-right.index);
  for(let index=0;index<extras;index+=1)result[ranked[index].index]+=1;
  return result;
}
for (const [id,name,env,tier,inputs,station,perPartInputs={},exactInputsBySlot=null] of suitRows) {
  const setId=`${id}_set`;
  EQUIPMENT[setId]={id:setId,name,slot:"set",env,tier,kind:"armorSet",parts:[]};
  armorSlots.forEach((slot,index)=>{const partId=`${id}_${slot}`; EQUIPMENT[partId]={id:partId,name:`${name}·${armorSlotNames[index]}`,slot,env:Object.fromEntries(Object.entries(env).map(([key,value])=>[key,Math.round(value*armorWeights[index])])),tier,kind:"armor"}; addItem(partId,EQUIPMENT[partId].name,"armor",EQUIPMENT[partId]); EQUIPMENT[setId].parts.push(partId);});
  const partInputs=armorSlots.map(slot=>exactInputsBySlot?{...exactInputsBySlot[slot]}:{});
  if(!exactInputsBySlot)for(const [inputId,quantity] of Object.entries(inputs)){
    const priorParts=inputId.endsWith("_set")?EQUIPMENT[inputId]?.parts:null;
    if(priorParts)priorParts.forEach((partId,index)=>{partInputs[index][partId]=quantity;});
    else splitArmorMaterial(quantity).forEach((partQuantity,index)=>{partInputs[index][inputId]=partQuantity;});
  }
  for(const inputs of partInputs)Object.assign(inputs,perPartInputs);
  EQUIPMENT[setId].parts.forEach((partId,index)=>addRecipe(partId,EQUIPMENT[partId].name,partInputs[index],partId,"equipment",station,tier));
}
for (const row of [
  ["waterproof_boots","防水皮靴","feet",{rain:15,rainStaminaReduction:.5},2,{leather:2,beeswax:1,rope:1,cotton_cloth:1},"needle"]
]) equipment(...row);

// 珍稀素材专属装备：四件装备分别专精一种灾害防护，不叠放部分暴风属性。
for (const row of [
  ["thick_pelt_coat","极寒兽皮服","body",{warmth:40},4,{thick_pelt:1,dense_bone:1},"needle"],
  ["glossy_feather_heat_leggings","亮羽隔热裤","legs",{heat:40},4,{glossy_feather:1,complete_tendon:1},"needle"],
  ["thunder_glass_goggles","雷晶防风镜","head",{storm:100},4,{thunder_glass:1,dense_bone:1},"needle"],
  ["rare_rain_boots","珍兽防雨靴","feet",{rain:100,rainStaminaReduction:1},4,{thick_pelt:1,complete_tendon:1},"needle"]
]) equipment(...row);

EQUIPMENT.rare_beast_pack={id:"rare_beast_pack",name:"珍兽远征包",slot:"backpack",tier:4,kind:"backpack",backpackCapacity:{ordinary:45,cold:20}};
addItem("rare_beast_pack","珍兽远征包","backpack",{slot:"backpack",backpackCapacity:{ordinary:45,cold:20}});
addRecipe("rare_beast_pack","珍兽远征包",{glossy_feather:1,complete_tendon:1,thick_pelt:1,dense_bone:1,thunder_glass:1},"rare_beast_pack","equipment","needle",4);

// 每条战斗装备链的最高级成品必须由玩家自己制作；蓝图仍可正常抽取或交易。
for(const kind of ["weapon","armor","backpack"]){
  const candidates=Object.values(EQUIPMENT).filter(entry=>entry.kind===kind&&FULL_ITEMS[entry.id]);
  const highestTier=Math.max(...candidates.map(entry=>entry.tier));
  for(const entry of candidates)if(entry.tier===highestTier)FULL_ITEMS[entry.id].tradeable=false;
}
// 珍兽远征包虽然是四级蓝图，但容量高于五级背包，同样属于只能自制的顶级装备。
FULL_ITEMS.rare_beast_pack.tradeable=false;

export const DEVICES = {};
for (const [id,name,inputs,houseTier,capacity,craftingStation,extra={}] of [
  ["stone_pot","木锅",{wood:3},1,0,"workbench",{space:0,progression:true}],["frying_pan","炒锅",{iron_ingot:3,plank:1},3,0],["oven","烤炉",{brick:6,iron_ingot:2},4,6,undefined,{space:1}],
  ["stone_mill","石磨",{stone:6,plank:2},3,4,"masonry_table",{space:1}],
  ["tanning_rack","鞣皮架",{plank:5,rope:2},1,2,"workbench",{blueprintTier:2,space:2}],["juicer","榨汁机",{iron_ingot:3,gear:1,glass:1},3,4]
]) {
  // 生产家具的蓝图等级仍由原策划阶段决定，但摆放统一只要求当地至少有茅草帐篷。
  DEVICES[id]={id,name,houseTier:1,capacity,space:Number.isFinite(extra.space)?extra.space:0};
  addItem(id,name,"device");
  addRecipe(`device_${id}`,name,inputs,id,"device",craftingStation??"hand",extra.blueprintTier??Math.max(1,houseTier-1),{blueprintId:`device_${id}`,progression:!!extra.progression});
}
Object.assign(DEVICES.stone_pot,{capacity:99,maxPerArea:1});
Object.assign(DEVICES.frying_pan,{capacity:99,maxPerArea:1});
Object.assign(DEVICES.oven,{maxPerArea:1});
Object.assign(DEVICES.stone_mill,{repeatable:true,maxPerArea:Infinity});
Object.assign(DEVICES.tanning_rack,{repeatable:true,maxPerArea:Infinity});
Object.assign(DEVICES.juicer,{maxPerArea:1});

export const FACILITIES = {};
function facility(id,name,steps,inputs,stamina,houseTier=0,effect={},extra={}) { FACILITIES[id]={id,name,steps,inputs,stamina,houseTier,effect,blueprintId:id,...extra}; }
const facilityRows = [
  ["bonfire","篝火",2,{stone:2,wood:2},1,0,{capacity:4,temperature:2,fuelDaily:2,heating:true}],
  ["workbench","制作台",1,{wood:3},1,1,{capacity:99}],
  ["grass_curtain","保温草帘",1,{grass:6,rope:1},.5,1,{warmth:4,stormFacilityProtection:10},{blueprintTier:1}],
  ["planting_bed","栽培地",1,{soil:3,fertilizer:1},.5,1,{plots:1},{maxPerArea:10,earlyBlueprint:true}],
  ["cooking_table","料理台",1,{plank:3,stone:2},1,2,{capacity:6},{blueprintId:"device_cooking_table"}],["compost","堆肥堆",1,{wood:4,grass:5},1,0,{capacity:1},{blueprintId:"device_compost",completionBlueprints:["fertilizer_manure","fertilizer_rotten"],noHouseRequired:true}],
  ["wood_stove","柴火灶",1,{stone_brick:4,iron_ingot:1},2,3,{capacity:8,temperature:2,fuelDaily:2,heating:true,happiness:1},{blueprintId:"device_wood_stove"}],["chemical_table","化工台",1,{brick:4,iron_ingot:2,glass:2},2.5,3,{capacity:3},{blueprintId:"device_chemical_table"}],
  ["textile_table","纺织机",1,{plank:5,iron_ingot:2},2,3,{capacity:4},{blueprintId:"device_textile_table"}],["brewing_table","酿造台",1,{clay:4,glass:2,plank:2},2,4,{capacity:2},{blueprintId:"device_brewing_table"}],["kitchen","厨房",6,{brick:2,plank:2,iron_ingot:1},2.5,4,{happiness:2,kitchenCapacityMultiplier:2,recipeIngredientReduction:1}],
  ["warehouse","仓库",5,{plank:3,stone:2},2,2,{storage:20}],
  ["seed_storage_room","种子储存室",5,{steel:2,plank:2,concrete:2},1,3,{seedStorage:20},{blueprintTier:3}],
  ["utility_room","杂物间",5,{steel:2,plank:3,concrete:3},1.5,3,{utilityStorage:30},{blueprintTier:3}],
  ["chicken_coop","鸡舍",4,{plank:2,rope:1},1,2,{animal:"chicken",capacity:2},{maxPerArea:2,completionBlueprints:["feed"]}],["smokehouse","晾晒棚",3,{wood:3,rope:1},1,0,{capacity:5},{blueprintTier:2,noHouseRequired:true}],["rain_collector","集水器",3,{plank:2,rope:1},1,2,{rainWater:3},{maxPerArea:4}],
  ["drainage_ditch","排水沟",3,{stone:3,clay:2,wood:1},1,2,{acidRainFacilityProtection:20}],["bathroom","浴室",4,{plank:2,stone:2,rope:1},1.5,2,{happiness:4}],["masonry_table","石工台",4,{stone:4,plank:1},1.5,2,{capacity:4}],
  ["cellar","地窖",6,{stone_brick:3,plank:2},2,3,{coldStorage:10}],["cellar_expansion","大地窖",5,{cement:1,plank:2,iron_ingot:1,brick:4},2,4,{coldStorage:15}],["sheep_pen","羊圈",5,{plank:3,stone:2},2,2,{animal:"sheep",capacity:2},{maxPerArea:2,completionBlueprints:["feed"]}],
  ["cattle_pen","牛圈",6,{plank:3,stone:2},2,2,{animal:"cattle",capacity:1},{maxPerArea:2,completionBlueprints:["feed"]}],["pig_pen","猪圈",5,{plank:3,stone:2},2,2,{animal:"pig",capacity:2},{maxPerArea:2,completionBlueprints:["feed"]}],["auto_feeder","自动喂食机",5,{brick:2,iron_ingot:1,clay:2},2,3,{autoFeed:true},{blueprintTier:2}],["beehive_box","蜂箱",4,{plank:2,honeycomb:1},1,3,{bees:true},{maxPerArea:4}],["toilet","厕所",5,{stone_brick:2,plank:1,clay:2},2,3,{happiness:4}],
  ["well","水井",6,{stone_brick:4,iron_ingot:1},2,3,{water:10}],["fireplace","壁炉",4,{stone_brick:3,iron_ingot:1},1.5,3,{temperature:6,fuelDaily:3,heating:true,heatingFuelReduction:.3}],["vent_hood","通风风帽",4,{stone_brick:2,plank:2,rope:1},1.5,3,{cooling:3,sickReduction:.1}],
  ["wind_shutters","防风百叶窗",1,{hardwood:4,iron_ingot:2},1.5,3,{stormFacilityProtection:20},{blueprintTier:3}],
  ["drip_irrigation","滴灌架",4,{plank:2,clay:2,iron_ingot:1},1.5,3,{autoWater:true}],
  ["brick_kiln","砖窑",5,{stone_brick:4,clay:2},2,3,{capacity:10}],["smelter","冶炼炉",7,{brick:4,stone_brick:2},2.5,3,{capacity:10}],["glass_furnace","玻璃熔炉",2,{brick:4,iron_ingot:1},2,3,{capacity:10},{blueprintId:"device_glass_furnace",blueprintTier:2}],["smithy","铁匠铺",7,{brick:3,iron_ingot:2},2.5,3,{capacity:5}],
  ["wind_anchor","防风锚桩",5,{stone:3,hardwood:2,iron_ingot:1,rope:1},2,3,{stormFacilityProtection:30}],["boatwright_bench","船工台",5,{plank:4,stone_brick:2,iron_ingot:1,rope:2},2,3,{capacity:2},{blueprintFixedOnly:true}],
  ["tannery","鞣皮工坊",5,{plank:3,brick:2},2,4,{stationBonus:{tanning_rack:2},happiness:2}],["greenhouse","温室",1,{glass_panel:2,steel:1},2,4,{plotProtection:true},{plotUpgrade:true}],
  ["pumping_station","抽水站",7,{steel:1,brick:3,clay:3},2,4,{water:20,acidRainFacilityProtection:20}],
  ["auto_fertilizer","自动施肥箱",5,{plank:2,iron_ingot:1,gear:1},2,4,{autoFertilize:true}],
  ["drainage_system","排水设施",6,{brick:3,cement:1},2,4,{acidRainFacilityProtection:40}],["warm_lining","保暖夹层",5,{plank:1,feather:3},1,1,{warmth:5},{blueprintTier:1}],
  ["insulation_layer","恒温蓄热层",6,{plank:3,wool_cloth:1,leather:1},2,4,{warmth:10,heatingFuelReduction:.25}],
  ["bedroom","卧室",6,{plank:3,wool_cloth:1,brick:1},2.5,5,{happiness:4}],["wardrobe","衣帽间",7,{plank:3,iron_ingot:1,wool_cloth:1},2.5,5,{wardrobeStorage:50}],["workroom","工作室",7,{brick:2,plank:2,iron_ingot:1},2.5,5,{happiness:4,workshopCapacityMultiplier:2}],
  ["recreation_room","娱乐室",6,{plank:3,glass:1,wool_cloth:1},2.5,5,{happiness:4}],["dining_room","餐厅",6,{plank:3,brick:2,glass:1},2.5,5,{happiness:4}],
  ["hydro_generator","水力发电机组",5,{steel:2,copper_wire:2,gear:1},2,0,{powerGeneration:5},{maxPerArea:20,noHouseRequired:true,allowedAreas:["C3","C4"],requiresAnyHouseLevel:5,blueprintFixedOnly:true,completionBlueprints:["distribution_room"],damageImmune:true}],
  ["distribution_room","配电室",3,{steel:2,copper_wire:2,gear:2,concrete:3},2,0,{gridAccess:true},{noHouseRequired:true,allowedAreas:["C3","C4"],prerequisites:["hydro_generator"],blueprintFixedOnly:true,damageImmune:true}],
  ["mining_machine","采矿机",5,{gear:2,steel:1,copper_wire:1},1,1,{power:2},{blueprintTier:3,maxPerArea:5,allowedAreas:["D1","C2","E1"],requiresLocalStorage:true,powerPriority:100,damageImmune:true}],
  ["air_conditioner","空调",7,{steel:2,glass_panel:1,insulated_cable:1},2.5,5,{cooling:25,power:1,happiness:3},{blueprintLotteryOnly:true}],
  ["machine_shop","机械工坊",10,{steel:2,gear:1,insulated_cable:1},3,5,{capacity:3}],["weather_station","气象站",7,{steel:1,glass_panel:1,copper_wire:2,precision_part:1},2.5,5,{forecast:3,power:1},{blueprintFixedOnly:true}],
  ["clinic","医务室",7,{brick:2,glass_panel:1,steel:1},2,5,{healing:true}],
  ["ice_cellar","冰窖",6,{concrete:2,steel:2,stone_brick:4,plank:4},2.5,5,{coldStorage:30},{noBlueprintRequired:true,prerequisites:["cellar_expansion"],replaces:"cellar_expansion"}],
  ["farm_expansion","扩耕",4,{wood:6,rope:4,soil:6,fertilizer:2},2,5,{farmExpanded:true},{noBlueprintRequired:true}],
  ["pasture","草场",5,{wood:6,plank:6,grass:10},2.5,5,{pasture:true},{noBlueprintRequired:true,prerequisites:["farm_expansion"]}],
  ["herb_field","药田",4,{wood:4,stone:4,soil:4,fertilizer:2},2,5,{herbField:true},{noBlueprintRequired:true,maxPerArea:1}]
];
addItem("fresh_herb","新鲜药草","material");
addRecipe("medicine_fresh","特效药剂",{fresh_herb:1,honey:1,water:1},"medicine","cooking_table",2);
addRecipe("dry_herb","草药",{fresh_herb:1},"herb","workbench",1);
for (const row of facilityRows) facility(...row);
// 同一地块只能建造一座的生产设施视为近乎不限次；允许同类多座/多件的生产工具保留各自原始产能与既有共用/累加方式。
for(const definition of Object.values(FACILITIES))if(Number(definition.effect?.capacity??0)>0&&(definition.maxPerArea??1)===1)definition.effect.capacity=99;
// 保留真正替代旧设施的升级链。
Object.assign(FACILITIES.wood_stove,{prerequisites:["bonfire"],replaces:"bonfire"});
Object.assign(FACILITIES.cellar_expansion,{prerequisites:["cellar"],replaces:"cellar"});
Object.assign(FACILITIES.ice_cellar,{prerequisites:["cellar_expansion"],replaces:"cellar_expansion"});
Object.assign(FACILITIES.drainage_system,{prerequisites:["drainage_ditch"],replaces:"drainage_ditch"});
Object.assign(FACILITIES.insulation_layer,{prerequisites:["warm_lining"],replaces:"warm_lining",lotteryPrerequisites:["warm_lining"]});
Object.assign(FACILITIES.pumping_station,{prerequisites:["well"],replaces:"well",lotteryPrerequisites:["well"]});
for(const id of ["bonfire","wood_stove","fireplace","drip_irrigation","air_conditioner","weather_station","mining_machine"])FACILITIES[id].switchable=true;
for(const id of ["fireplace","insulation_layer"])FACILITIES[id].earlyBlueprint=true;

// 生产燃料属于工具/设施本身：使用其中任意配方一次，都扣除相同的当地燃料点。
export const PRODUCTION_FUEL_COSTS=Object.freeze({
  bonfire:2,stone_pot:2,frying_pan:2,brick_kiln:5,smelter:20,oven:4,glass_furnace:10,wood_stove:2,smithy:10
});
for(const [id,productionFuelCost] of Object.entries(PRODUCTION_FUEL_COSTS)){
  const definition=DEVICES[id]??FACILITIES[id];
  if(definition)definition.productionFuelCost=productionFuelCost;
}

export const FURNITURE = {};
for (const [id,name,inputs,station,space,effect,tier=1] of [
  ["wood_tableware","木碗筷",{wood:2},"workbench",1,{happiness:1}],["ceramic_tableware","陶碗盘",{clay:2},"brick_kiln",1,{happiness:2},2],
  ["grass_bed","柴草床",{plank:2,grass:4,rope:1},"workbench",2,{happiness:1}],["plank_bed","木床",{plank:5,wool_cloth:2},"workbench",2,{happiness:2},2],["feather_bed","羽毛床",{plank:5,feather:8,cotton_cloth:2},"needle",2,{happiness:4},3],["wood_table","木桌椅",{plank:5},"workbench",2,{happiness:1},2],
  ["sofa","沙发",{plank:4,wool_cloth:2},"needle",2,{happiness:2},3],["cupboard","碗柜",{plank:4},"workbench",1,{happiness:1},2],["building_blocks_table","积木桌",{plank:2,wood:2},"workbench",1,{happiness:1},2],["dumbbell","哑铃",{iron_ingot:2},"smithy",1,{happiness:1},3],
  ["dartboard","飞镖靶",{plank:2,feather:2,iron_ingot:1},"workbench",1,{happiness:1},2],["rocking_chair","摇椅",{plank:4,rope:1},"workbench",1,{happiness:2},2],["electric_light","电灯",{glass:1,copper_wire:1,iron_ingot:1},"machine_shop",0,{happiness:3,power:1},4],
  ["oil_lamp","油灯",{iron_ingot:1,glass:1,fuel:1},"smithy",1,{happiness:1,fuelDaily:1},3],["storage_chest","储物箱",{wood:4,rope:1},"workbench",1,{storage:5},2],["bathtub","浴缸",{iron_ingot:4,plank:2},"smithy",3,{happiness:5,waterDaily:1,fuelDaily:2},3],["massage_bathtub","按摩浴缸",{steel:2,copper_wire:2,rubber:1},"machine_shop",3,{happiness:8,waterDaily:2,power:1},4],
  ["charcoal_dehumidifier","吸湿炭箱",{plank:2,charcoal:3},"workbench",1,{actionSicknessReduction:.1,acidRainFacilityProtection:5},2],["evaporative_cooler","蒸发冷风器",{clay:4,rope:2},"workbench",2,{cooling:6,waterDaily:1},2],["wool_blanket","羊毛厚毯",{wool_cloth:4},"needle",1,{warmth:10,happiness:1},2],
  ["fridge","冰箱",{steel:3,glass:1,insulated_cable:2},"machine_shop",4,{coldStorage:5,power:1},4],["fan","风扇",{iron_ingot:2,copper_wire:2},"smithy",2,{cooling:5,power:1},3],
  ["electric_heater","电暖器",{steel:2,copper_wire:2,insulated_cable:1},"machine_shop",2,{warmth:12,power:1},4],
  ["candle","蜡烛",{beeswax:2,rope:1},"workbench",1,{happiness:1},2],["feather_pillow","羽毛枕",{feather:4,cotton_cloth:1},"needle",1,{happiness:2},2],["snow_leopard_tapestry","雪豹挂毯",{snow_leopard_pelt:1,linen_cloth:1,plank:2},"needle",2,{happiness:3},4],["eagle_ornament","巨鹰羽饰",{eagle_feather:1,steel:1,plank:1},"machine_shop",1,{happiness:3,moveReduction:.1},4],
  ["lion_specimen","雄狮标本",{wandering_lion_pelt:1,cotton:10,salt:10},"needle",2,{happiness:3},4]
]) { FURNITURE[id]={id,name,space,effect,tier}; addItem(id,name,"furniture"); addRecipe(id,name,inputs,id,"furniture",station,tier); }
FULL_RECIPES.lion_specimen.fixedOnly=true;
FULL_ITEMS.wandering_lion_pelt.unlockBlueprints=["lion_specimen"];
const DAILY_FURNITURE_RESOURCE_KEYS=["fuelDaily","waterDaily","charcoalDaily","power"];
for(const definition of Object.values(FURNITURE))definition.switchable=DAILY_FURNITURE_RESOURCE_KEYS.some(key=>Number(definition.effect?.[key]??0)>0);
FURNITURE.storage_chest.repeatable=true;
FURNITURE.fridge.repeatable=true;
for(const id of ["evaporative_cooler","fan","electric_heater"])FURNITURE[id].repeatable=false;
for(const id of ["grass_bed","plank_bed","feather_bed"])FURNITURE[id].exclusiveGroup="bed";
for(const id of ["bathtub","massage_bathtub"])FURNITURE[id].exclusiveGroup="bathtub";
FULL_RECIPES.feather_pillow.alternatives=[{glossy_feather:1,cotton_cloth:1}];

// 保暖链作为生存进度优先项：保暖草甲及羽绒/加绒路线均通过前中期蓝图抽取获得。
for(const id of [
  ...EQUIPMENT.warm_grass_armor_set.parts,
  ...EQUIPMENT.wool_leather_armor_set.parts,...EQUIPMENT.fur_iron_armor_set.parts,
  "wool_blanket","leather","wool_cloth","device_tanning_rack"
])if(FULL_RECIPES[id])FULL_RECIPES[id].progression=true;

// 所有原“徒手制作”统一归入当地制作台；真正的徒手行为只保留在采集系统。
for (const recipe of Object.values(FULL_RECIPES)) if ((recipe.station ?? "hand") === "hand") recipe.station = "workbench";

export const LIVESTOCK_FEED_STAMINA_COST=.5;
export const LIVESTOCK = {
  chicken:{name:"鸡",youngItem:"chick",feed:{feed:1},matureDays:8,stages:[{name:"幼鸡",days:3},{name:"抱窝鸡",days:5},{name:"鸡群"}],continuous:{egg:{quantity:1,every:1},feather:{quantity:1,every:1},manure:{quantity:1,every:1},chicken_meat:{quantity:1,every:3}}},
  sheep:{name:"羊",youngItem:"lamb",feed:{feed:1},matureDays:9,stages:[{name:"小羊",days:4},{name:"产仔羊",days:5},{name:"羊群"}],continuous:{wool:{quantity:1,every:1},mutton:{quantity:1,every:3},large_bone:{quantity:1,every:3},tendon:{quantity:1,every:3},animal_fat:{quantity:1,every:3},manure:{quantity:1,every:1}}},
  cattle:{name:"牛",youngItem:"calf",feed:{feed:1},matureDays:16,stages:[{name:"小牛",days:6},{name:"育仔牛",days:10},{name:"牛群"}],continuous:{milk:{quantity:1,every:1},beef:{quantity:1,every:4},cattle_pelt:{quantity:2,every:4},large_bone:{quantity:1,every:4},tendon:{quantity:1,every:4},animal_fat:{quantity:1,every:4},manure:{quantity:1,every:1}}},
  pig:{name:"猪",youngItem:"piglet",feed:{feed:1},matureDays:9,stages:[{name:"幼猪",days:4},{name:"育仔猪",days:5},{name:"猪群"}],continuous:{pork:{quantity:1,every:3},pig_pelt:{quantity:1,every:3},animal_fat:{quantity:1,every:3},manure:{quantity:1,every:1}}}
};

export const ENEMIES = {
  wild_chicken:{name:"野鸡",attack:15,combatLevel:1,weakness:"melee",drops:{chicken_meat:[1,1],feather:[1,1],egg:[1,.3]},rareChance:.08,rare:{glossy_feather:100}},
  giant_rat:{name:"大老鼠",attack:15,combatLevel:1,weakness:"melee",drops:{small_fur:[1,1]}},
  marten_enemy:{name:"貂",attack:25,combatLevel:2,weakness:"melee",drops:{marten_pelt:[1,1],marten_meat:[1,1],tendon:[1,1]},rareChance:.10,rare:{complete_tendon:100}},
  venom_snake:{name:"毒蛇",attack:25,combatLevel:2,weakness:"ranged",drops:{venom:[1,1],animal_fat:[1,.4]}},
  giant_crab:{name:"大螃蟹",attack:40,combatLevel:3,weakness:"melee",drops:{crab_meat:[2,1],crab_shell:[1,1]}},
  wolf_pack:{name:"荒野狼群",attack:40,combatLevel:3,weakness:"ranged",drops:{tendon:[1,1],large_bone:[1,.5]},rareChance:.12,rare:{thick_pelt:60,complete_tendon:40}},
  snow_sheep:{name:"雪羊",attack:60,combatLevel:4,weakness:"melee",drops:{snow_sheep_meat:[2,1],snow_sheep_pelt:[1,.6],snow_sheep_tendon:[1,.6],snow_sheep_bone:[1,.4]},rareChance:.16,rare:{complete_tendon:55,thick_pelt:45}},
  giant_python:{name:"巨蟒",attack:60,combatLevel:4,weakness:"ranged",drops:{giant_python_venom:[1,.6],giant_python_pelt:[1,.7],giant_python_bone:[1,.6]},rareChance:.16,rare:{thick_pelt:55,dense_bone:45}},
  snow_elephant:{name:"雪象",attack:85,combatLevel:5,weakness:"ranged",drops:{snow_elephant_meat:[3,1],snow_elephant_pelt:[1,.7],snow_elephant_fat:[2,.6],snow_elephant_tendon:[1,.7],snow_elephant_bone:[1,.6]},rareChance:.22,rare:{complete_tendon:35,thick_pelt:35,dense_bone:30}},
  lion_pride:{name:"狮群",attack:85,combatLevel:5,weakness:"melee",drops:{lion_pelt:[1,1],large_bone:[2,1]},rareChance:.22,rare:{thick_pelt:60,dense_bone:40}},
  giant_octopus:{name:"深海巨型章鱼",attack:85,combatLevel:5,weakness:"ranged",drops:{giant_octopus_meat:[3,1],tough_tentacle:[1,.8]},rareChance:.22,rare:{complete_tendon:100}},
  giant_scorpion:{name:"巨型毒蝎",attack:115,combatLevel:6,weakness:"ranged",drops:{scorpion_venom:[2,1],scorpion_chitin:[1,1]},rareChance:.30,rare:{dense_bone:60,complete_tendon:40}},
  wandering_lion:{name:"游荡雄狮",attack:115,combatLevel:6,weakness:"melee",drops:{wandering_lion_meat:[4,1],wandering_lion_pelt:[1,1],lion_fang:[2,1]},rareChance:.30,rare:{thick_pelt:45,dense_bone:35,complete_tendon:20}},
  snow_leopard:{name:"雪豹",attack:115,combatLevel:6,weakness:"melee",boss:true,area:"A1",drops:{space_module:[1,1],snow_leopard_pelt:[1,1],large_bone:[3,1]}},
  giant_eagle:{name:"巨鹰",attack:115,combatLevel:6,weakness:"ranged",boss:true,area:"A7",drops:{coordinate_module:[1,1],eagle_feather:[1,1],tendon:[3,1]}}
};

// 取消裁缝台后，衣物制作改由制作台配合针具完成。
facility("return_tower","归航塔",1,{space_module:1,coordinate_module:1,return_core:1},5,5,{ending:true},{blueprintId:"return_tower",fixedOnly:true,global:true});

const blueprintName=(recipe)=>recipe.name.replace(/×\d+$/u,"");
export const BLUEPRINTS = [
  ...Object.values(FULL_RECIPES).filter(r=>r.category==="craft"||r.category==="process").map(r=>({id:r.blueprintId,name:blueprintName(r),tier:r.tier,category:"crafting",progression:!!r.progression,fixedOnly:!!r.fixedOnly})),
  ...Object.values(FULL_RECIPES).filter(r=>r.category==="food").map(r=>({id:r.blueprintId,name:blueprintName(r),tier:r.tier,category:"food",progression:!!r.progression})),
  ...Object.values(FULL_RECIPES).filter(r=>r.category==="equipment").map(r=>({id:r.blueprintId,name:blueprintName(r),tier:r.tier,category:"equipment",progression:!!r.progression})),
  ...Object.values(FULL_RECIPES).filter(r=>r.category==="furniture").map(r=>({id:r.blueprintId,name:blueprintName(r),tier:r.tier,category:"furniture",progression:!!r.progression,fixedOnly:!!r.fixedOnly})),
  ...Object.values(FULL_RECIPES).filter(r=>r.category==="device").map(r=>({id:r.blueprintId,name:blueprintName(r),tier:r.tier,category:"facility",progression:!!r.progression})),
  ...Object.values(FACILITIES).map(f=>({id:f.blueprintId,name:f.name,tier:f.blueprintTier??Math.max(1,f.houseTier-1),category:"facility",fixedOnly:!!f.fixedOnly||!!f.blueprintFixedOnly,lotteryOnly:!!f.blueprintLotteryOnly,progression:!!f.earlyBlueprint||["workbench","masonry_table","brick_kiln","smelter","smithy","machine_shop","mining_machine"].includes(f.id),...(f.lotteryPrerequisites?.length?{lotteryPrerequisites:[...f.lotteryPrerequisites]}:{})}))
];

export const CONTENT_COUNTS = {
  crafting: BLUEPRINTS.filter(b=>b.category==="crafting").length,
  food: BLUEPRINTS.filter(b=>b.category==="food").length,
  equipment: BLUEPRINTS.filter(b=>b.category==="equipment").length,
  furniture: BLUEPRINTS.filter(b=>b.category==="furniture").length,
  facility: BLUEPRINTS.filter(b=>b.category==="facility").length,
  total: BLUEPRINTS.length
};

export const INITIAL_BLUEPRINT_IDS=[
  "rope","firewood","wood_stick","stone_knife","stone_axe","stone_pick","wood_bucket","stone_brick",
  "drink_hot_water","drink_ice_water",
  "bonfire","workbench","warehouse","planting_bed",
  "masonry_table","cellar","drip_irrigation","sheep_pen",
  "brick_kiln","smelter","smithy",
  "grass_curtain","storage_chest","wood_needle"
];
