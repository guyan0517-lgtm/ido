import {
  AREAS,
  BLUEPRINTS,
  BUILDINGS,
  CONTINUED_EXPLORATION_NODE_WEIGHTS,
  CONTINUED_EXPLORATION_SPECIAL_NODE_CHANCES,
  CROPS,
  DEVICES,
  ENEMIES,
  EQUIPMENT,
  GRASSLAND_HERB_CHANCE,
  HERB_SEED_REPLACEMENT_CHANCE,
  ITEMS,
  KAYAK_REQUIRED_AREAS,
  NODES,
  RECIPES,
  SHIPWRECK_CHEST_PACKS,
  WILD_SEED_DROP_CHANCES
} from "./data.js";
import { ACTIVE_ATTACK_CHANCE, getActiveAttackAreasForEnemy } from "./active-attacks.js";

const START_AREA = "D4";
const EXPLORATION_STAMINA = 3;
const DISCOVERY_EFFORT_FACTOR = 0.5;
const TOOL_ASSET_AMORTIZATION = 10;
const SEED_VALUE_MULTIPLIER = 2;
const FULL_STATION_VALUE_RECIPE_IDS = new Set(["kayak"]);

const roundValue = (value) => Math.round(value * 100) / 100;
const finiteValue = (value) => Number.isFinite(value) && value > 0;
const finalizeValue = (itemId, value) => roundValue(roundValue(Math.max(0.1,value))*(ITEMS[itemId]?.type==="seed"?SEED_VALUE_MULTIPLIER:1));
const kayakSurchargeForArea = (areaId, values) => KAYAK_REQUIRED_AREAS.has(areaId)
  ? (finiteValue(values.kayak) ? values.kayak / TOOL_ASSET_AMORTIZATION : Infinity)
  : 0;
const kayakSurchargeDetail = (surcharge) => surcharge > 0 ? `，皮划艇摊销${roundValue(surcharge)}` : "";
const nodeOutputEntries = (node) => node?.randomOutputs?.length
  ? node.randomOutputs.map((output) => ({ itemId: output.itemId, chance: Number(output.chance ?? 0) }))
  : node?.output ? [{ itemId: node.output, chance: 1 }] : [];
const itemRecipeTier = (itemId) => Math.min(
  ...Object.values(RECIPES)
    .filter((recipe) => (recipe.outputs ?? [recipe.output]).some((output) => output?.itemId === itemId))
    .map((recipe) => recipe.tier ?? 1),
  99
);
const isTradeableValueItem = (itemId) => Boolean(ITEMS[itemId]) && ITEMS[itemId].tradeable !== false && !ITEMS[itemId].unique;
// 一次性剧情物保留取得成本供审计，不能用赠送成本压低普通可交易物的价值。
const canPriceFromSource = (itemId, repeatable) => repeatable || !isTradeableValueItem(itemId);

function isRepeatableNodeSource(areaId,nodeId){
  const node=NODES[nodeId];
  if(!node||node.uniqueSite)return false;
  if(!node.special||Number(node.respawnDays)>0)return true;
  const special=CONTINUED_EXPLORATION_SPECIAL_NODE_CHANCES[areaId];
  return Number(CONTINUED_EXPLORATION_NODE_WEIGHTS[areaId]?.[nodeId])>0
    || (special?.nodeId===nodeId&&Number(special.chance)>0);
}

function areaNeighbors(areaId) {
  const x = areaId.charCodeAt(0) - 65;
  const y = Number(areaId[1]) - 1;
  return [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]
    .filter(([nextX, nextY]) => nextX >= 0 && nextX < 7 && nextY >= 0 && nextY < 7)
    .map(([nextX, nextY]) => `${String.fromCharCode(65 + nextX)}${nextY + 1}`);
}

function buildTravelDistances() {
  const result = { [START_AREA]: 0 };
  const queue = [START_AREA];
  while (queue.length) {
    const areaId = queue.shift();
    for (const nextId of areaNeighbors(areaId)) {
      if (!AREAS[nextId] || result[nextId] !== undefined) continue;
      result[nextId] = result[areaId] + 1;
      queue.push(nextId);
    }
  }
  return result;
}

