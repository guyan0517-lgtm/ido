import {
  AREA_NAMES,
  BASE_TEMPERATURES,
  BLUEPRINTS,
  BUILDINGS,
  CHARACTERS,
  CONTINUED_EXPLORATION_NODE_WEIGHTS,
  CONTINUED_EXPLORATION_SPECIAL_NODE_CHANCES,
  CROPS,
  CULTIVATED_SEED_DROP_CHANCE,
  DEVICES,
  ENEMIES,
  EQUIPMENT,
  FURNITURE,
  GRASSLAND_HERB_CHANCE,
  HERB_SEED_REPLACEMENT_CHANCE,
  HOUSE_LEVELS,
  INITIAL_BLUEPRINTS,
  ITEMS,
  KAYAK_REQUIRED_AREAS,
  LOTTERY_BLUEPRINTS,
  NODES,
  RECIPES,
  AREAS,
  LIVESTOCK,
  LIVESTOCK_FEED_STAMINA_COST,
  SHIPWRECK_CHEST_PACKS,
  UNIQUE_DEPENDENT_ITEM_IDS,
  WILD_SEED_DROP_CHANCES
} from "./data.js";
import { pickFromKey, randomFromKey, weightedPick } from "./rng.js";
import { getBarterValue, getBlueprintBarterValue, RAW_BASIC_MATERIAL_IDS } from "./barter-values.js";
import { ACTIVE_ATTACK_CHANCE, getActiveAttackAreasForEnemy, getActiveAttackEnemyIds } from "./active-attacks.js";
import { NPC_MAIL_TRADE_REQUIREMENTS } from "./npc-content.js";
import { FOOD_PROCESSING_TRADE_ITEM_IDS } from "./content.js";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const clone = (value) => structuredClone(value);
const getRandomRevision = (state) => Number.isSafeInteger(state?.randomRevision) && state.randomRevision > 0 ? state.randomRevision : 0;
function getGameplaySeed(state) {
  const revision = getRandomRevision(state);
  return revision ? `${state.seed}:restart:${revision}` : state.seed;
}
const roundStamina = (value) => Math.round((Number(value) + Number.EPSILON) * 10) / 10;
export function formatStamina(value) {
  const numeric=Number(value);
  if(!Number.isFinite(numeric))return String(value);
  const rounded=roundStamina(numeric);
  return String(Object.is(rounded,-0)?0:rounded);
}
const friendlyPlayerText = (value) => String(value ?? "")
  .replaceAll("日结", "结束今天时")
  .replaceAll(">=", "不小于")
  .replaceAll("≥", "不小于")
  .replaceAll("<=", "不大于")
  .replaceAll("≤", "不大于");
const END_OF_DAY_TASK_EVENTS=new Set(["eat","drink","eat_happy","drink_happy","comfort","end_in_house","stamina_end","device_end"]);
const LEGACY_FACILITY_ITEMS={cooking_table:"cooking_table",wood_stove:"wood_stove",chemical_table:"chemical_table",textile_table:"textile_table",brewing_table:"brewing_table",compost:"compost",yogurt_maker:"brewing_table",grass_curtain:"grass_curtain",wind_shutters:"wind_shutters",glass_furnace:"glass_furnace"};
const LEGACY_FACILITY_ITEM_REFUNDS={glass_furnace:{brick:8,iron_ingot:2}};
const FIXED_HOUSE_ANNEX_ITEMS=new Set(["grass_curtain","wind_shutters"]);
const ANIMAL_HUNT_NODE_IDS=new Set(["chicken_flock","sheep_flock","cattle_herd","wild_boar_herd"]);
const DAILY_GATHER_EXCLUDED_NODES=new Set(["shipwreck_chest","shipwreck_debris","mysterious_facility",...ANIMAL_HUNT_NODE_IDS]);
const REMOVED_FUEL_TANK_BLUEPRINT_IDS=new Set(["fuel_tank","device_yogurt_maker"]);
const REMOVED_DRYING_RACK_BLUEPRINT_ID="device_drying_rack";
const REMOVED_FURNITURE_ITEM_IDS=new Set(["climate_machine"]);
const REMOVED_ITEM_REPLACEMENTS=Object.freeze({smoked_meat:"dried_meat",smoked_fish:"dried_fish"});
const REMOVED_ITEM_IDS=new Set([
  "scissors","sheep_pelt",
  "cucumber","cucumber_seed","cucumber_salad","dish_cucumber_salad",
  "nut","nut_seed","honey_nut","dish_honey_nut",
  ...Object.keys(REMOVED_ITEM_REPLACEMENTS)
]);
const REMOVED_DRYING_RACK_REFUND=Object.freeze({wood:4,rope:2});
const REMOVED_TEXTILE_WORKSHOP_ID="textile_workshop";
const REMOVED_TEXTILE_WORKSHOP_INPUTS=Object.freeze({plank:3,brick:2});
const REMOVED_DISASTER_SHUTTERS_ID="disaster_shutters";
const REMOVED_DISASTER_SHUTTERS_INPUTS=Object.freeze({steel:2,gear:1,insulated_cable:1});
const REMOVED_FACILITIES=Object.freeze({
  repair_shed:Object.freeze({steps:5,inputs:Object.freeze({plank:3,hardwood:2,iron_ingot:1})}),
  battery_room:Object.freeze({steps:6,inputs:Object.freeze({brick:3,battery:1})}),
  water_plant:Object.freeze({steps:8,inputs:Object.freeze({steel:2,glass:2,insulated_cable:1})}),
  generator_room:Object.freeze({steps:8,inputs:Object.freeze({steel:2,copper_wire:2,gear:1})}),
  cold_storage:Object.freeze({steps:8,inputs:Object.freeze({steel:2,glass_panel:1,insulated_cable:1})})
});
const REMOVED_GRASS_ARMOR_REPLACEMENTS=Object.freeze({
  grass_armor_head:"warm_grass_armor_head",
  grass_armor_body:"warm_grass_armor_body",
  grass_armor_legs:"warm_grass_armor_legs",
  grass_armor_feet:"warm_grass_armor_feet",
  grass_armor_hands:"warm_grass_armor_hands"
});
const REMOVED_GRASS_ARMOR_BLUEPRINT_IDS=new Set(["grass_armor",...Object.keys(REMOVED_GRASS_ARMOR_REPLACEMENTS)]);
const REMOVED_STANDALONE_EQUIPMENT_REPLACEMENTS=Object.freeze({
  wide_hat:"shade_grass_armor_head",
  shade_shawl:"shade_grass_armor_body",
  wool_shawl:"wool_leather_armor_body",
  wind_goggles:"storm_iron_armor_head"
});
const REMOVED_STANDALONE_EQUIPMENT_IDS=new Set(Object.keys(REMOVED_STANDALONE_EQUIPMENT_REPLACEMENTS));
const REMOVED_DEFENSE_ARMOR_SET_REPLACEMENTS=Object.freeze({
  leather_armor:"warm_grass_armor",
  waxed_leather_armor:"rain_grass_armor",
  iron_leather_armor:"wool_leather_armor",
  cold_steel_armor:"fur_iron_armor",
  sealed_steel_armor:"storm_iron_armor"
});
const REMOVED_DEFENSE_ARMOR_REPLACEMENTS=Object.freeze(Object.fromEntries(Object.entries(REMOVED_DEFENSE_ARMOR_SET_REPLACEMENTS).flatMap(([removed,replacement])=>
  ["head","body","legs","feet","hands"].map(slot=>[`${removed}_${slot}`,`${replacement}_${slot}`])
)));
const REMOVED_DEFENSE_ARMOR_BLUEPRINT_IDS=new Set([
  ...Object.keys(REMOVED_DEFENSE_ARMOR_SET_REPLACEMENTS),
  ...Object.keys(REMOVED_DEFENSE_ARMOR_SET_REPLACEMENTS).map(id=>`${id}_set`),
  ...Object.keys(REMOVED_DEFENSE_ARMOR_REPLACEMENTS)
]);
const REMOVED_STEEL_ARMOR_PARTS=Object.freeze(Object.fromEntries([
  ["head","头部",{steel:2,leather:1,precision_part:1}],
  ["body","上身",{steel:3,leather:2,precision_part:1}],
  ["legs","下身",{steel:2,leather:1,precision_part:1}],
  ["feet","足部",{steel:2,leather:1,precision_part:1}],
  ["hands","手部",{steel:1,leather:1,precision_part:1}]
].map(([slot,label,inputs])=>[`steel_armor_${slot}`,Object.freeze({name:`钢制生存护具·${label}`,inputs:Object.freeze(inputs)})])));
const REMOVED_CRAFTED_EQUIPMENT=Object.freeze({
  ...REMOVED_STEEL_ARMOR_PARTS,
  snow_shoes:Object.freeze({name:"雪地鞋",inputs:Object.freeze({hardwood:2,leather:2,rope:2})})
});
const REMOVED_CRAFTED_EQUIPMENT_IDS=new Set(["steel_armor","steel_armor_set",...Object.keys(REMOVED_CRAFTED_EQUIPMENT)]);
const DIRECT_FUEL_STATIONS=new Set([
  ...Object.entries(BUILDINGS),...Object.entries(DEVICES)
].filter(([,definition])=>Number(definition.productionFuelCost??0)>0).map(([id])=>id));
const KITCHEN_STATIONS=new Set(["bonfire","wood_stove","stone_pot","frying_pan","oven","cooking_table","smokehouse","juicer","brewing_table"]);
export function isKitchenStation(stationId){return KITCHEN_STATIONS.has(stationId);}
const DAILY_ITEM_RESOURCE_EFFECTS=Object.freeze([
  {effectKey:"waterDaily",itemId:"water"},
  {effectKey:"charcoalDaily",itemId:"charcoal"}
]);
const isBuildingEnabled=(baseId,entry)=>!BUILDINGS[baseId]?.switchable||entry.enabled!==false;
const isFurnitureEnabled=(entry)=>!FURNITURE[entry.itemId]?.switchable||entry.enabled!==false;
export const BACKPACK_CAPACITY = Object.freeze({ cold: 3, ordinary: 10 });
export const NPC_MAIL_FAVOR_THRESHOLDS=Object.freeze([1,2,3,4,5,6,7,8,9,10]);
export const MAX_NPC_TRADE_DISCOUNT=.3;
const MAX_NPC_TRADE_DISCOUNT_FAVOR=10;
export const GLOBAL_TRADE_PRICE_MULTIPLIER=1.1;
export const WEATHER_PREPARED_PRICE_MULTIPLIER=1.5;
export const WEATHER_BUYBACK_PRICE_MULTIPLIER=.8;
export const NPC_BASIC_DURABLE_BUYBACK_MULTIPLIER=1.5;
export const COLD_WOOL_BLANKET_PRICE_MULTIPLIER=2;
export const DAILY_TRADE_OFFER_COUNT=10;
export const MAX_RETAINED_NATURAL_NODES=100;
export const MAX_DAILY_RARE_MATERIAL_WANTS=1;
export const RARE_MATERIAL_WANT_CHANCE=.15;
export const DAILY_LOTTERY_MATERIAL_WEIGHTS=Object.freeze({grass:20,wood:20,stone:20,clay:15,sand:15,water:5});
const DAILY_LOTTERY_NON_WATER_MATERIAL_WEIGHTS=Object.freeze(Object.fromEntries(Object.entries(DAILY_LOTTERY_MATERIAL_WEIGHTS).filter(([itemId])=>itemId!=="water")));
const DAILY_LOTTERY_WATER_ASSIST_CHANCE=.5;
export const D4_LOW_FOOD_APPLE_CHANCE=.5;
export const FEED_ANIMALS_STAMINA_COST=LIVESTOCK_FEED_STAMINA_COST;
export const LIVESTOCK_STARVATION_DAYS=10;
const ANIMAL_PEN_IDS=Object.freeze({chicken:"chicken_coop",sheep:"sheep_pen",cattle:"cattle_pen",pig:"pig_pen",fish:"fishery",crab:"crab_pen"});
const AUTOMATIC_FEED_ORDER=Object.freeze(["pig","cattle","sheep","chicken","fish","crab"]);
// 好感折扣调整只作用于新报价，保留定价版本以免刷新玩家已有交易。
const TRADE_PRICING_RULE_VERSION=90;
const WEATHER_TRADE_RULE_VERSION=6;
const NPC_WANT_RULE_VERSION=1;
const UPDATED_NPC_WANT_IDS=new Set(["npc_09","npc_27"]);
export const SAVE_VERSION=27;
export const SAVE_FORMAT="compact-v1";
const FARM_FERTILITY_RULE_VERSION=2;
const CROP_REGROWTH_RULE_VERSION=1;
const DIET_SURVIVAL_RULE_VERSION=1;
const INJURY_RECOVERY_RULE_VERSION=1;
const AUTOMATIC_WATER_STORAGE_RULE_VERSION=1;
const REINFORCEMENT_DURATION_RULE_VERSION=1;
export const REINFORCEMENT_DURATION_DAYS=8;
const AUTOMATIC_WATER_PRIORITY=Object.freeze({drip_irrigation:1,evaporative_cooler:2,bathtub:3,massage_bathtub:3});
const IMPORTANT_FURNITURE_EFFECT_KEYS=new Set(["storage","coldStorage","warmth","cooling","acidRainFacilityProtection","stormFacilityProtection","actionSicknessReduction","sickReduction","rest","restFloor","moveReduction"]);
// 推进保底只保障会开启新资源或新系统的内容；纯效率工具和纯幸福设施仍保留在普通抽取与交易池。
const DAILY_PROGRESS_EXCLUDED_BLUEPRINT_IDS=new Set([
  "bathroom","toilet","warm_lining","cellar_expansion","seed_storage_room","utility_room",
  "iron_bucket","steel_bucket","iron_knife","steel_knife","steel_axe","iron_shovel","steel_shovel"
]);
function isDailyProgressBlueprint(blueprint){
  if(DAILY_PROGRESS_EXCLUDED_BLUEPRINT_IDS.has(blueprint.id))return false;
  if(blueprint.category==="facility")return true;
  const recipes=Object.values(RECIPES).filter(recipe=>recipe.blueprintId===blueprint.id);
  if(blueprint.category==="crafting")return recipes.some(recipe=>(recipe.outputs??[recipe.output]).some(output=>["tool","material","fuel"].includes(ITEMS[output?.itemId]?.type)));
  if(blueprint.category!=="furniture")return false;
  return recipes.some(recipe=>(recipe.outputs??[recipe.output]).some(output=>Object.entries(FURNITURE[output?.itemId]?.effect??{}).some(([key,value])=>IMPORTANT_FURNITURE_EFFECT_KEYS.has(key)&&Number(value)!==0)));
}
export const DAILY_PROGRESS_BLUEPRINT_IDS=Object.freeze(LOTTERY_BLUEPRINTS.filter(isDailyProgressBlueprint).map(blueprint=>blueprint.id));
function lotteryPrerequisitesMet(state,blueprint){
  return (blueprint?.lotteryPrerequisites??[]).every(blueprintId=>state.ownedBlueprintIds?.includes(blueprintId));
}
const DAILY_PROGRESS_TOOL_SERIES_BY_TYPE=new Map();
for(const blueprintId of DAILY_PROGRESS_BLUEPRINT_IDS){
  for(const recipe of Object.values(RECIPES).filter(entry=>entry.blueprintId===blueprintId)){
    for(const output of recipe.outputs??[recipe.output]){
      const item=ITEMS[output?.itemId];
      if(item?.type!=="tool"||!item.toolType)continue;
      const series=DAILY_PROGRESS_TOOL_SERIES_BY_TYPE.get(item.toolType)??[];
      if(!series.includes(blueprintId))series.push(blueprintId);
      DAILY_PROGRESS_TOOL_SERIES_BY_TYPE.set(item.toolType,series);
    }
  }
}
for(const series of DAILY_PROGRESS_TOOL_SERIES_BY_TYPE.values())series.sort((leftId,rightId)=>{
  const left=BLUEPRINTS.find(blueprint=>blueprint.id===leftId),right=BLUEPRINTS.find(blueprint=>blueprint.id===rightId);
  return (left?.tier??1)-(right?.tier??1)||leftId.localeCompare(rightId);
});

export function getDailyProgressGuaranteeBlueprintIds(state){
  const owned=new Set(state.ownedBlueprintIds??[]);
  const candidates=DAILY_PROGRESS_BLUEPRINT_IDS.filter(blueprintId=>{
    if(owned.has(blueprintId))return false;
    if(!lotteryPrerequisitesMet(state,BLUEPRINTS.find(blueprint=>blueprint.id===blueprintId)))return false;
    for(const series of DAILY_PROGRESS_TOOL_SERIES_BY_TYPE.values()){
      if(series.length<2||!series.includes(blueprintId))continue;
      return series.find(id=>!owned.has(id))===blueprintId;
    }
    return true;
  });
  if(!candidates.length)return [];
  const minimumTier=Math.min(...candidates.map(blueprintId=>BLUEPRINTS.find(blueprint=>blueprint.id===blueprintId)?.tier??1));
  return candidates.filter(blueprintId=>(BLUEPRINTS.find(blueprint=>blueprint.id===blueprintId)?.tier??1)===minimumTier);
}

function getAreaSites(areaId,seed){
  const definition = AREAS[areaId];
  return clone(definition.nodes);
}

function pickUndiscoveredAreaNode(unknownNodes,areaId,seed,attempt){
  if(AREAS[areaId].fixedDiscoveryOrder){
    return AREAS[areaId].nodes.map(site=>unknownNodes.find(node=>node.id===site.id)).find(Boolean)??null;
  }
  return pickFromKey(unknownNodes,seed,`discover:${areaId}:${attempt}`);
}

function makeAreaState(areaId, opened,seed) {
  const sites=getAreaSites(areaId,seed);
  return {
    id: areaId,
    opened,
    exploration: 0,
    explorationActions: 0,
    nodeDiscoveryIndex: 0,
    resolvedThresholds: [],
    nodes: Object.fromEntries(sites.map((site) => [site.id, {
      id: site.id,
      nodeId: site.nodeId,
      siteLabel: site.siteLabel,
      revealed: false,
      maxCharges: site.maxCharges,
      charges: site.initialCharges ?? site.maxCharges,
      respawnRemaining: 0
    }]))
  };
}

function inferLegacyNodeDiscoveryOrder(state,areaId,area,sites){
  const revealedNodes=Object.values(area.nodes).filter(node=>node.revealed);
  const existingOrders=revealedNodes.map(node=>Number(node.discoveryOrder)).filter(Number.isFinite);
  let nextOrder=Math.max(Number(area.nodeDiscoveryIndex??0),0,...existingOrders);
  const missingNodes=revealedNodes.filter(node=>!Number.isFinite(Number(node.discoveryOrder)));
  if(!missingNodes.length){area.nodeDiscoveryIndex=nextOrder;return;}

  const inferred=[];
  const ordinary=sites.map(site=>area.nodes[site.id]).filter(node=>node&&!NODES[node.nodeId]?.special);
  const unknown=[...ordinary];
  const fixedAttemptCount=Math.min(10,Math.max(0,Number(area.explorationActions??Math.ceil(Number(area.exploration??0)/10))));
  for(let attempt=1;attempt<=fixedAttemptCount&&unknown.length;attempt+=1){
    const guaranteedApple=areaId==="D4"&&attempt===1?unknown.find(node=>node.nodeId==="apple_tree"):null;
    const found=guaranteedApple??pickUndiscoveredAreaNode(unknown,areaId,state.seed,attempt);
    if(found){inferred.push(found);unknown.splice(unknown.indexOf(found),1);}
    for(const special of sites.map(site=>area.nodes[site.id]).filter(node=>node&&NODES[node.nodeId]?.special)){
      const unlockAttempt=Math.ceil(Number(NODES[special.nodeId]?.unlockAtExploration??100)/10);
      if(unlockAttempt===attempt&&!inferred.includes(special))inferred.push(special);
    }
  }
  const generated=Object.values(area.nodes)
    .filter(node=>node.generatedByExploration)
    .sort((left,right)=>Number(left.explorationSequence??0)-Number(right.explorationSequence??0));
  inferred.push(...generated.filter(node=>!inferred.includes(node)));
  inferred.push(...missingNodes.filter(node=>!inferred.includes(node)));
  for(const node of inferred)if(node.revealed&&!Number.isFinite(Number(node.discoveryOrder)))node.discoveryOrder=++nextOrder;
  area.nodeDiscoveryIndex=nextOrder;
}

function markNodeDiscovered(area,node){
  node.revealed=true;
  if(!Number.isFinite(Number(node.discoveryOrder))){
    area.nodeDiscoveryIndex=Math.max(0,Number(area.nodeDiscoveryIndex??0))+1;
    node.discoveryOrder=area.nodeDiscoveryIndex;
  }
}

function hydrateAreaNodes(state) {
  state.areas ??= {};
  state.groundByArea ??= {};
  state.storageByArea ??= {};
  state.coldStorageByArea ??= {};
  state.wardrobeByArea ??= {};
  state.seedStorageByArea ??= {};
  state.utilityStorageByArea ??= {};
  state.buildingsByArea ??= {};
  state.devicesByArea ??= {};
  state.furnitureByArea ??= {};
  state.plotsByArea ??= {};
  state.animalsByArea ??= {};
  state.powerByArea ??= {};
  state.facilityOperationByArea ??= {};
  state.fuelPointsByArea ??= {};
  state.farmSuppliesByArea ??= {};
  for (const [areaId, definition] of Object.entries(AREAS)) {
    const sites=getAreaSites(areaId,state.seed);
    state.areas[areaId] ??= makeAreaState(areaId, areaId === "D4",state.seed);
    state.groundByArea[areaId] ??= [];
    state.storageByArea[areaId] ??= [];
    state.coldStorageByArea[areaId] ??= [];
    state.wardrobeByArea[areaId] ??= [];
    state.seedStorageByArea[areaId] ??= [];
    state.utilityStorageByArea[areaId] ??= [];
    state.buildingsByArea[areaId] ??= {};
    state.devicesByArea[areaId] ??= [];
    state.furnitureByArea[areaId] ??= [];
    state.plotsByArea[areaId] ??= [];
    state.animalsByArea[areaId] ??= [];
    state.powerByArea[areaId] ??= { stored: 0, capacity: 0 };
    state.facilityOperationByArea[areaId] ??= { activeColdCapacity: 0 };
    state.fuelPointsByArea[areaId] ??= 0;
    state.farmSuppliesByArea[areaId] ??= { fertilizer: 0 };
    const area = state.areas[areaId];
    area.id ??= areaId;
    area.opened ??= areaId === "D4";
    area.exploration ??= 0;
    area.explorationActions ??= Math.ceil((area.exploration ?? 0) / 10);
    area.nodeDiscoveryIndex ??= 0;
    area.resolvedThresholds ??= [];
    area.nodes ??= {};
    const validNodeIds = new Set(sites.map((site) => site.id));
    const validNodeTypes = new Set(sites.map((site) => site.nodeId));
    const validGeneratedNodeTypes=new Set(validNodeTypes);
    const continuedSpecial=CONTINUED_EXPLORATION_SPECIAL_NODE_CHANCES[areaId];
    if(continuedSpecial)validGeneratedNodeTypes.add(continuedSpecial.nodeId);
    for (const existingId of Object.keys(area.nodes)) {
      const existing=area.nodes[existingId];
      if (!validNodeIds.has(existingId) && (!existing?.generatedByExploration||!validGeneratedNodeTypes.has(existing.nodeId))) delete area.nodes[existingId];
    }
    for (const site of sites) {
      const existing = area.nodes[site.id];
      if (existing) {
        const previousMaxCharges=existing.maxCharges;
        const fullCharges=site.initialCharges??site.maxCharges;
        const wasFullAtPreviousCapacity=existing.charges!==null
          &&previousMaxCharges!==null
          &&existing.charges===previousMaxCharges;
        existing.id ??= site.id;
        existing.nodeId ??= site.nodeId;
        existing.siteLabel ??= site.siteLabel;
        if(["snow_leopard_boss","giant_eagle_boss"].includes(site.nodeId))existing.siteLabel=site.siteLabel;
        existing.maxCharges = site.maxCharges;
        if(site.maxCharges!==null){
          if(existing.revealed!==true||existing.charges===null||existing.charges===undefined||(wasFullAtPreviousCapacity&&previousMaxCharges!==site.maxCharges))existing.charges=fullCharges;
          else existing.charges=Math.min(existing.charges,site.maxCharges);
        }
        if (NODES[site.nodeId]?.respawnDays === 0) existing.respawnRemaining = 0;
      } else {
        area.nodes[site.id] = {
          id: site.id,
          nodeId: site.nodeId,
          siteLabel: site.siteLabel,
          revealed: false,
          maxCharges: site.maxCharges,
          charges: site.initialCharges ?? site.maxCharges,
          respawnRemaining: 0
        };
      }
    }
    const generatedEntries=Object.entries(area.nodes).filter(([,node])=>node.generatedByExploration&&NODES[node.nodeId])
      .sort(([,left],[,right])=>Number(left.explorationSequence??0)-Number(right.explorationSequence??0));
    const nodeOccurrences=new Map(sites.map(site=>site.nodeId).map(nodeId=>[nodeId,sites.filter(site=>site.nodeId===nodeId).length]));
    for(const [existingId,existing] of generatedEntries){
      const fixedCapacity=NODES[existing.nodeId].maxCharges;
      const previousMaxCharges=existing.maxCharges;
      const wasFullAtPreviousCapacity=existing.charges!==null
        &&previousMaxCharges!==null
        &&existing.charges===previousMaxCharges;
      existing.id??=existingId;
      existing.revealed??=true;
      existing.generatedByExploration=true;
      existing.respawnRemaining??=0;
      const occurrence=(nodeOccurrences.get(existing.nodeId)??0)+1;
      nodeOccurrences.set(existing.nodeId,occurrence);
      existing.siteLabel??=`${NODES[existing.nodeId].name}·${occurrence}`;
      existing.maxCharges=fixedCapacity;
      if(fixedCapacity!==null){
        if(existing.revealed!==true||existing.charges===null||existing.charges===undefined||(wasFullAtPreviousCapacity&&previousMaxCharges!==fixedCapacity))existing.charges=NODES[existing.nodeId].initialCharges??fixedCapacity;
        else existing.charges=Math.min(existing.charges,fixedCapacity);
      }
    }
    // 固定顺序地块按配置补齐旧档进度，持续探索点不抵扣初始节点。
    const ordinaryNodes = (definition.fixedDiscoveryOrder?sites.map(site=>area.nodes[site.id]):Object.values(area.nodes))
      .filter((node) => !NODES[node.nodeId]?.special);
    const shouldBeRevealed = Math.min(ordinaryNodes.length, Math.floor((area.exploration ?? 0) / 10));
    const revealedCount = ordinaryNodes.filter((node) => node.revealed).length;
    if (revealedCount < shouldBeRevealed) {
      const missing = ordinaryNodes.filter((node) => !node.revealed).slice(0, shouldBeRevealed - revealedCount);
      for (const node of missing) node.revealed = true;
    }
    for (const node of Object.values(area.nodes).filter((entry) => NODES[entry.nodeId]?.special)) {
      if ((area.exploration ?? 0) >= (NODES[node.nodeId].unlockAtExploration ?? 100)) node.revealed = true;
    }
    for(const node of Object.values(area.nodes)){
      if(node.nodeId==="clay_pit"&&/^泥坑(?:·\d+)?$/.test(node.siteLabel))node.siteLabel=node.siteLabel.replace(/^泥坑/,NODES.clay_pit.name);
    }
    inferLegacyNodeDiscoveryOrder(state,areaId,area,sites);
  }
}

function enforceDevicePlacementLimits(state){
  for(const areaId of Object.keys(AREAS)){
    const counts=new Map(),kept=[];
    for(const entry of state.devicesByArea?.[areaId]??[]){
      const maxPerArea=DEVICES[entry.itemId]?.maxPerArea??2;
      const count=counts.get(entry.itemId)??0;
      if(count<maxPerArea){counts.set(entry.itemId,count+1);kept.push(entry);}
      else addItem(state,entry.itemId,1,{preferred:"ground",areaId});
    }
    state.devicesByArea[areaId]=kept;
  }
}

function createGeneratedExplorationNode(state, areaId, preferredNodeId = null, explorationAttempt = null) {
  const area = state.areas[areaId];
  const configuredWeights=CONTINUED_EXPLORATION_NODE_WEIGHTS[areaId];
  const configuredNodeIds=new Set(Object.keys(configuredWeights??{}));
  const templates = getAreaSites(areaId, state.seed).filter((site) => {
    const definition = NODES[site.nodeId];
    return definition && !definition.uniqueSite && (!definition.special||configuredNodeIds.has(site.nodeId));
  });
  if (!templates.length) return null;
  const sequence = Object.values(area.nodes).filter((node) => node.generatedByExploration).length + 1;
  const preferredTemplates=preferredNodeId?templates.filter(site=>site.nodeId===preferredNodeId):[];
  let template=preferredTemplates.length
    ?pickFromKey(preferredTemplates,getGameplaySeed(state),`generated-node:${areaId}:${sequence}`)
    :null;
  if(!template){
    const special=CONTINUED_EXPLORATION_SPECIAL_NODE_CHANCES[areaId];
    const ordinaryTemplates=special?templates.filter(site=>site.nodeId!==special.nodeId):templates;
    if(special&&randomFromKey(getGameplaySeed(state),`generated-special-node:${areaId}:${sequence}`)<special.chance){
      template=templates.find(site=>site.nodeId===special.nodeId)??{
        id:special.nodeId,
        nodeId:special.nodeId,
        siteLabel:NODES[special.nodeId].name,
        maxCharges:NODES[special.nodeId].maxCharges,
        initialCharges:NODES[special.nodeId].initialCharges??NODES[special.nodeId].maxCharges
      };
    }
    const configuredTotal=Object.values(configuredWeights??{}).reduce((sum,weight)=>sum+Number(weight),0);
    const attemptKey=explorationAttempt??sequence;
    if(configuredWeights&&configuredTotal<100&&randomFromKey(getGameplaySeed(state),`generated-node-empty:${areaId}:${attemptKey}`)>=configuredTotal/100)return null;
    const weightedTemplates=configuredWeights?Object.entries(configuredWeights).map(([nodeId,weight])=>({
      value:ordinaryTemplates.find(site=>site.nodeId===nodeId),weight:Number(weight)
    })).filter(entry=>entry.value&&entry.weight>0):[];
    template??=weightedTemplates.length
      ?weightedPick(weightedTemplates,getGameplaySeed(state),`generated-node:${areaId}:${attemptKey}`)
      :pickFromKey(ordinaryTemplates.length?ordinaryTemplates:templates,getGameplaySeed(state),`generated-node:${areaId}:${sequence}`);
  }
  const occurrence = Object.values(area.nodes).filter((node) => node.nodeId === template.nodeId).length + 1;
  let id = `${template.nodeId}__explore_${sequence}`;
  while (area.nodes[id]) id = `${id}_next`;
  const definition=NODES[template.nodeId];
  const fullCapacity=definition.maxCharges;
  const node = {
    id,
    nodeId: template.nodeId,
    siteLabel: `${NODES[template.nodeId].name}·${occurrence}`,
    revealed: true,
    maxCharges: fullCapacity,
    charges: definition.initialCharges ?? fullCapacity,
    respawnRemaining: 0,
    generatedByExploration: true,
    explorationSequence: sequence
  };
  area.nodes[id] = node;
  return node;
}

function blankInventoryByArea() {
  return Object.fromEntries(Object.keys(AREAS).map((id) => [id, []]));
}

export function createNewGame(seed = `${Date.now()}`) {
  const state = {
    version: SAVE_VERSION,
    seed: String(seed),
    randomRevision: 0,
    day: 1,
    actionIndex: 0,
    weatherSicknessActionIndex: 0,
    position: "D4",
    player: {
      stamina: 10,
      maxStamina: 10,
      happiness: 0,
      baseAttack: 10,
      warmth: 2,
      heatResist: 0,
      injury: 0,
      sick: false,
      noFoodAndDrinkDays: 0,
      incompleteDietDays: 0,
      extremeDays: 0,
      gameOver: false,
      gameOverReason: "",
      dietBuffs: { attack: 0, warmth: 0, heat: 0, rain: 0, storm: 0, attackTierBoost: false, sources: [] },
      equipment: { weapon: null, head: null, body: null, legs: null, feet: null, hands: null, backpack: "system_small_backpack" }
    },
    backpack: { cold: [], ordinary: [] },
    groundByArea: blankInventoryByArea(),
    storageByArea: blankInventoryByArea(),
    coldStorageByArea: blankInventoryByArea(),
    wardrobeByArea: blankInventoryByArea(),
    seedStorageByArea: blankInventoryByArea(),
    utilityStorageByArea: blankInventoryByArea(),
    areas: Object.fromEntries(Object.keys(AREAS).map((id) => [id, makeAreaState(id, id === "D4",String(seed))])),
    housesByArea: {},
    buildingsByArea: Object.fromEntries(Object.keys(AREAS).map((id) => [id, {}])),
    devicesByArea: Object.fromEntries(Object.keys(AREAS).map((id) => [id, []])),
    furnitureByArea: Object.fromEntries(Object.keys(AREAS).map((id) => [id, []])),
    plotsByArea: Object.fromEntries(Object.keys(AREAS).map((id) => [id, []])),
    animalsByArea: Object.fromEntries(Object.keys(AREAS).map((id) => [id, []])),
    powerByArea: Object.fromEntries(Object.keys(AREAS).map((id) => [id, { stored: 0, capacity: 0 }])),
    facilityOperationByArea: Object.fromEntries(Object.keys(AREAS).map((id) => [id, { activeColdCapacity: 0 }])),
    reinforcementByArea: {},
    reinforcementDurationRuleVersion: REINFORCEMENT_DURATION_RULE_VERSION,
    fuelPointsByArea: Object.fromEntries(Object.keys(AREAS).map((id) => [id, 0])),
    farmSuppliesByArea: Object.fromEntries(Object.keys(AREAS).map((id) => [id, { fertilizer: 0 }])),
    pastureByArea: Object.fromEntries(Object.keys(AREAS).map((id) => [id, { plots: [ { growth: 0 }, { growth: 0 }, { growth: 0 }, { growth: 0 }, { growth: 0 } ] }])),
    herbFieldsByArea: Object.fromEntries(Object.keys(AREAS).map((id) => [id, { planted: false, remaining: 5, watered: false, fertilized: false, fertility: 0, mature: false }])),
    automaticWaterStorageRuleVersion: AUTOMATIC_WATER_STORAGE_RULE_VERSION,
    farmFertilityRuleVersion: FARM_FERTILITY_RULE_VERSION,
    cropRegrowthRuleVersion: CROP_REGROWTH_RULE_VERSION,
    dietSurvivalRuleVersion: DIET_SURVIVAL_RULE_VERSION,
    ownedBlueprintIds: [...INITIAL_BLUEPRINTS],
    knownHouseSchemes: [1],
    selectedFood: null,
    selectedDrink: null,
    dailyTasks: [],
    dailyRewardClaimed: false,
    lastLottery: null,
    lotteryDrawIndex: 0,
    normalBlueprintsWon: 0,
    battleIndex: 0,
    uniqueDrops: [],
    tradesCompleted: 0,
    tradedCharacterIds: [],
    monkeyStolenItemCount: 0,
    monkeyHerbSeedGiftReceived: false,
    weatherTradeRuleVersion: WEATHER_TRADE_RULE_VERSION,
    relations: Object.fromEntries(Array.from({ length: 27 }, (_, index) => [`npc_${String(index + 1).padStart(2, "0")}`, { favor: 0, mails: 0 }])),
    tradeOffers: [],
    claimedMailIds: [],
    productionUsage: {},
    placementIndex: 0,
    buildCompletionIndex: 0,
    returnTowerAreaId: null,
    returnProgress: {},
    returnTowerComplete: false,
    returnEnding: null,
    returnDeparture: null,
    postgame: false,
    broadcasts: 0,
    connection: 0,
    gridPowerSpentToday: 0,
    launch: null,
    survivalHistory: [],
    injuryRecoveryRuleVersion: INJURY_RECOVERY_RULE_VERSION,
    injuryRestDays: 0,
    comfortRecoveryDays: 0,
    dailyWoundTreatmentUsed: false,
    temperatureDiscomfortDays: 0,
    mailReceivedToday: false,
    happinessBreakdown: null,
    dailyTradeFoodWater: false,
    logs: [{ day: 1, text: "你听到了一个声音：“活下去并通关赢得奖金返回现实吧。”" }],
    lastDaySummary: [],
    completed: false
  };

  addItem(state, "water", 10, { preferred: "backpack" });
  state.dailyTasks = generateDailyTasks(state);
  state.tradeOffers = generateTradeOffers(state);
  return state;
}

const SPARSE_ARRAY_AREA_KEYS=Object.freeze([
  "groundByArea","storageByArea","coldStorageByArea","wardrobeByArea","seedStorageByArea","utilityStorageByArea",
  "devicesByArea","furnitureByArea","plotsByArea","animalsByArea"
]);

function compactAreaCollectionsForSave(save){
  for(const key of SPARSE_ARRAY_AREA_KEYS){
    const compact=Object.fromEntries(Object.entries(save[key]??{}).filter(([,entries])=>Array.isArray(entries)&&entries.length));
    if(Object.keys(compact).length)save[key]=compact;else delete save[key];
  }
  const buildings=Object.fromEntries(Object.entries(save.buildingsByArea??{}).filter(([,entries])=>entries&&Object.keys(entries).length));
  if(Object.keys(buildings).length)save.buildingsByArea=buildings;else delete save.buildingsByArea;
  const power=Object.fromEntries(Object.entries(save.powerByArea??{}).filter(([,entry])=>Number(entry?.stored??0)!==0||Number(entry?.capacity??0)!==0||Object.keys(entry??{}).some(key=>!["stored","capacity"].includes(key))));
  if(Object.keys(power).length)save.powerByArea=power;else delete save.powerByArea;
  const operations=Object.fromEntries(Object.entries(save.facilityOperationByArea??{}).filter(([,entry])=>Number(entry?.activeColdCapacity??0)!==0||Object.keys(entry??{}).some(key=>key!=="activeColdCapacity")));
  if(Object.keys(operations).length)save.facilityOperationByArea=operations;else delete save.facilityOperationByArea;
  const fuel=Object.fromEntries(Object.entries(save.fuelPointsByArea??{}).filter(([,value])=>Number(value)!==0));
  if(Object.keys(fuel).length)save.fuelPointsByArea=fuel;else delete save.fuelPointsByArea;
  const farmSupplies=Object.fromEntries(Object.entries(save.farmSuppliesByArea??{}).filter(([,entry])=>Number(entry?.fertilizer??0)!==0||Object.keys(entry??{}).some(key=>key!=="fertilizer")));
  if(Object.keys(farmSupplies).length)save.farmSuppliesByArea=farmSupplies;else delete save.farmSuppliesByArea;
}

function compactAreasForSave(areas){
  const result={};
  for(const [areaId,area] of Object.entries(areas??{})){
    const compact=clone(area??{});
    delete compact.id;
    if(Boolean(compact.opened)===(areaId==="D4"))delete compact.opened;
    if(Number(compact.exploration??0)===0)delete compact.exploration;
    if(Number(compact.explorationActions??0)===0)delete compact.explorationActions;
    if(Number(compact.nodeDiscoveryIndex??0)===0)delete compact.nodeDiscoveryIndex;
    if(!compact.resolvedThresholds?.length)delete compact.resolvedThresholds;
    const compactNodes={};
    const sitesById=new Map((AREAS[areaId]?.nodes??[]).map(site=>[site.id,site]));
    for(const [nodeId,node] of Object.entries(compact.nodes??{})){
      const savedNode=clone(node),site=sitesById.get(nodeId);
      const previousMaxCharges=savedNode.maxCharges;
      delete savedNode.id;
      delete savedNode.siteLabel;
      delete savedNode.maxCharges;
      if(site){
        delete savedNode.nodeId;
        if(previousMaxCharges!==site.maxCharges&&savedNode.charges===previousMaxCharges)savedNode.maxCharges=previousMaxCharges;
        if(savedNode.revealed===false)delete savedNode.revealed;
        if(savedNode.charges===(site.initialCharges??site.maxCharges))delete savedNode.charges;
        if(Number(savedNode.respawnRemaining??0)===0)delete savedNode.respawnRemaining;
      }else{
        if(savedNode.revealed===true)delete savedNode.revealed;
        const definition=NODES[savedNode.nodeId];
        if(definition&&previousMaxCharges!==definition.maxCharges&&savedNode.charges===previousMaxCharges)savedNode.maxCharges=previousMaxCharges;
        if(definition&&savedNode.charges===(definition.initialCharges??definition.maxCharges))delete savedNode.charges;
        if(Number(savedNode.respawnRemaining??0)===0)delete savedNode.respawnRemaining;
      }
      if(Object.keys(savedNode).length)compactNodes[nodeId]=savedNode;
    }
    if(Object.keys(compactNodes).length)compact.nodes=compactNodes;else delete compact.nodes;
    if(Object.keys(compact).length)result[areaId]=compact;
  }
  return result;
}

function tradeEntryStaticName(entry){
  if(entry?.type==="blueprint")return BLUEPRINTS.find(blueprint=>blueprint.id===entry.id)?.name;
  return ITEMS[entry?.id]?.name;
}

function lotteryRewardStaticName(reward){
  if(reward?.type==="blueprint")return BLUEPRINTS.find(blueprint=>blueprint.id===reward.id)?.name;
  return ITEMS[reward?.itemId??reward?.id]?.name;
}

function stripDerivedSaveFields(save){
  for(const task of save.dailyTasks??[])if(task.text===getDailyTaskText(task))delete task.text;
  for(const offer of save.tradeOffers??[]){
    if(offer.give?.name===tradeEntryStaticName(offer.give))delete offer.give.name;
    if(offer.want?.name===ITEMS[offer.want.id]?.name)delete offer.want.name;
    if(offer.withdrawn===false)delete offer.withdrawn;
    if(offer.completed===false)delete offer.completed;
  }
  for(const reward of save.lastLottery??[])if(reward.name===lotteryRewardStaticName(reward))delete reward.name;
}

function hydrateDerivedSaveFields(state){
  for(const task of state.dailyTasks??[])task.text||=getDailyTaskText(task);
  for(const offer of state.tradeOffers??[]){
    if(offer.give)offer.give.name??=tradeEntryStaticName(offer.give);
    if(offer.want)offer.want.name??=ITEMS[offer.want.id]?.name;
    offer.withdrawn??=false;
    offer.completed??=false;
  }
  for(const reward of state.lastLottery??[])reward.name??=lotteryRewardStaticName(reward);
}

export function serializeState(state) {
  if(Number(state?.version)!==SAVE_VERSION)return JSON.stringify(state);
  const save=clone(state);
  save.version=SAVE_VERSION;
  save.saveFormat=SAVE_FORMAT;
  delete save.mailInbox;
  delete save.withdrawnOfferIds;
  delete save.pendingEncounter;
  delete save.battleCooldowns;
  delete save.dailyActivity;
  delete save.postStormRecoveryApplied;
  compactAreaCollectionsForSave(save);
  save.areas=compactAreasForSave(save.areas);
  if(!Object.keys(save.areas).length)delete save.areas;
  const relations=Object.fromEntries(Object.entries(save.relations??{}).filter(([,relation])=>Number(relation?.favor??0)!==0||Number(relation?.mails??0)!==0));
  if(Object.keys(relations).length)save.relations=relations;else delete save.relations;
  stripDerivedSaveFields(save);
  return JSON.stringify(save);
}

// Keep the morning snapshot intact; only future actions use a new random stream.
// The live revision survives page reloads and prevents repeated restarts reusing it.
export function restartDay(text, currentState) {
  const restored = deserializeState(text);
  const currentRevision = currentState?.seed === restored.seed ? getRandomRevision(currentState) : 0;
  restored.randomRevision = Math.max(getRandomRevision(restored), currentRevision) + 1;
  return restored;
}

export function deserializeState(text) {
  const state = JSON.parse(text);
  const sourceVersion=state.version;
  if (!Number.isInteger(sourceVersion)||sourceVersion<6||sourceVersion>SAVE_VERSION) throw new Error("暂不支持此存档版本");
  if(sourceVersion===SAVE_VERSION&&state.saveFormat!==undefined&&state.saveFormat!==SAVE_FORMAT)throw new Error("暂不支持此存档格式");
  delete state.saveFormat;
  state.version = SAVE_VERSION;
  state.randomRevision = getRandomRevision(state);
  hydrateAreaNodes(state);
  const defaults = createNewGame(state.seed);
  for (const key of ["coldStorageByArea","wardrobeByArea","devicesByArea","furnitureByArea","plotsByArea","animalsByArea","powerByArea","facilityOperationByArea","reinforcementByArea","fuelPointsByArea","farmSuppliesByArea","pastureByArea","herbFieldsByArea","uniqueDrops","relations","tradeOffers","claimedMailIds","productionUsage","returnProgress","survivalHistory"]) state[key] ??= clone(defaults[key]);
  for(const [npcId,relation] of Object.entries(defaults.relations))state.relations[npcId]??=clone(relation);
  hydrateDerivedSaveFields(state);
  unlockHouseSchemes(state);
  if(Number(state.reinforcementDurationRuleVersion??0)<REINFORCEMENT_DURATION_RULE_VERSION){
    for(const reinforcement of Object.values(state.reinforcementByArea)){
      const untilDay=Number(reinforcement?.untilDay??0);
      if(untilDay>=state.day)reinforcement.untilDay=untilDay+(REINFORCEMENT_DURATION_DAYS-3);
    }
  }
  state.reinforcementDurationRuleVersion=REINFORCEMENT_DURATION_RULE_VERSION;
  delete state.weatherSicknessExposureDays;
  delete state.acidRainExposureDay;
  state.weatherSicknessActionIndex=Math.max(0,Math.floor(Number(state.weatherSicknessActionIndex)||0));
  const sourceFarmFertilityRuleVersion=Number(state.farmFertilityRuleVersion??0);
  if(sourceFarmFertilityRuleVersion<1){
    for(const plots of Object.values(state.plotsByArea))for(const plot of plots)if(plot.phase!=="ready")plot.fertility=plot.fertilized?1:0;
  }
  if(sourceFarmFertilityRuleVersion<2){
    for(const plots of Object.values(state.plotsByArea))for(const plot of plots)if(plot.phase!=="ready"&&plot.fertilized)plot.fertility=Math.max(0,Number(plot.fertility??0)-1);
  }
  state.farmFertilityRuleVersion=FARM_FERTILITY_RULE_VERSION;
  if(Number(state.cropRegrowthRuleVersion??0)<CROP_REGROWTH_RULE_VERSION){
    for(const plots of Object.values(state.plotsByArea))for(const plot of plots){
      if(plot.phase!=="regrowing")continue;
      const crop=CROPS[plot.cropId];if(!crop)continue;
      const previousDays=legacyCropRegrowthDays(crop),remaining=Number(plot.remaining),elapsed=Number.isFinite(remaining)?Math.max(0,previousDays-remaining):0;
      plot.remaining=Math.max(0,crop.growthDays-elapsed);
    }
  }
  state.cropRegrowthRuleVersion=CROP_REGROWTH_RULE_VERSION;
  if(Number(state.dietSurvivalRuleVersion??0)<DIET_SURVIVAL_RULE_VERSION){
    const history=[...(state.survivalHistory??[])];
    const countTrailing=(predicate)=>{let count=0;for(let index=history.length-1;index>=0&&predicate(history[index]);index-=1)count+=1;return count;};
    state.player.noFoodAndDrinkDays??=history.length?countTrailing(entry=>!entry.ate&&!entry.drank):Math.min(Number(state.player.hungerDays??0),Number(state.player.thirstDays??0));
    state.player.incompleteDietDays??=history.length?countTrailing(entry=>!entry.ate||!entry.drank):Math.max(Number(state.player.hungerDays??0),Number(state.player.thirstDays??0));
  }
  state.dietSurvivalRuleVersion=DIET_SURVIVAL_RULE_VERSION;
  if(Number(state.injuryRecoveryRuleVersion??0)<INJURY_RECOVERY_RULE_VERSION)state.injuryRestDays=0;
  state.injuryRecoveryRuleVersion=INJURY_RECOVERY_RULE_VERSION;
  state.player.noFoodAndDrinkDays??=0;
  state.player.incompleteDietDays??=0;
  delete state.player.hungerDays;
  delete state.player.thirstDays;
  delete state.player.rainResist;
  delete state.player.stormProtection;
  state.dailyTradeFoodWater??=false;
  state.gridPowerSpentToday=Math.max(0,Number(state.gridPowerSpentToday??0));
  delete state.pendingEncounter;
  delete state.battleCooldowns;
  delete state.withdrawnOfferIds;
  delete state.dailyActivity;
  delete state.postStormRecoveryApplied;
  state.dailyRewardClaimed ??= false;
  state.lastLottery ??= null;
  for (const key of ["normalBlueprintsWon","battleIndex","tradesCompleted","broadcasts","connection","placementIndex","buildCompletionIndex","monkeyStolenItemCount"]) state[key] ??= 0;
  for (const key of ["injuryRestDays","comfortRecoveryDays","temperatureDiscomfortDays"]) state[key] ??= 0;
  state.dailyWoundTreatmentUsed ??= false;
  state.mailReceivedToday ??= false;
  state.monkeyHerbSeedGiftReceived ??= false;
  state.tradedCharacterIds ??= [];
  state.player.equipment ??= clone(defaults.player.equipment);
  state.player.equipment.backpack ??= "system_small_backpack";
  state.player.dietBuffs ??= clone(defaults.player.dietBuffs);
  state.player.stamina=roundStamina(state.player.stamina);
  state.player.maxStamina=roundStamina(state.player.maxStamina);
  migratePermanentTools(state);
  for(const areaId of Object.keys(AREAS))ensurePlotBedAssignments(state,areaId);
  migrateRemovedCrowbars(state);
  migrateRemovedItems(state);
  // 旧档已预留的指定食饮同步新幸福度，保留预留物资与历史结算。
  if(["apple_milk_tea","honey_lemon_tea"].includes(state.selectedDrink?.itemId))state.selectedDrink.happiness=ITEMS[state.selectedDrink.itemId].happiness;
  if(state.selectedFood?.itemId==="apple_pie")state.selectedFood.happiness=ITEMS.apple_pie.happiness;
  migrateRemovedGrassArmor(state);
  migrateRemovedStandaloneEquipment(state);
  migrateRemovedDefenseArmor(state);
  migrateRemovedCraftedEquipment(state);
  migrateRemovedFurniture(state);
  migrateRenamedEquipmentText(state);
  migrateLegacyFacilityItems(state);
  migrateRemovedTextileWorkshop(state);
  migrateRemovedDisasterShutters(state);
  migrateRemovedFacilities(state);
  if(Object.values(state.housesByArea??{}).some(house=>Number(house?.level??0)>=5)&&!state.ownedBlueprintIds.includes("hydro_generator"))acquireBlueprint(state,"hydro_generator","已有永久避难所");
  migrateLegacyGreenhouses(state);
  migratePlotAutoFertilizeSettings(state);
  migrateLegacyFarmWaterStorage(state);
  migrateLegacyMailboxState(state);
  for(const [itemId,item] of Object.entries(ITEMS)){
    if(!item.unlockBlueprints?.length||countItemGlobal(state,itemId)<=0)continue;
    for(const blueprintId of item.unlockBlueprints)acquireBlueprint(state,blueprintId,`已有${item.name}`);
  }
  const grandmaZhangRelation=state.relations.npc_21;
  if(Number(grandmaZhangRelation?.favor??0)>=5&&Number(grandmaZhangRelation?.mails??0)===4)grandmaZhangRelation.mails=5;
  // 旧规则已完工的玩家保留结局；新版安装后仍需跨三个游戏日进行坐标运算和广播。
  state.returnEnding??=null;
  state.postgame??=false;
  state.returnTowerComplete=Boolean(state.returnTowerComplete||state.returnProgress.core_install?.completed);
  const legacyReturnComplete=sourceVersion<27&&(state.returnTowerComplete||Boolean(state.launch));
  if(state.returnEnding||state.completed||state.postgame||legacyReturnComplete){
    state.returnEnding??=getReturnEnding(state);
    state.completed=!state.postgame;
    state.returnDeparture={completedRuns:3,lastRunDay:Math.max(0,Math.floor(Number(state.returnDeparture?.lastRunDay)||0))};
  }else if(state.returnProgress.core_install?.completed){
    state.returnDeparture={completedRuns:clamp(Math.floor(Number(state.returnDeparture?.completedRuns)||0),0,3),lastRunDay:Math.max(0,Math.floor(Number(state.returnDeparture?.lastRunDay)||0))};
    if(state.returnDeparture.completedRuns>=3)completeReturn(state);
  }else{
    state.returnDeparture=null;
    state.returnTowerComplete=false;
  }
  state.launch=null;
  updateConnection(state);
  enforceDevicePlacementLimits(state);
  if(sourceVersion<19)migrateLegacyTailorTables(state);
  if(sourceVersion<18)migrateLegacyArmorSetBlueprints(state);
  for(const areaId of Object.keys(AREAS))reconcileFacilityUpgrades(state,areaId);
  for(const task of state.dailyTasks??[]){
    if(["prod_food","prod_drink"].includes(task.id)||["produce_food","produce_drink"].includes(task.event)){
      task.id="prod_cook";
      task.event="cook";
      task.text=getDailyTaskText(task);
      delete task.staminaCost;
    }
    task.text=friendlyPlayerText(task.text);
  }
  for(const log of state.logs??[]){
    log.text=friendlyPlayerText(log.text);
    if(log.text==="你在D4的露天地面醒来。天黑前，最好先想办法搭起一顶茅草帐篷。")log.text=defaults.logs[0].text;
  }
  state.logs=(state.logs??[]).filter(log=>!log.text.startsWith("必然获知："));
  state.lastDaySummary=(state.lastDaySummary??[]).map(friendlyPlayerText);
  normalizeGameOverReason(state);
  delete state.followedNpcId;
  delete state.pendingFollowedNpcId;
  if((state.dailyTasks??[]).some(task=>END_OF_DAY_TASK_EVENTS.has(task.event))){
    state.dailyTasks=generateDailyTasks(state);
    if(state.dailyRewardClaimed)for(const task of state.dailyTasks)task.progress=task.target;
  }
  if((state.dailyTasks??[]).some(task=>task.id==="move_two"||task.event==="move"||task.id==="maintain_repair"||task.event==="repair")){
    const kept=state.dailyTasks.filter(task=>task.id!=="move_two"&&task.event!=="move"&&task.id!=="maintain_repair"&&task.event!=="repair"),keptIds=new Set(kept.map(task=>task.id));
    const replacements=generateDailyTasks(state).filter(task=>!keptIds.has(task.id));
    state.dailyTasks=[...kept,...replacements].slice(0,3);
    if(state.dailyRewardClaimed)for(const task of state.dailyTasks)task.progress=task.target;
  }
  if(getDailyTaskStaminaRequirement(state)>state.player.maxStamina){
    const completedFreeTasks=(state.dailyTasks??[]).filter(task=>task.progress>=task.target&&dailyTaskStaminaCost(state,task)===0);
    const refreshed=generateDailyTasks(state),seenTaskIds=new Set();
    state.dailyTasks=[...completedFreeTasks,...refreshed].filter(task=>{const key=task.id??`${task.event}:${task.text}`;if(seenTaskIds.has(key))return false;seenTaskIds.add(key);return true;}).slice(0,3);
    if(state.dailyTasks.length<3||getDailyTaskStaminaRequirement(state)>state.player.maxStamina)state.dailyTasks=refreshed;
    if(state.dailyRewardClaimed)for(const task of state.dailyTasks)task.progress=task.target;
  }
  for (const areaId of Object.keys(AREAS)) {
    for (const entry of state.devicesByArea[areaId] ?? []) {
      entry.id ??= `placed_${++state.placementIndex}`;
      entry.placedOrder ??= state.placementIndex;
      delete entry.enabled;
    }
    for (const entry of state.furnitureByArea[areaId] ?? []) {
      entry.id ??= `placed_${++state.placementIndex}`;
      entry.placedOrder ??= state.placementIndex;
      const definition=FURNITURE[entry.itemId];
      if(!definition?.switchable){
        delete entry.enabled;
        if(entry.itemId==="charcoal_dehumidifier"&&entry.resourcePaidDays){
          delete entry.resourcePaidDays.charcoal;
          if(!Object.keys(entry.resourcePaidDays).length)delete entry.resourcePaidDays;
        }
      }
      else if(entry.enabled!==false&&dailyItemResourceRequirements(definition.effect).some(({itemId,quantity})=>!dailyItemResourcePaid(entry,itemId,state.day)&&countDailyItemResource(state,itemId,areaId)<quantity))entry.enabled=false;
    }
    for (const [buildingId,progress] of Object.entries(state.buildingsByArea[areaId] ?? {})) {
      const baseId=buildingId.replace(/__\d+$/, "");
      if(BUILDINGS[baseId]?.damageImmune)progress.damaged=false;
      if(baseId==="mining_machine"&&!getMiningMachineProduction(state,areaId))progress.poweredToday=false;
      if (baseId === "workbench" && progress.progress >= 1) progress.completed = true;
      if (progress.completed && progress.completedOrder === undefined) progress.completedOrder = ++state.buildCompletionIndex;
      if(progress.completed)for(const blueprintId of BUILDINGS[baseId]?.completionBlueprints??[])acquireBlueprint(state,blueprintId,`${BUILDINGS[baseId].name}建成`);
      if(!BUILDINGS[baseId]?.switchable)delete progress.enabled;
      else if(progress.enabled!==false&&dailyItemResourceRequirements(BUILDINGS[baseId]?.effect).some(({itemId,quantity})=>!dailyItemResourcePaid(progress,itemId,state.day)&&countDailyItemResource(state,itemId,areaId)<quantity))progress.enabled=false;
    }
    for(const type of Object.keys(ANIMAL_PEN_IDS))ensureAnimalPenAssignments(state,areaId,type);
  }
  const hasResolvedTrade=(state.tradeOffers??[]).some(offer=>offer.completed||offer.withdrawn);
  const weatherOffers=state.tradeOffers??[],minimumBuybackHazards=activeMinimumWeatherBuybackHazards(state);
  const weatherOfferCount=weatherOffers.filter(offer=>offer.weatherPrepared||offer.weatherBuyback).length;
  const hasRequiredWeatherOffers=minimumBuybackHazards.length
    ? minimumBuybackHazards.every(hazard=>weatherOffers.filter(offer=>offer.weatherBuyback&&offer.weatherHazard===hazard).length>=3)
    : weatherOfferCount===1;
  const refreshWeatherTrades=Boolean(activeTradeHazard(state))&&!hasResolvedTrade&&(state.weatherTradeRuleVersion!==WEATHER_TRADE_RULE_VERSION||!hasRequiredWeatherOffers);
  const refreshWeatherOfferRules=Boolean(activeTradeHazard(state))&&weatherOffers.some(offer=>!offer.completed&&!offer.withdrawn&&(isForbiddenTradeOffer(offer)||isForbiddenNpcTradeGive(offer.give)||isOutdatedNpcTradeGive(state,offer.give)||Number(offer.tradePriceMultiplier??1)!==GLOBAL_TRADE_PRICE_MULTIPLIER||Number(offer.tradePricingRuleVersion??0)!==TRADE_PRICING_RULE_VERSION));
  state.weatherTradeRuleVersion=WEATHER_TRADE_RULE_VERSION;
  delete state.weatherBuybackRuleVersion;
  const regeneratedTradeOffers=sourceVersion<11||(sourceVersion<15&&Boolean(activeTradeHazard(state)))||refreshWeatherTrades||refreshWeatherOfferRules;
  if(regeneratedTradeOffers)state.tradeOffers=generateTradeOffers(state,refreshWeatherOfferRules?state.tradeOffers:[]);
  const refreshRelationshipPricing=sourceVersion<16&&!regeneratedTradeOffers;
  const refreshReverseTradePairs=sourceVersion<17&&!regeneratedTradeOffers;
  const refreshArmorBlueprintOffers=sourceVersion<18&&!regeneratedTradeOffers;
  const seenTradeNpcs=new Set();
  state.tradeOffers=(state.tradeOffers??[]).filter((offer)=>{
    if(seenTradeNpcs.has(offer.npcId)||seenTradeNpcs.size>=DAILY_TRADE_OFFER_COUNT)return false;
    seenTradeNpcs.add(offer.npcId);
    return true;
  });
  const reservedTradeBlueprints=new Set(),reservedTradePairs=new Set(),reachableTradeItems=new Set(getReachableTradeItemIds(state));
  let activeRareMaterialWantCount=0;
  for(const offer of state.tradeOffers)if(offer.completed||offer.withdrawn)reserveTradePair(reservedTradePairs,offer);
  state.tradeOffers=state.tradeOffers.map((offer,index)=>{
    const invalidSameItem=offer.give?.type==="item"&&offer.give.id===offer.want?.id;
    const invalidItems=isForbiddenTradeOffer(offer);
    const invalidSameWeaponStyle=isSameStyleWeaponTrade(offer.give,offer.want?.id);
    const offeredBlueprint=offer.give?.type==="blueprint"?BLUEPRINTS.find(blueprint=>blueprint.id===offer.give.id):null;
    const offeredItem=offer.give?.type==="item"?ITEMS[offer.give.id]:null;
    const invalidGive=isForbiddenNpcTradeGive(offer.give)||isOutdatedNpcTradeGive(state,offer.give)||(offer.give?.type==="item"&&(!offeredItem||offeredItem.tradeable===false||offeredItem.unique))||(offer.give?.type==="blueprint"&&(!offeredBlueprint||offeredBlueprint.fixedOnly||offeredBlueprint.lotteryOnly));
    const unreachableWant=!reachableTradeItems.has(offer.want?.id);
    const invalidReversePair=hasReverseTradePair(offer.give,offer.want?.id,reservedTradePairs);
    const npc=CHARACTERS.find(entry=>entry.id===offer.npcId);
    const outdatedNpcWant=isOutdatedNpcTradeWant(state,offer);
    const invalidTradePricing=Number(offer.tradePriceMultiplier??1)!==GLOBAL_TRADE_PRICE_MULTIPLIER||Number(offer.tradePricingRuleVersion??0)!==TRADE_PRICING_RULE_VERSION;
    const invalidBulkDurablePayment=offer.give?.type==="item"&&(isBasicMaterialTradeItem(offer.give.id)||isFoodTradeItem(offer.give.id))&&fixedTradeTypes.has(ITEMS[offer.want?.id]?.type)&&Number(offer.want?.quantity??0)!==1;
    const invalidMultiSideTrade=isForbiddenMultiSideTrade(Number(offer.give?.quantity??0),Number(offer.want?.quantity??0));
    const activeRareMaterialWant=isActiveRareMaterialWant(offer);
    const invalidRareMaterialWant=activeRareMaterialWant&&(Number(offer.want?.quantity??0)!==1||activeRareMaterialWantCount>=MAX_DAILY_RARE_MATERIAL_WANTS);
    const effectivePriceMultiplier=GLOBAL_TRADE_PRICE_MULTIPLIER*Number(offer.weatherPriceMultiplier??1);
    // 已保存的报价沿用当时折扣，不能因新报价折扣收紧而提高旧单的最低付款。
    const invalidFixedGoodPayment=Boolean(npc)&&Number(offer.want?.quantity??0)<minimumFixedGoodPaymentQuantity(state,offer.give,offer.want?.id,npc,effectivePriceMultiplier,offer.relationDiscount??undefined);
    if(offer.completed||offer.withdrawn||(!refreshRelationshipPricing&&!refreshReverseTradePairs&&!refreshArmorBlueprintOffers&&!invalidSameItem&&!invalidItems&&!invalidSameWeaponStyle&&!invalidGive&&!unreachableWant&&!invalidReversePair&&!invalidFixedGoodPayment&&!invalidTradePricing&&!invalidBulkDurablePayment&&!invalidMultiSideTrade&&!invalidRareMaterialWant&&!outdatedNpcWant)){
      if(offer.give?.type==="blueprint")reservedTradeBlueprints.add(offer.give.id);
      reserveTradePair(reservedTradePairs,offer);
      if(activeRareMaterialWant)activeRareMaterialWantCount+=1;
      return offer;
    }
    if(!npc){if(!invalidItems&&!invalidGive&&!invalidReversePair&&!invalidSameWeaponStyle&&!invalidTradePricing)reserveTradePair(reservedTradePairs,offer);return invalidItems||invalidGive||invalidReversePair||invalidSameWeaponStyle||invalidTradePricing?null:offer;}
    const replacement=makeOffer(state,npc,index,reservedTradeBlueprints,reservedTradePairs,activeRareMaterialWantCount<MAX_DAILY_RARE_MATERIAL_WANTS);
    if(replacement?.give.type==="blueprint")reservedTradeBlueprints.add(replacement.give.id);
    if(replacement){replacement.tradePricingRuleVersion=TRADE_PRICING_RULE_VERSION;reserveTradePair(reservedTradePairs,replacement);if(isActiveRareMaterialWant(replacement))activeRareMaterialWantCount+=1;return replacement;}
    if(!invalidItems&&!invalidGive&&!invalidReversePair&&!invalidSameWeaponStyle&&!invalidTradePricing&&!outdatedNpcWant)reserveTradePair(reservedTradePairs,offer);
    return invalidItems||invalidGive||invalidReversePair||invalidSameWeaponStyle||invalidTradePricing||outdatedNpcWant?null:offer;
  }).filter(Boolean);
  if(state.tradeOffers.length<DAILY_TRADE_OFFER_COUNT)state.tradeOffers=generateTradeOffers(state,state.tradeOffers);
  for(const stacks of [
    state.backpack?.cold??[],state.backpack?.ordinary??[],
    ...Object.values(state.coldStorageByArea??{}),...Object.values(state.storageByArea??{}),
    ...Object.values(state.groundByArea??{}),...Object.values(state.wardrobeByArea??{}),...Object.values(state.seedStorageByArea??{}),...Object.values(state.utilityStorageByArea??{})
  ])consolidateItemStacks(stacks);
  // 旧存档里已经收到、但尚未手动领取的礼物也补发一次。
  for(const mail of getReceivedMails(state))if(!mail.claimed)claimMail(state,mail.id);
  return state;
}

function migratePermanentTools(state){
  const collections=[state.backpack?.cold??[],state.backpack?.ordinary??[],...Object.values(state.groundByArea??{}),...Object.values(state.storageByArea??{}),...Object.values(state.coldStorageByArea??{}),...Object.values(state.wardrobeByArea??{}),...Object.values(state.utilityStorageByArea??{})];
  for(const stacks of collections){
    const merged=[];
    for(const stack of stacks){
      if(ITEMS[stack.itemId]?.type!=="tool"){merged.push(stack);continue;}
      delete stack.durability;
      const existing=merged.find(entry=>entry.itemId===stack.itemId);
      if(existing)existing.quantity+=(stack.quantity??1);
      else merged.push({...stack,quantity:stack.quantity??1});
    }
    stacks.splice(0,stacks.length,...merged);
  }
}

function migrateRemovedCrowbars(state){
  state.ownedBlueprintIds=(state.ownedBlueprintIds??[]).filter(id=>id!=="crowbar");
  if(Array.isArray(state.lastLottery))state.lastLottery=state.lastLottery.filter(reward=>reward.id!=="crowbar");
  const refunds=new Map();
  const removeCrowbars=(stacks,areaId)=>{
    for(let index=stacks.length-1;index>=0;index-=1){
      const stack=stacks[index];
      if(stack.itemId!=="crowbar")continue;
      refunds.set(areaId,(refunds.get(areaId)??0)+Math.max(0,Number(stack.quantity??1))*3);
      stacks.splice(index,1);
    }
  };
  for(const areaId of Object.keys(AREAS))for(const stacks of [state.groundByArea[areaId],state.storageByArea[areaId],state.coldStorageByArea[areaId],state.wardrobeByArea[areaId]])removeCrowbars(stacks,areaId);
  for(const stacks of [state.backpack.cold,state.backpack.ordinary])removeCrowbars(stacks,state.position);
  for(const [areaId,quantity] of refunds)addItem(state,"iron_ingot",quantity,{areaId,preferred:"ground"});
  for(const key of Object.keys(state.productionUsage??{}))if(key.endsWith(":crowbar"))delete state.productionUsage[key];
  for(const offer of state.tradeOffers??[])for(const entry of [offer.give,offer.want])if(entry?.id==="crowbar")entry.name??="铁撬棍";
  // 活跃报价由读档末尾的通用校验刷新，保留已成交与已撤回的历史。
}

function migrateRemovedCraftedEquipment(state){
  state.ownedBlueprintIds=(state.ownedBlueprintIds??[]).filter(id=>!REMOVED_CRAFTED_EQUIPMENT_IDS.has(id));
  if(Array.isArray(state.lastLottery))state.lastLottery=state.lastLottery.filter(reward=>!REMOVED_CRAFTED_EQUIPMENT_IDS.has(reward.id));
  const refunds=new Map();
  const refundEquipment=(itemId,quantity,areaId)=>{
    if(!REMOVED_CRAFTED_EQUIPMENT_IDS.has(itemId))return false;
    const inputs=REMOVED_CRAFTED_EQUIPMENT[itemId]?.inputs??{steel:10,leather:6,precision_part:5};
    const amount=Math.max(0,Number(quantity??1)||0),local=refunds.get(areaId)??{};
    for(const [material,needed] of Object.entries(inputs))local[material]=(local[material]??0)+needed*amount;
    refunds.set(areaId,local);
    return true;
  };
  for(const [slot,itemId] of Object.entries(state.player.equipment??{}))if(refundEquipment(itemId,1,state.position))state.player.equipment[slot]=null;
  const removeEquipment=(stacks,areaId)=>{
    for(let index=stacks.length-1;index>=0;index-=1)if(refundEquipment(stacks[index].itemId,stacks[index].quantity,areaId))stacks.splice(index,1);
  };
  for(const areaId of Object.keys(AREAS))for(const stacks of [state.groundByArea[areaId],state.storageByArea[areaId],state.coldStorageByArea[areaId],state.wardrobeByArea[areaId]])removeEquipment(stacks,areaId);
  for(const stacks of [state.backpack.cold,state.backpack.ordinary])removeEquipment(stacks,state.position);
  for(const [areaId,inputs] of refunds)for(const [itemId,quantity] of Object.entries(inputs))if(quantity>0)addItem(state,itemId,quantity,{areaId,preferred:"ground"});
  for(const key of Object.keys(state.productionUsage??{}))if([...REMOVED_CRAFTED_EQUIPMENT_IDS].some(id=>key.endsWith(`:${id}`)))delete state.productionUsage[key];
  for(const offer of state.tradeOffers??[])for(const entry of [offer.give,offer.want])if(REMOVED_CRAFTED_EQUIPMENT_IDS.has(entry?.id))entry.name??=REMOVED_CRAFTED_EQUIPMENT[entry.id]?.name??"钢制生存护具";
  // 活跃报价交给读档末尾的通用校验刷新；历史报价保留且不重复退款。
}

function migrateRemovedItems(state){
  const replacementId=(itemId)=>REMOVED_ITEM_REPLACEMENTS[itemId]??itemId;
  state.ownedBlueprintIds=[...new Set((state.ownedBlueprintIds??[]).map(replacementId).filter(id=>!REMOVED_ITEM_IDS.has(id)))];
  if(Array.isArray(state.lastLottery))state.lastLottery=state.lastLottery.map((reward)=>{
    const id=replacementId(reward.id);
    if(id===reward.id)return reward;
    const name=reward.type==="blueprint"?BLUEPRINTS.find(blueprint=>blueprint.id===id)?.name:ITEMS[id]?.name;
    return {...reward,id,...(name?{name}:{})};
  }).filter(reward=>!REMOVED_ITEM_IDS.has(reward.id));
  const removeStacks=(stacks)=>{
    if(!Array.isArray(stacks))return;
    for(let index=stacks.length-1;index>=0;index-=1){
      const itemId=stacks[index].itemId;
      if(!REMOVED_ITEM_IDS.has(itemId))continue;
      const replacement=REMOVED_ITEM_REPLACEMENTS[itemId];
      if(replacement)stacks[index]={...stacks[index],itemId:replacement};
      else stacks.splice(index,1);
    }
  };
  removeStacks(state.backpack?.cold);removeStacks(state.backpack?.ordinary);
  for(const areaId of Object.keys(AREAS))for(const stacks of [state.groundByArea?.[areaId],state.storageByArea?.[areaId],state.coldStorageByArea?.[areaId],state.wardrobeByArea?.[areaId]])removeStacks(stacks);
  for(const areaId of Object.keys(AREAS))state.plotsByArea[areaId]=(state.plotsByArea?.[areaId]??[]).filter(plot=>!REMOVED_ITEM_IDS.has(plot.cropId));
  if(REMOVED_ITEM_IDS.has(state.selectedFood?.itemId)&&!REMOVED_ITEM_REPLACEMENTS[state.selectedFood.itemId])state.selectedFood=null;
  if(REMOVED_ITEM_REPLACEMENTS[state.selectedFood?.itemId]){
    const itemId=REMOVED_ITEM_REPLACEMENTS[state.selectedFood.itemId];
    state.selectedFood={...state.selectedFood,itemId,happiness:ITEMS[itemId].happiness,reservation:state.selectedFood.reservation?{...state.selectedFood.reservation,unit:{...state.selectedFood.reservation.unit,itemId}}:state.selectedFood.reservation};
  }
  state.dailyTasks=(state.dailyTasks??[]).filter(task=>!REMOVED_ITEM_IDS.has(String(task.event??"").replace(/^gather_/u,"")));
  state.tradeOffers=(state.tradeOffers??[]).filter(offer=>!REMOVED_ITEM_IDS.has(offer.give?.id)&&!REMOVED_ITEM_IDS.has(offer.want?.id));
  for(const key of Object.keys(state.productionUsage??{}))if([...REMOVED_ITEM_IDS].some(itemId=>key.endsWith(`:${itemId}`)))delete state.productionUsage[key];
}

function migrateRemovedGrassArmor(state){
  state.ownedBlueprintIds=(state.ownedBlueprintIds??[]).filter(id=>!REMOVED_GRASS_ARMOR_BLUEPRINT_IDS.has(id));
  if(Array.isArray(state.lastLottery))state.lastLottery=state.lastLottery.filter(reward=>reward.type!=="blueprint"||!REMOVED_GRASS_ARMOR_BLUEPRINT_IDS.has(reward.id));
  for(const [slot,itemId] of Object.entries(state.player.equipment??{})){
    if(REMOVED_GRASS_ARMOR_REPLACEMENTS[itemId])state.player.equipment[slot]=REMOVED_GRASS_ARMOR_REPLACEMENTS[itemId];
  }
  const collections=[state.backpack?.cold??[],state.backpack?.ordinary??[],...Object.values(state.groundByArea??{}),...Object.values(state.storageByArea??{}),...Object.values(state.coldStorageByArea??{}),...Object.values(state.wardrobeByArea??{})];
  for(const stacks of collections){
    const merged=[];
    for(const stack of stacks){
      const mappedItemId=REMOVED_GRASS_ARMOR_REPLACEMENTS[stack.itemId]??stack.itemId;
      const existing=merged.find(entry=>entry.itemId===mappedItemId&&Number(entry.spoilageNights??0)===Number(stack.spoilageNights??0));
      if(existing)existing.quantity+=(stack.quantity??1);
      else merged.push({...stack,itemId:mappedItemId,quantity:stack.quantity??1});
    }
    stacks.splice(0,stacks.length,...merged);
  }
  state.tradeOffers=(state.tradeOffers??[]).filter(offer=>{
    if(!offer.completed&&!offer.withdrawn)return true;
    const removedGive=offer.give?.type==="blueprint"?REMOVED_GRASS_ARMOR_BLUEPRINT_IDS.has(offer.give.id):Boolean(REMOVED_GRASS_ARMOR_REPLACEMENTS[offer.give?.id]);
    return !removedGive&&!REMOVED_GRASS_ARMOR_REPLACEMENTS[offer.want?.id];
  });
}

function migrateRemovedStandaloneEquipment(state){
  const mapItemId=(itemId)=>REMOVED_STANDALONE_EQUIPMENT_REPLACEMENTS[itemId]??itemId;
  state.ownedBlueprintIds=[...new Set((state.ownedBlueprintIds??[]).map(mapItemId))];
  if(Array.isArray(state.lastLottery))for(const reward of state.lastLottery){
    if(reward.type!=="blueprint"||!REMOVED_STANDALONE_EQUIPMENT_IDS.has(reward.id))continue;
    reward.id=mapItemId(reward.id);
    reward.name=BLUEPRINTS.find(blueprint=>blueprint.id===reward.id)?.name??reward.name;
  }
  for(const [slot,itemId] of Object.entries(state.player.equipment??{}))state.player.equipment[slot]=mapItemId(itemId);
  const collections=[state.backpack?.cold??[],state.backpack?.ordinary??[],...Object.values(state.groundByArea??{}),...Object.values(state.storageByArea??{}),...Object.values(state.coldStorageByArea??{}),...Object.values(state.wardrobeByArea??{})];
  for(const stacks of collections){
    const merged=[];
    for(const stack of stacks){
      const mappedItemId=mapItemId(stack.itemId);
      const existing=merged.find(entry=>entry.itemId===mappedItemId&&Number(entry.spoilageNights??0)===Number(stack.spoilageNights??0));
      if(existing)existing.quantity+=Number(stack.quantity??1);
      else merged.push({...stack,itemId:mappedItemId,quantity:Number(stack.quantity??1)});
    }
    stacks.splice(0,stacks.length,...merged);
  }
  state.tradeOffers=(state.tradeOffers??[]).filter(offer=>{
    const removedGive=offer.give?.type==="blueprint"?REMOVED_STANDALONE_EQUIPMENT_IDS.has(offer.give.id):REMOVED_STANDALONE_EQUIPMENT_IDS.has(offer.give?.id);
    return !removedGive&&!REMOVED_STANDALONE_EQUIPMENT_IDS.has(offer.want?.id);
  });
}

function migrateRenamedEquipmentText(state){
  const rename=(value)=>{
    if(typeof value!=="string")return value;
    const preservedHeatName="__CURRENT_HEAT_ARMOR_NAME__";
    return value.replaceAll("防雨耐热钢甲",preservedHeatName)
      .replaceAll("羊毛衬里皮甲","羽绒温暖套装")
      .replaceAll("羊毛温暖套装","羽绒温暖套装")
      .replaceAll("透气皮甲","麻布单衣")
      .replaceAll("风暴铁甲","抗风保温钢甲")
      .replaceAll("防风衣","抗风保温钢甲")
      .replaceAll("耐热钢甲","防雨耐热钢甲")
      .replaceAll("淬毒连弩",ITEMS.venom_repeater.name)
      .replaceAll(preservedHeatName,"防雨耐热钢甲");
  };
  if(Array.isArray(state.lastLottery))for(const reward of state.lastLottery){
    if(reward.type==="blueprint"&&["storm_iron_armor_","heat_steel_armor_"].some(prefix=>String(reward.id??"").startsWith(prefix)))reward.name=BLUEPRINTS.find(blueprint=>blueprint.id===reward.id)?.name??rename(reward.name);
    else reward.name=rename(reward.name);
  }
  for(const offer of state.tradeOffers??[]){
    if(offer.give)offer.give.name=rename(offer.give.name);
    if(offer.want)offer.want.name=rename(offer.want.name);
  }
  for(const task of state.dailyTasks??[])task.text=rename(task.text);
  for(const log of state.logs??[])log.text=rename(log.text);
  state.lastDaySummary=(state.lastDaySummary??[]).map(rename);
}

function migrateRemovedDefenseArmor(state){
  const mapBlueprint=(blueprintId)=>{
    if(REMOVED_DEFENSE_ARMOR_REPLACEMENTS[blueprintId])return REMOVED_DEFENSE_ARMOR_REPLACEMENTS[blueprintId];
    const baseId=String(blueprintId??"").replace(/_set$/u,"");
    const replacement=REMOVED_DEFENSE_ARMOR_SET_REPLACEMENTS[baseId];
    return replacement?`${replacement}_body`:blueprintId;
  };
  state.ownedBlueprintIds=[...new Set((state.ownedBlueprintIds??[]).map(mapBlueprint))];
  if(Array.isArray(state.lastLottery))for(const reward of state.lastLottery){
    if(reward.type!=="blueprint"||!REMOVED_DEFENSE_ARMOR_BLUEPRINT_IDS.has(reward.id))continue;
    reward.id=mapBlueprint(reward.id);
    reward.name=BLUEPRINTS.find(blueprint=>blueprint.id===reward.id)?.name??reward.name;
  }
  for(const [slot,itemId] of Object.entries(state.player.equipment??{}))if(REMOVED_DEFENSE_ARMOR_REPLACEMENTS[itemId])state.player.equipment[slot]=REMOVED_DEFENSE_ARMOR_REPLACEMENTS[itemId];
  const collections=[state.backpack?.cold??[],state.backpack?.ordinary??[],...Object.values(state.groundByArea??{}),...Object.values(state.storageByArea??{}),...Object.values(state.coldStorageByArea??{}),...Object.values(state.wardrobeByArea??{})];
  for(const stacks of collections){
    const merged=[];
    for(const stack of stacks){
      const mappedItemId=REMOVED_DEFENSE_ARMOR_REPLACEMENTS[stack.itemId]??stack.itemId;
      const existing=merged.find(entry=>entry.itemId===mappedItemId&&Number(entry.spoilageNights??0)===Number(stack.spoilageNights??0));
      if(existing)existing.quantity+=Number(stack.quantity??1);
      else merged.push({...stack,itemId:mappedItemId,quantity:Number(stack.quantity??1)});
    }
    stacks.splice(0,stacks.length,...merged);
  }
  state.tradeOffers=(state.tradeOffers??[]).filter(offer=>{
    const removedGive=offer.give?.type==="blueprint"
      ?REMOVED_DEFENSE_ARMOR_BLUEPRINT_IDS.has(offer.give.id)
      :Boolean(REMOVED_DEFENSE_ARMOR_REPLACEMENTS[offer.give?.id]);
    return !removedGive&&!REMOVED_DEFENSE_ARMOR_REPLACEMENTS[offer.want?.id];
  });
  delete state.player.baseDefense;
}

function migrateRemovedFurniture(state){
  state.ownedBlueprintIds=(state.ownedBlueprintIds??[]).filter(id=>!REMOVED_FURNITURE_ITEM_IDS.has(id));
  if(Array.isArray(state.lastLottery))state.lastLottery=state.lastLottery.filter(reward=>!REMOVED_FURNITURE_ITEM_IDS.has(reward.id));
  const removeStacks=(stacks)=>{
    if(!Array.isArray(stacks))return;
    for(let index=stacks.length-1;index>=0;index--)if(REMOVED_FURNITURE_ITEM_IDS.has(stacks[index].itemId))stacks.splice(index,1);
  };
  removeStacks(state.backpack?.cold);removeStacks(state.backpack?.ordinary);
  for(const areaId of Object.keys(AREAS)){
    state.furnitureByArea[areaId]=(state.furnitureByArea[areaId]??[]).filter(entry=>!REMOVED_FURNITURE_ITEM_IDS.has(entry.itemId));
    for(const stacks of [state.groundByArea[areaId],state.storageByArea[areaId],state.coldStorageByArea[areaId],state.wardrobeByArea?.[areaId]])removeStacks(stacks);
  }
}

function migrateLegacyArmorSetBlueprints(state){
  const legacyToBody=new Map(Object.values(EQUIPMENT).filter(entry=>entry.kind==="armorSet").map(entry=>[entry.id.replace(/_set$/,""),entry.parts.find(partId=>partId.endsWith("_body"))]));
  state.ownedBlueprintIds=[...new Set((state.ownedBlueprintIds??[]).map(blueprintId=>legacyToBody.get(blueprintId)??blueprintId))];
  if(Array.isArray(state.lastLottery))for(const reward of state.lastLottery){
    if(reward.type!=="blueprint"||!legacyToBody.has(reward.id))continue;
    reward.id=legacyToBody.get(reward.id);
    reward.name=BLUEPRINTS.find(blueprint=>blueprint.id===reward.id)?.name??reward.name;
  }
}

function migrateLegacyTailorTables(state){
  state.ownedBlueprintIds=[...new Set((state.ownedBlueprintIds??[]).map(blueprintId=>blueprintId==="tailor_table"?"wood_needle":blueprintId))];
  if(Array.isArray(state.lastLottery))for(const reward of state.lastLottery){
    if(reward.type!=="blueprint"||reward.id!=="tailor_table")continue;
    reward.id="wood_needle";
    reward.name="木针";
  }
  for(const areaId of Object.keys(AREAS)){
    for(const [buildingId,progress] of Object.entries(state.buildingsByArea[areaId]??{})){
      if(buildingId.replace(/__\d+$/u,"")!=="tailor_table")continue;
      if(progress.completed||Number(progress.progress)>0)addItem(state,"wood_needle",1,{preferred:"ground",areaId});
      delete state.buildingsByArea[areaId][buildingId];
    }
  }
  for(const key of Object.keys(state.productionUsage??{}))if(key.endsWith(":tailor_table"))delete state.productionUsage[key];
}

function migrateLegacyFacilityItems(state) {
  state.ownedBlueprintIds=(state.ownedBlueprintIds??[]).filter(id=>id!=="storage_pile"&&id!==REMOVED_DRYING_RACK_BLUEPRINT_ID&&!REMOVED_FUEL_TANK_BLUEPRINT_IDS.has(id));
  for(const blueprintId of INITIAL_BLUEPRINTS)if(!state.ownedBlueprintIds.includes(blueprintId))state.ownedBlueprintIds.push(blueprintId);
  state.ownedBlueprintIds=[...new Set(state.ownedBlueprintIds)];
  if(Array.isArray(state.lastLottery))state.lastLottery=state.lastLottery.filter(reward=>reward.type!=="blueprint"||(reward.id!==REMOVED_DRYING_RACK_BLUEPRINT_ID&&!REMOVED_FUEL_TANK_BLUEPRINT_IDS.has(reward.id)));
  state.tradeOffers=(state.tradeOffers??[]).filter(offer=>!(offer.give?.type==="blueprint"&&REMOVED_FUEL_TANK_BLUEPRINT_IDS.has(offer.give.id)&&(offer.completed||offer.withdrawn)));
  const refunds=[];
  const install=(areaId,facilityId)=>{
    const definition=BUILDINGS[facilityId];if(!definition)return false;
    const existing=Object.keys(state.buildingsByArea[areaId]??{}).filter(id=>id===facilityId||id.startsWith(`${facilityId}__`));
    if(existing.length>=(definition.maxPerArea??1))return false;
    const id=existing.length?`${facilityId}__${existing.length+1}`:facilityId;
    state.buildingsByArea[areaId][id]={progress:definition.steps,completed:true,completedOrder:++state.buildCompletionIndex};
    return true;
  };
  const installLegacyItem=(areaId,itemId,refundFixedAnnex=false)=>{
    const facilityId=LEGACY_FACILITY_ITEMS[itemId];
    if(!facilityId)return false;
    if(refundFixedAnnex&&FIXED_HOUSE_ANNEX_ITEMS.has(itemId))refunds.push({areaId,facilityId,quantity:1});
    else if(!install(areaId,facilityId)&&LEGACY_FACILITY_ITEM_REFUNDS[itemId])refunds.push({areaId,inputs:LEGACY_FACILITY_ITEM_REFUNDS[itemId],quantity:1});
    return true;
  };
  for(const areaId of Object.keys(AREAS)){
    for(const [buildingId,progress] of Object.entries(state.buildingsByArea[areaId]??{})){
      if(buildingId.replace(/__\d+$/u,"")!=="fuel_tank")continue;
      if(Number(progress.progress??0)>0)refunds.push({areaId,inputs:{plank:2},quantity:1});
      delete state.buildingsByArea[areaId][buildingId];
    }
    for(const buildingId of Object.keys(state.buildingsByArea[areaId]??{}))if(buildingId.replace(/__\d+$/u,"")==="storage_pile")delete state.buildingsByArea[areaId][buildingId];
    const kept=[];
    for(const entry of state.devicesByArea[areaId]??[]){
      if(entry.itemId==="drying_rack"){refunds.push({areaId,inputs:REMOVED_DRYING_RACK_REFUND,quantity:1});continue;}
      if(!installLegacyItem(areaId,entry.itemId))kept.push(entry);
    }
    state.devicesByArea[areaId]=kept;
    const keptFurniture=[];
    for(const entry of state.furnitureByArea[areaId]??[])if(!installLegacyItem(areaId,entry.itemId))keptFurniture.push(entry);
    state.furnitureByArea[areaId]=keptFurniture;
    for(const stacks of [state.groundByArea[areaId]??[],state.storageByArea[areaId]??[],state.coldStorageByArea[areaId]??[]]){
      for(let index=stacks.length-1;index>=0;index--){
        const stack=stacks[index];
        if(stack.itemId==="drying_rack"){refunds.push({areaId,inputs:REMOVED_DRYING_RACK_REFUND,quantity:stack.quantity??1});stacks.splice(index,1);continue;}
        if(!LEGACY_FACILITY_ITEMS[stack.itemId])continue;for(let n=0;n<(stack.quantity??1);n++)installLegacyItem(areaId,stack.itemId,true);stacks.splice(index,1);
      }
    }
    const storage=state.storageByArea[areaId]??=[];
    const capacity=Math.max(0,Math.floor(getStorageCapacity(state,areaId)));
    for(const stack of storage.splice(capacity))addStackToStacks(state.groundByArea[areaId],stack);
  }
  for(const stacks of [state.backpack.cold??[],state.backpack.ordinary??[]]){
    for(let index=stacks.length-1;index>=0;index--){
      const stack=stacks[index];
      if(stack.itemId==="drying_rack"){refunds.push({areaId:state.position,inputs:REMOVED_DRYING_RACK_REFUND,quantity:stack.quantity??1});stacks.splice(index,1);continue;}
      if(!LEGACY_FACILITY_ITEMS[stack.itemId])continue;for(let n=0;n<(stack.quantity??1);n++)installLegacyItem(state.position,stack.itemId,true);stacks.splice(index,1);
    }
  }
  for(const key of Object.keys(state.productionUsage??{}))if(key.endsWith(":drying_rack"))delete state.productionUsage[key];
  for(const refund of refunds)for(const [itemId,quantity] of Object.entries(refund.inputs??BUILDINGS[refund.facilityId]?.inputs??{}))addItem(state,itemId,quantity*refund.quantity,{areaId:refund.areaId,preferred:"ground"});
}

function migrateRemovedTextileWorkshop(state){
  state.ownedBlueprintIds=(state.ownedBlueprintIds??[]).filter(id=>id!==REMOVED_TEXTILE_WORKSHOP_ID);
  if(Array.isArray(state.lastLottery))state.lastLottery=state.lastLottery.filter(reward=>reward.id!==REMOVED_TEXTILE_WORKSHOP_ID);
  state.tradeOffers=(state.tradeOffers??[]).filter(offer=>!(offer.give?.type==="blueprint"&&offer.give.id===REMOVED_TEXTILE_WORKSHOP_ID));
  for(const areaId of Object.keys(AREAS)){
    const buildings=state.buildingsByArea?.[areaId]??{},removed=Object.entries(buildings).filter(([id])=>id.replace(/__\d+$/u,"")===REMOVED_TEXTILE_WORKSHOP_ID);
    if(!removed.length)continue;
    let restoreTextileTable=false,completedSource=null;
    for(const [buildingId,progress] of removed){
      const investedSteps=progress.completed?5:Math.max(0,Math.min(5,Math.floor(Number(progress.progress??0))));
      if(investedSteps>0){
        restoreTextileTable=true;
        for(const [itemId,quantity] of Object.entries(REMOVED_TEXTILE_WORKSHOP_INPUTS))addItem(state,itemId,quantity*investedSteps,{areaId,preferred:"ground"});
      }
      if(progress.completed)completedSource=progress;
      delete buildings[buildingId];
    }
    if(restoreTextileTable&&!Object.keys(buildings).some(id=>id.replace(/__\d+$/u,"")==="textile_table")){
      buildings.textile_table={
        progress:BUILDINGS.textile_table.steps,
        completed:true,
        completedOrder:completedSource?.completedOrder??++state.buildCompletionIndex,
        ...(completedSource?.damaged?{damaged:true}:{})
      };
    }
  }
  for(const key of Object.keys(state.productionUsage??{})){
    if(!key.endsWith(`:${REMOVED_TEXTILE_WORKSHOP_ID}`))continue;
    const replacementKey=`${key.slice(0,-REMOVED_TEXTILE_WORKSHOP_ID.length)}textile_table`;
    state.productionUsage[replacementKey]=Math.max(Number(state.productionUsage[replacementKey]??0),Number(state.productionUsage[key]??0));
    delete state.productionUsage[key];
  }
}

function migrateRemovedDisasterShutters(state){
  state.ownedBlueprintIds=(state.ownedBlueprintIds??[]).filter(id=>id!==REMOVED_DISASTER_SHUTTERS_ID);
  if(Array.isArray(state.lastLottery))state.lastLottery=state.lastLottery.filter(reward=>reward.id!==REMOVED_DISASTER_SHUTTERS_ID);
  state.tradeOffers=(state.tradeOffers??[]).filter(offer=>!(offer.give?.type==="blueprint"&&offer.give.id===REMOVED_DISASTER_SHUTTERS_ID));
  for(const areaId of Object.keys(AREAS)){
    const buildings=state.buildingsByArea?.[areaId]??{};
    for(const [buildingId,progress] of Object.entries(buildings)){
      if(buildingId.replace(/__\d+$/u,"")!==REMOVED_DISASTER_SHUTTERS_ID)continue;
      const investedSteps=progress.completed?7:Math.max(0,Math.min(7,Math.floor(Number(progress.progress??0))));
      for(const [itemId,quantity] of Object.entries(REMOVED_DISASTER_SHUTTERS_INPUTS))addItem(state,itemId,quantity*investedSteps,{areaId,preferred:"ground"});
      delete buildings[buildingId];
    }
  }
  delete state.shutterTargetsByArea;
}

function migrateRemovedFacilities(state){
  const removedIds=new Set(Object.keys(REMOVED_FACILITIES));
  state.ownedBlueprintIds=(state.ownedBlueprintIds??[]).filter(id=>!removedIds.has(id));
  if(Array.isArray(state.lastLottery))state.lastLottery=state.lastLottery.filter(reward=>!removedIds.has(reward.id));
  state.tradeOffers=(state.tradeOffers??[]).filter(offer=>!(offer.give?.type==="blueprint"&&removedIds.has(offer.give.id)));
  for(const areaId of Object.keys(AREAS)){
    const buildings=state.buildingsByArea?.[areaId]??{};
    for(const [buildingId,progress] of Object.entries(buildings)){
      const baseId=buildingId.replace(/__\d+$/u,""),removed=REMOVED_FACILITIES[baseId];
      if(!removed)continue;
      const investedSteps=progress.completed?removed.steps:Math.max(0,Math.min(removed.steps,Math.floor(Number(progress.progress??0))));
      for(const [itemId,quantity] of Object.entries(removed.inputs))addItem(state,itemId,quantity*investedSteps,{areaId,preferred:"ground"});
      delete buildings[buildingId];
    }
    if(state.powerByArea?.[areaId]){
      state.powerByArea[areaId].capacity=0;
      state.powerByArea[areaId].stored=0;
    }
  }
  for(const key of Object.keys(state.productionUsage??{}))if(removedIds.has(key.split(":").at(-1)))delete state.productionUsage[key];
}

function reconcileFacilityUpgrade(state,areaId,upgradeId){
  const buildings=state.buildingsByArea?.[areaId],definition=BUILDINGS[upgradeId],predecessorId=definition?.replaces;
  if(!buildings||!predecessorId)return;
  const upgradeEntry=Object.entries(buildings).find(([id,progress])=>id.replace(/__\d+$/u,"")===upgradeId&&progress.completed);
  if(!upgradeEntry)return;
  const [,upgrade]=upgradeEntry;
  let enabled=upgrade.enabled!==false,paidDay=Number(upgrade.fuelPaidDay??0);
  for(const [id,predecessor] of Object.entries(buildings)){
    if(id.replace(/__\d+$/u,"")!==predecessorId)continue;
    if(predecessor.completed){enabled=enabled||predecessor.enabled!==false;paidDay=Math.max(paidDay,Number(predecessor.fuelPaidDay??0));}
    delete buildings[id];
  }
  if(definition.switchable)upgrade.enabled=enabled;
  if(Number(definition.effect?.fuelDaily??0)>0)upgrade.fuelPaidDay=paidDay;
  for(const [key,used] of Object.entries(state.productionUsage??{})){
    const match=key.match(/^(\d+):([^:]+):([^:]+)$/u);
    if(!match||match[2]!==areaId||match[3]!==predecessorId)continue;
    const target=`${match[1]}:${areaId}:${upgradeId}`;
    state.productionUsage[target]=(state.productionUsage[target]??0)+used;
    delete state.productionUsage[key];
  }
}

function reconcileFacilityUpgrades(state,areaId){
  for(const [upgradeId,definition] of Object.entries(BUILDINGS))if(definition.replaces)reconcileFacilityUpgrade(state,areaId,upgradeId);
}

const FIRST_CLIMATE_END_DAY=112;
const REPEATED_CLIMATE_START_DAY=10;
const REPEATED_CLIMATE_DAYS=FIRST_CLIMATE_END_DAY-REPEATED_CLIMATE_START_DAY+1;
const ACID_RAIN_START_DAY=56;
const ACID_RAIN_BASE_DAYS=6;
const STORM_START_DAY=106;
const STORM_BASE_DAYS=7;

function acidRainDurations(cycleIndex){
  const increase=Math.max(0,cycleIndex);
  return {light:2+increase,heavy:3+increase,downpour:1+increase,total:ACID_RAIN_BASE_DAYS+increase*3};
}

function climatePosition(day){
  const safeDay=Math.max(1,Math.floor(day));
  const cycleIndex=safeDay<=FIRST_CLIMATE_END_DAY?0:1+Math.floor((safeDay-FIRST_CLIMATE_END_DAY-1)/REPEATED_CLIMATE_DAYS);
  const cycleDay=safeDay<=FIRST_CLIMATE_END_DAY?safeDay:REPEATED_CLIMATE_START_DAY+((safeDay-FIRST_CLIMATE_END_DAY-1)%REPEATED_CLIMATE_DAYS);
  const rainStart=ACID_RAIN_START_DAY+cycleIndex*REPEATED_CLIMATE_DAYS;
  const rainDuration=acidRainDurations(cycleIndex).total;
  const rainDay=safeDay>=rainStart&&safeDay<rainStart+rainDuration?safeDay-rainStart:-1;
  return {cycleDay,cycleIndex,rainDay};
}

function climateCycleDay(day){return climatePosition(day).cycleDay;}
function climateCycleIndex(day){return climatePosition(day).cycleIndex;}

function isStormDay(day){
  const safeDay=Math.max(1,Math.floor(day));
  if(safeDay<STORM_START_DAY)return false;
  const stormCycleIndex=Math.floor((safeDay-STORM_START_DAY)/REPEATED_CLIMATE_DAYS);
  const stormStart=STORM_START_DAY+stormCycleIndex*REPEATED_CLIMATE_DAYS;
  const stormDuration=STORM_BASE_DAYS+stormCycleIndex*3;
  return safeDay<stormStart+stormDuration;
}

export function getBaseTemperature(day, seed = "0") {
  void seed;
  return BASE_TEMPERATURES[climateCycleDay(day)]??20;
}

export function hasWeatherHazard(weather,hazard){
  return (weather?.hazards??[weather?.id]).includes(hazard);
}

function scheduledWeatherHazards(day){
  const {cycleDay,rainDay}=climatePosition(day),hazards=[];
  if(cycleDay>=10&&cycleDay<=50)hazards.push("cold_wave");
  if(rainDay>=0)hazards.push("rain");
  if(cycleDay>=62&&cycleDay<=99)hazards.push("heat");
  if(isStormDay(day))hazards.push("storm");
  return hazards;
}

export function getWeather(state) {
  const day = state.day;
  const position=climatePosition(day);
  const hazards=scheduledWeatherHazards(day);
  const id=hazards.at(-1)??"calm";
  let intensity="normal",rainStage=null;
  if(hasWeatherHazard({id,hazards},"rain")){
    const durations=acidRainDurations(position.cycleIndex);
    rainStage=position.rainDay<durations.light?"light":position.rainDay<durations.light+durations.heavy?"heavy":"downpour";
  }
  if(hasWeatherHazard({id,hazards},"storm")){
    const roll=randomFromKey(state.seed,`weather-intensity:${day}`);intensity=roll<.3?"none":roll<.9?"normal":"severe";
    if(intensity==="severe"&&[1,2].every(offset=>isStormDay(day-offset)&&randomFromKey(state.seed,`weather-intensity:${day-offset}`)>=.9))intensity="normal";
  }
  return { id, hazards, intensity, rainStage, temperature: getBaseTemperature(day, state.seed), cycleDay:position.cycleDay, cycleIndex:position.cycleIndex };
}

export const ACID_RAIN_STAGE_EFFECTS=Object.freeze({
  light:Object.freeze({name:"小雨",outdoorStamina:0,cropFertilityLoss:1,cropDamageChance:.1,facilityDamageChance:.1,sicknessChance:.2}),
  heavy:Object.freeze({name:"大雨",outdoorStamina:.5,cropFertilityLoss:1,cropDamageChance:.2,facilityDamageChance:.2,sicknessChance:.4}),
  downpour:Object.freeze({name:"暴雨",outdoorStamina:1,cropFertilityLoss:2,cropDamageChance:.3,facilityDamageChance:.3,sicknessChance:.8})
});

export function getAcidRainStageEffect(weather){return ACID_RAIN_STAGE_EFFECTS[weather?.rainStage]??null;}

export function getWeatherForecast(state, areaId = state.position) {
  const station = getTotalGridPowerGeneration(state)>0&&completedInstances(state, areaId, "weather_station").some(([, progress]) => progress.enabled!==false&&progress.poweredToday !== false);
  const count = station ? 3 : 1;
  return Array.from({ length: count }, (_, offset) => {
    const forecastState = { ...state, day: state.day + offset + 1 };
    const weather = getWeather(forecastState);
    return { day: forecastState.day, weather, felt: getFeltTemperature(forecastState, areaId), band: getTemperatureBand(getFeltTemperature(forecastState, areaId)) };
  });
}

export function getHouse(state, areaId = state.position) {
  const base = HOUSE_LEVELS[state.housesByArea[areaId]?.level ?? 0];
  const returnBaseActive=state.returnTowerAreaId === areaId && state.returnProgress?.return_base?.completed;
  const reinforced=Number(state.housesByArea[areaId]?.level??0)>0&&(state.reinforcementByArea?.[areaId]?.untilDay??0)>=state.day;
  if(!returnBaseActive&&!reinforced)return base;
  const protectionBonus=(returnBaseActive?20:0)+(reinforced?20:0);
  return {
    ...base,
    space:returnBaseActive?Math.max(50,base.space):base.space,
    warmth:base.warmth+(returnBaseActive?20:0),
    acidRainFacilityProtection:Math.min(100,base.acidRainFacilityProtection+protectionBonus),
    stormFacilityProtection:Math.min(100,base.stormFacilityProtection+protectionBonus)
  };
}

export const FUEL_POINT_VALUES=Object.freeze({firewood:10,coal:50,fuel:200});
const roundFuelPoints=(value)=>Math.round((value+Number.EPSILON)*10)/10;

export function hasFuelStorage(state,areaId=state.position){
  const hasFuelBuilding=Object.entries(state.buildingsByArea?.[areaId]??{}).some(([id,progress])=>{
    if(!progress.completed)return false;
    const baseId=id.replace(/__\d+$/,""),definition=BUILDINGS[baseId];
    return Number(definition?.effect?.fuelDaily??0)>0||DIRECT_FUEL_STATIONS.has(baseId);
  });
  if(hasFuelBuilding)return true;
  return (state.furnitureByArea?.[areaId]??[]).some(entry=>Number(FURNITURE[entry.itemId]?.effect?.fuelDaily??0)>0)
    ||(state.devicesByArea?.[areaId]??[]).some(entry=>DIRECT_FUEL_STATIONS.has(entry.itemId));
}

function getHeatingFuelReduction(state,areaId){
  let reduction=0;
  for(const [id,progress] of Object.entries(state.buildingsByArea?.[areaId]??{})){
    if(!progress.completed||progress.damaged)continue;
    reduction+=Number(BUILDINGS[id.replace(/__\d+$/,'')]?.effect?.heatingFuelReduction??0);
  }
  return Math.min(.75,reduction);
}

export function getFuelDailyCost(state,effect,areaId=state.position){
  const base=Number(effect?.fuelDaily??0);
  return roundFuelPoints(effect?.heating?base*(1-getHeatingFuelReduction(state,areaId)):base);
}

function fuelConsumerEntries(state,areaId){
  const entries=[];
  for(const [id,entry] of Object.entries(state.buildingsByArea?.[areaId]??{})){
    const definition=BUILDINGS[id.replace(/__\d+$/,'')],effect=definition?.effect??{};
    if(entry.completed&&!entry.damaged&&Number(effect.fuelDaily??0)>0)entries.push({kind:"building",id,entry,effect,name:definition.name,order:entry.completedOrder??Number.MAX_SAFE_INTEGER});
  }
  for(const entry of state.furnitureByArea?.[areaId]??[]){
    const definition=FURNITURE[entry.itemId],effect=definition?.effect??{};
    if(Number(effect.fuelDaily??0)>0)entries.push({kind:"furniture",id:entry.id,entry,effect,name:definition.name,order:entry.placedOrder??Number.MAX_SAFE_INTEGER});
  }
  return entries.sort((left,right)=>left.order-right.order||left.name.localeCompare(right.name,"zh-CN"));
}

function projectedFuelOperationalEntries(state,areaId){
  const operational=new Set(),pool={value:Number(state.fuelPointsByArea?.[areaId]??0)};
  for(const consumer of fuelConsumerEntries(state,areaId)){
    if(consumer.entry.enabled===false)continue;
    if(consumer.entry.fuelPaidDay===state.day){operational.add(consumer.entry);continue;}
    const cost=getFuelDailyCost(state,consumer.effect,areaId);
    if(pool.value+1e-9>=cost){pool.value=roundFuelPoints(pool.value-cost);operational.add(consumer.entry);}
  }
  return operational;
}

function settleFuelConsumers(state,areaId,predicate=()=>true,summary=null){
  const stopped=[],paid=[];
  for(const consumer of fuelConsumerEntries(state,areaId)){
    if(consumer.entry.enabled===false||consumer.entry.fuelPaidDay===state.day||!predicate(consumer))continue;
    const cost=getFuelDailyCost(state,consumer.effect,areaId),available=Number(state.fuelPointsByArea?.[areaId]??0);
    if(available+1e-9>=cost){
      state.fuelPointsByArea[areaId]=roundFuelPoints(available-cost);
      consumer.entry.fuelPaidDay=state.day;
      paid.push({name:consumer.name,cost});
    }else{
      consumer.entry.enabled=false;
      consumer.entry.poweredToday=false;
      stopped.push(consumer.name);
      const text=`${areaId}：${consumer.name}因总燃料槽不足自动关闭`;
      addLog(state,text);
      if(summary)summary.push(text);
    }
  }
  return {paid,stopped};
}

function dailyItemResourceRequirements(effect){
  return DAILY_ITEM_RESOURCE_EFFECTS
    .map(({effectKey,itemId})=>({itemId,quantity:Number(effect?.[effectKey]??0)}))
    .filter(requirement=>requirement.quantity>0);
}

function dailyItemResourcePaid(entry,itemId,day){return Number(entry.resourcePaidDays?.[itemId]??0)===day;}

function hasDailyConsumableCost(effect){return Number(effect?.fuelDaily??0)>0||dailyItemResourceRequirements(effect).length>0;}

function automaticWaterPriority(baseId){return AUTOMATIC_WATER_PRIORITY[baseId]??Number.MAX_SAFE_INTEGER;}

function compareDailyResourceConsumers(left,right){
  const leftUsesWater=Number(left.effect?.waterDaily??0)>0,rightUsesWater=Number(right.effect?.waterDaily??0)>0;
  if(leftUsesWater!==rightUsesWater)return leftUsesWater?1:-1;
  if(leftUsesWater){const priorityDifference=automaticWaterPriority(left.baseId)-automaticWaterPriority(right.baseId);if(priorityDifference)return priorityDifference;}
  return left.order-right.order||(left.name??"").localeCompare(right.name??"","zh-CN");
}

function countDailyItemResource(state,itemId,areaId){return itemId==="water"?countLocalStorageItem(state,itemId,areaId):countItem(state,itemId,areaId);}

function consumeDailyItemResource(state,itemId,quantity,areaId){return itemId==="water"?consumeLocalStorageItem(state,itemId,quantity,areaId):consumeItem(state,itemId,quantity,areaId);}

export function getDailyResourcePaymentStatus(state,entry,effect){
  const usesResources=hasDailyConsumableCost(effect);
  const paid=usesResources
    &&(Number(effect?.fuelDaily??0)<=0||entry.fuelPaidDay===state.day)
    &&dailyItemResourceRequirements(effect).every(({itemId})=>dailyItemResourcePaid(entry,itemId,state.day));
  return {usesResources,paid};
}

function dailyConsumableConsumerEntries(state,areaId){
  const entries=[];
  for(const [id,entry] of Object.entries(state.buildingsByArea?.[areaId]??{})){
    const baseId=id.replace(/__\d+$/,''),definition=BUILDINGS[baseId],effect=definition?.effect??{};
    if(entry.completed&&!entry.damaged&&hasDailyConsumableCost(effect))entries.push({entry,effect,name:definition.name,baseId,order:entry.completedOrder??Number.MAX_SAFE_INTEGER});
  }
  for(const entry of state.furnitureByArea?.[areaId]??[]){
    const definition=FURNITURE[entry.itemId],effect=definition?.effect??{};
    if(hasDailyConsumableCost(effect))entries.push({entry,effect,name:definition.name,baseId:entry.itemId,order:entry.placedOrder??Number.MAX_SAFE_INTEGER});
  }
  return entries.sort(compareDailyResourceConsumers);
}

function settleDailyConsumableConsumers(state,areaId,summary=null,{deferWater=false}={}){
  const paid=[],stopped=[];
  for(const consumer of dailyConsumableConsumerEntries(state,areaId)){
    const {entry,effect,name}=consumer;
    if(entry.enabled===false)continue;
    const fuelCost=getFuelDailyCost(state,effect,areaId),needsFuel=fuelCost>0&&entry.fuelPaidDay!==state.day;
    const itemRequirements=dailyItemResourceRequirements(effect).filter(({itemId})=>!dailyItemResourcePaid(entry,itemId,state.day));
    if(deferWater&&itemRequirements.some(({itemId})=>itemId==="water"))continue;
    if(!needsFuel&&!itemRequirements.length)continue;
    const missingItem=itemRequirements.find(({itemId,quantity})=>countDailyItemResource(state,itemId,areaId)<quantity);
    const missingFuel=needsFuel&&Number(state.fuelPointsByArea?.[areaId]??0)+1e-9<fuelCost;
    if(missingItem||missingFuel){
      entry.enabled=false;
      entry.poweredToday=false;
      const resourceName=missingItem?ITEMS[missingItem.itemId].name:"总燃料槽";
      const text=`${areaId}：${name}因${resourceName}不足自动关闭`;
      stopped.push(name);addLog(state,text);if(summary)summary.push(text);
      continue;
    }
    if(needsFuel){state.fuelPointsByArea[areaId]=roundFuelPoints(Number(state.fuelPointsByArea[areaId]??0)-fuelCost);entry.fuelPaidDay=state.day;}
    for(const {itemId,quantity} of itemRequirements){consumeDailyItemResource(state,itemId,quantity,areaId);(entry.resourcePaidDays??={})[itemId]=state.day;}
    paid.push(name);
  }
  return {paid,stopped};
}

function settleCurrentAreaResourcesForAction(state){return settleDailyConsumableConsumers(state,state.position,null,{deferWater:true});}

function projectedDailyItemResourceOperationalEntries(state,areaId){
  const operational=new Set();
  const pools=Object.fromEntries(DAILY_ITEM_RESOURCE_EFFECTS.map(({itemId})=>[itemId,countDailyItemResource(state,itemId,areaId)]));
  pools.water=Math.max(0,pools.water-getDripIrrigationWaterDemand(state,areaId));
  const candidates=[];
  for(const [id,entry] of Object.entries(state.buildingsByArea?.[areaId]??{})){
    const baseId=id.replace(/__\d+$/,''),definition=BUILDINGS[baseId];
    if(entry.completed&&!entry.damaged&&entry.enabled!==false&&dailyItemResourceRequirements(definition?.effect).length)candidates.push({entry,effect:definition.effect,baseId,order:entry.completedOrder??Number.MAX_SAFE_INTEGER});
  }
  for(const entry of state.furnitureByArea?.[areaId]??[]){
    const effect=FURNITURE[entry.itemId]?.effect;
    if(entry.enabled!==false&&dailyItemResourceRequirements(effect).length)candidates.push({entry,effect,baseId:entry.itemId,order:entry.placedOrder??Number.MAX_SAFE_INTEGER});
  }
  candidates.sort(compareDailyResourceConsumers);
  for(const candidate of candidates){
    const unpaid=dailyItemResourceRequirements(candidate.effect).filter(({itemId})=>!dailyItemResourcePaid(candidate.entry,itemId,state.day));
    if(unpaid.some(({itemId,quantity})=>pools[itemId]<quantity))continue;
    for(const {itemId,quantity} of unpaid)pools[itemId]-=quantity;
    operational.add(candidate.entry);
  }
  return operational;
}

function collectLocalEffects(state, areaId = state.position) {
  const effects = { temperature:0,warmth: 0, cooling: 0, acidRainFacilityProtection:0, stormFacilityProtection:0, happiness: 0, storage: 0, coldStorage: 0, powerUse: 0, actionSicknessReduction:0, sickReduction: 0, healing:0 };
  const sources=Object.fromEntries(Object.keys(effects).map(key=>[key,[]]));
  const add=(key,value,label)=>{
    const amount=Number(value??0);
    if(!amount)return;
    effects[key]+=amount;
    sources[key].push({label,value:amount});
  };
  const fuelOperational=projectedFuelOperationalEntries(state,areaId),resourceOperational=projectedDailyItemResourceOperationalEntries(state,areaId);
  for (const [id, progress] of Object.entries(state.buildingsByArea[areaId] ?? {})) {
    const baseId=id.replace(/__\d+$/, ""),definition=BUILDINGS[baseId];
    if (!progress.completed || progress.damaged || !isBuildingEnabled(baseId,progress)) continue;
    const effect = definition?.effect ?? {};
    if (effect.power && (progress.poweredToday === false||getTotalGridPowerGeneration(state)<=0)) continue;
    if (effect.fuelDaily && !fuelOperational.has(progress)) continue;
    if (dailyItemResourceRequirements(effect).length&&!resourceOperational.has(progress)) continue;
    for (const key of Object.keys(effects)) add(key,effect[key],definition?.name??id);
  }
  let activeClimateWarmth=null;
  const climateCoolingByItem=new Map(),singleClimateFurniture=new Set(["electric_heater","evaporative_cooler","fan"]);
  for (const placed of state.furnitureByArea?.[areaId] ?? []) {
    if (!isFurnitureEnabled(placed)) continue;
    const definition=FURNITURE[placed.itemId],effect = definition?.effect ?? {};
    if (effect.power && (placed.poweredToday === false||getTotalGridPowerGeneration(state)<=0)) continue;
    if (effect.fuelDaily && !fuelOperational.has(placed)) continue;
    if (dailyItemResourceRequirements(effect).length&&!resourceOperational.has(placed)) continue;
    if(singleClimateFurniture.has(placed.itemId)){
      const warmth=Number(effect.warmth??0),cooling=Number(effect.cooling??0);
      if(warmth>(activeClimateWarmth?.value??0))activeClimateWarmth={label:definition.name,value:warmth};
      if(cooling>(climateCoolingByItem.get(placed.itemId)?.value??0))climateCoolingByItem.set(placed.itemId,{label:definition.name,value:cooling});
    }
    for (const key of Object.keys(effects)) if(!singleClimateFurniture.has(placed.itemId)||!["warmth","cooling"].includes(key)) add(key,effect[key],definition?.name??placed.itemId);
  }
  if(activeClimateWarmth)add("warmth",activeClimateWarmth.value,activeClimateWarmth.label);
  for(const source of climateCoolingByItem.values())add("cooling",source.value,source.label);
  return {effects,sources};
}

export function getLocalEffects(state, areaId = state.position) {
  return collectLocalEffects(state,areaId).effects;
}

export function getLocalEffectSources(state, areaId = state.position) {
  return collectLocalEffects(state,areaId).sources;
}

export function getOutdoorFacilityProtection(state,hazard,areaId=state.position){
  const key={rain:"acidRainFacilityProtection",storm:"stormFacilityProtection"}[hazard];
  if(!key)return 0;
  return clamp(Number(getHouse(state,areaId)[key]??0)+Number(getLocalEffects(state,areaId)[key]??0),0,100);
}

function getLocalHappinessSources(state, areaId = state.position) {
  if (!state.housesByArea[areaId]) return [];
  const sources = [],fuelOperational=projectedFuelOperationalEntries(state,areaId),resourceOperational=projectedDailyItemResourceOperationalEntries(state,areaId);
  for (const [id, progress] of Object.entries(state.buildingsByArea[areaId] ?? {})) {
    const baseId=id.replace(/__\d+$/, ""),definition = BUILDINGS[baseId];
    if (!progress.completed || progress.damaged || !isBuildingEnabled(baseId,progress)) continue;
    const effect = definition?.effect ?? {};
    if (effect.power && (progress.poweredToday === false||getTotalGridPowerGeneration(state)<=0)) continue;
    if (effect.fuelDaily && !fuelOperational.has(progress)) continue;
    if (dailyItemResourceRequirements(effect).length&&!resourceOperational.has(progress)) continue;
    if (Number(effect.happiness ?? 0) !== 0) sources.push({ label: definition.name, value: Number(effect.happiness) });
  }
  for (const placed of state.furnitureByArea?.[areaId] ?? []) {
    if (!isFurnitureEnabled(placed)) continue;
    const definition = FURNITURE[placed.itemId];
    const effect = definition?.effect ?? {};
    if (effect.power && (placed.poweredToday === false||getTotalGridPowerGeneration(state)<=0)) continue;
    if (effect.fuelDaily && !fuelOperational.has(placed)) continue;
    if (dailyItemResourceRequirements(effect).length&&!resourceOperational.has(placed)) continue;
    if (Number(effect.happiness ?? 0) !== 0) sources.push({ label: definition.name, value: Number(effect.happiness) });
  }
  return sources;
}

export function getPlayerStats(state) {
  const result = { attack: state.player.baseAttack, warmth: 0, heat: 0, rain: 0, storm: 0, rainStaminaReduction:0 };
  for (const itemId of Object.values(state.player.equipment ?? {})) {
    const gear = EQUIPMENT[itemId] ?? ITEMS[itemId];
    if (!gear) continue;
    result.attack += Number(gear.attack ?? 0);
    const env = gear.env ?? {};
    for (const key of ["warmth", "heat", "rain", "storm", "rainStaminaReduction"]) result[key] += Number(env[key] ?? 0);
  }
  result.warmth+=Math.max(0,(state.player.warmth??2)-2);
  result.heat+=Math.max(0,state.player.heatResist??0);
  const dietBuffs=state.player.dietBuffs??{};
  for(const key of ["attack","warmth","heat","rain","storm"])result[key]+=Number(dietBuffs[key]??0);
  result.rain=clamp(result.rain,0,100);
  result.storm=clamp(result.storm,0,100);
  if (state.player.injury > 0) {
    const divisor = 2 ** state.player.injury;
    result.attack = Math.max(1, Math.floor(result.attack / divisor));
  }
  return result;
}

export function getEffectiveCombatAttack(state, weakness, target={}) {
  const stats=getPlayerStats(state);
  const weapon=EQUIPMENT[state.player.equipment?.weapon]??ITEMS[state.player.equipment?.weapon];
  const matched=Boolean(weakness&&weapon?.weaponStyle===weakness);
  const mismatched=Boolean(weakness&&weapon?.weaponStyle&&weapon.weaponStyle!==weakness);
  const styleModifier=matched?1:(mismatched?-3:0);
  const weaponLevel=Number(weapon?.weaponLevel??0),targetLevel=Number(target.combatLevel??0),targetAttack=Number(target.attack??0);
  let attack=stats.attack+styleModifier,tierBoost=0;
  const attackTierBoost=Boolean(state.player.dietBuffs?.attackTierBoost)&&Number(state.player.injury??0)===0&&weaponLevel>0&&targetLevel===weaponLevel+1;
  if(attackTierBoost&&targetAttack>0&&attack<=targetAttack){tierBoost=targetAttack+1-attack;attack+=tierBoost;}
  return {attack,baseAttack:stats.attack,matched,mismatched,styleModifier,tierBoost,attackTierBoost,weaponStyle:weapon?.weaponStyle??null,weaponLevel};
}

export function getTemperatureBreakdown(state, areaId = state.position) {
  const weather = getWeather(state);
  const bias = AREAS[areaId]?.bias ?? 0;
  const house = getHouse(state, areaId);
  const { effects:local, sources:localSources } = collectLocalEffects(state, areaId);
  const entries = localSources.temperature.map(source=>({ label:source.label, value:source.value, type:"环境温度" }));
  const outdoorTemperature = weather.temperature + bias;
  let rawFeltTemperature = outdoorTemperature + local.temperature;
  let adjustmentMode = "comfortable";
  const addEquipmentSources=(key,multiplier=1)=>{
    for(const itemId of Object.values(state.player.equipment??{})){
      const gear=EQUIPMENT[itemId]??ITEMS[itemId],value=Number(gear?.env?.[key]??0)*multiplier;
      if(value)entries.push({label:gear.name,value,type:key==="warmth"?"装备保暖":"装备防热"});
    }
  };
  if(rawFeltTemperature<10){
    adjustmentMode="cold";
    if(house.warmth)entries.push({label:getHouseTemperatureLabel(state,areaId),value:house.warmth,type:"房屋保暖"});
    for(const source of localSources.warmth)entries.push({label:source.label,value:source.value,type:"家具/设施保暖"});
    addEquipmentSources("warmth");
    const dietWarmth=Number(state.player.dietBuffs?.warmth??0);
    if(dietWarmth)entries.push({label:"昨日饮食",value:dietWarmth,type:"饮食保暖"});
    const innateWarmth=Math.max(0,(state.player.warmth??2)-2);
    if(innateWarmth)entries.push({label:"角色额外保暖",value:innateWarmth,type:"角色保暖"});
    rawFeltTemperature+=house.warmth+local.warmth+getPlayerStats(state).warmth;
  }else if(rawFeltTemperature>30){
    adjustmentMode="hot";
    for(const source of localSources.cooling)entries.push({label:source.label,value:-source.value,type:"家具/设施防热"});
    addEquipmentSources("heat",-1);
    const dietHeat=Number(state.player.dietBuffs?.heat??0);
    if(dietHeat)entries.push({label:"昨日饮食",value:-dietHeat,type:"饮食防热"});
    const innateHeat=Math.max(0,state.player.heatResist??0);
    if(innateHeat)entries.push({label:"角色额外防热",value:-innateHeat,type:"角色防热"});
    rawFeltTemperature-=local.cooling+getPlayerStats(state).heat;
  }
  const feltTemperature=adjustmentMode==="cold"?Math.min(20,rawFeltTemperature):adjustmentMode==="hot"?Math.max(20,rawFeltTemperature):rawFeltTemperature;
  if(feltTemperature!==rawFeltTemperature)entries.push({label:"舒适温度调整限制",value:feltTemperature-rawFeltTemperature,type:"规则限制"});
  return {baseTemperature:weather.temperature,areaBias:bias,outdoorTemperature,entries,rawFeltTemperature,feltTemperature,adjustmentMode};
}

function getHouseTemperatureLabel(state,areaId){
  const house=getHouse(state,areaId);
  return state.returnTowerAreaId===areaId&&state.returnProgress?.return_base?.completed?`${house.name}与归航基地`:house.name;
}

export function getFeltTemperature(state, areaId = state.position) {
  return getTemperatureBreakdown(state,areaId).feltTemperature;
}

export function getTemperatureBand(value) {
  if (value >= 10 && value <= 30) return { id: "comfortable", name: "舒适", stamina: 0, risk: 0 };
  if ((value >= 1 && value <= 9) || (value >= 31 && value <= 39)) return { id: "strain", name: "负荷", stamina: 0.5, risk: 0 };
  if ((value >= -9 && value <= 0) || (value >= 40 && value <= 49)) return { id: "danger", name: "危险", stamina: 1, risk: 0.2 };
  const excess = value <= -10 ? -10 - value : value - 50;
  return { id: "lethal", name: "致命", stamina: 2, risk: Math.min(0.8, 0.2 + excess * 0.03), injuryRisk: 0.5 };
}

export function getOutdoorActionPreview(state, baseStamina, areaId = state.position) {
  const felt = getFeltTemperature(state, areaId);
  const band = getTemperatureBand(felt);
  const weather = getWeather(state);
  const stats=getPlayerStats(state);
  const rainExtra=hasWeatherHazard(weather,"rain")?Math.max(0,Number(getAcidRainStageEffect(weather)?.outdoorStamina??0)-stats.rainStaminaReduction):0;
  const stormExtra=hasWeatherHazard(weather,"storm")&&weather.intensity!=="none"?1:0;
  const weatherExtra=Math.max(rainExtra,stormExtra);
  const actionSicknessReduction=getLocalActionSicknessReduction(state,areaId),baseInjuryChance=band.id==="danger"?.2:band.id==="lethal"?.5:0;
  const injuryChance=baseInjuryChance*(felt<10?1:1-actionSicknessReduction);
  return { felt, band, weatherExtra, actionSicknessReduction, injuryChance, totalStamina: roundStamina(baseStamina + band.stamina + weatherExtra) };
}

function getLocalActionSicknessReduction(state,areaId=state.position){
  return clamp(Number(getLocalEffects(state,areaId).actionSicknessReduction??0),0,1);
}

export function getWeatherSicknessChance(state,hazard,areaId=state.position){
  const weather=getWeather(state),stats=getPlayerStats(state);
  let baseChance=0,protection=0;
  if(hazard==="rain"&&hasWeatherHazard(weather,"rain")){
    baseChance=Number(getAcidRainStageEffect(weather)?.sicknessChance??0)/5;
    protection=clamp(Number(stats.rain??0),0,100);
  }else if(hazard==="storm"&&hasWeatherHazard(weather,"storm")&&weather.intensity!=="none"){
    baseChance=(weather.intensity==="severe"?.8:.4)/5;
    protection=clamp(Number(stats.storm??0),0,100);
  }
  const actionSicknessReduction=getLocalActionSicknessReduction(state,areaId);
  return {hazard,baseChance,protection,chance:baseChance*(1-protection/100)*(1-actionSicknessReduction)};
}

function resolveWeatherSicknessExposure(state,areaId,{ignoreHouse=false}={}){
  if(!ignoreHouse&&Number(state.housesByArea?.[areaId]?.level??0)>0)return {checked:false,message:"",results:[]};
  const weather=getWeather(state),hazards=[];
  if(hasWeatherHazard(weather,"rain"))hazards.push("rain");
  if(hasWeatherHazard(weather,"storm")&&weather.intensity!=="none")hazards.push("storm");
  if(!hazards.length)return {checked:false,message:"",results:[]};
  const riskIndex=state.weatherSicknessActionIndex++;
  const results=hazards.map(hazard=>{
    const preview=getWeatherSicknessChance(state,hazard,areaId);
    const sick=randomFromKey(getGameplaySeed(state),`weather-sickness:${hazard}:${state.day}:${riskIndex}`)<preview.chance;
    return {...preview,sick};
  });
  const newlySick=!state.player.sick&&results.some(result=>result.sick);
  if(newlySick)state.player.sick=true;
  const names={rain:"酸雨",storm:"强风暴"},causes=results.filter(result=>result.sick).map(result=>names[result.hazard]).join("和");
  const message=newlySick?`${ignoreHouse?"在室外探索或采集时":"在无房屋地块行动时"}遭遇${causes}，生病了`:"";
  if(message)addLog(state,`${message}。`);
  return {checked:true,sick:newlySick,message,results};
}

function recordGameOver(state, reason) {
  if(!state.player.gameOver||!state.player.gameOverReason)state.player.gameOverReason=reason;
  state.player.gameOver=true;
}

function normalizeGameOverReason(state) {
  const recorded=typeof state.player.gameOverReason==="string"?state.player.gameOverReason.trim():"";
  if(!state.player.gameOver){state.player.gameOverReason="";return;}
  if(recorded){state.player.gameOverReason=recorded;return;}
  // Old saves have no death field. Recover only causes supported by their
  // actual overnight summary or a survival counter that reached its limit.
  const summary=state.lastDaySummary??[];
  if(summary.includes("未能在致命温度的露营中幸存"))state.player.gameOverReason="未能在致命温度的露营中幸存";
  else if(summary.some(text=>text.includes("连续3天没有吃饭也没有喝水"))||Number(state.player.noFoodAndDrinkDays)>=3)state.player.gameOverReason="连续3天没有吃饭也没有喝水";
  else if(summary.some(text=>text.includes("连续10天未能同时完成吃饭和喝水"))||Number(state.player.incompleteDietDays)>=10)state.player.gameOverReason="连续10天未能同时完成吃饭和喝水";
  else if(Number(state.player.extremeDays)>=3)state.player.gameOverReason="连续3天在无房屋地块经历极端温度（体感0℃及以下或40℃及以上）";
  else state.player.gameOverReason="";
}

function resolveOutdoorCost(state, baseStamina, acceptRisk, areaId = state.position,{sicknessAreaId=areaId,weatherExposureEvenWithHouse=false}={}) {
  let preview = getOutdoorActionPreview(state, baseStamina, areaId);
  if (state.player.stamina < preview.totalStamina) return { ok: false, message: `体力不足，需要${formatStamina(preview.totalStamina)}` };
  if ((preview.band.id === "danger" || preview.band.id === "lethal") && !acceptRisk) {
    return { ok: false, needsConfirmation: true, preview };
  }
  if(areaId===state.position)settleCurrentAreaResourcesForAction(state);
  preview=getOutdoorActionPreview(state,baseStamina,areaId);
  if(state.player.stamina<preview.totalStamina)return {ok:false,message:`体力不足，需要${formatStamina(preview.totalStamina)}`};
  state.player.stamina=roundStamina(state.player.stamina-preview.totalStamina);
  const riskIndex = state.actionIndex++;
  if (preview.band.id === "lethal" && randomFromKey(getGameplaySeed(state), `death:${state.day}:${riskIndex}`) < preview.band.risk) {
    recordGameOver(state,preview.felt<=-10?"在室外行动时未能从致命严寒中幸存":"在室外行动时未能从致命酷热中幸存");
    return { ok: false, died: true, message: "你没能从极端温度中活下来。" };
  }
  const injuryRisk=preview.injuryChance;
  if (injuryRisk > 0 && randomFromKey(getGameplaySeed(state), `temperature-injury:${state.day}:${riskIndex}`) < injuryRisk) {
    if (preview.felt < 10) inflictInjury(state);
    else state.player.sick = true;
    addLog(state, `极端温度使你${preview.felt < 10 ? "受伤" : "生病"}。`);
  }
  const weatherExposure=resolveWeatherSicknessExposure(state,sicknessAreaId,{ignoreHouse:weatherExposureEvenWithHouse});
  return { ok: true, preview, weatherExposure };
}

function inflictInjury(state, levels=1) {
  const injuryLevels=Math.max(1,Math.floor(Number(levels)||1));
  for(let level=0;level<injuryLevels;level+=1){
    state.player.injury += 1;
    state.player.stamina = Math.max(0, Math.round(state.player.stamina * 5) / 10);
    state.player.maxStamina = Math.max(5, Math.round(state.player.maxStamina * 5) / 10);
  }
}

function slotsUsed(stacks) {
  return stacks.length;
}

function getStackSpoilageBatches(stack) {
  const item=ITEMS[stack.itemId];
  const quantity=Math.max(0,Number(stack.quantity??0));
  if(!item?.shelfLifeNights||quantity<=0)return [];
  const raw=Array.isArray(stack.spoilageBatches)&&stack.spoilageBatches.length
    ?stack.spoilageBatches
    :[{spoilageNights:Number(stack.spoilageNights??0),quantity}];
  const merged=new Map(),fallbackAge=Math.max(0,Number(stack.spoilageNights??0)),ordered=[...raw].sort((a,b)=>Number(b.spoilageNights??0)-Number(a.spoilageNights??0));
  let remaining=quantity;
  for(const batch of ordered){
    if(remaining<=0)break;
    const batchQuantity=Math.min(remaining,Math.max(0,Number(batch.quantity??0)));
    if(!batchQuantity)continue;
    const age=Math.max(0,Number(batch.spoilageNights??0));
    merged.set(age,(merged.get(age)??0)+batchQuantity);
    remaining-=batchQuantity;
  }
  if(remaining>0)merged.set(fallbackAge,(merged.get(fallbackAge)??0)+remaining);
  return [...merged].map(([spoilageNights,batchQuantity])=>({spoilageNights,quantity:batchQuantity})).sort((a,b)=>b.spoilageNights-a.spoilageNights);
}

function oldestStackSpoilageNights(stack) {
  return getStackSpoilageBatches(stack)[0]?.spoilageNights??Number(stack.spoilageNights??0);
}

function applyStackSpoilageBatches(stack,batches) {
  const merged=new Map();
  for(const batch of batches??[]){
    const quantity=Math.max(0,Number(batch.quantity??0));
    if(!quantity)continue;
    const age=Math.max(0,Number(batch.spoilageNights??0));
    merged.set(age,(merged.get(age)??0)+quantity);
  }
  const normalized=[...merged].map(([spoilageNights,quantity])=>({spoilageNights,quantity})).sort((a,b)=>b.spoilageNights-a.spoilageNights);
  stack.quantity=normalized.reduce((sum,batch)=>sum+batch.quantity,0);
  stack.spoilageNights=normalized[0]?.spoilageNights??0;
  if(normalized.length>1)stack.spoilageBatches=normalized;else delete stack.spoilageBatches;
  return stack;
}

function mergeStackQuantities(target,incoming) {
  if(ITEMS[target.itemId]?.shelfLifeNights)applyStackSpoilageBatches(target,[...getStackSpoilageBatches(target),...getStackSpoilageBatches(incoming)]);
  else target.quantity=Number(target.quantity??0)+Number(incoming.quantity??0);
  return target;
}

function addStackToStacks(stacks,incoming,capacity=Infinity) {
  const existing=stacks.find(stack=>stack.itemId===incoming.itemId);
  if(existing){mergeStackQuantities(existing,incoming);return Number(incoming.quantity??0);}
  if(slotsUsed(stacks)>=capacity)return 0;
  const added=clone(incoming);
  if(ITEMS[added.itemId]?.shelfLifeNights)applyStackSpoilageBatches(added,getStackSpoilageBatches(added));
  stacks.push(added);
  return Number(incoming.quantity??0);
}

function takeFromStack(stack,quantity) {
  const requested=Math.min(Math.max(0,Number(quantity??0)),Math.max(0,Number(stack.quantity??0))),taken=clone(stack);
  if(!ITEMS[stack.itemId]?.shelfLifeNights){taken.quantity=requested;stack.quantity-=requested;return taken;}
  let remaining=requested;
  const kept=[],removed=[];
  for(const batch of getStackSpoilageBatches(stack)){
    const used=Math.min(batch.quantity,remaining);
    if(used>0)removed.push({spoilageNights:batch.spoilageNights,quantity:used});
    if(batch.quantity>used)kept.push({spoilageNights:batch.spoilageNights,quantity:batch.quantity-used});
    remaining-=used;
  }
  applyStackSpoilageBatches(stack,kept);
  applyStackSpoilageBatches(taken,removed);
  return taken;
}

export function getStackFreshnessRange(stack) {
  const item=ITEMS[stack?.itemId];
  if(!item?.shelfLifeNights)return null;
  const remaining=getStackSpoilageBatches(stack).map(batch=>Math.max(0,item.shelfLifeNights-batch.spoilageNights));
  if(!remaining.length)return {min:0,max:0};
  return {min:Math.min(...remaining),max:Math.max(...remaining)};
}

function consolidateItemStacks(stacks) {
  const consolidated=[];
  for(const stack of stacks??[]){
    const existing=consolidated.find(entry=>entry.itemId===stack.itemId);
    if(existing)mergeStackQuantities(existing,stack);else{
      const added=clone(stack);
      if(ITEMS[added.itemId]?.shelfLifeNights)applyStackSpoilageBatches(added,getStackSpoilageBatches(added));
      consolidated.push(added);
    }
  }
  stacks.splice(0,stacks.length,...consolidated);
}

function addToStacks(stacks, itemId, quantity, spoilageNights = 0, capacity = Infinity) {
  const item=ITEMS[itemId];
  return addStackToStacks(stacks,{itemId,quantity,...(item.shelfLifeNights?{spoilageNights}:{})},capacity);
}

function receivedItemsMessage(entries) {
  const totals=new Map();
  for(const entry of entries??[])if(entry?.itemId&&entry.quantity>0)totals.set(entry.itemId,(totals.get(entry.itemId)??0)+entry.quantity);
  return totals.size?`得到${[...totals].map(([itemId,quantity])=>`${ITEMS[itemId].name}×${quantity}`).join("、")}`:"";
}

export function getStorageCapacity(state, areaId) {
  return getLocalEffects(state, areaId).storage;
}

export function getColdStorageCapacity(state, areaId = state.position) {
  const passive = ["cellar","cellar_expansion","ice_cellar"].reduce((total,id)=>total+completedInstances(state,areaId,id).length*Number(BUILDINGS[id]?.effect?.coldStorage??0),0);
  const refrigerators = (state.furnitureByArea?.[areaId] ?? [])
    .filter((entry) => entry.itemId === "fridge" && entry.enabled !== false).length * Number(FURNITURE.fridge?.effect?.coldStorage ?? 0);
  return passive + refrigerators;
}

export function getWardrobeCapacity(state, areaId = state.position) {
  return completedInstances(state,areaId,"wardrobe").length * Number(BUILDINGS.wardrobe?.effect?.wardrobeStorage ?? 0);
}

export function getSeedStorageCapacity(state, areaId = state.position) {
  return completedInstances(state,areaId,"seed_storage_room").length * Number(BUILDINGS.seed_storage_room?.effect?.seedStorage ?? 0);
}

export function getUtilityStorageCapacity(state, areaId = state.position) {
  return completedInstances(state,areaId,"utility_room").length * Number(BUILDINGS.utility_room?.effect?.utilityStorage ?? 0);
}

function isUtilityStorageItem(itemId) {
  return ["tool","furniture","device"].includes(ITEMS[itemId]?.type);
}

export function getBackpackCapacity(state) {
  const equippedId=state.player?.equipment?.backpack??"system_small_backpack";
  const configured=ITEMS[equippedId]?.backpackCapacity??EQUIPMENT[equippedId]?.backpackCapacity??BACKPACK_CAPACITY;
  return {ordinary:Number(configured.ordinary??BACKPACK_CAPACITY.ordinary),cold:Number(configured.cold??BACKPACK_CAPACITY.cold)};
}

function getPassiveColdStorageCapacity(state, areaId) {
  return ["cellar","cellar_expansion","ice_cellar"].reduce((total,id)=>total+completedInstances(state,areaId,id).length*Number(BUILDINGS[id]?.effect?.coldStorage??0),0);
}

export function addItem(state, itemId, quantity, options = {}) {
  const item = ITEMS[itemId];
  if (!item || quantity <= 0) return 0;
  let remaining = quantity;
  const spoilageNights = options.spoilageNights ?? 0;
  const perishable = Boolean(item.shelfLifeNights);
  const areaId = options.areaId ?? state.position;
  const backpackCapacity=getBackpackCapacity(state);

  const addTo=(stacks,capacity)=>{
    if(remaining<=0)return;
    const added=addToStacks(stacks,itemId,remaining,spoilageNights,capacity);
    remaining -= added;
  };

  if(options.preferred==="ground"){
    addTo(state.groundByArea[areaId],Infinity);
  }else if(options.preferred==="backpack"){
    if(perishable)addTo(state.backpack.cold,backpackCapacity.cold);
    addTo(state.backpack.ordinary,backpackCapacity.ordinary);
    if(perishable)addTo(state.coldStorageByArea[areaId],getColdStorageCapacity(state,areaId));
    addTo(state.storageByArea[areaId],getStorageCapacity(state,areaId));
  }else if(options.preferred==="storage"){
    addTo(state.storageByArea[areaId],getStorageCapacity(state,areaId));
  }else{
    const targets=[];
    if(item.type==="seed")targets.push([state.seedStorageByArea[areaId],getSeedStorageCapacity(state,areaId)]);
    if(isUtilityStorageItem(itemId))targets.push([state.utilityStorageByArea[areaId],getUtilityStorageCapacity(state,areaId)]);
    if(["weapon","armor","backpack"].includes(item.type))targets.push([state.wardrobeByArea[areaId],getWardrobeCapacity(state,areaId)]);
    if(perishable){
      targets.push([state.coldStorageByArea[areaId],getColdStorageCapacity(state,areaId)]);
      targets.push([state.backpack.cold,backpackCapacity.cold]);
    }
    targets.push([state.storageByArea[areaId],getStorageCapacity(state,areaId)]);
    targets.push([state.backpack.ordinary,backpackCapacity.ordinary]);
    targets.push([state.groundByArea[areaId],Infinity]);
    // Prefer any accessible matching stack before allocating a new slot.
    for(const [stacks,capacity] of targets)if(stacks.some(stack=>stack.itemId===itemId&&stack.quantity>0))addTo(stacks,capacity);
    for(const [stacks,capacity] of targets)addTo(stacks,capacity);
  }
  if (remaining > 0) {
    addTo(state.groundByArea[areaId],Infinity);
  }
  if(quantity>remaining)for(const blueprintId of item.unlockBlueprints??[])acquireBlueprint(state,blueprintId,`取得${item.name}`);
  return quantity - remaining;
}

function allAccessibleStacks(state, areaId = state.position) {
  return [state.groundByArea[areaId], state.storageByArea[areaId], state.coldStorageByArea[areaId], state.wardrobeByArea[areaId], state.seedStorageByArea[areaId], state.utilityStorageByArea[areaId], state.backpack.cold, state.backpack.ordinary];
}

function mealLocations(state) {
  const backpackCapacity=getBackpackCapacity(state);
  const locations = [
    { key: "backpack:cold", label: "背包保鲜格", stacks: state.backpack.cold, capacity: backpackCapacity.cold, areaId: null },
    { key: "backpack:ordinary", label: "背包普通格", stacks: state.backpack.ordinary, capacity: backpackCapacity.ordinary, areaId: null }
  ];
  for (const areaId of Object.keys(AREAS).sort()) {
    locations.push({
      key: `area:${areaId}:storage`, label: `${areaId}储物`, stacks: state.storageByArea[areaId],
      capacity: getStorageCapacity(state, areaId), areaId
    });
    locations.push({
      key: `area:${areaId}:cold`, label: `${areaId}保鲜库`, stacks: state.coldStorageByArea[areaId],
      capacity: getColdStorageCapacity(state, areaId), areaId
    });
    locations.push({ key: `area:${areaId}:ground`, label: `${areaId}地面`, stacks: state.groundByArea[areaId], capacity: Infinity, areaId });
  }
  return locations;
}

function getMealLocation(state, sourceKey) {
  return mealLocations(state).find((location) => location.key === sourceKey);
}

function takeMealUnit(state, itemId, sourceKey) {
  const locations = sourceKey ? [getMealLocation(state, sourceKey)].filter(Boolean) : mealLocations(state);
  for (const location of locations) {
    const candidates = location.stacks
      .map((stack, index) => ({ stack, index }))
      .filter(({ stack }) => stack.itemId === itemId && stack.quantity > 0)
      .sort((a, b) => oldestStackSpoilageNights(b.stack)-oldestStackSpoilageNights(a.stack));
    const candidate = candidates[0];
    if (!candidate) continue;
    const unit=takeFromStack(candidate.stack,1);
    if (candidate.stack.quantity <= 0) location.stacks.splice(candidate.index, 1);
    return { sourceKey: location.key, sourceLabel: location.label, unit };
  }
  return null;
}

function restoreMealReservation(state, plan) {
  if (!plan?.reservation) return { restored: false };
  const location = getMealLocation(state, plan.reservation.sourceKey);
  if (!location) return { restored: false };
  const { unit } = plan.reservation;
  const mergeTarget=location.stacks.find(stack=>stack.itemId===unit.itemId);
  if (mergeTarget) {
    mergeStackQuantities(mergeTarget,unit);
    return { restored: true, sourceKey: location.key };
  }
  if (location.stacks.length < location.capacity) {
    location.stacks.push(clone(unit));
    return { restored: true, sourceKey: location.key };
  }
  const fallbackAreaId = location.areaId ?? state.position;
  addStackToStacks(state.groundByArea[fallbackAreaId],unit);
  addLog(state, `${location.label}已满，预留的${ITEMS[unit.itemId].name}已放到${fallbackAreaId}地面。`);
  return { restored: true, fellToGround: true, areaId: fallbackAreaId };
}

export function getMealSelectionOptions(state, kind) {
  const field = kind === "food" ? "selectedFood" : "selectedDrink";
  const options = [];
  for (const location of mealLocations(state)) {
    const totals = new Map();
    for (const stack of location.stacks) {
      if (ITEMS[stack.itemId]?.type !== kind) continue;
      totals.set(stack.itemId, (totals.get(stack.itemId) ?? 0) + stack.quantity);
    }
    for (const [itemId, quantity] of totals) options.push({ itemId, quantity, sourceKey: location.key, sourceLabel: location.label, reserved: false });
  }
  const plan = state[field];
  if (plan?.reservation) options.push({
    itemId: plan.itemId,
    quantity: 1,
    sourceKey: plan.reservation.sourceKey,
    sourceLabel: plan.reservation.sourceLabel,
    reserved: true,
    selected: true
  });
  return options;
}

export function countItem(state, itemId, areaId = state.position) {
  return allAccessibleStacks(state, areaId).flat().filter((stack) => stack.itemId === itemId).reduce((sum, stack) => sum + stack.quantity, 0);
}

export function countLocalStorageItem(state,itemId,areaId=state.position){
  return (state.storageByArea?.[areaId]??[]).filter(stack=>stack.itemId===itemId).reduce((sum,stack)=>sum+stack.quantity,0);
}

function hasBackpackItem(state,itemId){
  return [...(state.backpack?.cold??[]),...(state.backpack?.ordinary??[])].some(stack=>stack.itemId===itemId&&stack.quantity>0);
}

function consumeItem(state, itemId, quantity, areaId = state.position,{includeBackpack=true}={}) {
  const accessible=allAccessibleStacks(state,areaId),locations=includeBackpack?accessible:accessible.slice(0,-2);
  if (locations.flat().filter(stack=>stack.itemId===itemId).reduce((total,stack)=>total+stack.quantity,0) < quantity) return false;
  let remaining = quantity;
  for (const stacks of locations) {
    const candidates = stacks
      .map((stack, index) => ({ stack, index }))
      .filter(({ stack }) => stack.itemId === itemId)
      .sort((a, b) => oldestStackSpoilageNights(b.stack)-oldestStackSpoilageNights(a.stack));
    for (const candidate of candidates) {
      if (remaining <= 0) break;
      const used = Math.min(candidate.stack.quantity, remaining);
      takeFromStack(candidate.stack,used);
      remaining -= used;
    }
    for (let i = stacks.length - 1; i >= 0; i -= 1) if (stacks[i].quantity <= 0) stacks.splice(i, 1);
  }
  return remaining === 0;
}

function consumeLocalStorageItem(state,itemId,quantity,areaId=state.position){
  if(countLocalStorageItem(state,itemId,areaId)<quantity)return false;
  const stacks=state.storageByArea[areaId];
  let remaining=quantity;
  for(let index=stacks.length-1;index>=0&&remaining>0;index-=1){
    const stack=stacks[index];
    if(stack.itemId!==itemId)continue;
    const used=Math.min(stack.quantity,remaining);
    takeFromStack(stack,used);remaining-=used;
    if(stack.quantity<=0)stacks.splice(index,1);
  }
  return remaining===0;
}

function migrateLegacyFarmWaterStorage(state){
  if(Number(state.automaticWaterStorageRuleVersion??0)>=AUTOMATIC_WATER_STORAGE_RULE_VERSION)return;
  for(const areaId of Object.keys(AREAS)){
    const supply=state.farmSuppliesByArea[areaId]??={fertilizer:0},quantity=Math.max(0,Math.floor(Number(supply.water??0)));
    delete supply.water;
    supply.fertilizer=Math.max(0,Number(supply.fertilizer??0));
    if(!quantity)continue;
    const stored=addToStacks(state.storageByArea[areaId],"water",quantity,0,getStorageCapacity(state,areaId));
    const overflow=quantity-stored;
    if(overflow)addToStacks(state.groundByArea[areaId],"water",overflow);
    const text=`${areaId}：旧滴灌架储水${quantity}份已转回当地普通储物格${overflow?`，其中${overflow}份因储物格已满放到地面`:""}`;
    addLog(state,text);
  }
  state.automaticWaterStorageRuleVersion=AUTOMATIC_WATER_STORAGE_RULE_VERSION;
}

function hasInputs(state, inputs) {
  return Object.entries(inputs).every(([itemId, quantity]) => countItem(state, itemId) >= quantity);
}

function consumeInputs(state, inputs) {
  if (!hasInputs(state, inputs)) return false;
  for (const [itemId, quantity] of Object.entries(inputs)) consumeItem(state, itemId, quantity);
  return true;
}

function stationCapacityMultiplier(state,station,areaId){
  const roomId=isKitchenStation(station)?"kitchen":"workroom";
  return completedInstances(state,areaId,roomId).length?2:1;
}

function getProductionFuelCost(station){
  return Number(BUILDINGS[station]?.productionFuelCost??DEVICES[station]?.productionFuelCost??0);
}

export function getStationStatus(state, station, areaId = state.position) {
  if (station === "hand") return { available: true, remaining: Infinity, name: "徒手",groupKey:"hand",usageKey:"hand" };
  const fuelOperational=projectedFuelOperationalEntries(state,areaId);
  const built=(baseId)=>Object.entries(state.buildingsByArea?.[areaId]??{}).filter(([id,entry])=>(id===baseId||id.startsWith(`${baseId}__`))&&entry.completed);
  const usableBuilt=(baseId)=>completedInstances(state,areaId,baseId);
  const activeBuilt=(baseId)=>completedInstances(state,areaId,baseId).filter(([,entry])=>isBuildingEnabled(baseId,entry)&&(!BUILDINGS[baseId]?.effect?.fuelDaily||fuelOperational.has(entry)));
  if(station==="needle"){
    const needleCounts=["wood_needle","iron_needle"]
      .map(itemId=>({itemId,count:countItem(state,itemId,areaId)}))
      .filter(({count})=>count>0);
    if(!activeBuilt("workbench").length){
      const workbenches=built("workbench"),owned=Boolean(workbenches.length&&needleCounts.length);
      return {available:false,owned,remaining:0,capacity:0,name:"制作台",groupKey:"needle",usageKey:"needle",unavailableState:workbenches.some(([,entry])=>entry.damaged)?"已损坏":"未开启"};
    }
    if(!needleCounts.length)return {available:false,remaining:0,capacity:0,name:"木针或铁针",groupKey:"needle",usageKey:"needle"};
    const capacity=needleCounts.reduce((sum,{itemId,count})=>sum+count*Number(ITEMS[itemId].dailyProductionCapacity??0),0)*stationCapacityMultiplier(state,"needle",areaId);
    const used=state.productionUsage?.[`${state.day}:${areaId}:needle`]??0;
    const name=needleCounts.length===1?ITEMS[needleCounts[0].itemId].name:"针具";
    return {available:true,remaining:Math.max(0,capacity-used),capacity,name,groupKey:"needle",usageKey:"needle"};
  }
  const replacementId=Object.entries(BUILDINGS).find(([,definition])=>definition.replaces===station&&Number(definition.effect?.capacity??0)>0)?.[0];
  const replacementBuilt=replacementId?built(replacementId):[],replacementUsable=replacementId?usableBuilt(replacementId):[];
  const effectiveStation=replacementId&&(replacementUsable.length||(!usableBuilt(station).length&&replacementBuilt.length))?replacementId:station;
  const productionFuelCost=getProductionFuelCost(effectiveStation);
  const builtCount = (productionFuelCost>0?usableBuilt(effectiveStation):activeBuilt(effectiveStation)).length;
  const placed = (state.devicesByArea?.[areaId] ?? []).filter((device) => device.itemId === station);
  const unplacedCount=DEVICES[station]?countItem(state,station,areaId):0;
  let capacity = builtCount*Number(BUILDINGS[effectiveStation]?.effect?.capacity ?? 0);
  if (placed.length) capacity += placed.reduce((sum) => sum + Number(DEVICES[station]?.capacity ?? 0), 0);
  for (const [buildingId, definition] of Object.entries(BUILDINGS)) {
    const bonus = Number(definition.effect?.stationBonus?.[station] ?? 0);
    if (bonus) capacity += activeBuilt(buildingId).length * bonus;
  }
  let usageKey=effectiveStation,groupKey=effectiveStation;
  if (["stone_pot", "frying_pan"].includes(station)) {
    const usableStoves=usableBuilt("wood_stove"),usableBonfires=usableBuilt("bonfire"),builtStoves=built("wood_stove"),builtBonfires=built("bonfire");
    const providerId=usableStoves.length?"wood_stove":usableBonfires.length?"bonfire":builtStoves.length?"wood_stove":builtBonfires.length?"bonfire":null;
    const heat = Boolean(usableStoves.length||usableBonfires.length);
    const utensil = placed.length > 0;
    const utensilName=DEVICES[station]?.name??station;
    if (!utensil) return { available: false, owned:unplacedCount>0, remaining: 0, name:utensilName,groupKey:station,usageKey:station,productionFuelCost,unavailableState:"未摆放", unavailableMessage:`需要当地摆放${utensilName}` };
    if (!heat) return { available: false, owned:true, remaining: 0, name:utensilName,groupKey:station,usageKey:providerId??station,productionFuelCost,unavailableState:providerId?"火源已损坏":"缺少火源", unavailableMessage:`${utensilName}必须配合当地未损坏的篝火或柴火灶才可以使用` };
    capacity = Number(DEVICES[station]?.capacity??0);
    usageKey=station;
    groupKey=station;
  }
  capacity*=stationCapacityMultiplier(state,station,areaId);
  const available = Boolean(builtCount || placed.length);
  const used = state.productionUsage?.[`${state.day}:${areaId}:${usageKey}`] ?? 0;
  const builtEntries=built(effectiveStation),owned=Boolean(builtEntries.length||placed.length||unplacedCount);
  const unavailableState=!available
    ? (unplacedCount&&!placed.length?"未摆放":builtEntries.some(([,entry])=>entry.damaged)?"已损坏":"未开启")
    : undefined;
  return { available,owned,unavailableState, remaining: Math.max(0, capacity - used), capacity, name: BUILDINGS[effectiveStation]?.name ?? DEVICES[station]?.name ?? station,groupKey,usageKey,productionFuelCost };
}

function kitchenRecipeIngredientReduction(state,recipe) {
  if(!isKitchenStation(recipe.station??"workbench"))return 0;
  if(!completedInstances(state,state.position,"kitchen").length)return 0;
  return Number(BUILDINGS.kitchen?.effect?.recipeIngredientReduction??0);
}

export function getEffectiveRecipeInputs(state,recipe,inputs=recipe.inputs) {
  const reduction=kitchenRecipeIngredientReduction(state,recipe);
  if(!reduction)return inputs;
  return Object.fromEntries(Object.entries(inputs).map(([itemId,quantity])=>[itemId,quantity>1?Math.max(1,quantity-reduction):quantity]));
}

function recipeInputOptions(state,recipe) {
  const options=[recipe.inputs, ...(recipe.alternatives ?? [])];
  if(recipe.inputs?.tendon){const copy={...recipe.inputs};copy.complete_tendon=1;delete copy.tendon;options.push(copy);}
  return options.map(inputs=>getEffectiveRecipeInputs(state,recipe,inputs));
}

export function recipeActionLabel(recipe) {
  if (recipe?.category === "process") return "加工";
  if (recipe?.category === "food") return "烹饪";
  return "制作";
}

export function getRecipeAvailability(state, recipeId) {
  const recipe = RECIPES[recipeId];
  if (!recipe) return { ok: false, message: "未知配方" };
  if (!state.ownedBlueprintIds.includes(recipe.blueprintId)) return { ok: false, message: "尚未获得蓝图" };
  const station = getStationStatus(state, recipe.station??"workbench");
  if (!station.available) return { ok: false, message: station.unavailableMessage??`需要当地${station.name}` };
  if (station.remaining <= 0) return { ok: false, message: `${station.name}今日次数已用完` };
  if (station.productionFuelCost>0&&!hasFuelStorage(state,state.position)) return {ok:false,message:"需要当地总燃料槽；建成或摆放需要燃料的设施、家具后会自动出现"};
  if (station.productionFuelCost > (state.fuelPointsByArea?.[state.position] ?? 0)) return { ok: false, message: `当地燃料点不足，使用${station.name}一次需要${station.productionFuelCost}点` };
  const output=recipe.output??recipe.outputs?.[0];
  const canUseReserved=ITEMS[output?.itemId]?.type==="food";
  const inputOptions=recipeInputOptions(state,recipe);
  const optionIndex = inputOptions.findIndex((inputs) => Object.entries(inputs).every(([itemId,quantity])=>countItem(state,itemId)+(canUseReserved&&state.selectedFood?.itemId===itemId?1:0)>=quantity));
  if (optionIndex < 0) return { ok: false, message: "材料不足" };
  return { ok: true, recipe, station, inputs: inputOptions[optionIndex], optionIndex };
}

export function craftRecipe(state, recipeId) {
  const recipe = RECIPES[recipeId];
  const availability = getRecipeAvailability(state, recipeId);
  if (!availability.ok) return availability;
  const primaryOutput = recipe.output ?? recipe.outputs?.[0];
  const outputType = ITEMS[primaryOutput.itemId]?.type;
  const canTransformReservedFood = outputType === "food";
  const hasRecipeInputs = Object.entries(availability.inputs).every(([itemId, quantity]) => {
    const reserved = canTransformReservedFood && state.selectedFood?.itemId === itemId ? 1 : 0;
    return countItem(state, itemId) + reserved >= quantity;
  });
  if (!hasRecipeInputs) return { ok: false, message: "材料不足" };
  let transformedReservedFood = false;
  for (const [itemId, quantity] of Object.entries(availability.inputs)) {
    const available = countItem(state, itemId);
    const ordinaryUse = Math.min(available, quantity);
    if (ordinaryUse) consumeItem(state, itemId, ordinaryUse);
    if (ordinaryUse < quantity && canTransformReservedFood && state.selectedFood?.itemId === itemId) {
      state.selectedFood = null;
      transformedReservedFood = true;
    }
  }
  if ((recipe.station??"workbench") !== "hand") {
    const key = `${state.day}:${state.position}:${availability.station.usageKey??recipe.station??"workbench"}`;
    state.productionUsage[key] = (state.productionUsage[key] ?? 0) + 1;
  }
  state.fuelPointsByArea[state.position]=roundFuelPoints(Number(state.fuelPointsByArea[state.position]??0)-Number(availability.station.productionFuelCost??0));
  let outputs = recipe.outputs ?? [recipe.output];
  const efficientAlternative=recipe.rareAlternativeIndex!==undefined?availability.optionIndex===recipe.rareAlternativeIndex:availability.optionIndex>0;
  const selectedAlternativeQuantity=recipe.alternativeOutputQuantities?.[availability.optionIndex]
    ?? (efficientAlternative ? recipe.alternativeQuantity : undefined);
  if (selectedAlternativeQuantity && outputs.length === 1) outputs = [{ ...outputs[0], quantity: selectedAlternativeQuantity }];
  if (recipe.bonusOutput) outputs = [...outputs, recipe.bonusOutput];
  for (const output of outputs) addItem(state, output.itemId, output.quantity);
  if (transformedReservedFood) selectConsumable(state, primaryOutput.itemId);
  const quantity = outputs.reduce((sum, output) => sum + output.quantity, 0);
  const cooking=recipeActionLabel(recipe)==="烹饪";
  progressTasks(state, cooking ? "cook" : recipe.category === "process" ? "process" : "craft", cooking ? 1 : quantity);
  addLog(state, `制作了${outputs.map((output) => `${ITEMS[output.itemId].name}×${output.quantity}`).join("、")}。`);
  return { ok: true, message: receivedItemsMessage(outputs) };
}

export function loadFuel(state, itemId, quantity = 1) {
  if (!FUEL_POINT_VALUES[itemId]) return { ok: false, message: "这不是燃料" };
  if(!hasFuelStorage(state,state.position))return {ok:false,message:"建成或摆放需要燃料的设施、家具后才会自动出现当地总燃料槽"};
  if (!consumeItem(state, itemId, quantity)) return { ok: false, message: "燃料不足" };
  state.fuelPointsByArea[state.position] = roundFuelPoints(state.fuelPointsByArea[state.position] + FUEL_POINT_VALUES[itemId] * quantity);
  addLog(state, `${ITEMS[itemId].name}加入当地燃料槽，现有${state.fuelPointsByArea[state.position]}点。`);
  return { ok: true };
}

export function loadFarmSupply(state,itemId,quantity=1){
  if(itemId==="water")return {ok:false,message:"滴灌架会直接使用当地普通储物格中的水，无需装填"};
  const facilityId=itemId==="fertilizer"?"auto_fertilizer":null;
  if(!facilityId)return {ok:false,message:"这种物资不能放入自动农务设施"};
  if(completedInstances(state,state.position,facilityId).length===0)return {ok:false,message:`当地没有${BUILDINGS[facilityId].name}`};
  const available=countItem(state,itemId),requested=quantity==="all"?available:Math.max(1,Math.floor(Number(quantity)||1));
  if(requested<1||available<requested)return {ok:false,message:`${ITEMS[itemId].name}不足`};
  if(!consumeItem(state,itemId,requested))return {ok:false,message:`${ITEMS[itemId].name}不足`};
  const supply=state.farmSuppliesByArea[state.position]??={fertilizer:0};
  supply[itemId]+=requested;
  addLog(state,`${ITEMS[itemId].name}×${requested}加入${BUILDINGS[facilityId].name}，设施内现有${supply[itemId]}份。`);
  return {ok:true,message:`已加入${ITEMS[itemId].name}×${requested}`};
}

export function placeObject(state, itemId) {
  const item = ITEMS[itemId];
  const areaId = state.position;
  if (!state.housesByArea[areaId]) return { ok: false, message: "当地没有房屋" };
  if (!["device", "furniture"].includes(item?.type)) return { ok: false, message: "这件物品不能摆放" };
  if(item.type==="device"&&(state.housesByArea[areaId]?.level??0)<(DEVICES[itemId]?.houseTier??0))return {ok:false,message:"当地房屋等级不足"};
  if (!consumeItem(state, itemId, 1)) return { ok: false, message: "物品不在当地或背包" };
  if (item.type === "device") {
    const count = state.devicesByArea[areaId].filter((entry) => entry.itemId === itemId).length;
    const maxPerArea=DEVICES[itemId]?.maxPerArea??2;
    if (count >= maxPerArea) { addItem(state,itemId,1); return { ok:false,message:`同类设备每个地块最多${maxPerArea}台`}; }
    const occupied = state.furnitureByArea[areaId].reduce((sum, entry) => sum + (FURNITURE[entry.itemId]?.space ?? 0), 0)
      + state.devicesByArea[areaId].reduce((sum, entry) => sum + (DEVICES[entry.itemId]?.space ?? 0), 0);
    const capacity = getHouse(state, areaId).space;
    if (occupied + (DEVICES[itemId]?.space ?? 0) > capacity) { addItem(state,itemId,1); return {ok:false,message:"房间已经摆满了，先收起一些家具吧。"}; }
    const order=++state.placementIndex;
    state.devicesByArea[areaId].push({ id:`placed_${order}`,itemId, used: 0, priority:3, placedOrder:order });
  } else {
    const exclusiveGroup=FURNITURE[itemId]?.exclusiveGroup;
    if(exclusiveGroup&&state.furnitureByArea[areaId].some(entry=>FURNITURE[entry.itemId]?.exclusiveGroup===exclusiveGroup)){
      addItem(state,itemId,1);
      return {ok:false,message:exclusiveGroup==="bed"?"柴草床、木床和羽毛床只能摆放一张":"浴缸和按摩浴缸只能摆放一个"};
    }
    if(!FURNITURE[itemId]?.repeatable&&state.furnitureByArea[areaId].some(entry=>entry.itemId===itemId)){addItem(state,itemId,1);return {ok:false,message:"同名家具在一个地块只摆放一件"};}
    const occupied = state.furnitureByArea[areaId].reduce((sum, entry) => sum + (FURNITURE[entry.itemId]?.space ?? 0), 0)
      + state.devicesByArea[areaId].reduce((sum, entry) => sum + (DEVICES[entry.itemId]?.space ?? 0), 0);
    const capacity = getHouse(state, areaId).space;
    if (occupied + (FURNITURE[itemId]?.space ?? 0) > capacity) { addItem(state,itemId,1); return {ok:false,message:"房间已经摆满了，先收起一些家具吧。"}; }
    const order=++state.placementIndex;
    const effect=FURNITURE[itemId]?.effect??{};
    const usesImmediateResource=Number(effect.fuelDaily??0)>0||Number(effect.power??0)>0||dailyItemResourceRequirements(effect).length>0;
    const placed={ id:`placed_${order}`,itemId, priority: 3, placedOrder:order, fuelPaidDay:0 };
    if(FURNITURE[itemId]?.switchable)placed.enabled=!usesImmediateResource;
    state.furnitureByArea[areaId].push(placed);
  }
  addLog(state, `${ITEMS[itemId].name}已摆放在${areaId}。`);
  return { ok:true };
}
function findPlacedEntry(state,id,areaId=state.position){return [...(state.devicesByArea[areaId]??[]),...(state.furnitureByArea[areaId]??[])].find(entry=>entry.id===id||entry.itemId===id);}

function countEnableResource(state,itemId,areaId){
  if(itemId==="water"||areaId===state.position)return countDailyItemResource(state,itemId,areaId);
  return allAccessibleStacks(state,areaId).slice(0,-2).flat().filter(stack=>stack.itemId===itemId).reduce((total,stack)=>total+stack.quantity,0);
}

function resourceEnableError(state,entry,effect,name,areaId){
  const requirements=dailyItemResourceRequirements(effect).filter(({itemId})=>!dailyItemResourcePaid(entry,itemId,state.day));
  for(const {itemId,quantity} of requirements){
    const available=countEnableResource(state,itemId,areaId),resourceName=ITEMS[itemId].name;
    if(available+1e-9>=quantity)continue;
    if(itemId==="water")return available<=0?"当地普通储物格中没有水":`当地普通储物格中的水不足，开启${name}需要${quantity}份水`;
    return available<=0?`当前没有${resourceName}`:`当前${resourceName}不足，开启${name}需要${quantity}份${resourceName}`;
  }
  const fuelCost=getFuelDailyCost(state,effect,areaId),needsFuel=fuelCost>0&&entry.fuelPaidDay!==state.day;
  if(needsFuel){
    if(!hasFuelStorage(state,areaId))return "当地还没有需要燃料的设施或家具";
    const available=Number(state.fuelPointsByArea[areaId]??0);
    if(available+1e-9<fuelCost)return `总燃料槽不足，开启${name}需要${fuelCost}点燃料`;
  }
  return null;
}

function enableResourceEntry(state,entry,effect,name,areaId=state.position){
  const error=resourceEnableError(state,entry,effect,name,areaId);
  if(error)return {ok:false,message:error};
  entry.enabled=false;
  entry.poweredToday=false;
  const requirements=dailyItemResourceRequirements(effect).filter(({itemId})=>!dailyItemResourcePaid(entry,itemId,state.day));
  const fuelCost=getFuelDailyCost(state,effect,areaId),needsFuel=fuelCost>0&&entry.fuelPaidDay!==state.day;
  const defersForWater=requirements.some(({itemId})=>itemId==="water");
  if(!defersForWater)for(const {itemId,quantity} of requirements){
    if(areaId===state.position||itemId==="water")consumeDailyItemResource(state,itemId,quantity,areaId);
    else consumeItem(state,itemId,quantity,areaId,{includeBackpack:false});
    (entry.resourcePaidDays??={})[itemId]=state.day;
  }
  if(needsFuel&&!defersForWater){
    state.fuelPointsByArea[areaId]=roundFuelPoints(Number(state.fuelPointsByArea[areaId]??0)-fuelCost);
    entry.fuelPaidDay=state.day;
  }
  entry.enabled=true;
  if(Number(effect?.power??0)>0)entry.poweredToday=true;
  return {ok:true,message:defersForWater?`${name}已开启，将在结束今天时按自动用水顺序扣除运行资源`:`${name}已开启，今天不会再次扣运行资源`};
}

function placedObjectToggleError(state,entry,areaId){
  const definition=FURNITURE[entry.itemId],effect=definition?.effect??{};
  if(!definition?.switchable)return "这件家具摆放后始终生效，不需要开关";
  if(entry.damaged)return "家具损坏，修复后才能开启";
  if(entry.enabled!==false)return null;
  return powerEnableError(state,effect,Number(definition.powerPriority??0),areaId,"furniture",entry.itemId)
    ||resourceEnableError(state,entry,effect,definition.name,areaId);
}

export function togglePlacedObject(state,id,areaId=state.position){
  const entry=findPlacedEntry(state,id,areaId);if(!entry)return {ok:false,message:"当地没有该物品"};
  if(DEVICES[entry.itemId]){delete entry.enabled;return {ok:false,message:"便携生产工具摆放后始终可用，不需要开关"};}
  const definition=FURNITURE[entry.itemId],effect=definition?.effect??{};
  if(!definition?.switchable){delete entry.enabled;return {ok:false,message:"这件家具摆放后始终生效，不需要开关"};}
  const error=placedObjectToggleError(state,entry,areaId);
  if(error)return {ok:false,message:error};
  if(entry.enabled!==false){entry.enabled=false;entry.poweredToday=false;return {ok:true,message:`${ITEMS[entry.itemId].name}已关闭`};}
  if(Number(effect.fuelDaily??0)>0||dailyItemResourceRequirements(effect).length>0)return enableResourceEntry(state,entry,effect,ITEMS[entry.itemId].name,areaId);
  entry.enabled=true;if(Number(effect.power??0)>0)entry.poweredToday=true;return {ok:true,message:`${ITEMS[entry.itemId].name}已开启`};
}

function facilityToggleError(state,id,areaId){
  const baseId=id.replace(/__\d+$/,''),definition=BUILDINGS[baseId],progress=state.buildingsByArea[areaId]?.[id];
  if(!definition?.switchable)return "这座设施不需要开关";
  if(!progress?.completed)return "设施尚未建成";
  if(progress.damaged)return "设施损坏，修复后才能开启";
  if(progress.enabled!==false)return null;
  if(baseId==="mining_machine"&&!getMiningMachineProduction(state,areaId))return "当地没有可供采矿机开采的矿种";
  if(!hasRequiredFurniture(state,areaId,definition))return `当地需先摆放${ITEMS[definition.requiredFurniture].name}`;
  if(!hasRequiredOperationStorage(state,areaId,definition))return "必须有本地储存空间才可以运行";
  return powerEnableError(state,definition.effect,Number(definition.powerPriority??0),areaId,"building",baseId)
    ||resourceEnableError(state,progress,definition.effect,definition.name,areaId);
}

export function toggleFacility(state,id,areaId=state.position){
  const error=facilityToggleError(state,id,areaId);
  if(error)return {ok:false,message:error};
  const definition=BUILDINGS[id.replace(/__\d+$/,'')],progress=state.buildingsByArea[areaId][id];
  if(progress.enabled!==false){progress.enabled=false;progress.poweredToday=false;return {ok:true,message:`${definition.name}已关闭`};}
  if(Number(definition.effect?.fuelDaily??0)>0||dailyItemResourceRequirements(definition.effect).length>0)return enableResourceEntry(state,progress,definition.effect,definition.name,areaId);
  progress.enabled=true;
  if(Number(definition.effect?.power??0)>0)progress.poweredToday=true;
  return {ok:true,message:`${definition.name}已开启`};
}

export function pickupPlacedObject(state,id){
  const areaId=state.position;
  for(const list of [state.devicesByArea[areaId],state.furnitureByArea[areaId]]){
    const index=list.findIndex(entry=>entry.id===id||entry.itemId===id);
    if(index<0)continue;
    const [entry]=list.splice(index,1);
    addItem(state,entry.itemId,1,{preferred:"ground",areaId});
    const overflow=[];
    if(["storage_chest","fridge"].includes(entry.itemId)){
      const storage=entry.itemId==="storage_chest"?(state.storageByArea[areaId]??=[]):(state.coldStorageByArea[areaId]??=[]);
      const remainingCapacity=Math.max(0,Math.floor(entry.itemId==="storage_chest"?getStorageCapacity(state,areaId):getColdStorageCapacity(state,areaId)));
      overflow.push(...storage.splice(remainingCapacity));
      for(const stack of overflow)addStackToStacks(state.groundByArea[areaId],stack);
    }
    addLog(state,`${ITEMS[entry.itemId].name}已收起并放到${areaId}地面。`);
    if(!overflow.length)return {ok:true,message:`${ITEMS[entry.itemId].name}已收起并放到地面`};
    const totals=new Map();
    for(const stack of overflow)totals.set(stack.itemId,(totals.get(stack.itemId)??0)+stack.quantity);
    const dropped=[...totals].map(([itemId,quantity])=>`${ITEMS[itemId].name}×${quantity}`).join("、");
    addLog(state,`${entry.itemId==="storage_chest"?"储物":"保鲜"}容量减少，${dropped}已放到${areaId}地面。`);
    return {ok:true,message:entry.itemId==="storage_chest"?`储物箱已收起，箱内的${dropped}已放到地面`:`冰箱已收起，超出保鲜容量的${dropped}已放到地面`};
  }
  return {ok:false,message:"当地没有该物品"};
}

export function equipItem(state, itemId) {
  const gear = EQUIPMENT[itemId] ?? ITEMS[itemId];
  if (!gear?.slot || gear.slot === "set") return {ok:false,message:"这件物品不能直接装备"};
  if (countItem(state,itemId) < 1) return {ok:false,message:"物品不在当地或背包"};
  if(gear.slot==="backpack"){
    const capacity=gear.backpackCapacity??ITEMS[itemId]?.backpackCapacity??BACKPACK_CAPACITY;
    if(state.backpack.ordinary.length>capacity.ordinary||state.backpack.cold.length>capacity.cold)return {ok:false,message:`背包内物资超过${gear.name}的容量，请先把一部分物资放到地面或储物处`};
  }
  consumeItem(state,itemId,1);
  const old = state.player.equipment[gear.slot];
  state.player.equipment[gear.slot]=itemId;
  if (old && !["ordinary_clothes","system_small_backpack"].includes(old)) {
    if (gear.slot === "weapon") {
      const newLevel = Number(gear.weaponLevel ?? gear.tier ?? 0);
      const oldGear = EQUIPMENT[old] ?? ITEMS[old];
      const oldLevel = Number(oldGear?.weaponLevel ?? oldGear?.tier ?? 0);
      let routedToUtility = false;
      if (newLevel > oldLevel) {
        const utilityCap = getUtilityStorageCapacity(state, state.position);
        const utilityStacks = state.utilityStorageByArea[state.position] ??= [];
        if (utilityCap > 0 && utilityStacks.length < utilityCap) {
          utilityStacks.push({ itemId: old, quantity: 1 });
          routedToUtility = true;
          addLog(state, `将换下的${oldGear?.name ?? old}存入了杂货库。`);
        }
      }
      if (!routedToUtility) addItem(state, old, 1);
    } else {
      addItem(state, old, 1);
    }
  }
  return {ok:true};
}

export function unequipItem(state,slot){
  if(!["head","body","legs","feet","hands","weapon","backpack"].includes(slot))return {ok:false,message:"未知装备位置"};
  const old=state.player.equipment?.[slot];
  if(!old)return {ok:true};
  if(slot==="backpack"){
    if(state.backpack.ordinary.length>BACKPACK_CAPACITY.ordinary||state.backpack.cold.length>BACKPACK_CAPACITY.cold)return {ok:false,message:"系统小背包装不下当前物资，请先把一部分物资放到地面或储物处"};
    state.player.equipment.backpack="system_small_backpack";
    if(old!=="system_small_backpack")addItem(state,old,1);
    return {ok:true};
  }
  if(old!=="ordinary_clothes")addItem(state,old,1);
  state.player.equipment[slot]=null;
  return {ok:true};
}
export function useMedical(state,itemId){
  const item=ITEMS[itemId],injuryHealing=Number(item?.injuryHealing??0);
  if(injuryHealing>0){
    if(state.player.injury<=0)return {ok:false,message:"当前没有伤势"};
    if(state.dailyWoundTreatmentUsed)return {ok:false,message:"今天已经使用过伤药了"};
    if(!consumeItem(state,itemId,1))return {ok:false,message:`缺少${item.name}`};
    const clinicBonus=completedInstances(state,state.position,"clinic").length>0?1:0;
    const totalHealing=injuryHealing+clinicBonus;
    state.player.injury=Math.max(0,state.player.injury-totalHealing);
    if(state.player.injury<=0)state.injuryRestDays=0;
    state.dailyWoundTreatmentUsed=true;
    return {ok:true,message:`已使用${item.name}，伤势减轻${totalHealing}级${clinicBonus?"（医务室加成1级）":""}`};
  }
  if(itemId==="medicine"){
    if(!state.player.sick)return {ok:false,message:"当前没有疾病"};
    if(!consumeItem(state,itemId,1))return {ok:false,message:"缺少药剂"};
    state.player.sick=false;
    return {ok:true};
  }
  return {ok:false,message:"无法使用"};
}

function completedInstances(state, areaId, baseId) {
  return Object.entries(state.buildingsByArea[areaId] ?? {}).filter(([key,value]) => (key===baseId||key.startsWith(`${baseId}__`)) && value.completed && (!value.damaged||BUILDINGS[baseId]?.damageImmune));
}

function hasCompletedBuildingAnywhere(state,baseId){
  const allowedAreas=BUILDINGS[baseId]?.allowedAreas??Object.keys(AREAS);
  return allowedAreas.some(areaId=>Object.entries(state.buildingsByArea?.[areaId]??{}).some(([id,progress])=>id.replace(/__\d+$/u,"")===baseId&&progress.completed));
}

function getTotalGridPowerGeneration(state){
  return Object.keys(AREAS).reduce((total,areaId)=>{
    if(!completedInstances(state,areaId,"distribution_room").length)return total;
    return total+completedInstances(state,areaId,"hydro_generator").length*Number(BUILDINGS.hydro_generator?.effect?.powerGeneration??0);
  },0);
}

function powerConsumerRunsToday(state,areaId,kind,id,effect){
  if(kind==="furniture")return areaId===state.position||id==="fridge";
  return areaId===state.position||effect?.localClimateOnly!==true;
}

const MINING_MACHINE_NODE_IDS=new Set(["iron_ore_pile","copper_ore_pile","coal_mine"]);
export function getMiningMachineProduction(state,areaId=state.position){
  const nodeIds=[...new Set((AREAS[areaId]?.nodes??[]).map(site=>site.nodeId).filter(nodeId=>MINING_MACHINE_NODE_IDS.has(nodeId)))];
  if(!nodeIds.length)return null;
  const nodeId=pickFromKey(nodeIds,getGameplaySeed(state),`mining-machine:${state.day}:${areaId}`),node=NODES[nodeId];
  return {nodeId,itemId:node.output,quantity:Number(node.maxCharges??0)};
}

export function getMiningMachineStatus(state,areaId=state.position){
  const production=getMiningMachineProduction(state,areaId),capacity=Math.max(0,Math.floor(getStorageCapacity(state,areaId)));
  const storage=state.storageByArea[areaId]??[],hasStorage=capacity>0;
  const hasRoom=Boolean(production)&&(storage.some(entry=>entry.itemId===production.itemId)||storage.length<capacity);
  return {production,capacity,hasStorage,hasRoom,canStore:Boolean(production)&&hasStorage&&hasRoom};
}

function hasRequiredFurniture(state,areaId,definition){
  return !definition.requiredFurniture||(state.furnitureByArea[areaId]??[]).some(entry=>entry.itemId===definition.requiredFurniture);
}

function hasRequiredOperationStorage(state,areaId,definition){
  return !definition.requiresLocalStorage||getStorageCapacity(state,areaId)>0;
}

function collectGridPowerConsumers(state){
  const consumers=[];
  for(const areaId of Object.keys(AREAS)){
    for(const placed of state.furnitureByArea?.[areaId]??[]){
      const definition=FURNITURE[placed.itemId],effect=definition?.effect??{},use=Number(effect.power??0);
      if(use>0&&isFurnitureEnabled(placed)&&powerConsumerRunsToday(state,areaId,"furniture",placed.itemId,effect))consumers.push({areaId,kind:"furniture",id:placed.id,entry:placed,name:definition.name,effect,use,priority:Number(definition.powerPriority??0),order:placed.placedOrder??Number.MAX_SAFE_INTEGER});
    }
    for(const [id,progress] of Object.entries(state.buildingsByArea?.[areaId]??{})){
      const definition=BUILDINGS[id.replace(/__\d+$/u,"")],effect=definition?.effect??{},use=Number(effect.power??0);
      if(definition?.id==="mining_machine"&&!getMiningMachineProduction(state,areaId))continue;
      if(use>0&&progress.completed&&!progress.damaged&&progress.enabled!==false&&hasRequiredFurniture(state,areaId,definition)&&hasRequiredOperationStorage(state,areaId,definition)&&powerConsumerRunsToday(state,areaId,"building",id,effect))consumers.push({areaId,kind:"building",id,entry:progress,name:definition.name,effect,use,priority:Number(definition.powerPriority??0),order:progress.completedOrder??Number.MAX_SAFE_INTEGER});
    }
  }
  return consumers;
}

export function getGridPowerStatus(state){
  const generation=getTotalGridPowerGeneration(state);
  const consumers=collectGridPowerConsumers(state);
  const usageByArea=Object.fromEntries(Object.keys(AREAS).map(areaId=>[areaId,0]));
  for(const consumer of consumers)usageByArea[consumer.areaId]+=consumer.use;
  const applianceDemand=consumers.reduce((total,consumer)=>total+consumer.use,0),spent=Math.max(0,Number(state.gridPowerSpentToday??0));
  const demand=applianceDemand+spent;
  return {generation,demand,applianceDemand,spent,available:Math.max(0,generation-demand),shortage:Math.max(0,demand-generation),usageByArea,consumers};
}

function powerEnableError(state,effect,priority=0,areaId=state.position,kind="building",baseId=""){
  const use=Number(effect?.power??0);
  if(use<=0)return null;
  if(!powerConsumerRunsToday(state,areaId,kind,baseId,effect))return null;
  const status=getGridPowerStatus(state);
  const priorDemand=status.spent+status.consumers.filter(consumer=>consumer.priority<=priority).reduce((total,consumer)=>total+consumer.use,0);
  if(status.generation-priorDemand<use)return `全岛可支配电力不足，开启还需要${use}点电`;
  return null;
}

function gridPowerControlError(state){
  return completedInstances(state,state.position,"distribution_room").length?null:"必须在已建成配电室的地块操作";
}

export function getGridPowerConnections(state){
  const status=getGridPowerStatus(state),controlError=gridPowerControlError(state),connections=[];
  const addConnection=(areaId,kind,id,baseId,entry,definition)=>{
    const effect=definition?.effect??{},use=Number(effect.power??0);
    if(use<=0)return;
    const enabled=entry.enabled!==false,damaged=Boolean(entry.damaged);
    const operating=status.consumers.some(consumer=>consumer.areaId===areaId&&consumer.kind===kind&&consumer.id===id);
    const standby=enabled&&!damaged&&!powerConsumerRunsToday(state,areaId,kind,baseId,effect);
    const powered=operating&&status.generation>0&&entry.poweredToday!==false;
    const disabledReason=controlError||(kind==="building"?facilityToggleError(state,id,areaId):placedObjectToggleError(state,entry,areaId))||"";
    connections.push({areaId,areaName:AREAS[areaId].name,kind,id,baseId,name:definition.name,use,enabled,damaged,operating,powered,standby,canToggle:!disabledReason,disabledReason});
  };
  for(const areaId of Object.keys(AREAS)){
    for(const [id,entry] of Object.entries(state.buildingsByArea?.[areaId]??{})){
      if(!entry.completed)continue;
      const baseId=id.replace(/__\d+$/u,"");
      addConnection(areaId,"building",id,baseId,entry,BUILDINGS[baseId]);
    }
    for(const entry of state.furnitureByArea?.[areaId]??[])addConnection(areaId,"furniture",entry.id,entry.itemId,entry,FURNITURE[entry.itemId]);
  }
  return connections;
}

export function toggleGridPowerConnection(state,areaId,kind,id){
  const controlError=gridPowerControlError(state);
  if(controlError)return {ok:false,message:controlError};
  if(!AREAS[areaId])return {ok:false,message:"没有该电网设备"};
  if(kind==="building"){
    const definition=BUILDINGS[String(id).replace(/__\d+$/u,"")],entry=state.buildingsByArea?.[areaId]?.[id];
    if(!entry?.completed||Number(definition?.effect?.power??0)<=0)return {ok:false,message:"没有该电网设备"};
    return toggleFacility(state,id,areaId);
  }
  if(kind==="furniture"){
    const entry=(state.furnitureByArea?.[areaId]??[]).find(placed=>placed.id===id);
    if(!entry||Number(FURNITURE[entry.itemId]?.effect?.power??0)<=0)return {ok:false,message:"没有该电网设备"};
    return togglePlacedObject(state,id,areaId);
  }
  return {ok:false,message:"没有该电网设备"};
}

function buildingPrerequisiteError(state,areaId,definition){
  const completed=(id)=>Object.entries(state.buildingsByArea[areaId]??{}).some(([key,entry])=>(key===id||key.startsWith(`${id}__`))&&entry.completed);
  if(definition.allowedAreas?.length&&!definition.allowedAreas.includes(areaId))return `只能在${definition.allowedAreas.join("或")}建造`;
  if(!hasRequiredFurniture(state,areaId,definition))return `当地需先摆放${ITEMS[definition.requiredFurniture].name}`;
  if(Number(definition.requiresAnyHouseLevel??0)>0&&!Object.values(state.housesByArea??{}).some(house=>Number(house?.level??0)>=definition.requiresAnyHouseLevel))return "任意地块需先建成永久避难所";
  if(definition.globalPrerequisites?.some(id=>!hasCompletedBuildingAnywhere(state,id)))return "全岛前置设施不足";
  if(definition.prerequisites?.some(id=>!completed(id)))return "当地前置设施不足";
  if(definition.prerequisiteAny&&!definition.prerequisiteAny.some(completed))return "当地任选前置设施不足";
  if(definition.prerequisiteAnyCount){
    const count=definition.prerequisiteAnyCount.ids.filter(completed).length;
    if(count<definition.prerequisiteAnyCount.count)return "当地进阶前置设施数量不足";
  }
  return null;
}

function completedPlantingBeds(state,areaId,includeDamaged=false){
  return Object.entries(state.buildingsByArea[areaId]??{})
    .filter(([id,progress])=>{
      const baseId=id.replace(/__\d+$/u,"");
      return (baseId==="planting_bed"||baseId==="grass_field"||baseId==="corn_field")&&progress.completed&&(includeDamaged||!progress.damaged);
    })
    .sort(([,left],[,right])=>(left.completedOrder??0)-(right.completedOrder??0));
}

function ensurePlotBedAssignments(state,areaId){
  const plots=state.plotsByArea[areaId]??[],beds=completedPlantingBeds(state,areaId,true),validIds=new Set(beds.map(([id])=>id)),used=new Set();
  for(const plot of plots){
    if(plot.bedId&&validIds.has(plot.bedId)&&!used.has(plot.bedId))used.add(plot.bedId);
    else{
      const preferredBase = plot.cropId === "grass" ? "grass_field" : plot.cropId === "corn" ? "corn_field" : "planting_bed";
      const available=beds.find(([id])=>!used.has(id)&&id.replace(/__\d+$/u,"")===preferredBase) || beds.find(([id])=>!used.has(id));
      if(available){plot.bedId=available[0];used.add(available[0]);}
    }
    const bed=beds.find(([id])=>id===plot.bedId)?.[1];
    if(bed){
      // 温室属于栽培地，兼容仅把升级记在作物上的旧存档。
      if(plot.greenhouse||plot.weatherproof)bed.greenhouse=true;
      if(bed.greenhouse)plot.greenhouse=true;
    }
  }
  return used;
}

function getPlotBedProgress(state,plot,areaId=state.position){
  ensurePlotBedAssignments(state,areaId);
  return plot?.bedId?state.buildingsByArea[areaId]?.[plot.bedId]:null;
}

function isGreenhousePlot(state,plot,areaId=state.position){
  return Boolean(getPlotBedProgress(state,plot,areaId)?.greenhouse||plot?.greenhouse);
}

function migrateLegacyGreenhouses(state){
  for(const areaId of Object.keys(AREAS)){
    const buildings=state.buildingsByArea?.[areaId]??{},legacy=Object.entries(buildings).filter(([id])=>id==="greenhouse"||id.startsWith("greenhouse__"));
    ensurePlotBedAssignments(state,areaId);
    if(!legacy.length&&!state.plotsByArea?.[areaId]?.some(plot=>plot.weatherproof))continue;
    const beds=completedPlantingBeds(state,areaId,true);
    let protectedSlots=legacy.filter(([,progress])=>progress.completed).length*4;
    for(const plot of state.plotsByArea?.[areaId]??[]){
      if(plot.weatherproof){const bed=getPlotBedProgress(state,plot,areaId);if(bed)bed.greenhouse=true;plot.greenhouse=true;}
      delete plot.weatherproof;
    }
    for(const [,progress]of beds){if(protectedSlots<=0)break;if(!progress.greenhouse){progress.greenhouse=true;protectedSlots-=1;}}
    for(const [id]of legacy)delete buildings[id];
  }
}

export function getFarmCapacity(state, areaId=state.position) {
  return completedInstances(state,areaId,"planting_bed").length;
}

export function getFarmPlotSlots(state,areaId=state.position){
  ensurePlotBedAssignments(state,areaId);
  const plotsByBed=new Map((state.plotsByArea[areaId]??[]).filter(plot=>plot.bedId).map(plot=>[plot.bedId,plot]));
  return completedPlantingBeds(state,areaId,true).map(([bedId,progress],index)=>({bedId,progress,index,plot:plotsByBed.get(bedId)??null}));
}

function migratePlotAutoFertilizeSettings(state){
  for(const buildings of Object.values(state.buildingsByArea??{}))for(const [id,progress] of Object.entries(buildings)){
    const baseId=id.replace(/__\d+$/u,"");
    if(baseId==="planting_bed")progress.autoFertilize=progress.autoFertilize===true;
    if(baseId==="auto_fertilizer")delete progress.enabled;
  }
}

export function getPlotAutoFertilizeStatus(state,bedId,areaId=state.position){
  const buildings=state.buildingsByArea?.[areaId]??{},bed=buildings[bedId];
  const validBed=typeof bedId==="string"&&bedId.replace(/__\d+$/u,"")==="planting_bed"&&bed?.completed;
  const boxes=Object.entries(buildings).filter(([id,progress])=>id.replace(/__\d+$/u,"")==="auto_fertilizer"&&progress.completed);
  const available=Boolean(validBed&&boxes.length),enabled=Boolean(validBed&&bed.autoFertilize===true);
  return {available,enabled,operational:available&&enabled&&!bed.damaged&&boxes.some(([,progress])=>!progress.damaged)};
}

export function togglePlotAutoFertilize(state,bedId){
  const status=getPlotAutoFertilizeStatus(state,bedId);
  if(!status.available)return {ok:false,message:"需要当地已建成自动施肥箱和栽培地"};
  const enabled=!status.enabled;
  state.buildingsByArea[state.position][bedId].autoFertilize=enabled;
  return {ok:true,message:`这块栽培地的自动施肥已${enabled?"开启":"关闭"}`};
}

export function getPlotEnvironmentEffects(state,plot,areaId=state.position){
  const weather=getWeather(state),greenhouse=isGreenhousePlot(state,plot,areaId),needsWater=plot?.phase!=="ready";
  const acidRain=getAcidRainStageEffect(weather);
  return {
    greenhouse,
    heatAffected:needsWater&&!greenhouse&&hasWeatherHazard(weather,"heat"),
    rainAffected:!greenhouse&&Boolean(acidRain),
    rainFertilityLoss:Number(acidRain?.cropFertilityLoss??0),
    rainDamageChance:Number(acidRain?.cropDamageChance??0)
  };
}

export function getFarmAutomationCoverage(state,areaId=state.position){
  ensurePlotBedAssignments(state,areaId);
  const plotCount=state.plotsByArea[areaId]?.length??0;
  const active=(facilityId)=>completedInstances(state,areaId,facilityId).some(([,progress])=>!progress.damaged&&progress.enabled!==false);
  return {
    water:active("drip_irrigation")?plotCount:0,
    fertilizer:(state.plotsByArea[areaId]??[]).filter(plot=>getPlotAutoFertilizeStatus(state,plot.bedId,areaId).operational).length
  };
}

function getDripIrrigationWaterDemand(state,areaId=state.position){
  const coverage=getFarmAutomationCoverage(state,areaId).water;
  return (state.plotsByArea[areaId]??[]).slice(0,coverage).reduce((sum,plot)=>{
    if(plot.phase==="ready"||plot.watered)return sum;
    return sum+(getPlotEnvironmentEffects(state,plot,areaId).heatAffected?2:1);
  },0);
}

export function getAutomaticWaterStatus(state,areaId=state.position){
  const consumers=[];
  const dripDemand=getDripIrrigationWaterDemand(state,areaId);
  if(dripDemand>0)consumers.push({id:"drip_irrigation",name:BUILDINGS.drip_irrigation.name,quantity:dripDemand,priority:automaticWaterPriority("drip_irrigation")});
  if(areaId===state.position){
    for(const {entry,effect,name,baseId,order} of dailyConsumableConsumerEntries(state,areaId)){
      if(entry.enabled===false||dailyItemResourcePaid(entry,"water",state.day))continue;
      const quantity=Number(effect?.waterDaily??0);
      if(quantity>0)consumers.push({id:baseId,name,quantity,priority:automaticWaterPriority(baseId),order});
    }
  }
  consumers.sort((left,right)=>left.priority-right.priority||(left.order??0)-(right.order??0)||left.name.localeCompare(right.name,"zh-CN"));
  const stored=countLocalStorageItem(state,"water",areaId),expectedUse=consumers.reduce((sum,consumer)=>sum+consumer.quantity,0);
  return {stored,expectedUse,shortage:Math.max(0,expectedUse-stored),consumers};
}

export function getAutomaticWaterProductionStatus(state,areaId=state.position){
  const producersById=new Map();
  const addProducer=(id,name,quantity)=>{
    if(quantity<=0)return;
    const existing=producersById.get(id);
    if(existing)existing.quantity+=quantity;
    else producersById.set(id,{id,name,quantity});
  };
  const raining=hasWeatherHazard(getWeather(state),"rain");
  for(const [id,progress] of Object.entries(state.buildingsByArea?.[areaId]??{})){
    if(!progress.completed||progress.damaged)continue;
    const baseId=id.replace(/__\d+$/u,""),definition=BUILDINGS[baseId],effect=definition?.effect??{};
    addProducer(baseId,definition?.name??baseId,Number(effect.water??0));
    if(baseId==="rain_collector"&&raining)addProducer(baseId,definition.name,Number(effect.rainWater??0));
  }
  const producers=[...producersById.values()];
  return {expectedProduction:producers.reduce((sum,producer)=>sum+producer.quantity,0),producers};
}

export function getAutomaticFeedDemand(state,areaId=state.position){
  if(!completedInstances(state,areaId,"auto_feeder").length)return 0;
  // 预览可兼容旧档的栏舍分配，但不能改写动物的实际绑定。
  const previewState={...state,animalsByArea:{...state.animalsByArea,[areaId]:(state.animalsByArea?.[areaId]??[]).map(animal=>({...animal}))}};
  let demand=0;
  for(const type of AUTOMATIC_FEED_ORDER){
    const pens=getAnimalPenSlots(previewState,type,areaId).filter(canFeedAnimalPen);
    demand+=pens.length*Number(LIVESTOCK[type]?.feed?.feed??0);
  }
  return demand;
}

function getEndDayFuelDemand(state,areaId){
  return roundFuelPoints(fuelConsumerEntries(state,areaId).reduce((sum,consumer)=>{
    if(consumer.entry.enabled===false||consumer.entry.fuelPaidDay===state.day)return sum;
    if(areaId!==state.position)return sum;
    return sum+getFuelDailyCost(state,consumer.effect,areaId);
  },0));
}

function getProjectedLocalWaterAfterProduction(state){
  const preview=clone(state);
  resolvePowerAndFacilities(preview,[]);
  return Object.fromEntries(Object.keys(AREAS).map(areaId=>[areaId,countLocalStorageItem(preview,"water",areaId)]));
}

function cultivatedStock(state,areaId,crop,fertility=0){
  const effectiveFertility=Math.max(0,Math.min(5,Number(fertility)||0));
  return Math.floor(crop.stock*(1+effectiveFertility/2));
}

function legacyCropRegrowthDays(crop){
  if(["apple","wood"].includes(crop.id))return 5;
  return crop.growthDays<=3?2:crop.growthDays<=5?3:4;
}

export const CULTIVATED_TOOL_YIELDS=Object.freeze({stone_knife:5,iron_knife:8,steel_knife:12});

export function getCultivatedHarvestMethod(state){
  const candidates=[{label:"徒手",quantity:3,tool:null,toolStacks:null}];
  for(const entry of getToolInstances(state,"knife")){
    const quantity=CULTIVATED_TOOL_YIELDS[entry.stack.itemId]??0;
    if(quantity)candidates.push({label:ITEMS[entry.stack.itemId].name,quantity,tool:entry.stack,toolStacks:entry.stacks});
  }
  return candidates.sort((left,right)=>right.quantity-left.quantity||Number(Boolean(left.tool))-Number(Boolean(right.tool)))[0];
}

export function plantCrop(state,cropId,bedId=null) {
  const crop=CROPS[cropId]; if(!crop) return {ok:false,message:"未知作物"};
  const usedBeds=ensurePlotBedAssignments(state,state.position),beds=completedPlantingBeds(state,state.position);
  const preferredBase = cropId === "grass" ? "grass_field" : cropId === "corn" ? "corn_field" : "planting_bed";
  const emptyBed=bedId
    ? beds.find(([id])=>id===bedId&&!usedBeds.has(id))
    : (beds.find(([id])=>!usedBeds.has(id)&&id.replace(/__\d+$/u,"")===preferredBase) || beds.find(([id])=>!usedBeds.has(id)));
  if(!emptyBed) return {ok:false,message:"当地没有空种植位"};
  if(!consumeItem(state,crop.seedId,1)) return {ok:false,message:"缺少种子"};
  const stamina=1;
  if(state.player.stamina<stamina){addItem(state,crop.seedId,1);return {ok:false,message:`体力不足，需要${formatStamina(stamina)}`};}
  settleCurrentAreaResourcesForAction(state);
  state.player.stamina=roundStamina(state.player.stamina-stamina);
  state.plotsByArea[state.position].push({id:`plot_${state.day}_${state.actionIndex++}`,bedId:emptyBed[0],cropId,phase:"growing",remaining:crop.growthDays,charges:0,maxCharges:0,watered:false,fertilized:false,fertility:0,mature:false,greenhouse:Boolean(emptyBed[1].greenhouse),cycle:0,harvestedThisCycle:0});
  return {ok:true,message:`${ITEMS[crop.seedId].name}已种下，形成家养${crop.name}`,weatherExposure:resolveWeatherSicknessExposure(state,state.position)};
}

export function waterPlot(state,plotId) {
  const plot=state.plotsByArea[state.position].find(p=>p.id===plotId); if(!plot||plot.phase==="ready")return {ok:false,message:"这个资源点已经长满，无需浇水"};
  if(plot.watered)return {ok:false,message:"今天已经浇过水"};
  const cost=getPlotEnvironmentEffects(state,plot).heatAffected?2:1;
  if(countItem(state,"water")<cost||state.player.stamina<.2)return {ok:false,message:`需要水×${cost}和体力0.2`};
  settleCurrentAreaResourcesForAction(state);
  consumeItem(state,"water",cost);state.player.stamina=roundStamina(state.player.stamina-.2);plot.watered=true;progressTasks(state,"water",1);
  return {ok:true,weatherExposure:resolveWeatherSicknessExposure(state,state.position)};
}

export function fertilizePlot(state,plotId) {
  const plot=state.plotsByArea[state.position].find(p=>p.id===plotId);if(!plot||plot.phase==="ready"||plot.fertilized)return {ok:false,message:"今天不能再施肥"};
  if(plot.fertility>=5)return {ok:false,message:"丰饶已经满了，无需施肥"};
  if(countItem(state,"fertilizer")<1||state.player.stamina<.2)return {ok:false,message:"需要肥料×1和体力0.2"};
  settleCurrentAreaResourcesForAction(state);
  consumeItem(state,"fertilizer",1);state.player.stamina=roundStamina(state.player.stamina-.2);plot.fertilized=true;
  return {ok:true,weatherExposure:resolveWeatherSicknessExposure(state,state.position)};
}

export function harvestPlot(state,plotId) {
  const plot=state.plotsByArea[state.position].find(p=>p.id===plotId);if(!plot||plot.phase!=="ready"||plot.charges<=0)return {ok:false,message:"资源点尚未成熟"};
  if(state.player.stamina<.5)return {ok:false,message:"体力不足，需要0.5"};
  const crop=CROPS[plot.cropId],method=getCultivatedHarvestMethod(state),quantity=Math.min(method.quantity,plot.charges);
  settleCurrentAreaResourcesForAction(state);
  state.player.stamina=roundStamina(state.player.stamina-.5);plot.charges-=quantity;
  addItem(state,plot.cropId,quantity);
  if(plot.cropId==="grass"){
    addItem(state,"feed",quantity);
  }else if(plot.cropId==="corn"){
    addItem(state,"fish_feed",quantity);
  }
  let seeds=0;
  const seedRolls=crop.cultivatedSeedPerHarvest?1:quantity;
  for(let unit=0;unit<seedRolls;unit++)if(randomFromKey(getGameplaySeed(state),`cultivated-seed:${plot.id}:${plot.cycle}:${plot.harvestedThisCycle+unit}`)<CULTIVATED_SEED_DROP_CHANCE)seeds+=1;
  plot.harvestedThisCycle+=quantity;
  if(seeds)addItem(state,crop.seedId,seeds);
  if(plot.charges<=0){plot.phase="regrowing";plot.mature=false;plot.remaining=crop.growthDays;plot.fertility=0;plot.watered=false;plot.fertilized=false;plot.cycle+=1;plot.harvestedThisCycle=0;}
  progressGatherTasksForOutput(state,plot.cropId,quantity);
  progressTasks(state,"harvest",1);
  const extraGain=plot.cropId==="grass"?[{itemId:"feed",quantity}]:plot.cropId==="corn"?[{itemId:"fish_feed",quantity}]:[];
  const gains=[{itemId:plot.cropId,quantity},...extraGain,...(seeds?[{itemId:crop.seedId,quantity:seeds}]:[])];
  const feedGainText=plot.cropId==="grass"?`、${ITEMS.feed.name}×${quantity}`:plot.cropId==="corn"?`、${ITEMS.fish_feed.name}×${quantity}`:"";
  addLog(state,`从家养${crop.name}取得${ITEMS[plot.cropId].name}×${quantity}${feedGainText}${seeds?`、${ITEMS[crop.seedId].name}×${seeds}`:""}。`);
  return {ok:true,quantity,message:receivedItemsMessage(gains),weatherExposure:resolveWeatherSicknessExposure(state,state.position,{ignoreHouse:true})};
}

export function uprootCrop(state,plotId){
  const plots=state.plotsByArea[state.position]??[],index=plots.findIndex(plot=>plot.id===plotId);
  if(index<0)return {ok:false,message:"这个家养资源点已经不存在了"};
  ensurePlotBedAssignments(state,state.position);
  const [plot]=plots.splice(index,1);addLog(state,`拔除了家养${CROPS[plot.cropId]?.name??"作物"}，栽培地重新空了出来。`);
  return {ok:true,message:"已经拔除，种子不会返还"};
}

export function upgradePlotToGreenhouse(state,plotId){
  const plot=(state.plotsByArea[state.position]??[]).find(entry=>entry.id===plotId),definition=BUILDINGS.greenhouse;
  if(!plot)return {ok:false,message:"这个家养资源点已经不存在了"};
  if(!state.ownedBlueprintIds.includes(definition.blueprintId??"greenhouse"))return {ok:false,message:"尚未获得温室蓝图"};
  if(isGreenhousePlot(state,plot))return {ok:false,message:"这块栽培地已经是温室"};
  const bed=getPlotBedProgress(state,plot);
  if(!bed)return {ok:false,message:"没有找到这块栽培地"};
  if(!hasInputs(state,definition.inputs))return {ok:false,message:"升级温室的材料不足"};
  if(state.player.stamina<definition.stamina)return {ok:false,message:`体力不足，需要${formatStamina(definition.stamina)}`};
  settleCurrentAreaResourcesForAction(state);
  consumeInputs(state,definition.inputs);
  state.player.stamina=roundStamina(state.player.stamina-definition.stamina);
  bed.greenhouse=true;plot.greenhouse=true;
  progressTasks(state,"build",1);
  addLog(state,`${state.position}的一块栽培地升级成了温室。`);
  return {ok:true,message:"这块栽培地已升级为温室",weatherExposure:resolveWeatherSicknessExposure(state,state.position)};
}

export function upgradePastureToGreenhouse(state, areaId = state.position) {
  if (!completedInstances(state, areaId, "pasture").length) return { ok: false, message: "当地没有建好的草场" };
  const definition = BUILDINGS.greenhouse;
  if (!state.ownedBlueprintIds.includes(definition.blueprintId ?? "greenhouse")) return { ok: false, message: "尚未获得温室蓝图" };
  const pasture = getPastureStatus(state, areaId);
  if (pasture.greenhouse) return { ok: false, message: "草场已经是温室" };
  if (!hasInputs(state, definition.inputs)) return { ok: false, message: "升级温室的材料不足" };
  if (state.player.stamina < definition.stamina) return { ok: false, message: `体力不足，需要${formatStamina(definition.stamina)}` };
  settleCurrentAreaResourcesForAction(state);
  consumeInputs(state, definition.inputs);
  state.player.stamina = roundStamina(state.player.stamina - definition.stamina);
  pasture.greenhouse = true;
  progressTasks(state, "build", 1);
  addLog(state, `${areaId}的草场升级成了温室。`);
  return { ok: true, message: "草场已升级为温室", weatherExposure: resolveWeatherSicknessExposure(state, areaId) };
}

export function upgradeHerbFieldToGreenhouse(state, areaId = state.position) {
  if (!completedInstances(state, areaId, "herb_field").length) return { ok: false, message: "当地没有建好的药田" };
  const definition = BUILDINGS.greenhouse;
  if (!state.ownedBlueprintIds.includes(definition.blueprintId ?? "greenhouse")) return { ok: false, message: "尚未获得温室蓝图" };
  const field = getHerbFieldStatus(state, areaId);
  if (field.greenhouse) return { ok: false, message: "药田已经是温室" };
  if (!hasInputs(state, definition.inputs)) return { ok: false, message: "升级温室的材料不足" };
  if (state.player.stamina < definition.stamina) return { ok: false, message: `体力不足，需要${formatStamina(definition.stamina)}` };
  settleCurrentAreaResourcesForAction(state);
  consumeInputs(state, definition.inputs);
  state.player.stamina = roundStamina(state.player.stamina - definition.stamina);
  field.greenhouse = true;
  progressTasks(state, "build", 1);
  addLog(state, `${areaId}的药田升级成了温室。`);
  return { ok: true, message: "药田已升级为温室", weatherExposure: resolveWeatherSicknessExposure(state, areaId) };
}

export function getPastureStatus(state, areaId = state.position) {
  state.pastureByArea ??= {};
  const pasture = state.pastureByArea[areaId] ??= {};
  pasture.grassPlot ??= { planted: false, remaining: 3, watered: false, fertilized: false, fertility: 0, mature: false };
  pasture.cornPlot ??= { planted: false, remaining: 4, watered: false, fertilized: false, fertility: 0, mature: false };
  return pasture;
}

export function plantPasturePlot(state, cropType, areaId = state.position) {
  if (!completedInstances(state, areaId, "pasture").length) return { ok: false, message: "当地没有建好的草场" };
  const pasture = getPastureStatus(state, areaId);
  const isGrass = cropType === "grass";
  const plot = isGrass ? pasture.grassPlot : pasture.cornPlot;
  const seedId = isGrass ? "grass_seed" : "corn_seed";
  const seedName = isGrass ? "草种" : "玉米种子";
  const plotName = isGrass ? "草场地块" : "玉米地块";
  if (plot.planted) return { ok: false, message: `${plotName}已经播种` };
  if (countItem(state, seedId) < 1) return { ok: false, message: `缺少${seedName}` };
  if (state.player.stamina < 0.5) return { ok: false, message: "体力不足，需要0.5" };
  settleCurrentAreaResourcesForAction(state);
  consumeItem(state, seedId, 1);
  state.player.stamina = roundStamina(state.player.stamina - 0.5);
  plot.planted = true;
  plot.remaining = isGrass ? 3 : 4;
  plot.watered = false;
  plot.fertilized = false;
  plot.fertility = 0;
  plot.mature = false;
  addLog(state, `在草场${plotName}种下了${seedName}。`);
  return { ok: true, message: `${plotName}已播种`, weatherExposure: resolveWeatherSicknessExposure(state, state.position) };
}

export function waterPasturePlot(state, cropType, areaId = state.position) {
  if (!completedInstances(state, areaId, "pasture").length) return { ok: false, message: "当地没有建好的草场" };
  const pasture = getPastureStatus(state, areaId);
  const isGrass = cropType === "grass";
  const plot = isGrass ? pasture.grassPlot : pasture.cornPlot;
  const plotName = isGrass ? "草场地块" : "玉米地块";
  if (!plot.planted) return { ok: false, message: `${plotName}尚未播种` };
  if (plot.mature) return { ok: false, message: `${plotName}已成熟，等待夜间自动收获` };
  if (plot.watered) return { ok: false, message: "今天已经浇过水" };
  const cost = (!pasture.greenhouse && getPlotEnvironmentEffects(state, { id: "pasture" }, areaId).heatAffected) ? 2 : 1;
  if (countItem(state, "water") < cost || state.player.stamina < 0.2) return { ok: false, message: "缺少水或体力不足" };
  settleCurrentAreaResourcesForAction(state);
  consumeItem(state, "water", cost);
  state.player.stamina = roundStamina(state.player.stamina - 0.2);
  plot.watered = true;
  progressTasks(state, "water", 1);
  addLog(state, `为草场${plotName}进行了浇水。`);
  return { ok: true, message: `已给${plotName}浇水`, weatherExposure: resolveWeatherSicknessExposure(state, state.position) };
}

export function fertilizePasturePlot(state, cropType, areaId = state.position) {
  if (!completedInstances(state, areaId, "pasture").length) return { ok: false, message: "当地没有建好的草场" };
  const pasture = getPastureStatus(state, areaId);
  const isGrass = cropType === "grass";
  const plot = isGrass ? pasture.grassPlot : pasture.cornPlot;
  const plotName = isGrass ? "草场地块" : "玉米地块";
  if (!plot.planted) return { ok: false, message: `${plotName}尚未播种` };
  if (plot.mature) return { ok: false, message: `${plotName}已成熟，等待夜间自动收获` };
  if (plot.fertilized) return { ok: false, message: "今天不能再施肥" };
  if (plot.fertility >= 5) return { ok: false, message: "丰饶已满，无需施肥" };
  if (countItem(state, "fertilizer") < 1 || state.player.stamina < 0.2) return { ok: false, message: "缺少肥料或体力不足" };
  settleCurrentAreaResourcesForAction(state);
  consumeItem(state, "fertilizer", 1);
  state.player.stamina = roundStamina(state.player.stamina - 0.2);
  plot.fertilized = true;
  addLog(state, `为草场${plotName}进行了施肥。`);
  return { ok: true, message: `已给${plotName}施肥`, weatherExposure: resolveWeatherSicknessExposure(state, state.position) };
}

export function getHerbFieldStatus(state, areaId = state.position) {
  state.herbFieldsByArea ??= {};
  const field = state.herbFieldsByArea[areaId] ??= { planted: false, remaining: 5, watered: false, fertilized: false, fertility: 0, mature: false };
  return field;
}

export function plantHerbField(state, areaId = state.position) {
  if (!completedInstances(state, areaId, "herb_field").length) return { ok: false, message: "当地没有建好的药田" };
  state.herbFieldsByArea ??= {};
  const field = state.herbFieldsByArea[areaId] ??= { planted: false, remaining: 5, watered: false, fertilized: false, fertility: 0, mature: false };
  if (field.planted) return { ok: false, message: "药田已经种植了草药" };
  if (countItem(state, "herb_seed") < 1) return { ok: false, message: "缺少草药种子" };
  if (state.player.stamina < 0.5) return { ok: false, message: "体力不足，需要0.5" };
  settleCurrentAreaResourcesForAction(state);
  consumeItem(state, "herb_seed", 1);
  state.player.stamina = roundStamina(state.player.stamina - 0.5);
  field.planted = true;
  field.remaining = 5;
  field.watered = false;
  field.fertilized = false;
  field.fertility = 0;
  field.mature = false;
  addLog(state, "在药田种下了草药种子。");
  return { ok: true, message: "草药种子已种在药田", weatherExposure: resolveWeatherSicknessExposure(state, state.position) };
}

export function waterHerbField(state, areaId = state.position) {
  if (!completedInstances(state, areaId, "herb_field").length) return { ok: false, message: "当地没有建好的药田" };
  state.herbFieldsByArea ??= {};
  const field = state.herbFieldsByArea[areaId] ??= { planted: false, remaining: 5, watered: false, fertilized: false, fertility: 0, mature: false };
  if (!field.planted) return { ok: false, message: "药田尚未播种" };
  if (field.mature) return { ok: false, message: "草药已成熟，无需浇水" };
  if (field.watered) return { ok: false, message: "今天已经浇过水" };
  const cost = getPlotEnvironmentEffects(state, { id: "herb_field" }, areaId).heatAffected ? 2 : 1;
  if (countItem(state, "water") < cost || state.player.stamina < 0.2) return { ok: false, message: "缺少水或体力不足" };
  settleCurrentAreaResourcesForAction(state);
  consumeItem(state, "water", cost);
  state.player.stamina = roundStamina(state.player.stamina - 0.2);
  field.watered = true;
  progressTasks(state, "water", 1);
  addLog(state, "为药田进行了浇水。");
  return { ok: true, message: "已给药田浇水", weatherExposure: resolveWeatherSicknessExposure(state, state.position) };
}

export function fertilizeHerbField(state, areaId = state.position) {
  if (!completedInstances(state, areaId, "herb_field").length) return { ok: false, message: "当地没有建好的药田" };
  state.herbFieldsByArea ??= {};
  const field = state.herbFieldsByArea[areaId] ??= { planted: false, remaining: 5, watered: false, fertilized: false, fertility: 0, mature: false };
  if (!field.planted) return { ok: false, message: "药田尚未播种" };
  if (field.mature) return { ok: false, message: "草药已成熟，无需施肥" };
  if (field.fertilized) return { ok: false, message: "今天不能再施肥" };
  if (field.fertility >= 5) return { ok: false, message: "丰饶已满，无需施肥" };
  if (countItem(state, "fertilizer") < 1 || state.player.stamina < 0.2) return { ok: false, message: "缺少肥料或体力不足" };
  settleCurrentAreaResourcesForAction(state);
  consumeItem(state, "fertilizer", 1);
  state.player.stamina = roundStamina(state.player.stamina - 0.2);
  field.fertilized = true;
  addLog(state, "为药田进行了施肥。");
  return { ok: true, message: "已给药田施肥", weatherExposure: resolveWeatherSicknessExposure(state, state.position) };
}

export function harvestHerbField(state, areaId = state.position) {
  if (!completedInstances(state, areaId, "herb_field").length) return { ok: false, message: "当地没有建好的药田" };
  state.herbFieldsByArea ??= {};
  const field = state.herbFieldsByArea[areaId] ??= { planted: false, remaining: 5, watered: false, fertilized: false, fertility: 0, mature: false };
  if (!field.planted || !field.mature) return { ok: false, message: "药田尚未成熟" };
  if (state.player.stamina < 0.5) return { ok: false, message: "体力不足，需要0.5" };
  settleCurrentAreaResourcesForAction(state);
  state.player.stamina = roundStamina(state.player.stamina - 0.5);
  const yieldCount = 3 + Math.floor(Number(field.fertility || 0) / 2);
  addItem(state, "fresh_herb", yieldCount);
  addItem(state, "herb_seed", 1);
  field.planted = false;
  field.mature = false;
  field.remaining = 5;
  field.fertility = 0;
  field.watered = false;
  field.fertilized = false;
  progressTasks(state, "harvest", 1);
  addLog(state, "从药田收获了新鲜药草与草药种子。");
  return { ok: true, message: "收获了新鲜药草与草药种子", weatherExposure: resolveWeatherSicknessExposure(state, state.position, { ignoreHouse: true }) };
}

function resolvePastureAndHerb(state, summary) {
  for (const areaId of Object.keys(AREAS)) {
    if (completedInstances(state, areaId, "pasture").length > 0) {
      const pasture = getPastureStatus(state, areaId);
      // 草场地块：长满到期夜间自动收获并制作成饲料入库
      if (pasture.grassPlot?.planted) {
        const p = pasture.grassPlot;
        if (!p.mature) {
          if (!p.watered && consumeLocalStorageItem(state, "water", 1, areaId)) {
            p.watered = true;
          }
          if (p.watered) {
            p.remaining -= 1;
            if (p.fertilized) p.fertility = Math.min(5, (p.fertility || 0) + 1);
            if (p.remaining <= 0) p.mature = true;
          }
          p.watered = false;
          p.fertilized = false;
        }
        if (p.mature) {
          const feedCount = 4 + Math.floor(Number(p.fertility || 0) * 1.5);
          addItem(state, "feed", feedCount, { areaId, preferred: "storage" });
          addItem(state, "grass_seed", 1, { areaId });
          summary.push(`${areaId}：草场成熟，已自动收割并制作入库饲料${feedCount}份与草种1份`);
          addLog(state, `${areaId}：草场草料成熟，已自动收割并制作入库饲料${feedCount}份。`);
          p.planted = false;
          p.mature = false;
          p.remaining = 3;
          p.fertility = 0;
          p.watered = false;
          p.fertilized = false;
        }
      }
      // 玉米地块：长满到期夜间自动收获并制作成玉米饲料入库
      if (pasture.cornPlot?.planted) {
        const p = pasture.cornPlot;
        if (!p.mature) {
          if (!p.watered && consumeLocalStorageItem(state, "water", 1, areaId)) {
            p.watered = true;
          }
          if (p.watered) {
            p.remaining -= 1;
            if (p.fertilized) p.fertility = Math.min(5, (p.fertility || 0) + 1);
            if (p.remaining <= 0) p.mature = true;
          }
          p.watered = false;
          p.fertilized = false;
        }
        if (p.mature) {
          const feedCount = 3 + Math.floor(Number(p.fertility || 0) * 1.5);
          addItem(state, "fish_feed", feedCount, { areaId, preferred: "storage" });
          addItem(state, "corn_seed", 1, { areaId });
          summary.push(`${areaId}：玉米地成熟，已自动收获并制作成玉米饲料${feedCount}份与玉米种子1份`);
          addLog(state, `${areaId}：玉米地成熟，已自动收割制作入库玉米饲料${feedCount}份。`);
          p.planted = false;
          p.mature = false;
          p.remaining = 4;
          p.fertility = 0;
          p.watered = false;
          p.fertilized = false;
        }
      }
    }
    const aqueducts = completedInstances(state, areaId, "aqueduct");
    const upgradedAqueducts = completedInstances(state, areaId, "aqueduct_upgraded");
    const seawaterGained = aqueducts.length * 3 + upgradedAqueducts.length * 5;
    if (seawaterGained > 0) {
      addItem(state, "seawater", seawaterGained, { areaId });
      const facilityName = upgradedAqueducts.length > 0 ? "高级水渠" : "水渠";
      summary.push(`${areaId}：${facilityName}引流海水${seawaterGained}份存入当地储存库`);
      addLog(state, `${areaId}：${facilityName}引流海水${seawaterGained}份存入储存库。`);
    }
    if (completedInstances(state, areaId, "herb_field").length > 0) {
      state.herbFieldsByArea ??= {};
      const field = state.herbFieldsByArea[areaId] ??= { planted: false, remaining: 5, watered: false, fertilized: false, fertility: 0, mature: false };
      if (field.planted && !field.mature) {
        if (!field.watered && consumeLocalStorageItem(state, "water", 1, areaId)) {
          field.watered = true;
        }
        if (field.watered) {
          field.remaining -= 1;
          if (field.fertilized) {
            field.fertility = Math.min(5, (field.fertility || 0) + 1);
          }
          if (field.remaining <= 0) {
            field.mature = true;
            summary.push(`${areaId}：药田里的新鲜药草已经成熟`);
            addLog(state, `${areaId}：药田里的新鲜药草已经成熟，可以采收。`);
          }
        }
        field.watered = false;
        field.fertilized = false;
      }
    }
  }
}

function applyFarmAutomation(state,areaId,plots,summary){
  const coverage=getFarmAutomationCoverage(state,areaId),supply=state.farmSuppliesByArea[areaId]??={fertilizer:0};
  let watered=0,waterUsed=0,waterShortage=0;
  for(const plot of plots.slice(0,coverage.water)){
    if(plot.phase==="ready"||plot.watered)continue;
    const cost=getPlotEnvironmentEffects(state,plot,areaId).heatAffected?2:1;
    if(!consumeLocalStorageItem(state,"water",cost,areaId)){waterShortage+=1;continue;}
    plot.watered=true;watered+=1;waterUsed+=cost;
  }
  if(watered)summary.push(`${areaId}：滴灌架自动浇水${watered}处，消耗水${waterUsed}`);
  if(waterShortage)summary.push(`${areaId}：另有${waterShortage}处因当地普通储物格水不足未浇灌`);

  let fertilized=0,fertilizerShortage=0;
  for(const plot of plots){
    if(!getPlotAutoFertilizeStatus(state,plot.bedId,areaId).operational)continue;
    if(plot.phase==="ready"||plot.fertilized||plot.fertility>=5)continue;
    if(supply.fertilizer<1){fertilizerShortage+=1;continue;}
    supply.fertilizer-=1;plot.fertilized=true;fertilized+=1;
  }
  if(fertilized)summary.push(`${areaId}：自动施肥箱为${fertilized}处家养资源点施肥，消耗肥料${fertilized}`);
  if(fertilizerShortage)summary.push(`${areaId}：另有${fertilizerShortage}处因自动施肥箱存料不足未施肥`);
}

function completedAnimalPens(state,areaId,type){
  const penId=ANIMAL_PEN_IDS[type];
  const penIds=[penId];
  return Object.entries(state.buildingsByArea[areaId]??{})
    .filter(([id,progress])=>penIds.some(p=>id===p||id.startsWith(`${p}__`))&&progress.completed)
    .sort(([,left],[,right])=>(left.completedOrder??0)-(right.completedOrder??0));
}

function ensureAnimalPenAssignments(state,areaId,type){
  const animals=(state.animalsByArea[areaId]??[]).filter(animal=>animal.type===type),pens=completedAnimalPens(state,areaId,type);
  if(!pens.length)return;
  const validIds=new Set(pens.map(([id])=>id)),counts=new Map(pens.map(([id])=>[id,0]));
  for(const animal of animals){
    if(!validIds.has(animal.penId)){delete animal.penId;continue;}
    counts.set(animal.penId,(counts.get(animal.penId)??0)+1);
  }
  for(const animal of animals){
    if(animal.penId)continue;
    const target=pens.find(([id])=>{
      const baseId=id.replace(/__\d+$/u,"");
      const cap=BUILDINGS[baseId]?.effect?.capacity??1;
      return (counts.get(id)??0)<cap;
    })??pens.at(-1);
    animal.penId=target[0];counts.set(target[0],(counts.get(target[0])??0)+1);
  }
}

export function getAnimalPenSlots(state,type,areaId=state.position){
  ensureAnimalPenAssignments(state,areaId,type);
  return completedAnimalPens(state,areaId,type).map(([penId,progress],index)=>{
    const baseId=penId.replace(/__\d+$/u,"");
    return {
      penId,progress,index,capacity:BUILDINGS[baseId]?.effect?.capacity??1,
      animals:(state.animalsByArea[areaId]??[]).filter(animal=>animal.type===type&&animal.penId===penId)
    };
  });
}

function canFeedAnimalPen(slot){return !slot.progress.damaged&&slot.animals.some(animal=>!animal.fed);}

function animalPenCapacity(state,areaId,type){
  const pens=completedAnimalPens(state,areaId,type);
  let cap=0;
  for(const [id] of pens){
    const baseId=id.replace(/__\d+$/u,"");
    cap+=BUILDINGS[baseId]?.effect?.capacity??0;
  }
  return cap;
}
export function addAnimalToPen(state,type,penId=null){
  const def=LIVESTOCK[type];if(!def)return {ok:false,message:"未知动物"};
  const current=state.animalsByArea[state.position].filter(a=>a.type===type).length;
  if(current>=animalPenCapacity(state,state.position,type))return {ok:false,message:"当地栏舍已满"};
  const slots=getAnimalPenSlots(state,type),slot=penId?slots.find(entry=>entry.penId===penId):slots.find(entry=>!entry.progress.damaged&&entry.animals.length<entry.capacity);
  if(!slot||slot.progress.damaged||slot.animals.length>=slot.capacity)return {ok:false,message:"这座栏舍当前不可用"};
  if(!consumeItem(state,def.youngItem,1))return {ok:false,message:`缺少${ITEMS[def.youngItem].name}`};
  state.animalsByArea[state.position].push({id:`animal_${state.day}_${state.actionIndex++}`,type,penId:slot.penId,age:0,fed:false,hungryDays:0,productionDay:0});return {ok:true};
}
export function feedAnimals(state,type,penId=null){
  const def=LIVESTOCK[type];
  if(!def)return {ok:false,message:"未知动物"};
  const slots=getAnimalPenSlots(state,type);
  const slot=penId?slots.find(entry=>entry.penId===penId):slots.find(canFeedAnimalPen)??slots.find(entry=>entry.animals.some(animal=>!animal.fed));
  if(penId&&!slot)return {ok:false,message:"这座栏舍已经不存在了"};
  if(slot?.progress.damaged)return {ok:false,message:"栏舍已损坏，修复后才能喂养"};
  const animals=(slot?.animals??[]).filter(animal=>!animal.fed);
  if(!animals.length)return {ok:false,message:"没有需要喂养的动物"};
  const hasFishFeed=hasInputs(state,def.feed);
  if(!hasFishFeed||state.player.stamina<FEED_ANIMALS_STAMINA_COST)return {ok:false,message:"饲料或体力不足"};
  settleCurrentAreaResourcesForAction(state);
  consumeInputs(state,def.feed);
  state.player.stamina=roundStamina(state.player.stamina-FEED_ANIMALS_STAMINA_COST);
  for(const animal of animals)animal.fed=true;
  progressTasks(state,"feed",1);return {ok:true,weatherExposure:resolveWeatherSicknessExposure(state,state.position)};
}

export function getLivestockStageName(type,age){
  const definition=LIVESTOCK[type];
  if(!definition)return "动物";
  const currentAge=Math.max(0,Number(age)||0);
  let stageStart=0;
  for(const stage of definition.stages??[]){
    if(stage.days===undefined||currentAge<stageStart+stage.days)return stage.name;
    stageStart+=stage.days;
  }
  return definition.name;
}

function getToolInstances(state, toolType) {
  return allAccessibleStacks(state).flatMap((stacks) => stacks
    .filter((stack) => ITEMS[stack.itemId]?.toolType === toolType && stack.quantity > 0)
    .map((stack) => ({ stack, stacks })));
}

export function getNodeMethods(state, nodeId) {
  const nodeState = state.areas[state.position]?.nodes[nodeId];
  const node = NODES[nodeState?.nodeId ?? nodeId];
  if (!node) return [];
  const requiredAttack = (nodeState?.nodeId ?? nodeId)==="large_fish_school" ? 40 : 0;
  if (requiredAttack && getPlayerStats(state).attack < requiredAttack) return [];
  const choices=node.methods.map((method, index) => {
    if (method.hunt) return { id:`hunt-${index}`,label:"攻击",quantity:Number(method.hunt)||1,method,priority:3 };
    if (method.hand) return { id: `hand-${index}`, label: "徒手", quantity: method.hand, method, priority:0 };
    if (method.requiredItem) {
      const equipped = state.player.equipment?.[ITEMS[method.requiredItem]?.slot] === method.requiredItem;
      if (equipped || countItem(state, method.requiredItem) > 0) return { id: `item-${index}`, label: ITEMS[method.requiredItem].name, quantity: method.quantity, method, priority:1 };
      return null;
    }
    if (!method.toolType || !method.yields) return null;
    const tools = getToolInstances(state, method.toolType);
    const toolEntry = tools
      .map(entry=>({entry,quantity:Number(method.yields[entry.stack.itemId]??0)}))
      .filter(entry=>entry.quantity>0)
      .sort((left,right)=>right.quantity-left.quantity)[0];
    if (!toolEntry) return null;
    const quantity = toolEntry.quantity;
    if (!quantity) return null;
    return { id: `tool-${index}`, label: ITEMS[toolEntry.entry.stack.itemId].name, quantity, method, tool: toolEntry.entry.stack, toolStacks: toolEntry.entry.stacks, priority:2 };
  }).filter(Boolean);
  choices.sort((left,right)=>right.quantity-left.quantity||left.priority-right.priority);
  if(!choices.length)return [];
  const {priority,...best}=choices[0];
  return [best];
}

export function getNodeEnemyId(state, nodeId) {
  const type=state.areas[state.position]?.nodes[nodeId]?.nodeId ?? nodeId;
  return ({marten:"marten_enemy",lion_pride:"lion_pride",snow_leopard_boss:"snow_leopard",giant_eagle_boss:"giant_eagle"})[type] ?? null;
}

export function gatherNode(state, nodeId, methodId, acceptRisk = false) {
  const area = state.areas[state.position];
  const nodeState = area?.nodes[nodeId];
  const node = NODES[nodeState?.nodeId ?? nodeId];
  if (!nodeState?.revealed || !node) return { ok: false, message: "资源点尚未发现" };
  if (nodeState.charges !== null && nodeState.charges <= 0) return { ok: false, message: nodeState.respawnRemaining > 0 ? "等待恢复" : "这个资源点已经采完了" };
  const weather=getWeather(state);if(hasWeatherHazard(weather,"storm")&&weather.intensity==="severe")return {ok:false,message:"加强版强风暴期间禁止采集"};
  const method = getNodeMethods(state, nodeId).find((entry) => entry.id === methodId);
  if (!method) return { ok: false, message: "缺少可用工具" };
  const huntAttemptIndex=state.actionIndex;
  const cost = resolveOutdoorCost(state,node.stamina,acceptRisk,state.position,{weatherExposureEvenWithHouse:true});
  if (!cost.ok) return cost;
  const huntRequirement=Number(node.huntAttack??0);
  if(huntRequirement>0){
    const combat=getEffectiveCombatAttack(state,node.weakness,{attack:huntRequirement,combatLevel:node.combatLevel});
    const attack=combat.attack;
    if(attack<huntRequirement){
      inflictInjury(state);
      const message=`你的有效攻击${attack}低于${node.name}的攻击${huntRequirement}，攻击失败并受伤了`;
      addLog(state,message+"。");
      return {ok:false,huntFailed:true,injured:true,message};
    }
    if(attack===huntRequirement){
      const message=`你的有效攻击${attack}与${node.name}的攻击${huntRequirement}相同，双方僵持，什么也没有发生`;
      addLog(state,message+"。");
      return {ok:true,huntTied:true,quantity:0,message};
    }
    if(nodeState.charges!==null){nodeState.charges-=1;if(nodeState.charges===0)nodeState.respawnRemaining=node.respawnDays>0?node.respawnDays:0;}
    const gains=[];
    for(const [itemId,[quantity,chance]] of Object.entries(node.huntDrops??{})){
      if(randomFromKey(getGameplaySeed(state),`animal-hunt:${state.day}:${state.position}:${nodeState.id}:${huntAttemptIndex}:drop:${itemId}`)>=chance)continue;
      addItem(state,itemId,quantity);gains.push({itemId,quantity});
    }
    const captureToolStacks=[state.backpack.cold,state.backpack.ordinary].find(stacks=>stacks.some(stack=>ITEMS[stack.itemId]?.toolType===node.captureTool&&stack.quantity>0));
    const captureTool=captureToolStacks?.find(stack=>ITEMS[stack.itemId]?.toolType===node.captureTool&&stack.quantity>0);
    const captured=Boolean(captureTool&&node.captureOutput&&randomFromKey(getGameplaySeed(state),`animal-capture:${state.day}:${state.position}:${nodeState.id}:${huntAttemptIndex}`)<Number(node.captureChance??.1));
    if(captured){
      takeFromStack(captureTool,1);
      if(captureTool.quantity<=0)captureToolStacks.splice(captureToolStacks.indexOf(captureTool),1);
      addItem(state,node.captureOutput,1);gains.push({itemId:node.captureOutput,quantity:1});
    }
    const gainsText=receivedItemsMessage(gains);
    const captureCostText=captured?`；消耗${ITEMS[captureTool.itemId].name}×1`:"";
    addLog(state,`成功攻击${node.name}，${gainsText||"没有取得战利品"}${captured?`；${ITEMS[captureTool.itemId].name}捕获了${ITEMS[node.captureOutput].name}${captureCostText}`:""}。`);
    return {ok:true,quantity:1,captured,message:gainsText+captureCostText};
  }
  const gatheredQuantity = nodeState.charges === null ? method.quantity : Math.min(method.quantity, nodeState.charges);
  if (nodeState.charges !== null) {
    nodeState.charges -= gatheredQuantity;
    if (nodeState.charges === 0) nodeState.respawnRemaining = node.respawnDays > 0 ? node.respawnDays : 0;
  }
  if(nodeState.nodeId==="shipwreck_chest"){
    const opened=node.maxCharges-nodeState.charges-1;
    const pack=SHIPWRECK_CHEST_PACKS[opened];
    const gains=[];let blueprintName="";
    if(pack){
      if(pack.blueprint){
        const original=BLUEPRINTS.find(b=>b.id===pack.blueprint);
        if(acquireBlueprint(state,pack.blueprint,"沉船宝箱"))blueprintName=original?.name??pack.blueprint;
      }
      for(const id of pack.items){addItem(state,id,1);gains.push({itemId:id,quantity:1});}
      if(pack.extra){addItem(state,pack.extra[0],pack.extra[1]);gains.push({itemId:pack.extra[0],quantity:pack.extra[1]});}
    }
    addLog(state,"打开沉船宝箱。");const itemMessage=receivedItemsMessage(gains);return {ok:true,quantity:1,message:`得到${[blueprintName?`${blueprintName}蓝图`:"",itemMessage.replace(/^得到/,"")].filter(Boolean).join("、")}`};
  }
  if(nodeState.nodeId==="mysterious_facility"){
    if(countItemGlobal(state,"space_module")<1||countItemGlobal(state,"coordinate_module")<1){nodeState.charges=1;return {ok:false,message:"设施需要空间稳定模块和世界坐标模块"};}
    addItem(state,"return_core",1);acquireBlueprint(state,"return_tower","神秘设施");addLog(state,"神秘设施完成检测：取得归航核心与归航塔蓝图。");return {ok:true,quantity:1,message:"得到归航核心×1、归航塔蓝图"};
  }
  if(node.randomOutputs?.length){
    const roll=randomFromKey(getGameplaySeed(state),`random-node-output:${state.position}:${nodeState.id}:${nodeState.charges}`);
    let cumulative=0;
    const selected=node.randomOutputs.find(output=>(cumulative+=Number(output.chance??0))>roll)??node.randomOutputs.at(-1);
    const gains=[{itemId:selected.itemId,quantity:gatheredQuantity}];
    addItem(state,selected.itemId,gatheredQuantity);
    progressGatherTasksForOutput(state,selected.itemId,gatheredQuantity);
    addLog(state,`在${node.name}取得${ITEMS[selected.itemId].name}×${gatheredQuantity}。`);
    return {ok:true,quantity:gatheredQuantity,itemId:selected.itemId,message:receivedItemsMessage(gains)};
  }
  const gains=[{itemId:node.output,quantity:gatheredQuantity}];
  addItem(state, node.output, gatheredQuantity);
  if(node.output==="fish"||nodeState.nodeId==="fish_school"||nodeState.nodeId==="large_fish_school"){
    const trapStack=[state.backpack.cold,state.backpack.ordinary].find(stacks=>stacks.some(stack=>stack.itemId==="trap"&&stack.quantity>0))?.find(stack=>stack.itemId==="trap"&&stack.quantity>0);
    if(trapStack&&randomFromKey(getGameplaySeed(state),`fish-trap:${state.position}:${nodeState.id}:${state.day}:${state.actionIndex}`)<.25){
      takeFromStack(trapStack,1);
      addItem(state,"fry",1);
      gains.push({itemId:"fry",quantity:1});
      addLog(state,"消耗捕兽笼×1，成功捕获鱼苗×1。");
    }
  }
  if(CROPS[node.output]){
    const crop=CROPS[node.output],seedId=crop.seedId;let seedQuantity=0;
    const treeCrop=node.output==="apple";
    const seedChance=Number(crop.wildSeedChance??(treeCrop?WILD_SEED_DROP_CHANCES.tree:WILD_SEED_DROP_CHANCES.crop));
    const seedRolls=crop.wildSeedPerGather?1:gatheredQuantity;
    for(let unit=0;unit<seedRolls;unit+=1)if(randomFromKey(getGameplaySeed(state),`wild-seed:${state.position}:${nodeState.id}:${nodeState.charges}:${unit}`)<seedChance)seedQuantity+=1;
    if(seedQuantity){addItem(state,seedId,seedQuantity);gains.push({itemId:seedId,quantity:seedQuantity});addLog(state,`同时取得${ITEMS[seedId].name}×${seedQuantity}。`);}
  }
  if(nodeState.nodeId==="grassland"){
    const foundHerb=randomFromKey(getGameplaySeed(state),`grassland-herb:${state.position}:${nodeState.id}:${nodeState.charges}`)<GRASSLAND_HERB_CHANCE;
    if(foundHerb){
      const foundSeed=randomFromKey(getGameplaySeed(state),`grassland-herb-seed:${state.position}:${nodeState.id}:${nodeState.charges}`)<HERB_SEED_REPLACEMENT_CHANCE;
      const herbItemId=foundSeed?CROPS.herb.seedId:"herb";
      addItem(state,herbItemId,1);gains.push({itemId:herbItemId,quantity:1});
      addLog(state,`拔草时还找到了${ITEMS[herbItemId].name}×1。`);
    }
  }
  state.gatherBonusCounters ??= {};
  if (nodeState.nodeId === "fish_school") {
    const key = `${state.position}:${nodeState.id}:shrimp`;
    const misses = state.gatherBonusCounters[key] ?? 0;
    const foundBonus = misses >= 4 || randomFromKey(getGameplaySeed(state), `gather-bonus:${key}:${nodeState.charges}`) < 0.3;
    if (foundBonus) { addItem(state, "shrimp", 1); gains.push({itemId:"shrimp",quantity:1}); state.gatherBonusCounters[key] = 0; addLog(state, "鱼获中还有虾×1。"); }
    else state.gatherBonusCounters[key] = misses + 1;
  }
  for(const gain of gains)progressGatherTasksForOutput(state,gain.itemId,gain.quantity);
  addLog(state, `在${node.name}取得${ITEMS[node.output].name}×${gatheredQuantity}。`);
  return { ok: true, quantity: gatheredQuantity, message: receivedItemsMessage(gains) };
}

function coordParts(areaId) {
  return { x: areaId.charCodeAt(0) - 65, y: Number(areaId[1]) - 1 };
}

export function getNeighbors(areaId) {
  const { x, y } = coordParts(areaId);
  return [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]
    .filter(([nx, ny]) => nx >= 0 && nx < 7 && ny >= 0 && ny < 7)
    .map(([nx, ny]) => `${String.fromCharCode(65 + nx)}${ny + 1}`);
}

function openNeighbor(state, sourceAreaId, threshold) {
  const candidates = getNeighbors(sourceAreaId).filter((id) => AREAS[id] && !state.areas[id].opened);
  const picked = pickFromKey(candidates, getGameplaySeed(state), `open:${sourceAreaId}:${threshold}`);
  if (!picked) return null;
  state.areas[picked].opened = true;
  addLog(state, `地图开启：${picked} ${AREAS[picked].name}。`);
  return picked;
}

function retainedNaturalNodeCount(area){
  return Object.values(area?.nodes??{}).filter(node=>node.revealed&&(node.charges===null||node.charges>0||node.respawnRemaining>0)).length;
}

export function explore(state, acceptRisk = false) {
  const area = state.areas[state.position];
  if(retainedNaturalNodeCount(area)>=MAX_RETAINED_NATURAL_NODES)return {ok:false,message:"先看看已经发现的东西吧。"};
  const baseCost = 3;
  const cost = resolveOutdoorCost(state,baseCost,acceptRisk,state.position,{weatherExposureEvenWithHouse:true});
  if (!cost.ok) return cost;
  const previous = area.exploration;
  area.explorationActions = (area.explorationActions ?? Math.ceil(previous / 10)) + 1;
  const explorationAttempt = area.explorationActions;
  area.exploration = Math.min(100, area.exploration + 10);
  let opened = null;
  for (const threshold of [20, 40, 60, 80]) {
    if (previous < threshold && area.exploration >= threshold && !area.resolvedThresholds.includes(threshold)) {
      area.resolvedThresholds.push(threshold);
      opened = openNeighbor(state, state.position, threshold) ?? opened;
    }
  }
  const unknownNodes = Object.values(area.nodes).filter((node) => !node.revealed && !NODES[node.nodeId]?.special);
  const discovered = [];
  const availableAppleTree=Object.values(area.nodes).some(node=>node.nodeId==="apple_tree"&&node.revealed&&(node.charges===null||node.charges>0));
  const accessibleFood=countLocalFood(state,state.position)+(state.selectedFood?.reservation?1:0);
  const firstD4Exploration=state.position==="D4"&&previous===0;
  const lowFoodAppleEligible=state.position==="D4"&&previous>0&&!availableAppleTree&&accessibleFood<=1;
  const lowFoodAppleTriggered=lowFoodAppleEligible&&randomFromKey(getGameplaySeed(state),`low-food-apple:${state.position}:${explorationAttempt}`)<D4_LOW_FOOD_APPLE_CHANCE;
  const needsAppleTree=firstD4Exploration||lowFoodAppleTriggered;
  const guaranteedAppleTree = needsAppleTree ? unknownNodes.find((node) => node.nodeId === "apple_tree") : null;
  const found = guaranteedAppleTree
    ?? (needsAppleTree ? createGeneratedExplorationNode(state, state.position, "apple_tree",explorationAttempt) : null)
    ?? pickUndiscoveredAreaNode(unknownNodes,state.position,getGameplaySeed(state),explorationAttempt)
    ?? (previous>=100?createGeneratedExplorationNode(state, state.position,null,explorationAttempt):null);
  if (found) {
    markNodeDiscovered(area,found);
    discovered.push(found.id);
  }
  const specialDiscoveries = Object.values(area.nodes).filter((node) => {
    const definition = NODES[node.nodeId];
    return !node.revealed && definition?.special && area.exploration >= (definition.unlockAtExploration ?? 100);
  });
  for (const special of specialDiscoveries) {
    markNodeDiscovered(area,special);
    discovered.push(special.id);
  }
  if (state.position === "D4" && area.exploration >= 20) {
    if(!state.ownedBlueprintIds.includes("plank"))state.ownedBlueprintIds.push("plank");
  }
  progressTasks(state, "explore", 1);
  const discoveryNames=discovered.map(id=>area.nodes[id].siteLabel).join("、");
  addLog(state, `探索了${state.position} ${AREAS[state.position].name}，${discoveryNames?`发现了${discoveryNames}`:"没有发现新的资源点"}。${specialDiscoveries.length?"焦黑石柱之间散落着雷击形成的玻璃结晶。":""}`);
  let encounter = null;
  const discoveredThunderCircle=state.position==="G7"&&discovered.some(id=>area.nodes[id].nodeId==="thunder_stone_circle");
  const encounterEnemyIds=state.position==="G7"?(discoveredThunderCircle?["wandering_lion"]:[]):getActiveAttackEnemyIds(state.position);
  const candidates = encounterEnemyIds.map((enemyId) => [enemyId, ENEMIES[enemyId]]).filter(([,enemy]) => enemy);
  if (candidates.length && (discoveredThunderCircle||randomFromKey(getGameplaySeed(state),`encounter:${state.day}:${state.position}:${explorationAttempt}`) < ACTIVE_ATTACK_CHANCE)) {
    const [enemyId,enemy] = pickFromKey(candidates,getGameplaySeed(state),`encounter-pick:${state.day}:${state.position}:${explorationAttempt}`);
    const preview=getCombatPreview(state,enemyId);
    addLog(state,`探索途中遭到${enemy.name}主动袭击，战斗立即开始。`);
    const battle=fightEnemy(state,enemyId);
    encounter={
      enemyId,
      name:enemy.name,
      areaId:state.position,
      resolved:true,
      won:battle.won,
      injured:battle.injured,
      injuryLevels:battle.injuryLevels,
      loot:battle.loot,
      playerAttack:preview.combat.attack,
      rawPlayerAttack:preview.combat.baseAttack,
      enemyAttack:enemy.attack,
      matchedWeakness:preview.combat.matched,
      mismatchedWeakness:preview.combat.mismatched,
      attackTierBoost:preview.combat.attackTierBoost,
      tierBoost:preview.combat.tierBoost,
      weakness:enemy.weakness,
      tied:battle.tied
    };
  }
  const discoveryMessage = specialDiscoveries.length
    ? `发现特殊地点：${specialDiscoveries.map((node) => node.siteLabel).join("、")}`
    : found?`发现新资源点：${found.siteLabel}`:"本次探索没有发现新资源点";
  const battleMessage = encounter
    ? encounter.won
      ? `遭到${encounter.name}袭击，战斗胜利${encounter.injured?"但受伤":""}，获得${encounter.loot.join("、")||"无战利品"}`
      : encounter.tied
        ? `遭到${encounter.name}袭击，双方攻击相同，僵持后分开`
        : `遭到${encounter.name}袭击，攻击不足，战斗失败${encounter.injured?`并受伤${encounter.injuryLevels}层`:""}`
    : "";
  return {
    ok: true,
    opened,
    discovered,
    encounter,
    message: [discoveryMessage,battleMessage].filter(Boolean).join("；")
  };
}

export function getMoveAvailability(state,areaId){
  if(areaId===state.position)return {ok:false,message:"你已经在这个地块"};
  if (!state.areas[areaId]?.opened) return { ok: false, message: "该地块尚未开启" };
  if (!getNeighbors(state.position).includes(areaId)) return { ok: false, message: "两地之间没有可通行路线" };
  if (KAYAK_REQUIRED_AREAS.has(areaId) && !hasBackpackItem(state,"kayak")) return {ok:false,message:"前往该地块需要背包里携带皮划艇"};
  return {ok:true};
}

export function moveTo(state, areaId, acceptRisk = false) {
  const availability=getMoveAvailability(state,areaId);
  if(!availability.ok)return availability;
  const cost = resolveOutdoorCost(state, 1, acceptRisk,state.position,{sicknessAreaId:areaId});
  if (!cost.ok) return cost;
  state.position = areaId;
  progressTasks(state, "move", 1);
  addLog(state, `移动到${areaId} ${AREAS[areaId].name}。`);
  return { ok: true, message:cost.weatherExposure?.message??"" };
}

export function getCombatPreview(state, enemyId) {
  const enemy=ENEMIES[enemyId];
  if (!enemy) return null;
  const stats=getPlayerStats(state);
  const combat=getEffectiveCombatAttack(state,enemy.weakness,enemy);
  const outcome=combat.attack>enemy.attack?"win":combat.attack===enemy.attack?"tie":"lose";
  const defeatInjuryLevels=Math.max(1,Number(enemy.combatLevel??0)-combat.weaponLevel);
  return {enemy,stats,combat,missing:[],outcome,defeatInjuryLevels,canWin:outcome==="win",tied:outcome==="tie"};
}

function weightedObjectPick(weights,seed,key) {
  return weightedPick(Object.entries(weights).map(([value,weight])=>({value,weight})),seed,key);
}

export function fightEnemy(state, enemyId, sourceNodeId=null, acceptRisk=false) {
  const preview=getCombatPreview(state,enemyId);
  if (!preview) return {ok:false,message:"未知敌人"};
  const {enemy,combat}=preview;
  if(enemy.boss&&state.uniqueDrops.includes(enemyId))return {ok:false,message:`${enemy.name}已经被击败`};
  if (sourceNodeId) {
    const sourceNode=state.areas[state.position].nodes[sourceNodeId];
    if(!sourceNode?.revealed||sourceNode.charges<=0)return {ok:false,message:sourceNode?.respawnRemaining>0?"等待恢复":"这里已经没有这只动物了"};
    const cost=resolveOutdoorCost(state,NODES[state.areas[state.position].nodes[sourceNodeId]?.nodeId]?.stamina??2,acceptRisk,state.position,{weatherExposureEvenWithHouse:true});
    if (!cost.ok) return cost;
  }
  const battleKey=`battle:${state.battleIndex++}:${enemyId}`;
  const won=combat.attack>enemy.attack;
  const tied=combat.attack===enemy.attack;
  const injured=combat.attack<enemy.attack;
  const injuryLevels=injured?preview.defeatInjuryLevels:0;
  if (injured) { inflictInjury(state,injuryLevels); addLog(state,`${enemy.name}使你受伤${injuryLevels}层。`); }
  const loot=[];
  if (won) {
    for (const [itemId,[quantity,chance]] of Object.entries(enemy.drops)) if (randomFromKey(getGameplaySeed(state),`${battleKey}:drop:${itemId}`)<chance) { addItem(state,itemId,quantity); loot.push(`${ITEMS[itemId].name}×${quantity}`); }
    if (enemy.rareChance && randomFromKey(getGameplaySeed(state),`${battleKey}:rare`) < enemy.rareChance) {
      const rareId=weightedObjectPick(enemy.rare,getGameplaySeed(state),`${battleKey}:rare-kind`); addItem(state,rareId,1); loot.push(`${ITEMS[rareId].name}×1（稀有）`);
    }
    if (enemyId === "giant_crab") {
      const largeTrapStack = [state.backpack.cold, state.backpack.ordinary].find(stacks => stacks.some(stack => stack.itemId === "large_trap" && stack.quantity > 0))?.find(stack => stack.itemId === "large_trap" && stack.quantity > 0);
      if (largeTrapStack && randomFromKey(getGameplaySeed(state), `${battleKey}:crab-larva`) < .25) {
        takeFromStack(largeTrapStack, 1);
        addItem(state, "crab_larva", 1);
        loot.push("蟹苗×1");
        addLog(state, "消耗大型捕兽笼×1，成功捕获蟹苗×1。");
      }
    }
    if (sourceNodeId) { const node=state.areas[state.position].nodes[sourceNodeId]; node.charges=0; node.respawnRemaining=0; }
    if(enemy.boss&&!state.uniqueDrops.includes(enemyId))state.uniqueDrops.push(enemyId);
    addLog(state,`击败${enemy.name}，获得${loot.join("、")||"无额外掉落"}。`);
  } else if(tied)addLog(state,`你的有效攻击与${enemy.name}相同，双方僵持后分开。`);
  else addLog(state,`攻击不足，未能击败${enemy.name}。`);
  return {ok:true,won,tied,injured,injuryLevels,loot,message:won?`击败${enemy.name}，获得${loot.join("、")||"无额外掉落"}`:tied?`与${enemy.name}僵持，什么也没有发生`:`未能击败${enemy.name}，受伤${injuryLevels}层`};
}

export function getBuildOptions(state) {
  const areaId = state.position;
  const options = [];
  const houseLevel = state.housesByArea[areaId]?.level ?? 0;
  if (!AREAS[areaId]?.houseBuildable && houseLevel === 0) return options;
  const houseIds = [null,"remote_tent","wood_house","stone_house","brick_house","permanent_shelter"];
  if (houseLevel < 5) options.push([houseIds[houseLevel + 1], BUILDINGS[houseIds[houseLevel + 1]]]);
  if (houseLevel === 0) {
    const definition = BUILDINGS.workbench;
    const existing = state.buildingsByArea[areaId]?.workbench;
    if (state.ownedBlueprintIds.includes(definition.blueprintId ?? "workbench") && !existing?.completed) {
      options.push(["workbench", definition]);
    }
  }
  for (const [id, definition] of Object.entries(BUILDINGS)) {
    if (definition.houseLevel || definition.fixedOnly || definition.plotUpgrade || id === "return_tower") continue;
    if (houseLevel === 0 && !definition.noHouseRequired) continue;
    if (!definition.noBlueprintRequired && !state.ownedBlueprintIds.includes(definition.blueprintId ?? id)) continue;
    if(definition.allowedAreas?.length&&!definition.allowedAreas.includes(areaId))continue;
    if(!hasRequiredFurniture(state,areaId,definition))continue;
    if ((definition.houseTier ?? 0) > houseLevel) continue;
    const replacedByCompletedUpgrade=Object.entries(BUILDINGS).some(([upgradeId,upgrade])=>upgrade.replaces===id&&Object.entries(state.buildingsByArea[areaId]??{}).some(([buildingId,progress])=>buildingId.replace(/__\d+$/u,"")===upgradeId&&progress.completed));
    if(replacedByCompletedUpgrade)continue;
    if(id==="aqueduct_upgraded"&&!Object.entries(state.buildingsByArea[areaId]??{}).some(([bId,progress])=>bId.replace(/__\d+$/u,"")==="aqueduct"&&progress.completed))continue;
    const existing = Object.entries(state.buildingsByArea[areaId]).filter(([key]) => key === id || key.startsWith(`${id}__`));
    let max = definition.maxPerArea ?? 1;
    if ((id === "planting_bed" || id === "grass_field" || id === "corn_field") && completedInstances(state, areaId, "farm_expansion").length > 0) {
      max = 30;
    }
    const unfinished = existing.find(([,value]) => !value.completed);
    if (unfinished) options.push([unfinished[0], definition]);
    else if (existing.length < max) options.push([existing.length ? `${id}__${existing.length + 1}` : id, definition]);
  }
  return options;
}

export function getDistanceToSeawater(areaId = "A1") {
  const r1 = areaId.charCodeAt(0) - 65;
  const c1 = Number(areaId.slice(1)) - 1;
  const SEAWATER_AREAS = ["A6", "B6", "B7", "C5", "C6", "C7", "D7", "E7", "F7"];
  let min = 999;
  for (const sea of SEAWATER_AREAS) {
    const r2 = sea.charCodeAt(0) - 65;
    const c2 = Number(sea.slice(1)) - 1;
    const dist = Math.abs(r1 - r2) + Math.abs(c1 - c2);
    if (dist < min) min = dist;
  }
  return min;
}

export function buildStep(state, buildingId, acceptRisk = false) {
  const baseId = buildingId.replace(/__\d+$/, "");
  const definition = BUILDINGS[baseId];
  if (!definition) return { ok: false, message: "未知工程" };
  if(definition.plotUpgrade)return {ok:false,message:"温室需要在栽培地上升级"};
  if (!getBuildOptions(state).some(([id]) => id === buildingId)) return { ok: false, message: "当前条件不能施工此项目" };
  const areaId = state.position;
  if (!AREAS[areaId].houseBuildable && definition.houseLevel) return { ok: false, message: "此地不能建房" };
  const prerequisiteError=buildingPrerequisiteError(state,areaId,definition);
  if(prerequisiteError)return {ok:false,message:prerequisiteError};
  if(definition.requiredDevice&&!(state.devicesByArea[areaId]??[]).some(device=>device.itemId===definition.requiredDevice))return {ok:false,message:"当地缺少所需生产设备"};
  const progress = state.buildingsByArea[areaId][buildingId] ?? { progress: 0, completed: false };
  if (progress.completed) return { ok: false, message: "已经完成" };
  const baseInputs = baseId === "aqueduct"
    ? { stone_brick: 3 + getDistanceToSeawater(areaId), wood: 3 + getDistanceToSeawater(areaId) }
    : definition.inputs;
  const inputOptions=[baseInputs,...(definition.alternatives??[])];
  const selectedInputs=inputOptions.find(inputs=>hasInputs(state,inputs));
  if (!selectedInputs) return { ok: false, message: "材料不足" };
  const cost = resolveOutdoorCost(state, definition.stamina, acceptRisk);
  if (!cost.ok) return cost;
  consumeInputs(state, selectedInputs);
  if(baseId==="planting_bed")progress.autoFertilize=progress.autoFertilize===true;
  progress.progress += 1;
  if (progress.progress >= definition.steps) {
    progress.completed = true;
    progress.completedOrder = ++state.buildCompletionIndex;
    if(Number(definition.effect?.fuelDaily??0)>0||Number(definition.effect?.power??0)>0||dailyItemResourceRequirements(definition.effect).length>0){progress.enabled=false;progress.fuelPaidDay=0;}
    if (definition.houseLevel) state.housesByArea[areaId] = { level: definition.houseLevel };
    for(const blueprintId of definition.completionBlueprints??[])acquireBlueprint(state,blueprintId,`${definition.name}建成`);
    if(definition.completionItems){
      for(const [itemId, quantity] of Object.entries(definition.completionItems)){
        addItem(state, itemId, quantity, { areaId });
      }
    }
    if(baseId==="stone_house")acquireBlueprint(state,"boatwright_bench","石屋建成");
    if(baseId==="boatwright_bench")acquireBlueprint(state,"kayak","船工台建成");
    addLog(state, `在${areaId} ${AREAS[areaId].name}建好了${definition.name}。`);
  } else addLog(state, `${definition.name}施工${progress.progress}/${definition.steps}。`);
  state.buildingsByArea[areaId][buildingId] = progress;
  if(progress.completed&&definition.replaces)reconcileFacilityUpgrade(state,areaId,baseId);
  unlockHouseSchemes(state);
  progressTasks(state,"build",1);
  return { ok: true, completed: progress.completed };
}
export function getRepairRequirements(state,buildingId){
  const baseId=buildingId.replace(/__\d+$/u,"");
  const definition=BUILDINGS[baseId];
  if(!definition)return null;
  return {inputs:{...definition.inputs},stamina:1};
}

export function repairFacility(state,buildingId,acceptRisk=false){
  const progress=state.buildingsByArea[state.position]?.[buildingId],requirements=getRepairRequirements(state,buildingId);
  if(!progress?.damaged||!requirements)return {ok:false,message:"设施无需修复"};
  if(!hasInputs(state,requirements.inputs))return {ok:false,message:"修复材料不足"};
  const cost=resolveOutdoorCost(state,requirements.stamina,acceptRisk);if(!cost.ok)return cost;
  consumeInputs(state,requirements.inputs);progress.damaged=false;progressTasks(state,"repair",1);return {ok:true};
}

export function reinforceArea(state, acceptRisk=false) {
  if (!state.housesByArea[state.position]?.level) return {ok:false,message:"当前地块还没有可以加固的房子"};
  if ((state.reinforcementByArea[state.position]?.untilDay??0)>=state.day+REINFORCEMENT_DURATION_DAYS-1) return {ok:false,message:"当前地块的临时加固仍完整有效，无需重复加固"};
  const inputs={wood:5,plank:3};
  if (!hasInputs(state,inputs)) return {ok:false,message:"临时加固需要木材×5、木板×3"};
  const cost=resolveOutdoorCost(state,2,acceptRisk);if(!cost.ok)return cost;
  consumeInputs(state,inputs);state.reinforcementByArea[state.position]={untilDay:state.day+REINFORCEMENT_DURATION_DAYS-1};
  return {ok:true,message:`当地从今天起连续${REINFORCEMENT_DURATION_DAYS}天酸雨设施防护和强风设施防护各增加20`};
}

function unlockHouseSchemes(state) {
  const highestLevel = Math.max(0, ...Object.values(state.housesByArea ?? {}).map((house) => house.level));
  state.knownHouseSchemes ??= [1];
  for (let level = 1; level <= Math.min(5, highestLevel + 1); level += 1) {
    if (!state.knownHouseSchemes.includes(level)) state.knownHouseSchemes.push(level);
  }
}

function countItemGlobal(state,itemId) {
  const all=[...state.backpack.cold,...state.backpack.ordinary,...Object.values(state.storageByArea).flat(),...Object.values(state.coldStorageByArea).flat(),...Object.values(state.wardrobeByArea).flat(),...Object.values(state.seedStorageByArea).flat(),...Object.values(state.utilityStorageByArea).flat(),...Object.values(state.groundByArea).flat()];
  return all.filter((stack)=>stack.itemId===itemId).reduce((sum,stack)=>sum+stack.quantity,0);
}

export function selectConsumable(state, itemId) {
  return selectConsumableFrom(state, itemId);
}

export function selectConsumableFrom(state, itemId, sourceKey) {
  const item = ITEMS[itemId];
  if (!item || !["food", "drink"].includes(item.type)) return { ok: false, message: "这不是可直接食用的物品" };
  const field = item.type === "food" ? "selectedFood" : "selectedDrink";
  const current = state[field];
  if (current?.itemId === itemId && (!sourceKey || current.reservation?.sourceKey === sourceKey)) {
    progressTasks(state,item.type==="food"?"select_food":"select_drink",1);
    if((item.happiness??0)>=2)progressTasks(state,item.type==="food"?"select_food_happy":"select_drink_happy",1);
    return { ok: true };
  }
  const reservation = takeMealUnit(state, itemId, sourceKey);
  if (!reservation) return { ok: false, message: "没有可预留的这件物品" };
  const restored = restoreMealReservation(state, current);
  state[field] = { itemId, happiness: item.happiness ?? 0, reservation };
  progressTasks(state,item.type==="food"?"select_food":"select_drink",1);
  if((item.happiness??0)>=2)progressTasks(state,item.type==="food"?"select_food_happy":"select_drink_happy",1);
  return { ok: true, restored };
}

export function clearConsumableSelection(state, kind) {
  if (!["food", "drink"].includes(kind)) return { ok: false, message: "未知饮食类型" };
  const field = kind === "food" ? "selectedFood" : "selectedDrink";
  const restored = restoreMealReservation(state, state[field]);
  state[field] = null;
  return { ok: true, restored };
}

export function consumeSelectedForTrade(state, itemId) {
  const field = state.selectedFood?.itemId === itemId
    ? "selectedFood"
    : state.selectedDrink?.itemId === itemId ? "selectedDrink" : null;
  if (!field || !state[field]?.reservation) return { ok: false, message: "该物品没有被今日饮食预留" };
  const plan = state[field];
  state[field] = null;
  return { ok: true, itemId: plan.itemId, quantity: 1 };
}

function gatherTaskEventForOutput(itemId) {
  return `gather_${itemId}`;
}

function legacyGatherTaskEventForOutput(itemId) {
  if(["wood","hardwood"].includes(itemId))return "gather_wood";
  if(itemId==="stone")return "gather_stone";
  if(["iron_ore","copper_ore","coal","sulfur","corundum","limestone"].includes(itemId))return "gather_ore";
  if(itemId==="grass")return null;
  if(CROPS[itemId]||["apple","mushroom"].includes(itemId))return "gather_food";
  return null;
}

function progressGatherTasksForOutput(state,itemId,quantity){
  const events=new Set([gatherTaskEventForOutput(itemId),legacyGatherTaskEventForOutput(itemId)].filter(Boolean));
  for(const event of events)progressTasks(state,event,quantity);
}

function gatherTaskMatchesOutput(event,itemId) {
  return event===gatherTaskEventForOutput(itemId)||event===legacyGatherTaskEventForOutput(itemId);
}

function getMinimumTravelStaminaByArea(state) {
  const distances=new Map([[state.position,0]]),pending=[state.position];
  while(pending.length){
    pending.sort((left,right)=>distances.get(left)-distances.get(right));
    const areaId=pending.shift(),distance=distances.get(areaId);
    for(const neighbor of getNeighbors(areaId)){
      if(!state.areas[neighbor]?.opened||(KAYAK_REQUIRED_AREAS.has(neighbor)&&!hasBackpackItem(state,"kayak")))continue;
      const next=distance+getOutdoorActionPreview(state,1,areaId).totalStamina;
      if(next>=(distances.get(neighbor)??Infinity))continue;
      distances.set(neighbor,next);
      if(!pending.includes(neighbor))pending.push(neighbor);
    }
  }
  return distances;
}

function minimumGatherTaskStamina(state,event,target,travelStaminaByArea=getMinimumTravelStaminaByArea(state)) {
  if(target<=0)return 0;
  let minimum=Infinity;
  for(const [areaId,area] of Object.entries(state.areas)){
    if(!area.opened)continue;
    const travelStamina=travelStaminaByArea.get(areaId)??Infinity;
    if(!Number.isFinite(travelStamina))continue;
    const areaState=areaId===state.position?state:{...state,position:areaId};
    for(const nodeState of Object.values(area.nodes??{})){
      const node=NODES[nodeState.nodeId];
      if(!nodeState.revealed||!node||DAILY_GATHER_EXCLUDED_NODES.has(nodeState.nodeId)||!gatherTaskMatchesOutput(event,node.output))continue;
      if(nodeState.charges!==null&&nodeState.charges<target)continue;
      const methods=getNodeMethods(areaState,nodeState.id);
      if(!methods.length)continue;
      const quantity=Math.max(...methods.map(method=>method.quantity));
      const actions=Math.ceil(target/quantity);
      const gatherStamina=getOutdoorActionPreview(areaState,node.stamina,areaId).totalStamina*actions;
      minimum=Math.min(minimum,travelStamina+gatherStamina);
    }
    const plots=(state.plotsByArea[areaId]??[]).filter(plot=>CROPS[plot.cropId]&&plot.phase==="ready"&&plot.charges>0&&gatherTaskMatchesOutput(event,plot.cropId));
    if(!plots.length)continue;
    const quantity=getCultivatedHarvestMethod(areaState).quantity,harvests=[];
    for(const plot of plots){
      const fullHarvests=Math.min(Math.floor(plot.charges/quantity),Math.ceil(target/quantity));
      for(let action=0;action<fullHarvests;action+=1)harvests.push(quantity);
      if(plot.charges%quantity)harvests.push(plot.charges%quantity);
    }
    harvests.sort((left,right)=>right-left);
    let gathered=0,actions=0;
    for(const amount of harvests){gathered+=amount;actions+=1;if(gathered>=target)break;}
    if(gathered>=target)minimum=Math.min(minimum,travelStamina+actions*.5);
  }
  return minimum;
}

function dailyGatherTaskTarget(itemId) {
  if(["iron_ore","copper_ore","coal","sulfur","corundum","limestone","crude_oil","clean_ice","thunder_glass"].includes(itemId))return 1;
  if(["food","foodIngredient"].includes(ITEMS[itemId]?.type))return 2;
  return 3;
}

function getDailyGatherTaskTemplates(state) {
  const outputIds=new Set();
  for(const area of Object.values(state.areas)){
    if(!area.opened)continue;
    for(const nodeState of Object.values(area.nodes??{})){
      const node=NODES[nodeState.nodeId],item=node&&ITEMS[node.output];
      if(!nodeState.revealed||!node||!item||DAILY_GATHER_EXCLUDED_NODES.has(nodeState.nodeId)||["livestock","unique"].includes(item.type))continue;
      const target=dailyGatherTaskTarget(node.output);
      if(nodeState.charges===null||nodeState.charges>=target)outputIds.add(node.output);
    }
  }
  for(const [areaId,plots] of Object.entries(state.plotsByArea)){
    if(!state.areas[areaId]?.opened)continue;
    const available=new Map();
    for(const plot of plots)if(CROPS[plot.cropId]&&plot.phase==="ready"&&plot.charges>0)available.set(plot.cropId,(available.get(plot.cropId)??0)+plot.charges);
    for(const [itemId,quantity] of available)if(quantity>=dailyGatherTaskTarget(itemId))outputIds.add(itemId);
  }
  const travelStaminaByArea=getMinimumTravelStaminaByArea(state);
  return [...outputIds].map(itemId=>{
    const target=dailyGatherTaskTarget(itemId),event=gatherTaskEventForOutput(itemId);
    const staminaCost=minimumGatherTaskStamina(state,event,target,travelStaminaByArea);
    return {id:event,family:"采集",text:`采集${ITEMS[itemId].name}${target}份`,target,event,outdoor:true,staminaCost,ok:()=>Number.isFinite(staminaCost)};
  });
}

function minimumBuildTaskStamina(state) {
  const areaId=state.position,costs=[];
  for(const [,definition] of getBuildOptions(state)){
    if(buildingPrerequisiteError(state,areaId,definition))continue;
    if(definition.requiredDevice&&!(state.devicesByArea[areaId]??[]).some(device=>device.itemId===definition.requiredDevice))continue;
    if(![definition.inputs,...(definition.alternatives??[])].some(inputs=>hasInputs(state,inputs)))continue;
    costs.push(getOutdoorActionPreview(state,definition.stamina).totalStamina);
  }
  for(const stage of RETURN_STAGES)if(getReturnStageAvailability(state,stage.id).ok)costs.push(getOutdoorActionPreview(state,stage.stamina).totalStamina);
  return costs.length?Math.min(...costs):Infinity;
}

function calculateDailyTaskStaminaCost(state,task) {
  if(task.event==="explore")return getOutdoorActionPreview(state,3).totalStamina*task.target;
  if(task.event.startsWith("gather_"))return minimumGatherTaskStamina(state,task.event,Math.max(0,task.target-(task.progress??0)));
  if(task.event==="build")return minimumBuildTaskStamina(state)*task.target;
  if(task.event==="water")return .2*task.target;
  if(task.event==="feed")return FEED_ANIMALS_STAMINA_COST*task.target;
  if(task.event==="repair")return getOutdoorActionPreview(state,1).totalStamina*task.target;
  return 0;
}

function dailyTaskStaminaCost(state,task) {
  if(Number(task.progress??0)>=Number(task.target))return 0;
  return task.staminaCost??calculateDailyTaskStaminaCost(state,task);
}

export function getDailyTaskStaminaRequirement(state,tasks=state.dailyTasks) {
  const eventCosts=new Map();
  for(const task of tasks??[]){
    const cost=dailyTaskStaminaCost(state,task);
    eventCosts.set(task.event,Math.max(eventCosts.get(task.event)??0,cost));
  }
  return [...eventCosts.values()].reduce((sum,cost)=>sum+cost,0);
}

function chooseBudgetedDailyTasks(state,candidates,budget) {
  const combinations=[];
  for(let first=0;first<candidates.length-2;first++)for(let second=first+1;second<candidates.length-1;second++)for(let third=second+1;third<candidates.length;third++){
    const tasks=[candidates[first],candidates[second],candidates[third]];
    if(getDailyTaskStaminaRequirement(state,tasks)<=budget)combinations.push(tasks);
  }
  if(!combinations.length)return [];
  const maxFamilies=Math.max(...combinations.map(tasks=>new Set(tasks.map(task=>task.family)).size));
  return pickFromKey(combinations.filter(tasks=>new Set(tasks.map(task=>task.family)).size===maxFamilies),getGameplaySeed(state),`task-budget:${state.day}`)??[];
}

function getDailyTaskText(task){
  if(task?.event==="cook"||task?.id==="prod_cook")return `烹饪${task.target}次`;
  if(String(task?.event??"").startsWith("gather_")){
    const itemId=task.event.slice("gather_".length),item=ITEMS[itemId];
    if(item)return `采集${item.name}${task.target}份`;
  }
  const fixed={
    plan_food:"设定今日食物",plan_drink:"设定今日饮料",
    plan_food_happy:"设定幸福度不小于2的今日食物",plan_drink_happy:"设定幸福度不小于2的今日饮料",
    env_comfort:"结束今天时体温处于舒适状态",env_house:"结束今天时位于有房地块",
    prod_process:"完成1次加工",prod_craft:"完成1次制作",
    build_step:"完成1次施工",explore_once:"完成1次探索",
    manage_water:"给家养资源点浇水1次",manage_feed:"喂养任意栏舍",manage_harvest:"收获家养资源点1次",
    maintain_stamina:"结束今天时剩余体力不小于1",maintain_repair:"修复1个设施",maintain_device:"开启环境设备并结束今天"
  };
  if(task?.id==="explore_three")return `完成${task.target}次探索`;
  return fixed[task?.id]??task?.text??String(task?.id??"");
}

export function generateDailyTasks(state) {
  const peak=getBaseTemperature(state.day,state.seed)<=-10||getBaseTemperature(state.day,state.seed)>=50;
  const templates=[
    {id:"plan_food",family:"饮食",text:"设定今日食物",target:1,event:"select_food",ok:()=>mealLocations(state).some(l=>l.stacks.some(s=>ITEMS[s.itemId]?.type==="food"))},{id:"plan_drink",family:"饮食",text:"设定今日饮料",target:1,event:"select_drink",ok:()=>mealLocations(state).some(l=>l.stacks.some(s=>ITEMS[s.itemId]?.type==="drink"))},
    {id:"plan_food_happy",family:"饮食",text:"设定幸福度不小于2的今日食物",target:1,event:"select_food_happy",threshold:2,ok:()=>mealLocations(state).some(l=>l.stacks.some(s=>ITEMS[s.itemId]?.type==="food"&&(ITEMS[s.itemId].happiness??0)>=2))},
    {id:"plan_drink_happy",family:"饮食",text:"设定幸福度不小于2的今日饮料",target:1,event:"select_drink_happy",threshold:2,ok:()=>mealLocations(state).some(l=>l.stacks.some(s=>ITEMS[s.itemId]?.type==="drink"&&(ITEMS[s.itemId].happiness??0)>=2))},
    {id:"env_comfort",family:"环境",text:"结束今天时体温处于舒适状态",target:1,event:"comfort",endOfDay:true,ok:()=>getTemperatureBand(getFeltTemperature(state)).id!=="lethal"},{id:"env_house",family:"环境",text:"结束今天时位于有房地块",target:1,event:"end_in_house",endOfDay:true,ok:()=>Object.keys(state.housesByArea).length>0},
    {id:"prod_cook",family:"生产",text:"烹饪1次",target:1,event:"cook",ok:()=>Object.values(RECIPES).some(r=>recipeActionLabel(r)==="烹饪"&&getRecipeAvailability(state,r.id).ok)},{id:"prod_process",family:"生产",text:"完成1次加工",target:1,event:"process",ok:()=>Object.values(RECIPES).some(r=>r.category==="process"&&getRecipeAvailability(state,r.id).ok)},{id:"prod_craft",family:"生产",text:"完成1次制作",target:1,event:"craft",ok:()=>Object.values(RECIPES).some(r=>["craft","equipment","furniture","device"].includes(r.category)&&getRecipeAvailability(state,r.id).ok)},
    {id:"build_step",family:"施工",text:"完成1次施工",target:1,event:"build",outdoor:true,ok:()=>Number.isFinite(minimumBuildTaskStamina(state))},
    ...getDailyGatherTaskTemplates(state),
    {id:"explore_once",family:"探索",text:"完成1次探索",target:1,event:"explore",outdoor:true,ok:()=>true},{id:"explore_three",family:"探索",text:"完成3次探索",target:3,event:"explore",outdoor:true,ok:()=>state.player.maxStamina>=9},
    {id:"manage_water",family:"经营",text:"给家养资源点浇水1次",target:1,event:"water",outdoor:true,ok:()=>state.plotsByArea[state.position].some(p=>!p.watered&&p.phase!=="ready")&&countItem(state,"water")>0},{id:"manage_feed",family:"经营",text:"喂养任意栏舍",target:1,event:"feed",outdoor:true,ok:()=>Object.keys(ANIMAL_PEN_IDS).some(type=>getAnimalPenSlots(state,type).some(canFeedAnimalPen))},{id:"manage_harvest",family:"经营",text:"收获家养资源点1次",target:1,event:"harvest",outdoor:true,ok:()=>state.plotsByArea[state.position].some(p=>p.phase==="ready"&&p.charges>0)},
    {id:"maintain_stamina",family:"维护",text:"结束今天时剩余体力不小于1",target:1,event:"stamina_end",endOfDay:true,ok:()=>true},{id:"maintain_device",family:"维护",text:"开启环境设备并结束今天",target:1,event:"device_end",endOfDay:true,ok:()=>state.furnitureByArea[state.position].some(f=>FURNITURE[f.itemId]?.switchable&&f.enabled!==false)}
  ];
  const immediate=[];
  for(const template of templates){
    if(template.endOfDay||!template.ok())continue;
    const staminaCost=dailyTaskStaminaCost(state,template);
    if(Number.isFinite(staminaCost))immediate.push({...template,staminaCost});
  }
  let candidates=immediate.filter(t=>!peak||!t.outdoor);
  if(candidates.length<3)candidates=[...candidates,...immediate.filter(t=>!candidates.includes(t))];
  const priorities=peak?["饮食","生产","维护","施工","采集","探索","经营"]:["饮食","生产","施工","采集","探索","经营","维护"];
  const hasFirstHouse=Object.values(state.housesByArea).some(house=>house?.level>=1);
  const taskBudget=hasFirstHouse?state.player.maxStamina:Math.min(9,state.player.maxStamina);
  const chosen=[];
  if(hasFirstHouse){
    for(let i=0;i<priorities.length&&chosen.length<3;i++){const family=priorities[(i+Math.floor(randomFromKey(getGameplaySeed(state),`task-family:${state.day}`)*priorities.length))%priorities.length];if(chosen.some(t=>t.family===family))continue;const pool=candidates.filter(t=>t.family===family);if(pool.length){const {ok,outdoor,...plain}=pickFromKey(pool,getGameplaySeed(state),`task:${state.day}:${family}`);chosen.push(plain);}}
    const remaining=candidates.filter(t=>!chosen.some(entry=>entry.id===t.id));
    while(chosen.length<3&&remaining.length){const picked=pickFromKey(remaining,getGameplaySeed(state),`task-fill:${state.day}:${chosen.length}`);chosen.push(picked);remaining.splice(remaining.indexOf(picked),1);}
    if(chosen.length<3||getDailyTaskStaminaRequirement(state,chosen)>taskBudget)chosen.length=0;
  }
  if(chosen.length<3){
    const concentratedExplore=candidates.find(task=>task.id==="explore_three");
    for(const target of [3,2,1]){
      if(concentratedExplore){concentratedExplore.target=target;concentratedExplore.text=`完成${target}次探索`;concentratedExplore.staminaCost=calculateDailyTaskStaminaCost(state,concentratedExplore);}
      chosen.push(...chooseBudgetedDailyTasks(state,candidates,taskBudget));
      if(chosen.length===3)break;
    }
  }
  return chosen.slice(0,3).map(({ok,outdoor,endOfDay,staminaCost,...task})=>({...task,progress:0}));
}

function progressTasks(state, event, amount) {
  for (const task of state.dailyTasks) if (task.event === event) task.progress = Math.min(task.target, task.progress + amount);
}

export function claimDailyTaskReward(state) {
  if (state.dailyRewardClaimed) return { ok: false, message: "今天的十连抽已经领取过了" };
  if (!state.dailyTasks?.length || !state.dailyTasks.every((task) => task.progress >= task.target)) return { ok: false, message: "完成三个每日任务后才能抽取奖励" };
  const rewards = drawLottery(state);
  state.dailyRewardClaimed = true;
  state.lastLottery = null;
  addLog(state, `领取每日任务十连抽：获得${rewards.filter((reward) => reward.type === "blueprint").length}张蓝图和${rewards.filter((reward) => reward.type === "material").length}组素材。`);
  return { ok: true, rewards };
}

function drawLottery(state) {
  const rewards = [];
  for (let slot = 0; slot < 10; slot += 1) {
    const drawIndex = state.lotteryDrawIndex++;
    // 前九抽所得与已预留饮用的水也算已有水；仅第十抽在仍缺水时补偿。
    const noWaterLastDraw=slot===9&&countItem(state,"water")<=0&&!(state.selectedDrink?.itemId==="water"&&state.selectedDrink.reservation);
    const waterAssist=noWaterLastDraw&&randomFromKey(getGameplaySeed(state),`lottery-water:${drawIndex}`)<DAILY_LOTTERY_WATER_ASSIST_CHANCE;
    const unowned = LOTTERY_BLUEPRINTS.filter((bp) => !state.ownedBlueprintIds.includes(bp.id)&&lotteryPrerequisitesMet(state,bp));
    const guaranteeCandidateIds=slot===0?new Set(getDailyProgressGuaranteeBlueprintIds(state)):null;
    const guaranteeCandidates=guaranteeCandidateIds?unowned.filter(blueprint=>guaranteeCandidateIds.has(blueprint.id)):[];
    if (!waterAssist && unowned.length && (guaranteeCandidates.length||randomFromKey(getGameplaySeed(state), `lottery-kind:${drawIndex}`) < 0.3)) {
      const candidates=guaranteeCandidates.length?guaranteeCandidates:unowned;
      const playerTier=Math.max(...state.knownHouseSchemes);
      const pity=(state.normalBlueprintsWon+1)%5===0?candidates.filter(entry=>entry.progression&&entry.tier<=playerTier):[];
      const blueprint=pity.length?pickFromKey(pity,getGameplaySeed(state),`lottery-pity:${drawIndex}`):weightedPick(candidates.map((entry) => { const delta=Math.max(0,entry.tier-playerTier); const base=delta===0?100:delta===1?20:delta===2?4:1; return { value:entry,weight:base*(entry.progression&&entry.tier<=playerTier?3:1)}; }),getGameplaySeed(state),`lottery-blueprint:${drawIndex}`);
      acquireBlueprint(state,blueprint.id,"每日任务");
      state.normalBlueprintsWon += 1;
      rewards.push({ type: "blueprint", id: blueprint.id, name: blueprint.name, ...(guaranteeCandidates.length?{progressGuarantee:true}:{}) });
    } else {
      // 未命中的另一半排除普通池里的水，确保缺水时该奖品恰为50%概率出水。
      const materialWeights=noWaterLastDraw?DAILY_LOTTERY_NON_WATER_MATERIAL_WEIGHTS:DAILY_LOTTERY_MATERIAL_WEIGHTS;
      const itemId = waterAssist?"water":weightedObjectPick(materialWeights,getGameplaySeed(state),`lottery-material:${drawIndex}`);
      const quantity = 1 + Math.floor(randomFromKey(getGameplaySeed(state), `lottery-quantity:${drawIndex}`) * 5);
      addItem(state, itemId, quantity);
      rewards.push({ type: "material", itemId, name: ITEMS[itemId].name, quantity });
    }
  }
  return rewards;
}

export function acquireBlueprint(state,blueprintId,source="未知来源") {
  if(state.ownedBlueprintIds.includes(blueprintId))return false;
  state.ownedBlueprintIds.push(blueprintId);
  for(const offer of state.tradeOffers??[])if(offer.give?.type==="blueprint"&&offer.give.id===blueprintId)offer.withdrawn=true;
  const bp=BLUEPRINTS.find(entry=>entry.id===blueprintId);addLog(state,`从${source}获得蓝图：${bp?.name??blueprintId}。`);return true;
}

export const PROCESSED_TRADE_MATERIAL_IDS=Object.freeze(["plank","leather","bone_glue","iron_ingot","copper_ingot","glass","steel","copper_wire","gear"]);
export const PRIMARY_PROCESSED_TRADE_MATERIAL_IDS=Object.freeze(["rope","firewood","charcoal","stone_brick","brick","lime","cement","concrete","glass_panel","beeswax","wool_cloth","cotton_cloth","linen_cloth","rubber","fuel","feed","fertilizer","corundum_abrasive"]);
const COMMON_ANIMAL_TRADE_MATERIAL_IDS=Object.freeze(["wool","feather","small_fur","tendon","large_bone","animal_fat","cattle_pelt","pig_pelt"]);
// 战斗掉落、狩猎副产物和家畜产物不会被天然资源点主产物集合自动收录。
const BASIC_TRADE_MATERIAL_IDS=new Set([...RAW_BASIC_MATERIAL_IDS,"venom",...COMMON_ANIMAL_TRADE_MATERIAL_IDS,...PROCESSED_TRADE_MATERIAL_IDS,...PRIMARY_PROCESSED_TRADE_MATERIAL_IDS]);
export const NPC_BLUEPRINT_REPLACEMENT_CATEGORIES=Object.freeze({
  npc_02:Object.freeze(["工具"]),npc_09:Object.freeze(["基础素材"]),
  npc_10:Object.freeze(["工具"]),npc_20:Object.freeze(["种子"]),
  npc_26:Object.freeze(["工具","加工素材"])
});
const itemTierCache=new Map();
function itemTier(itemId){if(itemTierCache.has(itemId))return itemTierCache.get(itemId);const tier=RECIPES[itemId]?.tier??Object.values(RECIPES).find(r=>r.output?.itemId===itemId||r.outputs?.some(o=>o.itemId===itemId))?.tier??1;itemTierCache.set(itemId,tier);return tier;}
const tradeUpgradeCandidatesCache=new Map();
const TRADE_ARMOR_EFFECT_KEYS=["warmth","heat","rain","storm","rainStaminaReduction"];
function tradeUpgradeCandidates(itemId){
  if(tradeUpgradeCandidatesCache.has(itemId))return tradeUpgradeCandidatesCache.get(itemId);
  const item=ITEMS[itemId];
  const candidates=Object.entries(ITEMS).filter(([ownedId,owned])=>{
    if(ownedId===itemId||owned.type!==item?.type)return false;
    if(item.type==="tool")return Boolean(item.toolType)&&owned.toolType===item.toolType&&itemTier(ownedId)>itemTier(itemId);
    if(item.type==="weapon")return owned.weaponStyle===item.weaponStyle&&Number(owned.weaponLevel)>Number(item.weaponLevel);
    if(item.type==="armor")return owned.slot===item.slot&&(EQUIPMENT[ownedId]?.tier??itemTier(ownedId))>(EQUIPMENT[itemId]?.tier??itemTier(itemId))&&TRADE_ARMOR_EFFECT_KEYS.every(key=>Number(owned.env?.[key]??0)>=Number(item.env?.[key]??0));
    if(item.type==="backpack"){
      const keys=["ordinary","cold"];
      return keys.every(key=>Number(owned.backpackCapacity?.[key]??0)>=Number(item.backpackCapacity?.[key]??0))&&keys.some(key=>Number(owned.backpackCapacity?.[key]??0)>Number(item.backpackCapacity?.[key]??0));
    }
    return false;
  }).map(([id])=>id);
  tradeUpgradeCandidatesCache.set(itemId,candidates);
  return candidates;
}
// 日结明细的前两项固定为实际吃、喝的幸福度，今日预留和总幸福度不作为供货下限。
export function getYesterdayDietHappiness(state,kind){
  const index=kind==="food"?0:kind==="drink"?1:-1,breakdown=state.happinessBreakdown;
  if(index<0||state.day<=1||breakdown?.day!==state.day-1)return null;
  const entry=breakdown.entries?.[index];
  if(!entry||entry.label===(kind==="food"?"未进食":"未饮水"))return null;
  return Number.isFinite(entry.value)?entry.value:null;
}
const TRADE_DIET_HAZARD_EFFECT_KEYS={cold_wave:"warmth",heat:"heat",rain:"rain",storm:"storm"};
export function isOutdatedNpcTradeGive(state,give){
  if(give?.type!=="item")return false;
  const item=ITEMS[give.id];
  if(["food","drink"].includes(item?.type)){
    const minimum=getYesterdayDietHappiness(state,item.type);
    if(minimum===null||Number(item.happiness??0)>=minimum)return false;
    const weather=getWeather(state);
    return !Object.entries(TRADE_DIET_HAZARD_EFFECT_KEYS).some(([hazard,key])=>hasWeatherHazard(weather,hazard)&&Number(item.nextDayEffect?.[key]??0)>0);
  }
  if(!["tool","weapon","armor","backpack"].includes(item?.type))return false;
  const upgrades=tradeUpgradeCandidates(give.id);
  if(!upgrades.length)return false;
  const equipped=Object.values(state.player?.equipment??{});
  if(upgrades.some(id=>equipped.includes(id)))return true;
  const collections=[state.backpack?.cold??[],state.backpack?.ordinary??[],...Object.values(state.storageByArea??{}),...Object.values(state.coldStorageByArea??{}),...Object.values(state.wardrobeByArea??{}),...Object.values(state.utilityStorageByArea??{}),...Object.values(state.groundByArea??{})];
  return collections.some(stacks=>stacks.some(stack=>Number(stack.quantity)>0&&upgrades.includes(stack.itemId)));
}
export function getTradeCategoryItemIds(label,state,forNpc=false){
  const tier=Math.min(5,Math.max(...state.knownHouseSchemes)+1);
  const entries=Object.entries(ITEMS).filter(([id,item])=>item.tradeable!==false&&!item.unique&&itemTier(id)<=tier);
  const has=(word)=>label.includes(word);
  let ids;
  if(has("基础素材"))ids=entries.filter(([id,item])=>BASIC_TRADE_MATERIAL_IDS.has(id)&&!item.tradeCategories?.includes("food")).map(([id])=>id);
  else if(has("加工素材"))ids=entries.filter(([id])=>PROCESSED_TRADE_MATERIAL_IDS.includes(id)).map(([id])=>id);
  else if(has("珍稀素材"))ids=entries.filter(([,i])=>i.type==="rareMaterial").map(([id])=>id);
  else if(has("种子"))ids=entries.filter(([,i])=>i.type==="seed").map(([id])=>id);
  else if(has("工具"))ids=entries.filter(([,i])=>i.type==="tool").map(([id])=>id);
  else if(has("家具"))ids=entries.filter(([,i])=>i.type==="furniture").map(([id])=>id);
  else if(has("武器"))ids=entries.filter(([,i])=>i.type==="weapon").map(([id])=>id);
  else if(has("装备"))ids=entries.filter(([,i])=>["armor","backpack"].includes(i.type)).map(([id])=>id);
  else if(has("美食"))ids=entries.filter(([,i])=>(i.type==="food"&&(i.happiness??0)>0)||i.tradeCategories?.includes("food")).map(([id])=>id);
  else if(has("食材"))ids=entries.filter(([,i])=>["foodIngredient","food"].includes(i.type)||i.tradeCategories?.includes("food")).map(([id])=>id);
  else ids=["wood","stone","grass"];
  ids=ids.filter(id=>ITEMS[id]&&(forNpc||countItemGlobal(state,id)>0));
  return [...new Set(ids)];
}

function splitTendency(value){return String(value??"").split(/[、/]/).map(s=>s.trim()).filter(Boolean);}
function npcBlueprintReplacementItemIds(state,npc){
  return [...new Set((NPC_BLUEPRINT_REPLACEMENT_CATEGORIES[npc.id]??["基础素材"]).flatMap(label=>getTradeCategoryItemIds(label,state,true)))];
}
const fixedTradeTypes=new Set(["tool","weapon","armor","backpack","furniture","device"]);
const BASIC_MATERIAL_TRADE_TYPES=new Set(["material","fuel"]);
const FOOD_TRADE_TYPES=new Set(["food","foodIngredient","drink"]);
function isFoodTradeItem(itemId){const item=ITEMS[itemId];return FOOD_TRADE_TYPES.has(item?.type)||Boolean(item?.tradeCategories?.includes("food"));}
function isBasicMaterialTradeItem(itemId){return BASIC_MATERIAL_TRADE_TYPES.has(ITEMS[itemId]?.type)&&!isFoodTradeItem(itemId);}
const FIXED_GOOD_MINIMUM_PAYMENTS=[0,4,6,9,12,15];
function dailyTradeCap(day){return day<=30?5:day<=70?10:20;}
function stageTradeableItems(state){const tier=Math.min(5,Math.max(...state.knownHouseSchemes)+1);return Object.entries(ITEMS).filter(([id,item])=>item.tradeable!==false&&!item.unique&&itemTier(id)<=tier).map(([id])=>id);}
const TRADE_SPECIAL_NODE_OUTPUTS={grassland:["herb"]};

export function getReachableTradeItemIds(state){
  const openedAreas=new Set(Object.entries(state.areas??{}).filter(([,area])=>area?.opened).map(([areaId])=>areaId));
  const reachable=new Set();
  for(const areaId of openedAreas){
    for(const node of Object.values(state.areas[areaId]?.nodes??{})){
      const nodeId=node.nodeId??node.id,definition=NODES[nodeId],output=definition?.output;
      for(const itemId of definition?.randomOutputs?.map(entry=>entry.itemId)??[output])if(itemId&&ITEMS[itemId])reachable.add(itemId);
      for(const itemId of Object.keys(definition?.huntDrops??{}))if(ITEMS[itemId])reachable.add(itemId);
      if(definition?.captureOutput&&ITEMS[definition.captureOutput])reachable.add(definition.captureOutput);
      for(const itemId of TRADE_SPECIAL_NODE_OUTPUTS[nodeId]??[])if(ITEMS[itemId])reachable.add(itemId);
    }
  }
  for(const [enemyId,enemy] of Object.entries(ENEMIES)){
    const available=enemy.area?openedAreas.has(enemy.area):getActiveAttackAreasForEnemy(enemyId).some(areaId=>openedAreas.has(areaId));
    if(!available)continue;
    for(const itemId of Object.keys(enemy.drops??{}))if(ITEMS[itemId])reachable.add(itemId);
    for(const itemId of Object.keys(enemy.rare??{}))if(ITEMS[itemId])reachable.add(itemId);
  }
  let changed=true;
  while(changed){
    changed=false;
    for(const livestock of Object.values(LIVESTOCK)){
      if(!reachable.has(livestock.youngItem))continue;
      for(const itemId of Object.keys(livestock.continuous??{}))if(ITEMS[itemId]&&!reachable.has(itemId)){reachable.add(itemId);changed=true;}
    }
    for(const recipe of Object.values(RECIPES)){
      const inputOptions=[recipe.inputs,...(recipe.alternatives??[])].filter(Boolean);
      if(!inputOptions.some(inputs=>Object.keys(inputs).every(itemId=>reachable.has(itemId))))continue;
      const outputs=[...(recipe.outputs??(recipe.output?[recipe.output]:[])),...(recipe.bonusOutput?[recipe.bonusOutput]:[])];
      for(const output of outputs)if(output?.itemId&&ITEMS[output.itemId]&&!reachable.has(output.itemId)){reachable.add(output.itemId);changed=true;}
    }
  }
  const stageItems=new Set(stageTradeableItems(state));
  return [...reachable].filter(itemId=>stageItems.has(itemId)).sort();
}

export function getNpcReachableWantIds(state,npc){
  const reachable=getReachableTradeItemIds(state),reachableSet=new Set(reachable);
  const preferred=[...new Set(splitTendency(npc?.want).flatMap(label=>getTradeCategoryItemIds(label,state,true)).filter(itemId=>reachableSet.has(itemId)))];
  return preferred.length?preferred:reachable;
}

function isOutdatedNpcTradeWant(state,offer){
  if(!UPDATED_NPC_WANT_IDS.has(offer.npcId)||offer.weatherPrepared||offer.weatherBuyback||Number(offer.npcWantRuleVersion??0)>=NPC_WANT_RULE_VERSION)return false;
  const npc=CHARACTERS.find(entry=>entry.id===offer.npcId);
  return !getNpcReachableWantIds(state,npc).includes(offer.want?.id);
}

function tradeUnitValue(entry,state){
  if(entry.type==="blueprint")return getBlueprintBarterValue(entry.id);
  // 天气临时估价适用于交易两侧，不改变素材、配方成本或蓝图的隐藏基础价值。
  const coldBlanket=entry.id==="wool_blanket"&&getWeather(state).temperature<0;
  return getBarterValue(entry.id)*(coldBlanket?COLD_WOOL_BLANKET_PRICE_MULTIPLIER:1);
}
function tradePairKey(giveId,wantId){return `${giveId}>${wantId}`;}
function hasReverseTradePair(give,wantId,reservedTradePairs){return give?.type==="item"&&reservedTradePairs.has(tradePairKey(wantId,give.id));}
function reserveTradePair(reservedTradePairs,offer){if(offer?.give?.type==="item"&&offer.want?.id)reservedTradePairs.add(tradePairKey(offer.give.id,offer.want.id));}
function isActiveRareMaterialWant(offer){return Boolean(offer&&!offer.completed&&!offer.withdrawn&&ITEMS[offer.want?.id]?.type==="rareMaterial");}
function isForbiddenNpcTradeGive(give){return give?.type==="item"&&ITEMS[give.id]?.type==="rareMaterial";}
export function isForbiddenTradeOffer(offer){
  if(!["item","blueprint"].includes(offer?.give?.type))return true;
  const itemIds=offer?.give?.type==="item"?[offer.give.id,offer.want?.id]:[offer?.want?.id];
  return itemIds.some(itemId=>!ITEMS[itemId]||ITEMS[itemId].tradeable===false||ITEMS[itemId].unique||ITEMS[itemId].type==="unique");
}
function isForbiddenMultiSideTrade(giveQuantity,wantQuantity){return giveQuantity>1&&wantQuantity>1;}
function isSameStyleWeaponTrade(give,wantId){
  if(give?.type!=="item")return false;
  const offered=ITEMS[give.id],wanted=ITEMS[wantId];
  return offered?.type==="weapon"&&wanted?.type==="weapon"&&["melee","ranged"].includes(offered.weaponStyle)&&offered.weaponStyle===wanted.weaponStyle;
}
export function getNpcTradeDiscount(state,npcId){
  const favor=Math.max(0,Number(state.relations?.[npcId]?.favor??0));
  return Math.min(MAX_NPC_TRADE_DISCOUNT,favor/MAX_NPC_TRADE_DISCOUNT_FAVOR*MAX_NPC_TRADE_DISCOUNT);
}
function minimumFixedGoodPaymentQuantity(state,give,wantId,npc,priceMultiplier=GLOBAL_TRADE_PRICE_MULTIPLIER,relationshipDiscount=getNpcTradeDiscount(state,npc.id)){
  const durableGive=give?.type==="item"&&fixedTradeTypes.has(ITEMS[give.id]?.type),wantFixed=fixedTradeTypes.has(ITEMS[wantId]?.type)||ITEMS[wantId]?.type==="rareMaterial";
  if(!durableGive||wantFixed)return 1;
  const tier=Math.min(5,Math.max(1,itemTier(give.id)));
  return Math.max(1,Math.ceil(FIXED_GOOD_MINIMUM_PAYMENTS[tier]*priceMultiplier*(1-relationshipDiscount)));
}
function fairTradeQuantities(state,give,wantId,npc,key,quantityCap=dailyTradeCap(state.day),priceMultiplier=GLOBAL_TRADE_PRICE_MULTIPLIER){
  if(isForbiddenTradeOffer({give,want:{id:wantId}})||isForbiddenNpcTradeGive(give)||isOutdatedNpcTradeGive(state,give)||isSameStyleWeaponTrade(give,wantId))return null;
  const giveFixed=give.type==="blueprint"||fixedTradeTypes.has(ITEMS[give.id]?.type);
  const giveBasic=give.type==="item"&&isBasicMaterialTradeItem(give.id);
  const giveBulkBasicOrFood=giveBasic||(give.type==="item"&&isFoodTradeItem(give.id));
  const wantFixed=fixedTradeTypes.has(ITEMS[wantId]?.type)||ITEMS[wantId]?.type==="rareMaterial";
  const relationshipDiscount=getNpcTradeDiscount(state,npc.id),minimumWantQuantity=minimumFixedGoodPaymentQuantity(state,give,wantId,npc,priceMultiplier),coefficient=(npc.coefficient??1)/(1-relationshipDiscount);
  // 给出价值的100%～120%区间只除以价格倍率，不能把整个区间取倒数。
  const minimumRatio=1/priceMultiplier,maximumRatio=1.2/priceMultiplier,giveUnitValue=tradeUnitValue(give,state),wantUnitValue=tradeUnitValue({type:"item",id:wantId},state);
  const blueprintQuantityNeeded=give.type==="blueprint"?Math.ceil(giveUnitValue/(wantUnitValue*coefficient*minimumRatio)):0;
  const blueprintPaymentCap=give.type==="blueprint"?Math.max(quantityCap,blueprintQuantityNeeded):quantityCap;
  const bulkGiveQuantityNeeded=!giveFixed&&wantFixed?Math.ceil(wantUnitValue*minimumWantQuantity*coefficient*minimumRatio/giveUnitValue):0;
  const fixedGoodPaymentNeeded=giveFixed&&!wantFixed?Math.ceil(giveUnitValue/(wantUnitValue*coefficient*minimumRatio)):0;
  const cap=Math.max(blueprintPaymentCap,minimumWantQuantity,bulkGiveQuantityNeeded,fixedGoodPaymentNeeded),giveAmounts=giveFixed?[1]:Array.from({length:cap},(_,i)=>i+1),wantAmounts=ITEMS[wantId]?.type==="rareMaterial"?[1]:giveBulkBasicOrFood&&wantFixed?[1]:Array.from({length:cap-minimumWantQuantity+1},(_,i)=>i+minimumWantQuantity);
  const legal=[];
  for(const giveQuantity of giveAmounts)for(const wantQuantity of wantAmounts){if(isForbiddenMultiSideTrade(giveQuantity,wantQuantity))continue;const target=wantUnitValue*wantQuantity*coefficient;const ratio=giveUnitValue*giveQuantity/target;if(ratio>=minimumRatio&&ratio<=maximumRatio)legal.push({giveQuantity,wantQuantity});}
  const selected=pickFromKey(legal,getGameplaySeed(state),key)??null;
  if(selected&&giveBasic&&wantFixed)selected.giveQuantity=Math.ceil(selected.giveQuantity*NPC_BASIC_DURABLE_BUYBACK_MULTIPLIER);
  return selected;
}
function activeTradeHazard(state){
  const weather=getWeather(state),mapping={cold_wave:"cold",rain:"rain",heat:"heat",storm:"storm"};
  const selected=["storm","cold_wave","heat","rain"].find(hazard=>hasWeatherHazard(weather,hazard));
  return mapping[selected]??null;
}
function activeMinimumWeatherBuybackHazards(state){
  const weather=getWeather(state),hazards=[];
  if(weather.temperature<=-10)hazards.push("cold");
  if(weather.temperature>=40)hazards.push("heat");
  if(hasWeatherHazard(weather,"rain")&&["heavy","downpour"].includes(weather.rainStage))hazards.push("rain");
  if(hasWeatherHazard(weather,"storm")&&weather.intensity!=="none")hazards.push("storm");
  return hazards;
}
const WEATHER_TRADE_MERCHANT_IDS=["npc_19","npc_13","npc_23"];
function armorParts(setId){return [...(EQUIPMENT[`${setId}_set`]?.parts??[])].sort((left,right)=>Math.max(...Object.values(ITEMS[right]?.env??{}))-Math.max(...Object.values(ITEMS[left]?.env??{}))||left.localeCompare(right));}
function weatherTradeCandidates(state,npcId,hazard){
  if(npcId==="npc_19"){
    if(hazard==="cold")return armorParts(state.day<=28?"warm_grass_armor":"wool_leather_armor").map(id=>({type:"item",id}));
    if(hazard==="rain")return armorParts(getWeather(state).temperature>30?"heat_steel_armor":"rain_grass_armor").map(id=>({type:"item",id}));
    if(hazard==="heat")return armorParts(hasWeatherHazard(getWeather(state),"rain")?"heat_steel_armor":state.day>70?"vented_iron_armor":"breathable_leather_armor").map(id=>({type:"item",id}));
    if(hazard==="storm")return armorParts("storm_iron_armor").map(id=>({type:"item",id}));
  }
  if(npcId==="npc_13")return ({cold:[{type:"item",id:"wool_blanket"}],rain:[{type:"blueprint",id:"drainage_ditch"},{type:"item",id:"charcoal_dehumidifier"}],heat:[{type:"item",id:"evaporative_cooler"}],storm:[{type:"blueprint",id:"wind_shutters"},{type:"blueprint",id:"wind_anchor"}]}[hazard]??[]);
  if(npcId==="npc_23")return ({cold:state.day<=28?["stone_axe","wood_bucket"]:["iron_axe","wood_bucket"],rain:["wood_shovel"],heat:[state.day>70?"steel_bucket":"iron_bucket","wood_bucket"],storm:["iron_axe","wood_shovel"]}[hazard]??[]).map(id=>({type:"item",id}));
  return [];
}
function ownsWeatherTradeGive(state,candidate){
  if(candidate.type==="blueprint")return state.ownedBlueprintIds.includes(candidate.id);
  return countItemGlobal(state,candidate.id)>0||Object.values(state.player.equipment??{}).includes(candidate.id)||Object.values(state.furnitureByArea??{}).some(entries=>entries.some(entry=>entry.itemId===candidate.id));
}

const WEATHER_BUYBACK_EFFECT_KEYS={
  cold:{equipment:["warmth"],furniture:["warmth"]},
  rain:{equipment:["rain"],furniture:["rain","acidRainFacilityProtection"]},
  heat:{equipment:["heat"],furniture:["cooling"]},
  storm:{equipment:["storm"],furniture:["wind"]}
};
function weatherBuybackScore(itemId,hazard){
  const item=ITEMS[itemId],definition=FURNITURE[itemId],keys=WEATHER_BUYBACK_EFFECT_KEYS[hazard];
  if(!item||!keys)return 0;
  if(["armor","backpack"].includes(item.type))return keys.equipment.reduce((sum,key)=>sum+Number(item.env?.[key]??0),0);
  if(item.type==="furniture")return keys.furniture.reduce((sum,key)=>sum+Number(definition?.effect?.[key]??0),0);
  return 0;
}
function weatherBuybackCandidates(state,hazard){
  const reachable=new Set(getReachableTradeItemIds(state));
  return Object.keys(ITEMS).filter(itemId=>reachable.has(itemId)&&ITEMS[itemId].tradeable!==false&&!ITEMS[itemId].unique&&weatherBuybackScore(itemId,hazard)>0)
    .sort((left,right)=>itemTier(left)-itemTier(right)||weatherBuybackScore(left,hazard)-weatherBuybackScore(right,hazard)||left.localeCompare(right));
}
function npcCanBuyWeatherItem(npc,itemId){
  const item=ITEMS[itemId],provideLabels=splitTendency(npc.provide);
  if(["armor","backpack"].includes(item?.type))return !provideLabels.some(label=>label.includes("装备"));
  if(item?.type==="furniture")return !provideLabels.some(label=>label.includes("家具"));
  return false;
}
const LOW_TIER_BLUEPRINT_NPC_IDS=new Set(["npc_02","npc_26"]);
function preferredBlueprintCandidates(npc,candidates){
  if(!LOW_TIER_BLUEPRINT_NPC_IDS.has(npc.id)||!candidates.length)return candidates;
  const lowestTier=Math.min(...candidates.map(blueprint=>blueprint.tier));
  return candidates.filter(blueprint=>blueprint.tier===lowestTier);
}
function npcTradeGiveEntries(state,npc,excludedBlueprints=new Set(),allowBlueprintReplacement=false){
  const entries=[],seen=new Set(),maxBlueprintTier=Math.max(...state.knownHouseSchemes)+1;
  const add=(entry)=>{const key=`${entry.type}:${entry.id}`;if(!seen.has(key)&&!isOutdatedNpcTradeGive(state,entry)){seen.add(key);entries.push(entry);}};
  for(const label of splitTendency(npc.provide)){
    if(label.includes("蓝图")){
      const candidates=preferredBlueprintCandidates(npc,BLUEPRINTS.filter(blueprint=>!blueprint.fixedOnly&&!blueprint.lotteryOnly&&!state.ownedBlueprintIds.includes(blueprint.id)&&!excludedBlueprints.has(blueprint.id)&&blueprint.tier<=maxBlueprintTier));
      for(const blueprint of candidates)add({type:"blueprint",id:blueprint.id,name:blueprint.name,quantity:1});
      if(!candidates.length&&(allowBlueprintReplacement||npc.id==="npc_26"))for(const itemId of npcBlueprintReplacementItemIds(state,npc))add({type:"item",id:itemId,name:ITEMS[itemId].name,quantity:1});
      continue;
    }
    for(const itemId of getTradeCategoryItemIds(label,state,true))add({type:"item",id:itemId,name:ITEMS[itemId].name,quantity:1});
  }
  return entries;
}
function makeWeatherBuybackOffer(state,npc,ordinal,reservedTradePairs=new Set(),selectedHazard=null,excludedBlueprints=new Set()){
  const hazard=selectedHazard??activeTradeHazard(state);if(!hazard)return null;
  const availableWants=weatherBuybackCandidates(state,hazard).filter(itemId=>npcCanBuyWeatherItem(npc,itemId));if(!availableWants.length)return null;
  const firstWant=pickFromKey(availableWants,getGameplaySeed(state),`weather-buyback-want:${hazard}:${state.day}:${npc.id}:${ordinal}`);
  const wants=firstWant?[firstWant,...availableWants.filter(itemId=>itemId!==firstWant)]:availableWants;
  const gives=npcTradeGiveEntries(state,npc,excludedBlueprints);if(!gives.length)return null;
  for(const wantId of wants){
    const legal=[];
    for(const candidate of gives){
      if((candidate.type==="item"&&candidate.id===wantId)||hasReverseTradePair(candidate,wantId,reservedTradePairs))continue;
      const give={...candidate};
      const quantities=fairTradeQuantities(state,give,wantId,npc,`weather-buyback:${hazard}:${state.day}:${npc.id}:${wantId}:${give.type}:${give.id}`,60,GLOBAL_TRADE_PRICE_MULTIPLIER*WEATHER_BUYBACK_PRICE_MULTIPLIER);
      if(quantities)legal.push({give,quantities});
    }
    const selected=pickFromKey(legal,getGameplaySeed(state),`weather-buyback:${hazard}:${state.day}:${npc.id}:${wantId}:give`);
    if(selected){
      selected.give.quantity=selected.quantities.giveQuantity;
      return {id:`offer_${state.day}_${npc.id}_${ordinal}`,npcId:npc.id,give:selected.give,want:{id:wantId,name:ITEMS[wantId].name,quantity:selected.quantities.wantQuantity},withdrawn:false,completed:false,relationDiscount:getNpcTradeDiscount(state,npc.id),tradePriceMultiplier:GLOBAL_TRADE_PRICE_MULTIPLIER,weatherBuyback:true,weatherHazard:hazard,weatherPriceMultiplier:WEATHER_BUYBACK_PRICE_MULTIPLIER};
    }
  }
  return null;
}
function makeWeatherPreparedOffer(state,npc,ordinal,reservedTradePairs=new Set(),excludedBlueprints=new Set()){
  const hazard=activeTradeHazard(state),allCandidates=weatherTradeCandidates(state,npc.id,hazard);
  if(!hazard||!allCandidates.length)return null;
  const available=allCandidates.filter(candidate=>!isOutdatedNpcTradeGive(state,candidate)&&(candidate.type!=="blueprint"||!state.ownedBlueprintIds.includes(candidate.id)&&!excludedBlueprints.has(candidate.id))),missing=available.filter(candidate=>!ownsWeatherTradeGive(state,candidate));
  const primary=missing.length?missing:available;
  const first=pickFromKey(primary,getGameplaySeed(state),`weather-trade-item:${hazard}:${state.day}:${npc.id}`);
  const candidates=first?[first,...primary.filter(candidate=>candidate!==first),...available.filter(candidate=>!primary.includes(candidate))]:available;
  const reachable=new Set(getReachableTradeItemIds(state));
  const wants=getTradeCategoryItemIds("基础素材",state,true).filter(id=>reachable.has(id)&&(state.day>10||id!=="water"));
  for(const candidate of candidates){
    const give={...candidate,name:candidate.type==="blueprint"?BLUEPRINTS.find(entry=>entry.id===candidate.id)?.name:ITEMS[candidate.id]?.name,quantity:1};
    if(!give.name)continue;
    const legal=[];
    for(const wantId of wants){if(hasReverseTradePair(give,wantId,reservedTradePairs))continue;const quantities=fairTradeQuantities(state,give,wantId,npc,`weather-trade:${hazard}:${state.day}:${npc.id}:${give.id}:${wantId}`,100,GLOBAL_TRADE_PRICE_MULTIPLIER*WEATHER_PREPARED_PRICE_MULTIPLIER);if(quantities)legal.push({wantId,quantities});}
    const selected=pickFromKey(legal,getGameplaySeed(state),`weather-trade:${hazard}:${state.day}:${npc.id}:${give.id}:want`);
    if(selected)return {id:`offer_${state.day}_${npc.id}_${ordinal}`,npcId:npc.id,give,want:{id:selected.wantId,name:ITEMS[selected.wantId].name,quantity:selected.quantities.wantQuantity},withdrawn:false,completed:false,relationDiscount:getNpcTradeDiscount(state,npc.id),tradePriceMultiplier:GLOBAL_TRADE_PRICE_MULTIPLIER,weatherPrepared:true,weatherHazard:hazard,weatherPriceMultiplier:WEATHER_PREPARED_PRICE_MULTIPLIER};
  }
  return null;
}
const ORDINARY_WEATHER_TRADE_ITEM_GROUPS={
  cold_wave:["firewood","coal","wool_cloth","medicine"],
  rain:["beeswax","bandage","medicine","plank"],
  heat:["water","fuel","medicine"],storm:["plank","hardwood","iron_ingot","bandage","medicine"]
};
function ordinaryWeatherTradeIds(state){
  const weather=getWeather(state),hazardMapping={cold_wave:"cold",rain:"rain",heat:"heat",storm:"storm"},ids=new Set();
  for(const weatherHazard of weather.hazards??[weather.id]){
    for(const itemId of ORDINARY_WEATHER_TRADE_ITEM_GROUPS[weatherHazard]??[])ids.add(itemId);
    const tradeHazard=hazardMapping[weatherHazard];
    if(!tradeHazard)continue;
    for(const npcId of WEATHER_TRADE_MERCHANT_IDS)for(const candidate of weatherTradeCandidates(state,npcId,tradeHazard))ids.add(candidate.id);
    for(const itemId of weatherBuybackCandidates(state,tradeHazard))ids.add(itemId);
  }
  return ids;
}
function makeOffer(state,npc,ordinal,excludedBlueprints=new Set(),reservedTradePairs=new Set(),allowRareMaterialWant=true){
  const key=`trade:${state.day}:${npc.id}:${ordinal}`;
  // 标记已按新需求生成的报价，保留现有兜底规则，避免读档反复刷新合法兜底。
  const wantRuleFields=UPDATED_NPC_WANT_IDS.has(npc.id)?{npcWantRuleVersion:NPC_WANT_RULE_VERSION}:{};
  const provideLabels=splitTendency(npc.provide);
  const offerPriceMultiplier=GLOBAL_TRADE_PRICE_MULTIPLIER;
  const weatherIds=ordinaryWeatherTradeIds(state);
  const reachableWantPool=getReachableTradeItemIds(state),preferredWantPool=getNpcReachableWantIds(state,npc);
  const rareWantPreferred=splitTendency(npc.want).some(label=>label.includes("珍稀素材"));
  const rareMaterialWant=allowRareMaterialWant&&rareWantPreferred&&preferredWantPool.some(id=>ITEMS[id]?.type==="rareMaterial")&&randomFromKey(getGameplaySeed(state),`${key}:rare-material-want`)<RARE_MATERIAL_WANT_CHANCE;
  const scopedPreferredWantPool=preferredWantPool.filter(id=>(ITEMS[id]?.type==="rareMaterial")===rareMaterialWant);
  const scopedReachableWantPool=reachableWantPool.filter(id=>(ITEMS[id]?.type==="rareMaterial")===rareMaterialWant);
  for(let attempt=0;attempt<20;attempt+=1){
    const provide=weightedPick(provideLabels.map((value,index)=>({value,weight:index?60:100})),getGameplaySeed(state),`${key}:provide:${attempt}`)??"基础素材";
    let give;
    if(provide.includes("蓝图")){
      const candidates=preferredBlueprintCandidates(npc,BLUEPRINTS.filter(bp=>!bp.fixedOnly&&!bp.lotteryOnly&&!state.ownedBlueprintIds.includes(bp.id)&&!excludedBlueprints.has(bp.id)&&bp.tier<=Math.max(...state.knownHouseSchemes)+1));
      const bp=weightedPick(candidates.map(value=>({value,weight:weatherIds.has(value.id)?140:60})),getGameplaySeed(state),`${key}:bp:${attempt}`);if(bp)give={type:"blueprint",id:bp.id,name:bp.name,quantity:1};
    }
    if(!give){const pool=(provide.includes("蓝图")?npcBlueprintReplacementItemIds(state,npc):getTradeCategoryItemIds(provide,state,true)).filter(id=>!isOutdatedNpcTradeGive(state,{type:"item",id}));const id=weightedPick(pool.map(value=>({value,weight:weatherIds.has(value)?140:60})),getGameplaySeed(state),`${key}:give:${attempt}`);if(!id)continue;give={type:"item",id,name:ITEMS[id].name,quantity:1};}
    let wantPool=scopedPreferredWantPool;
    if(give.type==="item")wantPool=wantPool.filter(id=>id!==give.id);
    if(!wantPool.length)wantPool=scopedReachableWantPool.filter(id=>give.type!=="item"||id!==give.id);
    const wantId=weightedPick(wantPool.map(id=>({value:id,weight:weatherIds.has(id)?140:60})),getGameplaySeed(state),`${key}:want:${attempt}`);if(!wantId)continue;
    if(hasReverseTradePair(give,wantId,reservedTradePairs))continue;
    const quantities=fairTradeQuantities(state,give,wantId,npc,`${key}:quantities:${attempt}`,dailyTradeCap(state.day),offerPriceMultiplier);if(!quantities)continue;
    give.quantity=quantities.giveQuantity;
    return {id:`offer_${state.day}_${npc.id}_${ordinal}`,npcId:npc.id,give,want:{id:wantId,name:ITEMS[wantId].name,quantity:quantities.wantQuantity},withdrawn:false,completed:false,relationDiscount:getNpcTradeDiscount(state,npc.id),tradePriceMultiplier:GLOBAL_TRADE_PRICE_MULTIPLIER,...wantRuleFields};
  }
  let fallbackWantPool=scopedPreferredWantPool.length?scopedPreferredWantPool:scopedReachableWantPool;
  const fallbackGives=npcTradeGiveEntries(state,npc,excludedBlueprints,true);
  const legalFallbacks=[];
  for(const candidate of fallbackGives)for(const wantId of fallbackWantPool){
    if((candidate.type==="item"&&candidate.id===wantId)||hasReverseTradePair(candidate,wantId,reservedTradePairs))continue;
    const give={...candidate};
    const quantities=fairTradeQuantities(state,give,wantId,npc,`${key}:fallback-quantities:${give.id}:${wantId}`,dailyTradeCap(state.day),offerPriceMultiplier);
    if(quantities)legalFallbacks.push({give,wantId,quantities});
  }
  let fallback=pickFromKey(legalFallbacks,getGameplaySeed(state),`${key}:fallback-pair`);
  if(!fallback&&scopedPreferredWantPool.length){
    for(const candidate of fallbackGives)for(const wantId of scopedReachableWantPool){
      if((candidate.type==="item"&&candidate.id===wantId)||hasReverseTradePair(candidate,wantId,reservedTradePairs))continue;
      const give={...candidate};
      const quantities=fairTradeQuantities(state,give,wantId,npc,`${key}:reachable-fallback-quantities:${give.id}:${wantId}`,dailyTradeCap(state.day),offerPriceMultiplier);
      if(quantities)legalFallbacks.push({give,wantId,quantities});
    }
    fallback=pickFromKey(legalFallbacks,getGameplaySeed(state),`${key}:reachable-fallback-pair`);
  }
  if(!fallback)return null;
  fallback.give.quantity=fallback.quantities.giveQuantity;
  return {id:`offer_${state.day}_${npc.id}_${ordinal}`,npcId:npc.id,give:fallback.give,want:{id:fallback.wantId,name:ITEMS[fallback.wantId].name,quantity:fallback.quantities.wantQuantity},withdrawn:false,completed:false,relationDiscount:getNpcTradeDiscount(state,npc.id),tradePriceMultiplier:GLOBAL_TRADE_PRICE_MULTIPLIER,...wantRuleFields};
}

export function generateTradeOffers(state,preservedOffers=[]){
  const all=[...CHARACTERS],hazard=activeTradeHazard(state),minimumBuybackHazards=activeMinimumWeatherBuybackHazards(state),offers=Array(DAILY_TRADE_OFFER_COUNT),excludedBlueprints=new Set(),reservedTradePairs=new Set(),usedNpcIds=new Set();
  const preserved=new Set();
  let activeRareMaterialWantCount=0;
  for(const [position,offer] of preservedOffers.slice(0,DAILY_TRADE_OFFER_COUNT).entries()){
    if(!offer.completed&&!offer.withdrawn&&(isForbiddenTradeOffer(offer)||isForbiddenNpcTradeGive(offer.give)||isOutdatedNpcTradeGive(state,offer.give)||isOutdatedNpcTradeWant(state,offer)||isSameStyleWeaponTrade(offer.give,offer.want?.id)||Number(offer.tradePriceMultiplier??1)!==GLOBAL_TRADE_PRICE_MULTIPLIER||Number(offer.tradePricingRuleVersion??0)!==TRADE_PRICING_RULE_VERSION))continue;
    offers[position]=offer;
    preserved.add(offer);
    usedNpcIds.add(offer.npcId);
    if(offer.give?.type==="blueprint")excludedBlueprints.add(offer.give.id);
    reserveTradePair(reservedTradePairs,offer);
    if(isActiveRareMaterialWant(offer))activeRareMaterialWantCount+=1;
  }
  for(const minimumHazard of minimumBuybackHazards){
    let buybackCount=offers.filter(offer=>offer?.weatherBuyback&&offer.weatherHazard===minimumHazard).length;
    while(buybackCount<3){
      const availablePositions=Array.from({length:DAILY_TRADE_OFFER_COUNT},(_,index)=>index).filter(index=>!offers[index]);
      const position=pickFromKey(availablePositions,getGameplaySeed(state),`minimum-weather-buyback-position:${state.day}:${minimumHazard}:${buybackCount}`)??availablePositions[0]??-1;
      if(position<0)break;
      const candidates=all.filter(npc=>!usedNpcIds.has(npc.id)&&!WEATHER_TRADE_MERCHANT_IDS.includes(npc.id));
      let weatherOffer=null;
      while(candidates.length){
        const npc=pickFromKey(candidates,getGameplaySeed(state),`minimum-weather-buyback-npc:${state.day}:${minimumHazard}:${buybackCount}:${candidates.length}`);
        candidates.splice(candidates.indexOf(npc),1);
        weatherOffer=makeWeatherBuybackOffer(state,npc,position,reservedTradePairs,minimumHazard,excludedBlueprints);
        if(weatherOffer)break;
      }
      if(!weatherOffer)break;
      weatherOffer.weatherMinimumBuyback=true;
      offers[position]=weatherOffer;
      usedNpcIds.add(weatherOffer.npcId);
      if(weatherOffer.give.type==="blueprint")excludedBlueprints.add(weatherOffer.give.id);
      reserveTradePair(reservedTradePairs,weatherOffer);
      buybackCount+=1;
    }
  }
  let weatherPosition=-1;
  if(hazard&&!offers.some(offer=>offer?.weatherPrepared)&&(minimumBuybackHazards.length||!offers.some(offer=>offer?.weatherBuyback))){
    const availablePositions=Array.from({length:DAILY_TRADE_OFFER_COUNT},(_,index)=>index).filter(index=>!offers[index]);
    weatherPosition=pickFromKey(availablePositions,getGameplaySeed(state),`weather-trade-position:${state.day}:${hazard}`)??availablePositions[0]??-1;
    const unusedNpcs=all.filter(npc=>!usedNpcIds.has(npc.id));
    const prepared=WEATHER_TRADE_MERCHANT_IDS.map(id=>unusedNpcs.find(npc=>npc.id===id)).filter(Boolean).map(npc=>makeWeatherPreparedOffer(state,npc,weatherPosition,reservedTradePairs,excludedBlueprints));
    let buyback=null;
    if(!minimumBuybackHazards.length){
      const buybackNpcs=[...unusedNpcs];
      while(buybackNpcs.length&&!buyback){
        const npc=pickFromKey(buybackNpcs,getGameplaySeed(state),`weather-buyback-npc:${state.day}:${hazard}:${buybackNpcs.length}`);
        buybackNpcs.splice(buybackNpcs.indexOf(npc),1);
        buyback=makeWeatherBuybackOffer(state,npc,weatherPosition,reservedTradePairs,hazard,excludedBlueprints);
      }
    }
    const weatherCandidates=[...prepared,buyback].filter(offer=>offer&&!hasReverseTradePair(offer.give,offer.want?.id,reservedTradePairs));
    const weatherOffer=pickFromKey(weatherCandidates,getGameplaySeed(state),`weather-trade-kind:${state.day}:${hazard}`);
    if(weatherOffer){
      offers[weatherPosition]=weatherOffer;
      usedNpcIds.add(weatherOffer.npcId);
      if(weatherOffer.give.type==="blueprint")excludedBlueprints.add(weatherOffer.give.id);
      reserveTradePair(reservedTradePairs,weatherOffer);
    }else weatherPosition=-1;
  }
  for(const position of Array.from({length:DAILY_TRADE_OFFER_COUNT},(_,index)=>index)){
    if(position===weatherPosition||offers[position])continue;
    const candidates=all.filter(npc=>!usedNpcIds.has(npc.id));
    while(candidates.length){
      const npc=pickFromKey(candidates,getGameplaySeed(state),`trade-npc:${state.day}:${position}:${candidates.length}`);
      candidates.splice(candidates.indexOf(npc),1);
      const offer=makeOffer(state,npc,position,excludedBlueprints,reservedTradePairs,activeRareMaterialWantCount<MAX_DAILY_RARE_MATERIAL_WANTS);
      if(!offer)continue;
      offers[position]=offer;
      usedNpcIds.add(npc.id);
      if(offer.give.type==="blueprint")excludedBlueprints.add(offer.give.id);
      reserveTradePair(reservedTradePairs,offer);
      if(isActiveRareMaterialWant(offer))activeRareMaterialWantCount+=1;
      break;
    }
  }
  return offers.filter(Boolean).map(offer=>preserved.has(offer)?offer:{...offer,tradePricingRuleVersion:TRADE_PRICING_RULE_VERSION});
}

export function refreshOutdatedTradeOffers(state){
  if(!(state.tradeOffers??[]).some(offer=>!offer.completed&&!offer.withdrawn&&(isForbiddenTradeOffer(offer)||isOutdatedNpcTradeGive(state,offer.give)||Number(offer.tradePriceMultiplier??1)!==GLOBAL_TRADE_PRICE_MULTIPLIER||Number(offer.tradePricingRuleVersion??0)!==TRADE_PRICING_RULE_VERSION)))return false;
  state.tradeOffers=generateTradeOffers(state,state.tradeOffers);
  return true;
}

function mailIdFor(npcId,number){return `${npcId}_mail_${number}`;}

export function getMailContent(mail){
  const npc=CHARACTERS.find(entry=>entry.id===mail?.npcId),number=Number(mail?.number??0);
  return {
    text:npc?.mails?.[number-1]??mail?.text??"",
    attachmentSpec:number>=6?(npc?.attachments?.[number-6]??mail?.attachmentSpec??null):null
  };
}

export function getReceivedMails(state){
  const claimed=new Set(state.claimedMailIds??[]),result=[];
  for(const npc of CHARACTERS){
    const count=Math.min(NPC_MAIL_FAVOR_THRESHOLDS.length,Math.max(0,Number(state.relations?.[npc.id]?.mails??0)));
    for(let number=1;number<=count;number+=1){
      const id=mailIdFor(npc.id,number);
      result.push({id,npcId:npc.id,number,claimed:number<6||claimed.has(id)});
    }
  }
  return result;
}

function migrateLegacyMailboxState(state){
  const claimed=new Set(state.claimedMailIds??[]);
  for(const mail of state.mailInbox??[]){
    const npcId=mail?.npcId,number=Number(mail?.number??String(mail?.id??"").match(/_mail_(\d+)$/)?.[1]);
    if(!state.relations?.[npcId]||!Number.isInteger(number)||number<1||number>NPC_MAIL_FAVOR_THRESHOLDS.length)continue;
    state.relations[npcId].mails=Math.max(Number(state.relations[npcId].mails??0),number);
    if(mail.claimed&&number>=6)claimed.add(mailIdFor(npcId,number));
  }
  state.claimedMailIds=[...claimed];
  delete state.mailInbox;
}

function sendEarnedMails(state,npcId,offer){
  const relation=state.relations[npcId],thresholds=NPC_MAIL_FAVOR_THRESHOLDS;
  if(relation.mails>=thresholds.length||relation.favor<thresholds[relation.mails])return[];
  const number=relation.mails+1;
  if(!tradeMeetsMailRequirements(offer,NPC_MAIL_TRADE_REQUIREMENTS[npcId]?.[number]))return[];
  // 每笔交易只发下一封，旧档积累的好感也不触发批量补发。
  relation.mails+=1;state.mailReceivedToday=true;
  const mail={id:mailIdFor(npcId,number),npcId,number,claimed:number<6};
  if(number>=6)mail.claimed=claimMail(state,mail.id).ok;
  return[mail];
}

const PREPARED_MAIL_FOOD_IDS=new Set(Object.values(RECIPES).flatMap(recipe=>[recipe.output,...(recipe.outputs??[])])
  .filter(output=>ITEMS[output?.itemId]?.type==="food").map(output=>output.itemId));
function tradeEntryMatchesMailCategory(entry,category){
  if(entry?.type==="blueprint")return category==="蓝图"&&BLUEPRINTS.some(blueprint=>blueprint.id===entry.id);
  const item=entry?.type==="item"?ITEMS[entry.id]:null;
  if(!item)return false;
  // 邮件检查已成交物品的含义，不使用报价的科技层、库存或完整角色倾向过滤。
  switch(category){
    case "食材":return (["foodIngredient","food"].includes(item.type)&&entry.id!=="herb")||FOOD_PROCESSING_TRADE_ITEM_IDS.includes(entry.id);
    case "成品食物":return PREPARED_MAIL_FOOD_IDS.has(entry.id);
    case "基础素材":return BASIC_TRADE_MATERIAL_IDS.has(entry.id)&&!item.tradeCategories?.includes("food");
    case "种子":return item.type==="seed";
    case "家具":return item.type==="furniture";
    case "武器":return item.type==="weapon";
    case "衣物":return item.type==="armor";
    case "工具":return item.type==="tool";
    default:return false;
  }
}

function tradeMeetsMailRequirements(offer,requirements){
  return Object.entries(requirements??{}).every(([side,category])=>tradeEntryMatchesMailCategory(
    side==="give"?offer?.give:{type:"item",id:offer?.want?.id},category));
}

export function acceptTrade(state,offerId,acceptReserved=false){
  const offer=state.tradeOffers.find(o=>o.id===offerId);if(!offer||offer.withdrawn||offer.completed)return {ok:false,message:"报价已经失效"};
  if(isForbiddenTradeOffer(offer))return {ok:false,message:"这条报价包含不可交易的物品，已经失效"};
  if(isForbiddenNpcTradeGive(offer.give))return {ok:false,message:"NPC不再出售珍稀素材"};
  if(isOutdatedNpcTradeGive(state,offer.give))return {ok:false,message:["food","drink"].includes(ITEMS[offer.give.id]?.type)?"这条报价的食物或饮料幸福度低于昨日饮食，已经失效":"已持有更高级的同类物品，这条报价已失效"};
  if(isSameStyleWeaponTrade(offer.give,offer.want?.id))return {ok:false,message:"近战武器之间、远程武器之间不能互换"};
  const reserved=(state.selectedFood?.itemId===offer.want.id?1:0)+(state.selectedDrink?.itemId===offer.want.id?1:0);
  const local=countItem(state,offer.want.id,state.position);
  if(local+reserved<offer.want.quantity)return {ok:false,message:"交换物不足"};
  if(reserved&&local<offer.want.quantity&&!acceptReserved)return {ok:false,needsConfirmation:true,message:`这笔交换会取走今日预留的${ITEMS[offer.want.id].name}，并把对应饮食改回未设定。`};
  let remaining=offer.want.quantity;
  const localTake=Math.min(local,remaining);if(localTake){consumeItem(state,offer.want.id,localTake,state.position);remaining-=localTake;}
  if(remaining&&state.selectedFood?.itemId===offer.want.id){state.selectedFood=null;remaining-=1;}if(remaining&&state.selectedDrink?.itemId===offer.want.id){state.selectedDrink=null;remaining-=1;}
  if(remaining>0)return {ok:false,message:"交换物不足"};
  offer.completed=true;
  if(offer.give.type==="blueprint")acquireBlueprint(state,offer.give.id,CHARACTERS.find(n=>n.id===offer.npcId).name);else addItem(state,offer.give.id,offer.give.quantity,{areaId:state.position});
  if(offer.give.type==="item"&&isFoodTradeItem(offer.give.id))state.dailyTradeFoodWater=true;
  const npc=CHARACTERS.find(n=>n.id===offer.npcId);
  state.tradesCompleted+=1;if(!state.tradedCharacterIds.includes(offer.npcId))state.tradedCharacterIds.push(offer.npcId);state.relations[offer.npcId].favor+=1;
  const newMails=sendEarnedMails(state,offer.npcId,offer);updateConnection(state);
  const givenName=(offer.give.type==="blueprint"?BLUEPRINTS.find(entry=>entry.id===offer.give.id)?.name:ITEMS[offer.give.id]?.name)??offer.give.name;
  const receivedName=offer.give.type==="blueprint"&&!givenName.endsWith("蓝图")?`${givenName}蓝图`:givenName;
  addLog(state,`与${npc.name}交易：交出${ITEMS[offer.want.id].name}×${offer.want.quantity}，获得${receivedName}×${offer.give.quantity??1}。`);
  return {ok:true,newMails,message:offer.give.type==="blueprint"?`交易完成，已获得${offer.give.name}蓝图`:`交易完成，获得${offer.give.name}×${offer.give.quantity}`};
}

function itemIdByName(name){return Object.entries(ITEMS).find(([,item])=>item.name===name)?.[0];}
function parseAttachment(spec){
  if(!spec)return[];
  const setMap={"抗风保温钢甲完整五件":"storm_iron_armor","防风衣完整五件":"storm_iron_armor","风暴铁甲完整五件":"storm_iron_armor","羽绒温暖套装完整五件":"wool_leather_armor","羊毛温暖套装完整五件":"wool_leather_armor","羊毛衬里皮甲完整五件":"wool_leather_armor"};
  if(setMap[spec])return EQUIPMENT[`${setMap[spec]}_set`].parts.map(itemId=>({itemId,quantity:1}));
  if(spec.includes("茶树、咖啡、柠檬、香蕉种子各×2"))return ["tea_leaf_seed","coffee_bean_seed","lemon_seed","banana_seed"].map(itemId=>({itemId,quantity:2})).concat({itemId:"fertilizer",quantity:8});
  const result=[];for(const part of spec.split(/[、，]/)){const match=part.trim().match(/^(.+?)(?:×(\d+))?$/);if(!match)continue;let name=match[1].trim();const quantity=Number(match[2]??1);if(name==="茶树种子")name="茶叶种子";if(name==="咖啡种子")name="咖啡豆种子";const itemId=itemIdByName(name);if(itemId)result.push({itemId,quantity});}
  return result;
}

export function claimMail(state,mailId){
  const mail=getReceivedMails(state).find(entry=>entry.id===mailId);if(!mail)return {ok:false,message:"邮件不存在"};
  const attachmentSpec=getMailContent(mail).attachmentSpec;if(!attachmentSpec||mail.claimed)return {ok:false,message:"附件已经领取"};
  const items=parseAttachment(attachmentSpec);
  for(const item of items)addItem(state,item.itemId,item.quantity,{areaId:state.position});
  state.claimedMailIds.push(mailId);
  const npc=CHARACTERS.find(entry=>entry.id===mail.npcId);
  addLog(state,`收到${npc.name}的礼物（第${mail.number}封来信）：${items.map(item=>`${ITEMS[item.itemId].name}×${item.quantity}`).join("、")}。`);
  return {ok:true,items};
}

export function updateConnection(state){if(!state.buildingsByArea[state.returnTowerAreaId]?.communication_array?.completed){state.connection=0;return 0;}const conditions=[state.tradesCompleted>=40,state.tradedCharacterIds.length>=6];state.connection=Math.round(conditions.filter(Boolean).length/conditions.length*100);return state.connection;}

export function getReturnEnding(state){
  if(state.returnEnding)return state.returnEnding;
  // 好感可高于已收邮件进度；收到第十封信即为朋友，不要求领取附件。
  const friendIds=CHARACTERS.filter(npc=>Number(state.relations?.[npc.id]?.mails??0)>=10).map(npc=>npc.id);
  return {kind:friendIds.length>=10?"everyone":friendIds.length?"friends":"solo",friendIds};
}

function completeReturn(state){
  if(state.returnEnding||state.postgame)return {ok:false,message:"通关记录已保存"};
  state.returnEnding=getReturnEnding(state);
  state.returnTowerComplete=true;
  state.completed=true;
  state.launch=null;
  return {ok:true,completed:true};
}

export const RETURN_STAGES=[
  {id:"return_base",name:"归航基地",steps:10,inputs:{concrete:6,steel:4,insulated_cable:2},stamina:4},
  {id:"tower_foundation",name:"归航塔基",steps:10,inputs:{concrete:8,steel:3},stamina:4},
  {id:"steel_tower",name:"钢铁塔身",steps:10,inputs:{steel:6,glass_panel:2},stamina:4},
  {id:"energy_array",name:"能源阵列",steps:8,inputs:{insulated_cable:3,battery:1,precision_part:1},stamina:4},
  {id:"cooling_system",name:"冷却系统",steps:6,inputs:{steel:3,glass:2,rubber:2},stamina:4},
  {id:"computing_center",name:"计算中心",steps:8,inputs:{precision_part:2,optical_lens:1,insulated_cable:2},stamina:4},
  {id:"communication_array",name:"通讯阵列",steps:8,inputs:{steel:2,copper_wire:4,optical_lens:1},stamina:4},
  {id:"core_install",name:"核心安装",steps:1,inputs:{space_module:1,coordinate_module:1,return_core:1},stamina:5}
];

export function selectReturnTowerArea(state,areaId=state.position){if(!state.ownedBlueprintIds.includes("return_tower"))return {ok:false,message:"尚未取得归航塔蓝图"};if(state.housesByArea[areaId]?.level!==5)return {ok:false,message:"当地必须先建成永久避难所"};if(state.returnTowerAreaId&&state.returnTowerAreaId!==areaId&&Object.values(state.returnProgress).some(p=>p.progress>0))return {ok:false,message:"归航塔已经锁定在其他地块"};state.returnTowerAreaId=areaId;return {ok:true};}
export function getReturnStageAvailability(state,stageId){
  const areaId=state.returnTowerAreaId;
  if(!areaId||state.position!==areaId)return {ok:false,message:"必须位于选定的归航塔地块"};
  const index=RETURN_STAGES.findIndex(stage=>stage.id===stageId),stage=RETURN_STAGES[index];
  if(!stage)return {ok:false,message:"未知归航工程"};
  if(state.returnEnding||state.postgame)return {ok:false,message:"通关记录已保存"};
  if(state.returnProgress[stageId]?.completed)return {ok:false,message:"该归航工程已经完成"};
  if(index>0&&!state.returnProgress[RETURN_STAGES[index-1].id]?.completed)return {ok:false,message:"前一阶段尚未完成"};
  if(stageId==="return_base"){
    if(!state.buildingsByArea[areaId]?.machine_shop?.completed)return {ok:false,message:"当地缺少机械工坊"};
    if(!state.buildingsByArea[areaId]?.weather_station?.completed)return {ok:false,message:"当地缺少已建成的气象站"};
  }
  if(stageId==="core_install"&&(!state.buildingsByArea[areaId]?.communication_array?.completed||state.tradesCompleted<40||state.tradedCharacterIds.length<6))return {ok:false,message:"幸存者连接网尚未达到100%（需完成40次交易、与6位角色交易）"};
  if(!hasInputs(state,stage.inputs))return {ok:false,message:"当地材料不足"};
  return {ok:true,stage};
}

export function buildReturnStage(state,stageId,acceptRisk=false){
  const availability=getReturnStageAvailability(state,stageId);
  if(!availability.ok)return availability;
  const {stage}=availability,areaId=state.returnTowerAreaId;
  if(stageId==="core_install")updateConnection(state);
  const cost=resolveOutdoorCost(state,stage.stamina,acceptRisk);
  if(!cost.ok)return cost;
  consumeInputs(state,stage.inputs);
  const progress=state.returnProgress[stageId]??{progress:0,completed:false};
  progress.progress+=1;
  if(progress.progress>=stage.steps){
    progress.completed=true;
    if(stageId==="communication_array")state.buildingsByArea[areaId].communication_array={completed:true};
    addLog(state,`在${areaId} ${AREAS[areaId].name}建好了${stageId==="core_install"?"归航塔（核心安装完成）":stage.name}。`);
  }
  state.returnProgress[stageId]=progress;
  progressTasks(state,"build",1);
  if(stageId==="core_install"&&progress.completed){
    state.returnTowerComplete=true;
    state.returnDeparture={completedRuns:0,lastRunDay:0};
    state.launch=null;
  }
  return {ok:true,completed:progress.completed};
}

function getPriorityGridPowerAvailable(state){
  const status=getGridPowerStatus(state);
  const reservedDemand=status.spent+status.consumers.filter(consumer=>consumer.priority<=0).reduce((total,consumer)=>total+consumer.use,0);
  return Math.max(0,status.generation-reservedDemand);
}

export function getReturnBroadcastResources(state){
  const areaId=state.returnTowerAreaId??state.position;
  return {powerAvailable:getPriorityGridPowerAvailable(state),fuelAvailable:countItem(state,"fuel",areaId),powerRequired:10,fuelRequired:1};
}

function useGridPower(state,requiredPower,{consume=true}={}){
  const required=Math.max(0,Number(requiredPower)||0);
  if(getPriorityGridPowerAvailable(state)<required)return {ok:false};
  if(consume)state.gridPowerSpentToday=Math.max(0,Number(state.gridPowerSpentToday??0))+required;
  return {ok:true};
}

export function broadcastReturnSignal(state){
  const areaId=state.returnTowerAreaId;
  if(state.returnEnding||state.postgame||state.completed)return {ok:false,message:"通关记录已保存"};
  if(!areaId||state.position!==areaId)return {ok:false,message:"必须位于选定的归航塔地块"};
  if(!state.returnProgress.core_install?.completed)return {ok:false,message:"归航塔尚未完成核心安装"};
  const departure=state.returnDeparture??{completedRuns:0,lastRunDay:0};
  if(departure.completedRuns>=3)return {ok:false,message:"坐标运算和广播已经完成"};
  if(departure.lastRunDay>=state.day)return {ok:false,message:"今天已进行坐标运算和广播，请明天继续"};
  if(countItem(state,"fuel",areaId)<1)return {ok:false,message:"需要全岛可支配电力10、燃油1"};
  if(!useGridPower(state,10).ok)return {ok:false,message:"需要全岛可支配电力10、燃油1"};
  consumeItem(state,"fuel",1,areaId);
  departure.completedRuns+=1;
  departure.lastRunDay=state.day;
  state.returnDeparture=departure;
  const departureProgress=departure.completedRuns;
  addLog(state,`在${areaId} ${AREAS[areaId].name}发送了归航广播（第${departureProgress}次坐标运算和广播）。`);
  if(departureProgress>=3)return {...completeReturn(state),departureProgress};
  return {ok:true,departureProgress,message:departureProgress===1?"再进行两次坐标运算和广播即可离开此处":"再进行一次坐标运算和广播即可离开此处"};
}
export function startReturnLaunch(state){return {ok:false,message:state.returnEnding||state.postgame?"通关记录已保存":"请在核心安装完成后进行坐标运算和广播"};}
function countLocalFood(state,areaId){return allAccessibleStacks(state,areaId).flat().filter(s=>ITEMS[s.itemId]?.type==="food").reduce((sum,s)=>sum+s.quantity,0);}
function consumeAnyLocalFood(state,areaId){for(const stacks of allAccessibleStacks(state,areaId))for(const stack of stacks)if(ITEMS[stack.itemId]?.type==="food"){consumeItem(state,stack.itemId,1,areaId);return true;}return false;}
const LAUNCH_FAULTS=[{id:"signal",name:"信号漂移",weight:20,cost:2},{id:"tower",name:"塔身松动",weight:20,cost:3},{id:"cooling",name:"冷却管堵塞",weight:18,cost:4,inputs:{rubber:1,water:2}},{id:"surge",name:"电力浪涌",weight:17,cost:4,inputs:{battery:1}},{id:"coordinate",name:"坐标重新校准",weight:15,cost:5,inputs:{precision_part:1,optical_lens:1}},{id:"crack",name:"塔基裂缝",weight:10,cost:5,inputs:{concrete:2,steel:1}}];
export function getLaunchStatus(state){if(!state.launch)return null;if(!state.launch.pendingFault)state.launch.pendingFault=weightedPick(LAUNCH_FAULTS.map(f=>({value:f,weight:f.weight})),getGameplaySeed(state),`launch:${state.launch.startIndex}:${state.launch.day}`);return state.launch;}
export function abortReturnLaunch(state){if(!state.launch)return {ok:false,message:"当前没有进行中的归航启动"};state.launch=null;return {ok:true,message:"已中止本次启动，归航塔与关键物不受损"};}
export function continueAfterEnding(state){if(!state.completed)return {ok:false,message:"尚未通关"};state.returnEnding??=getReturnEnding(state);state.completed=false;state.postgame=true;return {ok:true};}
export function resolveLaunchDay(state,method="stamina",helperId=null){return {ok:false,message:"请在核心安装完成后进行坐标运算和广播"};}

function spoilStacks(state, stacks, cold, summary, areaId) {
  const protectedSlots = cold === true ? Infinity : cold === false ? 0 : Math.max(0, Number(cold) || 0);
  for (let i = stacks.length - 1; i >= 0; i -= 1) {
    const stack = stacks[i];
    const item = ITEMS[stack.itemId];
    if (!item?.shelfLifeNights || i < protectedSlots) continue;
    // Outside preservation, hot water cools into water instead of spoiling.
    if (stack.itemId === "hot_water") {
      stacks.splice(i, 1);
      addToStacks(stacks, "water", stack.quantity);
      summary.push(`${areaId}：热水冷却成水×${stack.quantity}`);
      continue;
    }
    const aged=getStackSpoilageBatches(stack).map(batch=>({...batch,spoilageNights:batch.spoilageNights+1}));
    const expiredQuantity=aged.filter(batch=>batch.spoilageNights>=item.shelfLifeNights).reduce((sum,batch)=>sum+batch.quantity,0);
    const remaining=aged.filter(batch=>batch.spoilageNights<item.shelfLifeNights);
    if(remaining.length)applyStackSpoilageBatches(stack,remaining);else stacks.splice(i,1);
    if(expiredQuantity&&stack.itemId!=="clean_ice"){
      addToStacks(stacks,"rotten",expiredQuantity);
      summary.push(`${areaId}：${item.name}腐坏×${expiredQuantity}`);
    }else if(expiredQuantity)summary.push(`${areaId}：干净冰融化×${expiredQuantity}`);
  }
}

const GROUND_LOSS_EXACT_LIMIT=32;
const GROUND_LOSS_BATCH_SIZE=256;

const GROUND_LOSS_PROTECTED_ITEM_IDS=new Set(UNIQUE_DEPENDENT_ITEM_IDS);

export function isGroundLossProtectedItem(itemId){return GROUND_LOSS_PROTECTED_ITEM_IDS.has(itemId);}

function sampleBinomialFromKey(seed,key,trials,chance){
  if(trials<=0||chance<=0)return 0;
  if(chance>=1)return trials;
  const roll=randomFromKey(seed,key),failureChance=1-chance;
  let successes=0,probability=failureChance**trials,cumulative=probability;
  while(roll>=cumulative&&successes<trials){
    probability*=((trials-successes)/(successes+1))*(chance/failureChance);
    successes+=1;
    cumulative+=probability;
  }
  return successes;
}

function getGroundLossCount(state,areaId,stack,index,chance){
  const quantity=Math.max(0,Math.floor(Number(stack.quantity)||0));
  if(quantity<=GROUND_LOSS_EXACT_LIMIT){
    let lost=0;
    for(let unit=0;unit<quantity;unit+=1)if(randomFromKey(getGameplaySeed(state),`ground-loss:${state.day}:${areaId}:${stack.itemId}:${index}:${unit}`)<chance)lost+=1;
    return lost;
  }
  let lost=0,remaining=quantity,batch=0;
  while(remaining>0){
    const trials=Math.min(GROUND_LOSS_BATCH_SIZE,remaining);
    lost+=sampleBinomialFromKey(getGameplaySeed(state),`ground-loss-batch:${state.day}:${areaId}:${stack.itemId}:${index}:${batch}`,trials,chance);
    remaining-=trials;
    batch+=1;
  }
  return lost;
}

function resolveGroundLoss(state, areaId, summary, monkeyLosses) {
  const stacks = state.groundByArea[areaId];
  for (let index = stacks.length - 1; index >= 0; index -= 1) {
    const stack = stacks[index];
    const item = ITEMS[stack.itemId];
    if(isGroundLossProtectedItem(stack.itemId))continue;
    const foodLike = ["food", "drink", "foodIngredient"].includes(item.type);
    const chance = foodLike ? 0.1 : 0.05;
    const lost=getGroundLossCount(state,areaId,stack,index,chance);
    if (lost) {
      takeFromStack(stack,lost);
      if(!KAYAK_REQUIRED_AREAS.has(areaId))state.monkeyStolenItemCount=Math.max(0,Number(state.monkeyStolenItemCount??0))+lost;
      if(areaId===state.position){
        const cause=KAYAK_REQUIRED_AREAS.has(areaId)?"sea":"monkey";
        const existing=monkeyLosses.find(entry=>entry.itemId===stack.itemId);
        if(existing)existing.quantity+=lost;else monkeyLosses.push({itemId:stack.itemId,name:item.name,quantity:lost,...(cause==="sea"?{cause}: {})});
        summary.push(`${cause==="sea"?"海水冲走了":"猴子拿走了"}${item.name}×${lost}`);
      }
      if (stack.quantity <= 0) stacks.splice(index, 1);
    }
  }
}

function resolvePowerAndFacilities(state, summary) {
  for(const areaId of Object.keys(AREAS)){
    const buildings=state.buildingsByArea[areaId];
    if(state.powerByArea?.[areaId])state.powerByArea[areaId]={stored:0,capacity:0};
    for(const placed of state.furnitureByArea[areaId]??[])if(Number(FURNITURE[placed.itemId]?.effect?.power??0)>0)placed.poweredToday=false;
    for(const [id,progress] of Object.entries(buildings))if(Number(BUILDINGS[id.replace(/__\d+$/u,"")]?.effect?.power??0)>0)progress.poweredToday=false;

    const passiveWater=Object.entries(buildings).reduce((total,[id,progress])=>{
      if(!progress.completed||progress.damaged)return total;
      return total+Number(BUILDINGS[id.replace(/__\d+$/u,"")]?.effect?.water??0);
    },0);
    if (passiveWater) addItem(state, "water", passiveWater, { areaId, preferred: "storage" });
    const collectorCount = completedInstances(state, areaId, "rain_collector").length;
    if (hasWeatherHazard(getWeather(state),"rain") && collectorCount) addItem(state, "water", 3 * collectorCount, { areaId, preferred: "storage" });
    const hiveCount = completedInstances(state, areaId, "beehive_box").length;
    if (state.day % 3 === 0 && hiveCount) {
      addItem(state, "honey", 2 * hiveCount, { areaId, preferred: "storage" });
      addItem(state, "beeswax", hiveCount, { areaId, preferred: "storage" });
    }
  }

  const status=getGridPowerStatus(state),ready=[];
  for(const consumer of status.consumers){
      const { effect, entry } = consumer;
      const resourceRequirements=dailyItemResourceRequirements(effect);
      const unpaidResources=resourceRequirements.filter(({itemId})=>itemId!=="water"&&!dailyItemResourcePaid(entry,itemId,state.day));
      const missingResource=unpaidResources.find(({itemId,quantity})=>countDailyItemResource(state,itemId,consumer.areaId)<quantity);
      const nonPowerReady=!missingResource&&(!effect.fuelDaily||entry.fuelPaidDay===state.day);
      if(nonPowerReady){
        ready.push({...consumer,unpaidResources});
      }else if(missingResource){
        entry.enabled=false;
        summary.push(`${consumer.areaId}：${consumer.name}因${ITEMS[missingResource.itemId].name}不足自动关闭`);
      }
  }
  ready.sort((left,right)=>left.priority-right.priority||randomFromKey(getGameplaySeed(state),`grid-power:${state.day}:${left.areaId}:${left.kind}:${left.id}`)-randomFromKey(getGameplaySeed(state),`grid-power:${state.day}:${right.areaId}:${right.kind}:${right.id}`)||left.order-right.order);
  let remaining=Math.max(0,status.generation-Math.max(0,Number(state.gridPowerSpentToday??0))),outageCount=0;
  for(const consumer of ready){
    const operational=consumer.use<=remaining;
    consumer.entry.poweredToday=operational;
    if(operational){
      remaining-=consumer.use;
      for(const {itemId,quantity} of consumer.unpaidResources){
        consumeDailyItemResource(state,itemId,quantity,consumer.areaId);
        (consumer.entry.resourcePaidDays??={})[itemId]=state.day;
      }
      if(consumer.kind==="building"&&consumer.id.replace(/__\d+$/u,"")==="mining_machine"){
        const {production,capacity,hasStorage}=getMiningMachineStatus(state,consumer.areaId);
        if(!hasStorage)continue;
        if(production){
          const stored=addToStacks(state.storageByArea[consumer.areaId],production.itemId,production.quantity,0,capacity);
          summary.push(stored?`${consumer.areaId}：采矿机产出${ITEMS[production.itemId].name}×${stored}，已收入当地储物格`:`${consumer.areaId}：采矿机因当地普通储物格已满而停产`);
        }
      }
    }else{
      outageCount+=1;
      summary.push(`${consumer.areaId}：${consumer.name}因全岛电力不足${consumer.priority>0?"":"随机"}断电，本日停机`);
    }
  }
  if(outageCount)summary.push(`全岛可支配电力不足，共有${outageCount}件电器在本次过夜结算中断电`);

  for(const areaId of Object.keys(AREAS)){
    const buildings=state.buildingsByArea[areaId];
    let activeColdCapacity = getPassiveColdStorageCapacity(state, areaId);
    for (const placed of state.furnitureByArea[areaId] ?? []) if (placed.itemId === "fridge" && placed.enabled !== false && placed.poweredToday) activeColdCapacity += Number(FURNITURE.fridge.effect.coldStorage ?? 0);
    const localConsumers=status.consumers.filter(consumer=>consumer.areaId===areaId);
    const powerPositive=status.generation>0&&localConsumers.every(consumer=>consumer.entry.poweredToday);
    state.facilityOperationByArea[areaId] = { activeColdCapacity, powerPositive };
  }
}

function resolveFarming(state,summary,cropDeaths){
  for(const [areaId,plots]of Object.entries(state.plotsByArea)){
    for(let index=plots.length-1;index>=0;index-=1){
      const plot=plots[index];
      const crop=CROPS[plot.cropId],environment=getPlotEnvironmentEffects(state,plot,areaId);
      const ready=plot.phase==="ready";
      const isAutoFeedCrop=plot.cropId==="grass"||plot.cropId==="corn";
      if(!ready&&plot.watered&&plot.fertilized)plot.fertility=Math.min(5,Number(plot.fertility??0)+1);
      if(environment.rainAffected&&randomFromKey(getGameplaySeed(state),`acid-rain-plot:${state.day}:${areaId}:${plot.id}`)<environment.rainDamageChance){
        if(Number(plot.fertility??0)<=0){
          plots.splice(index,1);
          summary.push(`${areaId}：家养${crop.name}在酸雨中因丰饶已经为0而死亡`);
          const reason="酸雨侵蚀时丰饶已为0",message=`家养${crop.name}死亡：${reason}`;
          cropDeaths.push({day:state.day,areaId,plotId:plot.id,cropId:plot.cropId,name:crop.name,reason,message});
          addLog(state,`${areaId}：${message}。`);
          continue;
        }
        plot.fertility=Math.max(0,Number(plot.fertility??0)-environment.rainFertilityLoss);
        summary.push(`${areaId}：家养${crop.name}受酸雨影响，丰饶降低${environment.rainFertilityLoss}点`);
      }
      if(ready){
        if(isAutoFeedCrop){
          const yieldQty=plot.charges||cultivatedStock(state,areaId,crop,plot.fertility);
          const feedItemId=plot.cropId==="grass"?"feed":"fish_feed";
          addItem(state,feedItemId,yieldQty,{areaId,preferred:"storage"});
          let seeds=0;
          const seedRolls=crop.cultivatedSeedPerHarvest?1:yieldQty;
          for(let unit=0;unit<seedRolls;unit++)if(randomFromKey(getGameplaySeed(state),`cultivated-seed:${plot.id}:${plot.cycle}:${unit}`)<CULTIVATED_SEED_DROP_CHANCE)seeds+=1;
          if(seeds)addItem(state,crop.seedId,seeds,{areaId,preferred:"storage"});
          plot.phase="regrowing";
          plot.mature=false;
          plot.remaining=crop.growthDays;
          plot.charges=0;
          plot.maxCharges=yieldQty;
          plot.fertility=0;
          plot.cycle=(plot.cycle||0)+1;
          plot.harvestedThisCycle=0;
          summary.push(`${areaId}：${crop.name}自动收割，产出${ITEMS[feedItemId].name}×${yieldQty}已入库`);
          addLog(state,`${areaId}：${crop.name}成熟并自动收割，制成${ITEMS[feedItemId].name}×${yieldQty}${seeds?`、${ITEMS[crop.seedId].name}×${seeds}`:""}已入库。`);
        }
        plot.watered=false;plot.fertilized=false;continue;
      }
      if(plot.watered)plot.remaining-=1;
      if(plot.remaining<=0){
        const yieldQty=cultivatedStock(state,areaId,crop,plot.fertility);
        if(isAutoFeedCrop){
          const feedItemId=plot.cropId==="grass"?"feed":"fish_feed";
          addItem(state,feedItemId,yieldQty,{areaId,preferred:"storage"});
          let seeds=0;
          const seedRolls=crop.cultivatedSeedPerHarvest?1:yieldQty;
          for(let unit=0;unit<seedRolls;unit++)if(randomFromKey(getGameplaySeed(state),`cultivated-seed:${plot.id}:${plot.cycle}:${unit}`)<CULTIVATED_SEED_DROP_CHANCE)seeds+=1;
          if(seeds)addItem(state,crop.seedId,seeds,{areaId,preferred:"storage"});
          plot.phase="regrowing";
          plot.mature=false;
          plot.remaining=crop.growthDays;
          plot.charges=0;
          plot.maxCharges=yieldQty;
          plot.fertility=0;
          plot.cycle=(plot.cycle||0)+1;
          plot.harvestedThisCycle=0;
          summary.push(`${areaId}：${crop.name}自动收割，产出${ITEMS[feedItemId].name}×${yieldQty}已入库`);
          addLog(state,`${areaId}：${crop.name}成熟并自动收割，制成${ITEMS[feedItemId].name}×${yieldQty}${seeds?`、${ITEMS[crop.seedId].name}×${seeds}`:""}已入库。`);
        }else{
          plot.phase="ready";plot.mature=true;plot.maxCharges=yieldQty;plot.charges=plot.maxCharges;
          summary.push(`${areaId}：家养${crop.name}已经长满（${plot.charges}/${plot.maxCharges}）`);
        }
      }
      plot.watered=false;plot.fertilized=false;
    }
  }
}

function resolveFarmAutomation(state,summary){
  for(const [areaId,plots]of Object.entries(state.plotsByArea))applyFarmAutomation(state,areaId,plots,summary);
}

function resolveAutomaticFeeding(state,summary){
  for(const areaId of Object.keys(AREAS)){
    if(!completedInstances(state,areaId,"auto_feeder").length)continue;
    let fedPens=0,feedUsed=0,unfedPens=0,damagedPens=0;
    for(const type of AUTOMATIC_FEED_ORDER){
      const slots=getAnimalPenSlots(state,type,areaId);
      const feedItem=Object.keys(LIVESTOCK[type]?.feed??{})[0]??"feed";
      const cost=Number(LIVESTOCK[type]?.feed?.[feedItem]??0);
      for(const slot of slots){
        const penAnimals=slot.animals.filter(animal=>!animal.fed);
        if(!penAnimals.length)continue;
        if(slot.progress.damaged){damagedPens+=1;continue;}
        let fed=false;
        if(cost&&consumeLocalStorageItem(state,feedItem,cost,areaId)){
          fed=true;
        }
        if(!fed){unfedPens+=1;continue;}
        for(const animal of penAnimals)animal.fed=true;
        fedPens+=1;feedUsed+=cost;
      }
    }
    if(fedPens)summary.push(`${areaId}：自动喂食机喂养${fedPens}座栏舍`);
    if(damagedPens)summary.push(`${areaId}：${damagedPens}座栏舍因损坏未自动喂养，请先修复`);
    if(unfedPens)summary.push(`${areaId}：另有${unfedPens}座栏舍因当地普通储物格饲料不足未喂养`);
  }
}

function resolveAnimals(state,summary,animalRunaways){
  for(const [areaId,animals]of Object.entries(state.animalsByArea)){
    const escapedByType=new Map();
    for(let i=animals.length-1;i>=0;i--){
      const animal=animals[i],def=LIVESTOCK[animal.type];
      if(animal.fed){
        animal.age+=1;animal.hungryDays=0;
        if(animal.age>=def.matureDays){
          animal.productionDay+=1;
          for(const [itemId,prod]of Object.entries(def.continuous))if(animal.productionDay%prod.every===0&&(!prod.tool||countItem(state,prod.tool,areaId)>0))addItem(state,itemId,prod.quantity,{areaId});
        }
      }else animal.hungryDays+=1;
      if(animal.hungryDays>=LIVESTOCK_STARVATION_DAYS){
        escapedByType.set(animal.type,(escapedByType.get(animal.type)??0)+1);
        animals.splice(i,1);
        continue;
      }
      animal.fed=false;
    }
    for(const [type,count]of escapedByType){
      const name=LIVESTOCK[type].name,allGone=!animals.some(animal=>animal.type===type);
      const message=allGone?`一直没有吃的，养的${name}全跑掉了`:`一直没有吃的，养的${name}有${count}群跑掉了`;
      const reason=`连续${LIVESTOCK_STARVATION_DAYS}天未喂养`;
      summary.push(`${areaId}：${message}`);
      animalRunaways.push({day:state.day,areaId,type,name,count,allGone,reason,message});
      addLog(state,`${areaId}：${message}（${reason}）。`);
    }
  }
}

function resolveWeatherDamage(state,summary){
  const weather=getWeather(state),hasStorm=hasWeatherHazard(weather,"storm")&&weather.intensity!=="none",acidRain=getAcidRainStageEffect(weather);
  if(!hasStorm&&!acidRain)return;
  for(const areaId of Object.keys(AREAS)){
    const candidates=Object.entries(state.buildingsByArea[areaId]).filter(([id,progress])=>progress.completed&&!progress.damaged&&!BUILDINGS[id.replace(/__\d+$/u,"")]?.houseLevel&&!BUILDINGS[id.replace(/__\d+$/u,"")]?.damageImmune);
    if(!candidates.length)continue;
    const rainProtectionFactor=1-getOutdoorFacilityProtection(state,"rain",areaId)/100,stormProtectionFactor=1-getOutdoorFacilityProtection(state,"storm",areaId)/100,returnBaseFactor=state.returnTowerAreaId===areaId&&state.returnProgress.return_base?.completed?.5:1;
    if(acidRain){
      const chance=acidRain.facilityDamageChance*rainProtectionFactor*returnBaseFactor;
      for(const [id,progress]of candidates){
        if(BUILDINGS[id.replace(/__\d+$/u,"")]?.acidRainDamageImmune)continue;
        if(randomFromKey(getGameplaySeed(state),`acid-rain-damage:${state.day}:${areaId}:${id}`)>=chance)continue;
        progress.damaged=true;
        summary.push(`${areaId}：${BUILDINGS[id.replace(/__\d+$/u,"")]?.name}受酸雨损坏`);
      }
    }
    if(!hasStorm)continue;
    const stormCandidates=candidates.filter(([,progress])=>!progress.damaged);
    if(!stormCandidates.length)continue;
    const chance=(weather.intensity==="severe"?.9:.65)*stormProtectionFactor*returnBaseFactor;
    if(randomFromKey(getGameplaySeed(state),`weather-damage:${state.day}:${areaId}`)<chance){
      const [id,progress]=pickFromKey(stormCandidates,getGameplaySeed(state),`weather-damage-pick:${state.day}:${areaId}`);
      progress.damaged=true;summary.push(`${areaId}：${BUILDINGS[id.replace(/__\d+$/u,"")]?.name}受损`);
    }
  }
}

function refreshNodes(state) {
  for (const area of Object.values(state.areas)) {
    for (const node of Object.values(area.nodes)) {
      const definition = NODES[node.nodeId ?? node.id];
      if (definition?.respawnDays > 0 && node.charges !== null && node.charges <= 0 && node.respawnRemaining > 0) {
        node.respawnRemaining -= 1;
        if (node.respawnRemaining <= 0) node.charges = node.maxCharges ?? definition.maxCharges;
      } else if (definition?.respawnDays === 0) node.respawnRemaining = 0;
    }
  }
}

export function getEndDayWarnings(state){
  const foodReady = Boolean(state.selectedFood?.reservation);
  const drinkReady = Boolean(state.selectedDrink?.reservation);
  const previewFelt = getFeltTemperature(state);
  const previewBand = getTemperatureBand(previewFelt);
  const camping = !state.housesByArea[state.position];
  const warnings = [];
  const missing = [!foodReady ? "食物" : null, !drinkReady ? "饮料" : null].filter(Boolean).join("和");
  if (missing) warnings.push(`今日${missing}未设定`);
  if (camping) {
    const excess = previewFelt <= -10 ? -10 - previewFelt : previewFelt >= 50 ? previewFelt - 50 : 0;
    const deathRisk = previewBand.id === "lethal" ? Math.min(0.9, 0.4 + excess * 0.03) : 0;
    warnings.push(`将在室外露营：体感${previewFelt}℃（${previewBand.name}）、休息环境-2${previewBand.id === "danger" ? "、50%温度伤病率" : previewBand.id === "lethal" ? `、${Math.round(deathRisk * 100)}%死亡率，存活后必得温度伤病` : ""}`);
  }
  const gridStatus=getGridPowerStatus(state);
  if(gridStatus.shortage>0)warnings.push(`全岛可支配电力不足：发电${gridStatus.generation}点、已占用${gridStatus.demand}点，过夜时会随机让部分电器断电`);
  const projectedWaterByArea=getProjectedLocalWaterAfterProduction(state);
  for(const areaId of Object.keys(AREAS)){
    const waterStatus=getAutomaticWaterStatus(state,areaId),projectedWater=projectedWaterByArea[areaId]??waterStatus.stored;
    if(waterStatus.expectedUse>projectedWater){
      const production=Math.max(0,projectedWater-waterStatus.stored),shortage=waterStatus.expectedUse-projectedWater;
      warnings.push(`${areaId}自动用水不足：当地库存${waterStatus.stored}份＋今晚预计产水${production}份，需要${waterStatus.expectedUse}份，缺${shortage}份`);
    }
    const fuelStored=Number(state.fuelPointsByArea?.[areaId]??0),fuelDemand=getEndDayFuelDemand(state,areaId);
    if(fuelDemand>fuelStored+1e-9)warnings.push(`${areaId}自动燃料不足：总燃料槽有${formatStamina(fuelStored)}点，需要${formatStamina(fuelDemand)}点，缺${formatStamina(fuelDemand-fuelStored)}点`);
    const feedStored=countLocalStorageItem(state,"feed",areaId),feedDemand=getAutomaticFeedDemand(state,areaId);
    if(feedDemand>feedStored)warnings.push(`${areaId}自动喂食饲料不足：当地普通储物格有${feedStored}份，需要${feedDemand}份，缺${feedDemand-feedStored}份`);
  }
  return {warnings,foodReady,drinkReady,camping,previewBand};
}

function nextDayDietBuffs(consumedFood,consumedDrink){
  const buffs={attack:0,warmth:0,heat:0,rain:0,storm:0,attackTierBoost:false,sources:[]};
  for(const [kind,plan] of [["food",consumedFood],["drink",consumedDrink]]){
    const item=plan?ITEMS[plan.itemId]:null,effect=item?.nextDayEffect;
    if(!effect)continue;
    for(const key of ["attack","warmth","heat","rain","storm"])buffs[key]+=Number(effect[key]??0);
    buffs.sources.push({itemId:plan.itemId,name:item.name,kind,effect:clone(effect)});
  }
  const highAttackFood=buffs.sources.some(source=>source.kind==="food"&&source.effect.attackTier==="high");
  const highAttackDrink=buffs.sources.some(source=>source.kind==="drink"&&source.effect.attackTier==="high");
  buffs.attackTierBoost=highAttackFood&&highAttackDrink;
  return buffs;
}

function dietBuffSummary(buffs){
  const labels={attack:"攻击",warmth:"保暖",heat:"防热",rain:"防雨",storm:"防风"};
  const parts=Object.entries(labels).filter(([key])=>Number(buffs[key]??0)>0).map(([key,label])=>`${label}+${buffs[key]}`);
  if(buffs.attackTierBoost)parts.push("强攻组合：可挑战高一级敌人");
  return parts.join("、");
}

export function endDay(state, force = false) {
  if(state.player.gameOver)return {ok:false,message:"本次求生结束"};
  if (!state.dailyRewardClaimed && state.dailyTasks?.length && state.dailyTasks.every((task) => task.progress >= task.target)) {
    return { ok: false, message: "今日十连抽奖励还没有领取，请先点击每日任务里的抽奖按钮" };
  }
  const endDayPreview=getEndDayWarnings(state),{foodReady,drinkReady,camping,previewBand}=endDayPreview;
  if (!force && (!foodReady || !drinkReady || (camping && ["danger","lethal"].includes(previewBand.id)))) {
    return { ok: false, needsConfirmation: true, message: `${endDayPreview.warnings.join("；")}，仍要进入下一天吗？` };
  }

  const consumedFood = foodReady ? clone(state.selectedFood) : null;
  const consumedDrink = drinkReady ? clone(state.selectedDrink) : null;
  if (consumedFood) {
    progressTasks(state, "eat", 1);
    if(consumedFood.happiness>=2)progressTasks(state,"eat_happy",1);
    addLog(state, `结束今天时食用了${ITEMS[consumedFood.itemId].name}（幸福度${consumedFood.happiness >= 0 ? "+" : ""}${consumedFood.happiness}）。`);
  }
  if (consumedDrink) {
    progressTasks(state, "drink", 1);
    if(consumedDrink.happiness>=2)progressTasks(state,"drink_happy",1);
    addLog(state, `结束今天时饮用了${ITEMS[consumedDrink.itemId].name}（幸福度${consumedDrink.happiness >= 0 ? "+" : ""}${consumedDrink.happiness}）。`);
  }
  let rewards = state.lastLottery ? clone(state.lastLottery) : null;
  state.lastLottery = null;

  const summary = [];
  const monkeyLosses = [];
  const cropDeaths = [];
  const animalRunaways = [];
  resolvePowerAndFacilities(state,summary);
  resolveWeatherDamage(state,summary);
  resolveFarmAutomation(state,summary);
  settleDailyConsumableConsumers(state,state.position,summary);
  resolveFarming(state,summary,cropDeaths);
  resolvePastureAndHerb(state,summary);
  refreshNodes(state);
  spoilStacks(state, state.backpack.cold, true, summary, "背包保鲜格");
  spoilStacks(state, state.backpack.ordinary, false, summary, "背包");
  for (const areaId of Object.keys(AREAS)) {
    spoilStacks(state, state.storageByArea[areaId], false, summary, areaId);
    spoilStacks(state, state.coldStorageByArea[areaId], state.facilityOperationByArea[areaId]?.activeColdCapacity ?? getPassiveColdStorageCapacity(state, areaId), summary, `${areaId}保鲜库`);
    spoilStacks(state, state.groundByArea[areaId], false, summary, areaId);
    resolveGroundLoss(state, areaId, summary, monkeyLosses);
  }
  let monkeyGift=false;
  if(!state.monkeyHerbSeedGiftReceived&&Number(state.monkeyStolenItemCount??0)>=100){
    state.monkeyHerbSeedGiftReceived=true;
    addItem(state,"herb_seed",1);
    summary.push("猴子送来草药种子×1");
    addLog(state,"收到猴子的礼物：草药种子×1。");
    monkeyGift=true;
  }
  resolveAutomaticFeeding(state,summary);
  resolveAnimals(state,summary,animalRunaways);

  const felt = getFeltTemperature(state);
  if(getTemperatureBand(felt).id==="comfortable")progressTasks(state,"comfort",1);
  if(state.housesByArea[state.position])progressTasks(state,"end_in_house",1);
  if(state.player.stamina>=1)progressTasks(state,"stamina_end",1);
  if(state.furnitureByArea[state.position].some(f=>FURNITURE[f.itemId]?.switchable&&f.enabled!==false))progressTasks(state,"device_end",1);
  if(!rewards&&state.lastLottery)rewards=clone(state.lastLottery);
  state.lastLottery=null;
  const finalBand = getTemperatureBand(felt);
  state.campedLastNight = camping;
  if (camping && finalBand.id === "danger" && randomFromKey(getGameplaySeed(state), `camp-injury:${state.day}`) < 0.5) {
    if (felt < 10) inflictInjury(state); else state.player.sick = true;
    summary.push("露营时遭受温度伤病");
  }
  if (camping && finalBand.id === "lethal") {
    const excess = felt <= -10 ? -10 - felt : felt - 50;
    const deathRisk = Math.min(0.9, 0.4 + excess * 0.03);
    if (randomFromKey(getGameplaySeed(state), `camp-death:${state.day}`) < deathRisk) {
      recordGameOver(state,felt<=-10?"露营时未能从致命严寒中幸存":"露营时未能从致命酷热中幸存");
      summary.push("未能在致命温度的露营中幸存");
    } else {
      if (felt < 10) inflictInjury(state); else state.player.sick = true;
      summary.push("熬过了致命温度的露营，但必然受到温度伤病");
    }
  }

  const keptStaminaForRecovery=state.player.injury>0&&state.player.stamina>0;
  state.injuryRestDays=keptStaminaForRecovery?state.injuryRestDays+1:0;
  if(state.player.injury>0&&state.injuryRestDays>=3){state.player.injury-=1;state.injuryRestDays=0;summary.push("连续3天保留体力后自然恢复一层伤势");}
  const clinicReady = completedInstances(state,state.position,"clinic").length>0;
  if(clinicReady&&state.player.injury>0&&!state.dailyWoundTreatmentUsed){state.player.injury-=1;summary.push("医务室护理使伤势减轻一层");}
  if(state.player.injury<=0)state.injuryRestDays=0;
  const comfortableRecovery=state.player.sick&&finalBand.id==="comfortable"&&consumedFood&&consumedDrink;
  state.comfortRecoveryDays=comfortableRecovery?state.comfortRecoveryDays+1:0;
  const sicknessRecoveryDays=clinicReady?2:3;
  if(state.player.sick&&state.comfortRecoveryDays>=sicknessRecoveryDays){state.player.sick=false;state.comfortRecoveryDays=0;summary.push(clinicReady?"在医务室连续养病2天后痊愈":"连续舒适作息3天后自然痊愈");}
  state.temperatureDiscomfortDays = felt < 10 || felt > 30 ? state.temperatureDiscomfortDays + 1 : 0;
  if (state.temperatureDiscomfortDays >= 5) state.player.sick = true;

  const happinessSources = [
    { label: consumedFood ? ITEMS[consumedFood.itemId].name : "未进食", value: consumedFood?.happiness ?? -10 },
    { label: consumedDrink ? ITEMS[consumedDrink.itemId].name : "未饮水", value: consumedDrink?.happiness ?? -10 },
    ...getLocalHappinessSources(state),
    ...(state.mailReceivedToday ? [{ label: "收到关系邮件", value: 1 }] : []),
    ...(state.player.stamina >= 2 ? [{ label: "剩余体力充足", value: 1 }] : state.player.stamina <= 0 ? [{ label: "体力耗尽", value: -1 }] : []),
    ...(!state.housesByArea[state.position] ? [{ label: "露营过夜", value: -2 }] : []),
    ...(felt < 10 || felt > 30 ? [{ label: "体感温度不适", value: -6 }] : []),
    ...(state.player.sick ? [{ label: "生病", value: -10 }] : []),
    ...(state.player.injury > 0 ? [{ label: `受伤${state.player.injury}层`, value: -10 }] : [])
  ];
  const rawHappiness = happinessSources.reduce((sum, source) => sum + source.value, 0);
  state.player.happiness = Math.max(-10, rawHappiness);
  state.happinessBreakdown = { day: state.day, entries: happinessSources, rawTotal: rawHappiness, finalTotal: state.player.happiness };
  const baseMaxStamina = Math.max(5, 10 + state.player.happiness / 2);
  const statusDivisor = (2 ** state.player.injury) * (state.player.sick ? 2 : 1);
  state.player.maxStamina = Math.max(5, Math.round(baseMaxStamina / statusDivisor * 10) / 10);
  state.player.stamina = state.player.maxStamina;
  state.player.noFoodAndDrinkDays = !consumedFood&&!consumedDrink ? state.player.noFoodAndDrinkDays + 1 : 0;
  state.player.incompleteDietDays = consumedFood&&consumedDrink ? 0 : state.player.incompleteDietDays + 1;
  state.player.extremeDays = !state.housesByArea[state.position] && (felt <= 0 || felt >= 40) ? state.player.extremeDays + 1 : 0;
  if(state.player.noFoodAndDrinkDays>=3){recordGameOver(state,"连续3天没有吃饭也没有喝水");summary.push("连续3天没有吃饭也没有喝水，未能活下来");}
  else if(state.player.incompleteDietDays>=10){recordGameOver(state,"连续10天未能同时完成吃饭和喝水");summary.push("连续10天未能同时完成吃饭和喝水，未能活下来");}
  else if(state.player.extremeDays>=3){recordGameOver(state,"连续3天在无房屋地块经历极端温度（体感0℃及以下或40℃及以上）");summary.push("连续3天在无房屋地块经历极端温度（体感0℃及以下或40℃及以上），未能活下来");}

  state.survivalHistory.push({day:state.day,areaId:state.position,ate:Boolean(consumedFood),drank:Boolean(consumedDrink),tradedFoodWater:state.dailyTradeFoodWater,powerPositive:Boolean(state.facilityOperationByArea[state.position]?.powerPositive),waterPositive:countItem(state,"water",state.position)>0});
  if(state.survivalHistory.length>30)state.survivalHistory.splice(0,state.survivalHistory.length-30);
  state.dailyTradeFoodWater=false;
  state.dailyWoundTreatmentUsed=false;
  state.mailReceivedToday=false;

  state.player.dietBuffs=nextDayDietBuffs(consumedFood,consumedDrink);
  const nextDayBuffText=dietBuffSummary(state.player.dietBuffs);
  if(nextDayBuffText)summary.push(`次日饮食加成：${nextDayBuffText}`);

  state.day += 1;
  state.gridPowerSpentToday=0;
  state.yesterdayDiet = {
    food: consumedFood ? consumedFood.itemId : (state.selectedFood?.itemId ?? null),
    drink: consumedDrink ? consumedDrink.itemId : (state.selectedDrink?.itemId ?? null)
  };
  state.selectedFood = null;
  state.selectedDrink = null;
  state.dailyRewardClaimed = false;
  state.dailyTasks = generateDailyTasks(state);
  state.tradeOffers = generateTradeOffers(state);
  state.lastDaySummary = summary;
  addLog(state, `进入第${state.day}日。幸福度${state.player.happiness >= 0 ? "+" : ""}${state.player.happiness}，体力恢复至${formatStamina(state.player.maxStamina)}。`);
  return { ok: true, summary, rewards, monkeyLosses, monkeyGift, cropDeaths, animalRunaways };
}

export function getInventoryView(state) {
  return {
    cold: clone(state.backpack.cold),
    ordinary: clone(state.backpack.ordinary),
    storage: clone(state.storageByArea[state.position]),
    localCold: clone(state.coldStorageByArea[state.position]),
    wardrobe: clone(state.wardrobeByArea[state.position]),
    seedStorage: clone(state.seedStorageByArea[state.position]),
    utilityStorage: clone(state.utilityStorageByArea[state.position]),
    ground: clone(state.groundByArea[state.position])
  };
}

function inventoryCollection(state, location) {
  const backpackCapacity=getBackpackCapacity(state);
  if (location === "cold") return { stacks: state.backpack.cold, capacity: backpackCapacity.cold };
  if (location === "ordinary") return { stacks: state.backpack.ordinary, capacity: backpackCapacity.ordinary };
  if (location === "storage") return { stacks: state.storageByArea[state.position], capacity: getStorageCapacity(state, state.position) };
  if (location === "local-cold") return { stacks: state.coldStorageByArea[state.position], capacity: getColdStorageCapacity(state, state.position) };
  if (location === "wardrobe") return { stacks: state.wardrobeByArea[state.position], capacity: getWardrobeCapacity(state, state.position) };
  if (location === "seed-storage") return { stacks: state.seedStorageByArea[state.position], capacity: getSeedStorageCapacity(state, state.position) };
  if (location === "utility-storage") return { stacks: state.utilityStorageByArea[state.position], capacity: getUtilityStorageCapacity(state, state.position) };
  if (location === "ground") return { stacks: state.groundByArea[state.position], capacity: Infinity };
  return null;
}

const INVENTORY_LOCATIONS = ["cold", "ordinary", "wardrobe", "seed-storage", "utility-storage", "local-cold", "storage", "ground"];

function validateInventoryTransfer(state, sourceLocation, sourceIndex, targetLocation) {
  const source = inventoryCollection(state, sourceLocation);
  const target = inventoryCollection(state, targetLocation);
  if (!source || !target || sourceLocation === targetLocation) return { ok: false, message: "无效的搬运位置" };
  const stack = source.stacks[sourceIndex];
  if (!stack) return { ok: false, message: "物品已经不在原处" };
  const item = ITEMS[stack.itemId];
  if(stack.itemId==="kayak"&&KAYAK_REQUIRED_AREAS.has(state.position)&&["cold","ordinary"].includes(sourceLocation)&&targetLocation==="ground")return {ok:false,message:"在这片水域不能把皮划艇从背包放到地面"};
  if(targetLocation==="wardrobe"&&!['weapon','armor','backpack'].includes(item.type))return {ok:false,message:"衣帽间只能存放武器、护具和背包"};
  if(targetLocation==="seed-storage"&&item.type!=="seed")return {ok:false,message:"种子储存室只能存放种子"};
  if(targetLocation==="utility-storage"&&!isUtilityStorageItem(stack.itemId))return {ok:false,message:"杂物间只能存放家具和工具"};
  if (["cold", "local-cold"].includes(targetLocation) && !item.shelfLifeNights) return { ok: false, message: "没有腐坏期限的物品不能放入保鲜格" };
  const mergeTarget=target.stacks.find(entry=>entry.itemId===stack.itemId);
  if (!mergeTarget && target.stacks.length >= target.capacity) return { ok: false, message: "目标位置没有空格" };
  return { ok: true, source, target, stack, item, mergeTarget };
}

export function getInventoryTransferTargets(state, sourceLocation, sourceIndex) {
  return INVENTORY_LOCATIONS.filter((targetLocation) => validateInventoryTransfer(state, sourceLocation, sourceIndex, targetLocation).ok);
}

export function reorderInventoryStack(state, location, sourceIndex, insertionIndex) {
  const collection = inventoryCollection(state, location);
  if (!collection || !Number.isInteger(sourceIndex) || !Number.isInteger(insertionIndex) || sourceIndex < 0 || sourceIndex >= collection.stacks.length || insertionIndex < 0 || insertionIndex > collection.stacks.length) return { ok: false, message: "无效的排序位置" };
  // The insertion gap belongs to the original row, before removing the source stack.
  const targetIndex = insertionIndex > sourceIndex ? insertionIndex - 1 : insertionIndex;
  if (targetIndex === sourceIndex) return { ok: true, changed: false };
  const [stack] = collection.stacks.splice(sourceIndex, 1);
  collection.stacks.splice(targetIndex, 0, stack);
  return { ok: true, changed: true };
}

export function transferStack(state, sourceLocation, sourceIndex, targetLocation) {
  const validation = validateInventoryTransfer(state, sourceLocation, sourceIndex, targetLocation);
  if (!validation.ok) return validation;
  const { source, target, stack, item, mergeTarget } = validation;
  if (mergeTarget) mergeStackQuantities(mergeTarget,stack);
  else target.stacks.push(clone(stack));
  source.stacks.splice(sourceIndex, 1);
  addLog(state, `搬运了${item.name}×${stack.quantity}。`);
  return { ok: true };
}

export function getAreaDisplayName(areaId) {
  return AREAS[areaId]?.name ?? areaId;
}

export function getMapCellName(areaId) {
  const { x, y } = coordParts(areaId);
  return AREA_NAMES[y]?.[x] ?? "未知区域";
}

export function formatInputs(inputs) {
  return Object.entries(inputs).map(([itemId, quantity]) => `${ITEMS[itemId].name}×${quantity}`).join("、");
}

export function addLog(state, text) {
  state.logs.push({ day: state.day, text });
  if (state.logs.length > 100) state.logs.splice(0, state.logs.length - 100);
}

export function consolidateBackpack(state) {
  let transferredCount = 0;
  const areaId = state.position;
  const backpackSlots = [state.backpack.ordinary, state.backpack.cold];

  const storages = [
    { type: "storage", stacks: state.storageByArea[areaId] ??= [], capacity: getStorageCapacity(state, areaId), allowed: () => true },
    { type: "cold", stacks: state.coldStorageByArea[areaId] ??= [], capacity: getColdStorageCapacity(state, areaId), allowed: (item) => Boolean(item?.shelfLifeNights) },
    { type: "seed-storage", stacks: state.seedStorageByArea[areaId] ??= [], capacity: getSeedStorageCapacity(state, areaId), allowed: (item) => item?.type === "seed" },
    { type: "utility-storage", stacks: state.utilityStorageByArea[areaId] ??= [], capacity: getUtilityStorageCapacity(state, areaId), allowed: (item) => isUtilityStorageItem(item?.id ?? item) },
    { type: "wardrobe", stacks: state.wardrobeByArea[areaId] ??= [], capacity: getWardrobeCapacity(state, areaId), allowed: (item) => ["weapon", "armor", "backpack"].includes(item?.type) }
  ];

  for (const stacks of backpackSlots) {
    for (let i = stacks.length - 1; i >= 0; i--) {
      const stack = stacks[i];
      if (!stack || stack.quantity <= 0) {
        stacks.splice(i, 1);
        continue;
      }
      const item = ITEMS[stack.itemId];
      for (const storage of storages) {
        if (storage.capacity <= 0 || !storage.allowed(item)) continue;
        const existing = storage.stacks.find(s => s.itemId === stack.itemId);
        if (existing) {
          mergeStackQuantities(existing, stack);
          stacks.splice(i, 1);
          transferredCount++;
          break;
        }
      }
    }
  }

  const mergeInternal = (stacks) => {
    const map = new Map();
    for (let i = 0; i < stacks.length; i++) {
      const stack = stacks[i];
      if (!stack || stack.quantity <= 0) {
        stacks.splice(i, 1);
        i--;
        continue;
      }
      if (map.has(stack.itemId)) {
        const existing = map.get(stack.itemId);
        mergeStackQuantities(existing, stack);
        stacks.splice(i, 1);
        i--;
        transferredCount++;
      } else {
        map.set(stack.itemId, stack);
      }
    }
  };

  mergeInternal(state.backpack.ordinary);
  mergeInternal(state.backpack.cold);

  if (transferredCount > 0) {
    addLog(state, "整理了背包物资。");
  }
  return { ok: true, transferredCount };
}

export function applyYesterdayDiet(state) {
  const yesterday = state.yesterdayDiet;
  if (!yesterday || (!yesterday.food && !yesterday.drink)) {
    return { ok: true, changed: false };
  }
  let appliedFood = false;
  let appliedDrink = false;
  if (yesterday.food) {
    const res = selectConsumableFrom(state, yesterday.food);
    if (res.ok) appliedFood = true;
  }
  if (yesterday.drink) {
    const res = selectConsumableFrom(state, yesterday.drink);
    if (res.ok) appliedDrink = true;
  }
  return { ok: true, changed: appliedFood || appliedDrink };
}

export function storeAllSeeds(state) {
  const areaId = state.position;
  const capacity = getSeedStorageCapacity(state, areaId);
  if (capacity <= 0) return { ok: false, message: "当地没有种子储存室" };
  state.seedStorageByArea ??= {};
  const seedStorage = state.seedStorageByArea[areaId] ??= [];
  let transferredCount = 0;

  const sources = [
    state.backpack.ordinary,
    state.backpack.cold,
    state.storageByArea[areaId] ??= [],
    state.groundByArea[areaId] ??= []
  ];

  for (const stacks of sources) {
    for (let i = stacks.length - 1; i >= 0; i--) {
      const stack = stacks[i];
      if (!stack || stack.quantity <= 0) {
        stacks.splice(i, 1);
        continue;
      }
      const item = ITEMS[stack.itemId];
      if (item?.type !== "seed") continue;

      const existing = seedStorage.find(s => s.itemId === stack.itemId);
      if (existing) {
        mergeStackQuantities(existing, stack);
        stacks.splice(i, 1);
        transferredCount++;
        continue;
      }

      if (seedStorage.length < capacity) {
        seedStorage.push(stack);
        stacks.splice(i, 1);
        transferredCount++;
      }
    }
  }

  if (transferredCount > 0) {
    addLog(state, "已将地块与背包中的种子收纳进储存室。");
  }
  return {
    ok: true,
    transferredCount,
    message: transferredCount > 0 ? "已收纳种子" : "暂无可收纳种子"
  };
}