const TRAVEL_DISTANCES = buildTravelDistances();
const WILD_VALUE_ONLY_HUNT_DROPS=Object.freeze({
  sheep_flock:Object.freeze({wool:Object.freeze([1,1])}),
  cattle_herd:Object.freeze({milk:Object.freeze([1,1])})
});
const NEAREST_WILD_NODE_AREA=Object.freeze(Object.fromEntries(Object.keys(WILD_VALUE_ONLY_HUNT_DROPS).map(nodeId=>{
  const areaId=Object.entries(AREAS)
    .filter(([,area])=>area.nodes.some(site=>site.nodeId===nodeId))
    .sort(([left],[right])=>(TRAVEL_DISTANCES[left]??12)-(TRAVEL_DISTANCES[right]??12)||left.localeCompare(right))[0]?.[0];
  return [nodeId,areaId];
})));

function buildMinimumWildTravelByItem(){
  const result=new Map(),record=(itemId,travel)=>{if(itemId&&travel<(result.get(itemId)??Infinity))result.set(itemId,travel);};
  for(const [areaId,area] of Object.entries(AREAS)){
    const travel=TRAVEL_DISTANCES[areaId]??12;
    for(const site of area.nodes){
      const node=NODES[site.nodeId];
      const repeatable=isRepeatableNodeSource(areaId,site.nodeId);
      for(const output of nodeOutputEntries(node))if(canPriceFromSource(output.itemId,repeatable))record(output.itemId,travel);
      for(const itemId of Object.keys(node?.huntDrops??{}))if(canPriceFromSource(itemId,repeatable))record(itemId,travel);
      for(const itemId of Object.keys(WILD_VALUE_ONLY_HUNT_DROPS[site.nodeId]??{}))if(canPriceFromSource(itemId,repeatable))record(itemId,travel);
    }
  }
  for(const [enemyId,enemy] of Object.entries(ENEMIES)){
    const areas=enemy.boss?[enemy.area]:getActiveAttackAreasForEnemy(enemyId);
    const travel=Math.min(...areas.filter(Boolean).map(areaId=>TRAVEL_DISTANCES[areaId]??12));
    for(const itemId of [...Object.keys(enemy.drops??{}),...Object.keys(enemy.rare??{})])if(canPriceFromSource(itemId,!enemy.boss))record(itemId,travel);
  }
  return result;
}
const MINIMUM_WILD_TRAVEL_BY_ITEM=buildMinimumWildTravelByItem();

function nodeDiscoveryProbability(areaId,nodeId){
  const area=AREAS[areaId];
  if(!area)return 0;
  const configuredWeights=CONTINUED_EXPLORATION_NODE_WEIGHTS[areaId];
  const configuredTotal=configuredWeights?Object.values(configuredWeights).reduce((total,weight)=>total+Number(weight),0):0;
  if(configuredWeights?.[nodeId]&&configuredTotal>0)return Number(configuredWeights[nodeId])/(configuredTotal<=100?100:configuredTotal);
  const count=area.nodes.filter(site=>site.nodeId===nodeId).length;
  return area.nodes.length?count/area.nodes.length:0;
}

export const RAW_BASIC_MATERIAL_IDS = Object.freeze([...new Set(
  Object.values(NODES)
    .filter((node) => !node.uniqueSite && !node.special)
    .flatMap(nodeOutputEntries)
    .map((output) => output.itemId)
    .filter((itemId) => ["material", "fuel", "drink"].includes(ITEMS[itemId]?.type))
)]);

const rawBasicMaterialSet = new Set(RAW_BASIC_MATERIAL_IDS);
export const isRawBasicMaterial = (itemId) => rawBasicMaterialSet.has(itemId);

function inputValue(inputs, values) {
  let total = 0;
  for (const [itemId, quantity] of Object.entries(inputs ?? {})) {
    if (!finiteValue(values[itemId])) return Infinity;
    total += values[itemId] * quantity;
  }
  return total;
}

function constructionValue(buildingId, values) {
  const building = BUILDINGS[buildingId];
  if (!building) return Infinity;
  const options = [building.inputs, ...(building.alternatives ?? [])];
  const perStep = Math.min(...options.map((inputs) => inputValue(inputs, values)));
  if (!finiteValue(perStep)) return Infinity;
  return (perStep + Number(building.stamina ?? 0)) * Number(building.steps ?? 1);
}

function stationValue(stationId, values) {
  if (!stationId) return 0;
  if (stationId === "stone_pot") {
    const pot = values.stone_pot;
    const bonfire = constructionValue("bonfire", values);
    return finiteValue(pot) && finiteValue(bonfire) ? pot + bonfire : Infinity;
  }
  if (stationId === "needle") {
    const workbench = constructionValue("workbench", values);
    const needle = Math.min(values.wood_needle, values.iron_needle);
    return finiteValue(workbench) && finiteValue(needle) ? workbench + needle : Infinity;
  }
  if (BUILDINGS[stationId]) return constructionValue(stationId, values);
  if (finiteValue(values[stationId])) return values[stationId];
  return Infinity;
}

function recipeOptions(recipe) {
  return [recipe.inputs, ...(recipe.alternatives ?? [])].map((inputs, index) => ({
    inputs,
    outputQuantity: recipe.alternativeOutputQuantities?.[index]
      ?? (recipe.alternativeQuantity && (recipe.rareAlternativeIndex !== undefined ? index === recipe.rareAlternativeIndex : index > 0)
        ? recipe.alternativeQuantity
        : Number(recipe.output?.quantity ?? recipe.outputs?.[0]?.quantity ?? 1))
  }));
}

function minimumToolMethod(methods, values) {
  const hand = methods.find((method) => method.hand);
  if (hand) return { quantity: hand.hand, toolCost: 0, toolId: null };

  const candidates = [];
  for (const method of methods) {
    if (method.requiredItem) {
      const toolValue = values[method.requiredItem];
      if (finiteValue(toolValue)) candidates.push({
        quantity: Number(method.quantity ?? 1),
        toolCost: toolValue / TOOL_ASSET_AMORTIZATION,
        toolId: method.requiredItem,
        tier: itemRecipeTier(method.requiredItem)
      });
    }
    for (const [toolId, quantity] of Object.entries(method.yields ?? {})) {
      const toolValue = values[toolId];
      if (!finiteValue(toolValue)) continue;
      candidates.push({
        quantity: Number(quantity),
        toolCost: toolValue / TOOL_ASSET_AMORTIZATION,
        toolId,
        tier: itemRecipeTier(toolId)
      });
    }
  }
  candidates.sort((left, right) => left.tier - right.tier || left.toolCost - right.toolCost || left.toolId.localeCompare(right.toolId));
  return candidates[0] ?? null;
}

function minimumHuntWeapon(enemyAttack,weakness,values){
  if(enemyAttack<10)return {itemId:null,value:0};
  return Object.entries(EQUIPMENT)
    .filter(([,equipment])=>Number(equipment.attack??0)+10+(equipment.weaponStyle===weakness?1:0)>enemyAttack)
    .map(([itemId])=>({itemId,value:values[itemId]}))
    .filter(entry=>finiteValue(entry.value))
    .sort((left,right)=>left.value-right.value)[0]??null;
}

function naturalSources(values) {
  const result = [];
  for (const [areaId, area] of Object.entries(AREAS)) {
    const discoverable = area.nodes;
    const occurrences = {};
    for (const site of discoverable) occurrences[site.nodeId] = (occurrences[site.nodeId] ?? 0) + 1;
    for (const [nodeId, count] of Object.entries(occurrences)) {
      const node = NODES[nodeId];
      if (!node?.output || !node.methods?.length) continue;
      const repeatable=isRepeatableNodeSource(areaId,nodeId);
      const probability=nodeDiscoveryProbability(areaId,nodeId);
      const discovery = EXPLORATION_STAMINA * DISCOVERY_EFFORT_FACTOR / probability;
      const travel = TRAVEL_DISTANCES[areaId] ?? 12;
      const kayakSurcharge=kayakSurchargeForArea(areaId,values);
      if(!Number.isFinite(kayakSurcharge))continue;
      if(node.huntAttack){
        const weapon=minimumHuntWeapon(Number(node.huntAttack),node.weakness,values);
        if(!weapon)continue;
        const actionEffort=discovery+Number(node.stamina??0)+travel;
        const weaponCost=weapon.value/TOOL_ASSET_AMORTIZATION;
        for(const [itemId,[quantity,chance]] of Object.entries(node.huntDrops??{}))if(quantity>0&&chance>0&&canPriceFromSource(itemId,repeatable))result.push({
          itemId,travel,value:weaponCost+actionEffort/(quantity*chance)+kayakSurcharge,detail:`狩猎：${areaId}${area.name}${node.name}，掉率${roundValue(chance*100)}%，移动${travel}${weapon.itemId?`，最低武器${ITEMS[weapon.itemId].name}`:"，无需武器"}${kayakSurchargeDetail(kayakSurcharge)}`
        });
        if(NEAREST_WILD_NODE_AREA[nodeId]===areaId)for(const [itemId,[quantity,chance]] of Object.entries(WILD_VALUE_ONLY_HUNT_DROPS[nodeId]??{}))if(quantity>0&&chance>0&&canPriceFromSource(itemId,repeatable))result.push({
          itemId,travel,value:weaponCost+actionEffort/(quantity*chance)+kayakSurcharge,detail:`野外采集基准：${areaId}${area.name}${node.name}，按最近野外来源计算，不读取家畜产量，移动${travel}${weapon.itemId?`，最低武器${ITEMS[weapon.itemId].name}`:"，无需武器"}${kayakSurchargeDetail(kayakSurcharge)}`
        });
        const captureTool=Object.entries(ITEMS).find(([,item])=>item.toolType===node.captureTool);
        if(node.captureOutput&&captureTool&&finiteValue(values[captureTool[0]])&&Number(node.captureChance)>0&&canPriceFromSource(node.captureOutput,repeatable))result.push({
          itemId:node.captureOutput,
          value:weaponCost+values[captureTool[0]]+actionEffort/Number(node.captureChance)+kayakSurcharge,
          detail:`捕获：背包携带${captureTool[1].name}成功狩猎${node.name}，概率${roundValue(Number(node.captureChance)*100)}%，捕获成功消耗${captureTool[1].name}×1${kayakSurchargeDetail(kayakSurcharge)}`
        });
        continue;
      }
      const method = minimumToolMethod(node.methods, values);
      if (!method?.quantity) continue;
      const matchingSites = discoverable.filter((site) => site.nodeId === nodeId);
      const pointCapacity = matchingSites.reduce((total, site) => {
        const capacity = Number(site.maxCharges ?? node.maxCharges ?? 1);
        return total + (Number.isFinite(capacity) && capacity > 0 ? capacity : 1);
      }, 0) / matchingSites.length;
      const discoveryPerUnit = discovery / pointCapacity;
      const travelPerUnit = travel / pointCapacity;
      const gathering = Number(node.stamina ?? 0) / method.quantity;
      const effortPerUnit=discoveryPerUnit+gathering+travelPerUnit;
      for(const output of nodeOutputEntries(node))if(output.chance>0&&canPriceFromSource(output.itemId,repeatable))result.push({
        itemId:output.itemId,travel,
        value:method.toolCost+effortPerUnit/output.chance+kayakSurcharge,
        detail:`采集：${areaId}${area.name}${node.randomOutputs?.length?`，产物概率${roundValue(output.chance*100)}%`:""}，发现率${roundValue(probability * 100)}%，每点${roundValue(pointCapacity)}份，发现摊销${roundValue(discoveryPerUnit)}，移动摊销${roundValue(travelPerUnit)}，采集${roundValue(gathering)}，${method.toolId ? `最低工具${ITEMS[method.toolId].name}` : "可徒手"}${kayakSurchargeDetail(kayakSurcharge)}`
      });
    }
  }
  for(const [areaId,{nodeId,chance}]of Object.entries(CONTINUED_EXPLORATION_SPECIAL_NODE_CHANCES)){
    const area=AREAS[areaId],node=NODES[nodeId],method=minimumToolMethod(node?.methods??[],values);
    if(!area||!node?.output||!method?.quantity||!(chance>0))continue;
    const matchingSite=area.nodes.find(site=>site.nodeId===nodeId);
    const pointCapacity=Number(matchingSite?.maxCharges??node.maxCharges??1);
    const discovery=EXPLORATION_STAMINA*DISCOVERY_EFFORT_FACTOR/chance;
    const travel=TRAVEL_DISTANCES[areaId]??12;
    const discoveryPerUnit=discovery/pointCapacity;
    const travelPerUnit=travel/pointCapacity;
    const gathering=Number(node.stamina??0)/method.quantity;
    const effortPerUnit=discoveryPerUnit+gathering+travelPerUnit;
    const kayakSurcharge=kayakSurchargeForArea(areaId,values);
    if(!Number.isFinite(kayakSurcharge))continue;
    for(const output of nodeOutputEntries(node))if(output.chance>0&&canPriceFromSource(output.itemId,isRepeatableNodeSource(areaId,nodeId)))result.push({
      itemId:output.itemId,travel,
      value:method.toolCost+effortPerUnit/output.chance+kayakSurcharge,
      detail:`持续探索：${areaId}${area.name}${node.randomOutputs?.length?`，产物概率${roundValue(output.chance*100)}%`:""}，满探索后发现率${roundValue(chance*100)}%，每点${roundValue(pointCapacity)}份，发现摊销${roundValue(discoveryPerUnit)}，移动摊销${roundValue(travelPerUnit)}，采集${roundValue(gathering)}，${method.toolId?`最低工具${ITEMS[method.toolId].name}`:"可徒手"}${kayakSurchargeDetail(kayakSurcharge)}`
    });
  }
  return result;
}

function seedSources(values){
  const result=[];
  for(const crop of Object.values(CROPS)){
    const herbSeed=crop.id==="herb";
    const seedChance=herbSeed
      ?GRASSLAND_HERB_CHANCE*HERB_SEED_REPLACEMENT_CHANCE
      :Number(crop.wildSeedChance??(crop.id==="apple"?WILD_SEED_DROP_CHANCES.tree:WILD_SEED_DROP_CHANCES.crop));
    if(!(seedChance>0))continue;
    const candidates=[];
    for(const [areaId,area] of Object.entries(AREAS)){
      const nodeIds=[...new Set(area.nodes.map(site=>site.nodeId))];
      for(const nodeId of nodeIds){
        const node=NODES[nodeId];
        if(!isRepeatableNodeSource(areaId,nodeId))continue;
        if((herbSeed?nodeId!=="grassland":node?.output!==crop.id))continue;
        const hand=node.methods?.find(method=>Number(method.hand)>0);
        const probability=nodeDiscoveryProbability(areaId,nodeId);
        if(!hand||!(probability>0))continue;
        const travel=TRAVEL_DISTANCES[areaId]??12;
        const kayak=kayakSurchargeForArea(areaId,values);
        if(!Number.isFinite(kayak))continue;
        const discovery=EXPLORATION_STAMINA/probability;
        const seedRollsPerGather=crop.wildSeedPerGather?1:Number(hand.hand);
        const gathering=Number(node.stamina??0)/seedRollsPerGather/probability/seedChance;
        candidates.push({
          itemId:crop.seedId,
          travel,
          value:discovery+gathering+travel+kayak,
          detail:`种子：${areaId}${area.name}${node.name}，发现率${roundValue(probability*100)}%，徒手产量${hand.hand}，种子掉率${roundValue(seedChance*100)}%，探索${roundValue(discovery)}，采集${roundValue(gathering)}，移动${travel}${kayakSurchargeDetail(kayak)}`
        });
      }
    }
    const nearestTravel=Math.min(...candidates.map(candidate=>candidate.travel));
    const selected=candidates.filter(candidate=>candidate.travel===nearestTravel).sort((left,right)=>left.value-right.value)[0];
    if(selected)result.push(selected);
  }
  return result;
}

function combatSources(values) {
  const result = [];
  const weaponEntries = Object.entries(EQUIPMENT)
    .filter(([, equipment]) => Number(equipment.attack ?? 0) > 0)
    .map(([itemId, equipment]) => ({ itemId, attack: Number(equipment.attack), weaponStyle:equipment.weaponStyle, value: values[itemId] }))
    .filter((entry) => finiteValue(entry.value));

  for (const [enemyId, enemy] of Object.entries(ENEMIES)) {
    const areas = enemy.boss ? [enemy.area] : getActiveAttackAreasForEnemy(enemyId);
    const sourceArea=areas.filter(Boolean).map(areaId=>({areaId,travel:TRAVEL_DISTANCES[areaId]??12,kayakSurcharge:kayakSurchargeForArea(areaId,values)}))
      .filter(source=>Number.isFinite(source.kayakSurcharge))
      .sort((left,right)=>left.travel-right.travel||left.kayakSurcharge-right.kayakSurcharge||left.areaId.localeCompare(right.areaId))[0];
    if(!sourceArea)continue;
    const {travel,kayakSurcharge}=sourceArea;
    const weapon = weaponEntries
      .filter((entry) => entry.attack + 10 + (entry.weaponStyle===enemy.weakness?1:0) > enemy.attack)
      .sort((left, right) => left.value - right.value)[0];
    if (!weapon && enemy.attack >= 10) continue;
    const encounterEffort = enemy.boss ? EXPLORATION_STAMINA * DISCOVERY_EFFORT_FACTOR : EXPLORATION_STAMINA * DISCOVERY_EFFORT_FACTOR / ACTIVE_ATTACK_CHANCE;
    const weaponCost = weapon ? weapon.value / TOOL_ASSET_AMORTIZATION : 0;
    const effort = encounterEffort + travel;
    for (const [itemId, [quantity, chance]] of Object.entries(enemy.drops ?? {})) {
      if (chance > 0 && quantity > 0 && canPriceFromSource(itemId,!enemy.boss)) result.push({
        itemId,travel,
        value: weaponCost + effort / (quantity * chance) + kayakSurcharge,
        detail: `战斗：${enemy.name}，掉率${roundValue(chance * 100)}%，移动${travel}${weapon ? `，最低武器${ITEMS[weapon.itemId].name}` : ""}${kayakSurchargeDetail(kayakSurcharge)}`
      });
    }
    const rareWeightTotal = Object.values(enemy.rare ?? {}).reduce((sum, weight) => sum + weight, 0);
    for (const [itemId, weight] of Object.entries(enemy.rare ?? {})) {
      const chance = Number(enemy.rareChance ?? 0) * weight / rareWeightTotal;
      if (chance > 0 && canPriceFromSource(itemId,!enemy.boss)) result.push({
        itemId,travel,
        value: weaponCost + effort / chance + kayakSurcharge,
        detail: `稀有战利品：${enemy.name}，综合掉率${roundValue(chance * 100)}%${kayakSurchargeDetail(kayakSurcharge)}`
      });
    }
  }
  return result;
}

function fixedRewardSources(values){
  const areaId="D6",area=AREAS[areaId],node=NODES.shipwreck_chest;
  const method=minimumToolMethod(node?.methods??[],values);
  if(!area||!node||!method)return [];
  const probability=area.nodes.filter(site=>site.nodeId==="shipwreck_chest").length/area.nodes.length;
  const discovery=EXPLORATION_STAMINA*DISCOVERY_EFFORT_FACTOR/probability;
  const travel=TRAVEL_DISTANCES[areaId]??12;
  const result=[];
  for(const [index,pack] of SHIPWRECK_CHEST_PACKS.entries()){
    const effort=discovery+travel+(index+1)*(Number(node.stamina??0)+method.toolCost);
    for(const itemId of pack.items)if(canPriceFromSource(itemId,false))result.push({
      itemId,value:effort,detail:`固定奖励：D6沉船宝箱，包含${ITEMS[itemId].name}`
    });
    if(pack.extra&&canPriceFromSource(pack.extra[0],false))result.push({
      itemId:pack.extra[0],value:effort/pack.extra[1],detail:`固定奖励：D6沉船宝箱，包含${ITEMS[pack.extra[0]].name}×${pack.extra[1]}`
    });
  }
  return result;
}

function updateValue(values, details, itemId, candidate, detail) {
  if (!ITEMS[itemId] || !finiteValue(candidate) || candidate >= values[itemId] - 0.001) return false;
  values[itemId] = candidate;
  details[itemId] = detail;
  return true;
}

function calculateBarterValues() {
  const values = Object.fromEntries(Object.keys(ITEMS).map((itemId) => [itemId, Infinity]));
  const details = {};
  if (ITEMS.rotten) {
    values.rotten = 0.1;
    details.rotten = "腐坏副产物保底价值";
  }
  if (ITEMS.ordinary_clothes) {
    values.ordinary_clothes = 1;
    details.ordinary_clothes = "旧存档保留衣物且不可交易";
  }

  for (let iteration = 0; iteration < 80; iteration += 1) {
    let changed = false;

    for (const source of [...naturalSources(values),...combatSources(values)])if(source.travel===MINIMUM_WILD_TRAVEL_BY_ITEM.get(source.itemId))changed = updateValue(values, details, source.itemId, source.value, source.detail) || changed;
    for (const source of fixedRewardSources(values)) changed = updateValue(values, details, source.itemId, source.value, source.detail) || changed;

    for (const recipe of Object.values(RECIPES)) {
      const station = stationValue(recipe.station, values);
      if (!Number.isFinite(station)) continue;
      const outputs = [...(recipe.outputs ?? [recipe.output]), ...(recipe.bonusOutput ? [recipe.bonusOutput] : [])].filter(Boolean);
      for (const option of recipeOptions(recipe)) {
        const materials = inputValue(option.inputs, values);
        if (!Number.isFinite(materials)) continue;
        // 生产燃料定义在工具/设施上；木柴可转换为10点燃料。
        const productionFuelCost=Number(BUILDINGS[recipe.station]?.productionFuelCost??DEVICES[recipe.station]?.productionFuelCost??0);
        const fuel = productionFuelCost * (finiteValue(values.firewood) ? values.firewood / 10 : 0);
        const totalUnits = recipe.outputs
          ? outputs.reduce((sum, output) => sum + Number(output.quantity ?? 1), 0)
          : option.outputQuantity;
        const usesFullStationValue = FULL_STATION_VALUE_RECIPE_IDS.has(recipe.id);
        const stationContribution = usesFullStationValue ? station : station / TOOL_ASSET_AMORTIZATION;
        const unitValue = (materials + fuel) / Math.max(1, totalUnits) + stationContribution;
        for (const output of outputs) changed = updateValue(
          values,
          details,
          output.itemId,
          unitValue,
          `生产：${recipe.name}；原料${roundValue(materials)}${fuel>0?`，燃料${roundValue(fuel)}`:""}，${recipe.station==="needle"?"制作台与针具":ITEMS[recipe.station]?.name ?? BUILDINGS[recipe.station]?.name ?? recipe.station}${usesFullStationValue?"完整价值":"摊销"}${roundValue(stationContribution)}`
        ) || changed;
      }
    }

    if (finiteValue(values.grass)) {
      changed = updateValue(values, details, "herb", values.grass / (GRASSLAND_HERB_CHANCE * (1 - HERB_SEED_REPLACEMENT_CHANCE)), `采集草地时先按${GRASSLAND_HERB_CHANCE * 100}%概率发现，再有${HERB_SEED_REPLACEMENT_CHANCE * 100}%概率被草药种子替换`) || changed;
    }
    if (finiteValue(values.fish)) changed = updateValue(values, details, "shrimp", values.fish / 0.3, "采集鱼群时按30%基础概率取得，连续未出会触发保底") || changed;

    for(const source of seedSources(values))changed=updateValue(values,details,source.itemId,source.value,source.detail)||changed;

    if (!changed) break;
  }

  const unresolved = [];
  for (const [itemId, item] of Object.entries(ITEMS)) {
    if (finiteValue(values[itemId])) continue;
    unresolved.push(itemId);
    const tier = itemRecipeTier(itemId);
    values[itemId] = 10 * (tier === 99 ? 5 : tier);
    details[itemId] = "未进入常规交易池的保底估值";
  }

  for(const [itemId,item] of Object.entries(ITEMS))if(item.type==="seed")details[itemId]=`${details[itemId]}；种子最终价值强制×${SEED_VALUE_MULTIPLIER}`;

  return {
    values: Object.freeze(Object.fromEntries(Object.entries(values).map(([itemId, value]) => [itemId, finalizeValue(itemId,value)]))),
    details: Object.freeze(details),
    unresolved: Object.freeze(unresolved)
  };
}

const calculated = calculateBarterValues();
export const BARTER_VALUES = calculated.values;
export const BARTER_VALUE_DETAILS = calculated.details;
export const BARTER_VALUE_FALLBACK_IDS = calculated.unresolved;

export function getBarterValue(itemId) {
  return BARTER_VALUES[itemId] ?? 0.1;
}

export function getBlueprintBarterValue(blueprintId) {
  const blueprint = BLUEPRINTS.find((entry) => entry.id === blueprintId);
  return 50 * Number(blueprint?.tier ?? 1);
}
