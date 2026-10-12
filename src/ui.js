import {
  BUILDINGS,
  BLUEPRINTS,
  CHARACTERS,
  CROPS,
  DEVICES,
  ENEMIES,
  EQUIPMENT,
  FURNITURE,
  HOUSE_LEVELS,
  ITEMS,
  LIVESTOCK,
  NODES,
  RECIPES,
  AREAS,
  WEATHER_LABELS
} from "./data.js";
import { ITEM_USAGE_DESCRIPTIONS } from "./item-descriptions.js";
import {
  isForbiddenTradeOffer,
  isOutdatedNpcTradeGive,
  countItem,
  countLocalStorageItem,
  formatStamina,
  formatInputs,
  getAreaDisplayName,
  getBuildOptions,
  getCombatPreview,
  getAutomaticWaterProductionStatus,
  getAutomaticWaterStatus,
  getAutomaticFeedDemand,
  getEndDayWarnings,
  getGridPowerStatus,
  getGridPowerConnections,
  getReturnBroadcastResources,
  getColdStorageCapacity,
  getBackpackCapacity,
  getCultivatedHarvestMethod,
  getFarmAutomationCoverage,
  getFarmCapacity,
  getFarmPlotSlots,
  getPlotAutoFertilizeStatus,
  getAcidRainStageEffect,
  getPlotEnvironmentEffects,
  getFeltTemperature,
  getDailyResourcePaymentStatus,
  FEED_ANIMALS_STAMINA_COST,
  FUEL_POINT_VALUES,
  getFuelDailyCost,
  getHouse,
  getInventoryView,
  getInventoryTransferTargets,
  getStackFreshnessRange,
  getAnimalPenSlots,
  getLivestockStageName,
  getStorageCapacity,
  getWardrobeCapacity,
  getSeedStorageCapacity,
  getUtilityStorageCapacity,
  getLaunchStatus,
  getLocalEffects,
  getLocalEffectSources,
  getMailContent,
  getMapCellName,
  getMealSelectionOptions,
  getMoveAvailability,
  getMiningMachineProduction,
  getMiningMachineStatus,
  getNodeMethods,
  getNodeEnemyId,
  getOutdoorActionPreview,
  getOutdoorFacilityProtection,
  getTemperatureBreakdown,
  getTemperatureBand,
  getWeather,
  getWeatherSicknessChance,
  getWeatherForecast,
  hasWeatherHazard,
  getPlayerStats,
  getEffectiveRecipeInputs,
  getRecipeAvailability,
  recipeActionLabel,
  getReceivedMails,
  getRepairRequirements,
  getReturnEnding,
  getStationStatus,
  hasFuelStorage,
  isKitchenStation,
  REINFORCEMENT_DURATION_DAYS,
  RETURN_STAGES
} from "./engine.js";

const RELEASE_VERSION = new URL(import.meta.url).searchParams.get("v") || "development";
function assetUrl(relativePath) {
  const url = new URL(relativePath, import.meta.url);
  url.searchParams.set("v", RELEASE_VERSION);
  return url.href;
}

const MAP_IMAGE_URL = assetUrl("../map.gif");
const FACE_PORTRAIT_URLS = Object.fromEntries(CHARACTERS.map((npc) => [
  npc.id,
  assetUrl(`../assets/faces/${npc.avatarFile}`)
]));
const HOUSE_ICON_URLS = Object.fromEntries([1, 2, 3, 4, 5].map((level) => [
  level,
  assetUrl(`../assets/houses/house-level-${level}.svg`)
]));

function npcAvatar(npc){return `<img class="npc-avatar" src="${FACE_PORTRAIT_URLS[npc.id]}" alt="" aria-hidden="true">`;}

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;").replaceAll("'", "&#039;");

export function renderGameInfo(language = "zh") {
  const playerGroup = language === "zh" ? "<p>玩家群：464501564</p>" : "";
  return `<h2>游戏信息</h2><p>制作人：水螅</p>${playerGroup}<p>版本号：${escapeHtml(RELEASE_VERSION)}</p>`;
}

const ACID_RAIN_STAGE_NAMES={light:"小雨",heavy:"大雨",downpour:"暴雨"};
const STORM_INTENSITY_NAMES={none:"停歇",normal:"大风",severe:"加强大风"};
function weatherLabel(weather,includeStormIntensity=false){return (weather.hazards?.length?weather.hazards:[weather.id]).map(id=>id==="rain"?`酸雨·${ACID_RAIN_STAGE_NAMES[weather.rainStage]??"未知雨势"}`:id==="storm"&&includeStormIntensity?`强风暴·${STORM_INTENSITY_NAMES[weather.intensity]??"未知风势"}`:WEATHER_LABELS[id]??id).join("＋");}
function weatherSignature(weather){return (weather.hazards?.length?weather.hazards:[weather.id]).map(id=>id==="rain"?`rain:${weather.rainStage}`:id).join("+");}

function weatherTrendHint(state, weather) {
  const forecast = getWeatherForecast(state);
  const currentSignature=weatherSignature(weather);
  const change = forecast.find((entry) => weatherSignature(entry.weather) !== currentSignature);
  if (change) {
    if (!change.weather.hazards?.length) return "似乎接下来会平静下来";
    return `似乎${weatherLabel(change.weather)}要来了`;
  }
  if (!weather.hazards?.length) return "似乎接下来也很平静";
  return `似乎${weatherLabel(weather)}还会持续`;
}

function temperatureTrendHint(state, felt) {
  const forecast = getWeatherForecast(state);
  const upcomingFelt = forecast[0]?.felt ?? felt;
  if (upcomingFelt < felt) return "似乎要降温了";
  if (upcomingFelt > felt) return "似乎要升温了";
  return "似乎温度变化不大";
}

export function renderStatus(state) {
  const weather = getWeather(state);
  const felt = getFeltTemperature(state);
  const band = getTemperatureBand(felt);
  const weatherHint = weatherTrendHint(state, weather);
  const temperatureHint = temperatureTrendHint(state, felt);
  return [
    { label: "日期", value: `第 ${state.day} 天` },
    { label: "位置", value: `${state.position} ${getAreaDisplayName(state.position)}` },
    { label: "体力", value: `${formatStamina(state.player.stamina)}/${formatStamina(state.player.maxStamina)}`, action: "open-stamina-guide", ariaLabel: "查看体力与幸福度的关系" },
    { label: "幸福", value: `${state.player.happiness >= 0 ? "+" : ""}${state.player.happiness}`, action: "open-happiness", ariaLabel: "查看幸福来源" },
    { label: "天气", value: `${weatherLabel(weather,true)}（${weatherHint}）`, action: "open-weather-details", trend: true, ariaLabel: "查看当前天气与灾害影响" },
    { label: "体感", value: `${felt}℃ · ${band.name}（${temperatureHint}）`, action: "open-temperature-guide", trend: true, ariaLabel: "查看当前地块温度明细" }
  ].map(({ label, value, action, trend, ariaLabel }) => action
    ? `<button type="button" class="status-pill status-pill-button${trend ? " status-pill-trend" : ""}" data-action="${action}" aria-label="${ariaLabel}"><small>${label}</small><strong>${escapeHtml(value)}</strong></button>`
    : `<div class="status-pill${trend ? " status-pill-trend" : ""}"><small>${label}</small><strong>${escapeHtml(value)}</strong></div>`).join("");
}

export function renderStaminaGuide(state) {
  const happiness = state.player.happiness;
  const happinessAdjustment = happiness / 2;
  const baseMaxStamina = Math.max(5, 10 + happinessAdjustment);
  const signed = (value,formatter=String) => `${value >= 0 ? "+" : ""}${formatter(value)}`;
  return `<h2>体力与幸福度</h2><div class="metric-row"><span>当前幸福度</span><strong>${signed(happiness)}</strong></div><div class="metric-row"><span>幸福度带来的体力修正</span><strong class="${happinessAdjustment < 0 ? "danger-text" : ""}">${signed(happinessAdjustment,formatStamina)}</strong></div><div class="metric-row survival-metric-total"><span>幸福度计算后的基础上限</span><strong>${formatStamina(baseMaxStamina)}</strong></div><div class="metric-row"><span>当前体力</span><strong>${formatStamina(state.player.stamina)}/${formatStamina(state.player.maxStamina)}</strong></div>`;
}

export function renderHappinessDetails(state) {
  const details = state.happinessBreakdown;
  if (!details?.entries?.length) return `<h2>幸福来源</h2><div class="empty">没有发生影响幸福度的事情</div>`;
  const signed = (value) => `${value >= 0 ? "+" : ""}${value}`;
  const rows = details.entries.map((entry) => `<div class="metric-row"><span>${escapeHtml(entry.label)}</span><strong class="${entry.value < 0 ? "danger-text" : ""}">${signed(entry.value)}</strong></div>`).join("");
  const capped = details.rawTotal !== details.finalTotal
    ? `<p class="row-detail">各项合计${signed(details.rawTotal)}，幸福度最低为−10，最终为${signed(details.finalTotal)}。</p>`
    : `<p class="row-detail">各项合计${signed(details.finalTotal)}。</p>`;
  return `<h2>幸福来源</h2><p class="row-detail">第${details.day}天结束时的结算明细</p>${rows}${capped}`;
}

function renderWeatherForecast(state){
  const forecast=getWeatherForecast(state);
  if(forecast.length!==3)return "";
  const days=["明天","后天","大后天"];
  const rows=forecast.map(({day,weather},index)=>`<div class="weather-effect-row"><strong>第${day}天 · ${days[index]}</strong><div class="metric-row"><span>基础气温</span><b>${weather.temperature}℃</b></div><div class="metric-row"><span>灾害</span><b>${escapeHtml(weather.hazards?.length?weatherLabel(weather,true):"无灾害")}</b></div></div>`).join("");
  return `<section class="weather-forecast"><h3>未来三天天气</h3>${rows}</section>`;
}

export function renderWeatherDetails(state){
  const weather=getWeather(state),hazards=weather.hazards??[],acidRainFacilityProtection=getOutdoorFacilityProtection(state,"rain"),stormFacilityProtection=getOutdoorFacilityProtection(state,"storm");
  const acidRain=getAcidRainStageEffect(weather),outdoorExtra=getOutdoorActionPreview(state,0).weatherExtra;
  const returnBaseActive=state.returnTowerAreaId===state.position&&state.returnProgress?.return_base?.completed;
  const effects=[];
  const add=(title,text)=>effects.push(`<div class="weather-effect-row"><strong>${escapeHtml(title)}</strong><p class="row-detail">${escapeHtml(text)}</p></div>`);
  const damageChanceText=(chance)=>chance<=0?"0%":chance<.01?"不足1%":`${Math.round(chance*100)}%`;
  for(const hazard of hazards){
    if(hazard==="cold_wave")add("寒潮",`当日基础温度为${weather.temperature}℃；寒冷造成的行动体力、受伤和死亡风险按最终体感温度计算。`);
    if(hazard==="heat")add("酷暑",`当日基础温度为${weather.temperature}℃；炎热造成的行动体力、疾病和死亡风险按最终体感温度计算。非温室的生长期作物每次浇水需要2份水。`);
    if(hazard==="rain"&&acidRain){
      const facilityChance=acidRain.facilityDamageChance*(1-acidRainFacilityProtection/100)*(returnBaseActive?.5:1);
      const sickChance=Math.round(getWeatherSicknessChance(state,"rain").chance*1000)/10;
      const cropChance=Math.round(acidRain.cropDamageChance*100);
      add("行动体力",`探索、移动、天然资源采集、资源点战斗、施工及修复，每次因当前灾害额外消耗${formatStamina(outdoorExtra)}体力；多种灾害叠加时取最高加成，不重复累加。酸雨各阶段都可以正常探索和采集。`);
      add("种植",`未升级为温室的生长中或待收获作物，结束今天时${cropChance<100?`有${cropChance}%几率`:"必定"}失去${acidRain.cropFertilityLoss}点丰饶；丰饶已经为0时再次受损，作物死亡。`);
      add("人物状态",Number(state.housesByArea?.[state.position]?.level??0)>0?`当前地块虽有房屋，但探索、采集天然资源和采收家养植物仍会独立进行酸雨生病判定；其他耗体力行动受房屋保护。计入当前装备、昨日饮食及当地行动生病减免后，单次生病概率为${sickChance}%。防雨达到100时完全免疫。`:`在当前无房屋地块，每次消耗体力的行动都会独立进行酸雨生病判定；计入当前装备、昨日饮食及当地行动生病减免后，单次生病概率为${sickChance}%。防雨达到100时完全免疫。`);
      add("室外设施",acidRainFacilityProtection<100?`当地酸雨设施防护为${acidRainFacilityProtection}，每座室外设施有${damageChanceText(facilityChance)}概率受损；受损后必须修好才能继续使用。`:`当地酸雨设施防护已达到100，酸雨不会损坏室外设施。`);
      add("集水器","酸雨期间结束今天时，每座集水器收集3份水。");
    }
    if(hazard==="storm"){
      if(weather.intensity==="none"){
        add("强风暴","今天处于强风暴期，但当前风势间歇：不增加行动体力、不限制采集，也不会造成设施受损。临时加固仍可正常施工。");
      }else{
        const facilityChance=(weather.intensity==="severe"?.9:.65)*(1-stormFacilityProtection/100)*(returnBaseActive?.5:1);
        const sickChance=Math.round(getWeatherSicknessChance(state,"storm").chance*1000)/10;
        add("行动体力",`探索、移动、天然资源采集、资源点战斗、施工及修复，每次因当前灾害额外消耗${formatStamina(outdoorExtra)}体力；多种灾害叠加时取最高加成，不重复累加。${weather.intensity==="severe"?"加强版强风暴期间天然资源点禁止采集。":"普通强风暴仍可正常采集。"}`);
        add("人物状态",Number(state.housesByArea?.[state.position]?.level??0)>0?`当前地块虽有房屋，但探索、采集天然资源和采收家养植物仍会独立进行强风暴生病判定；其他耗体力行动受房屋保护。计入当前装备、昨日饮食及当地行动生病减免后，单次生病概率为${sickChance}%。防风达到100时完全免疫。`:`在当前无房屋地块，每次消耗体力的行动都会独立进行强风暴生病判定；计入当前装备、昨日饮食及当地行动生病减免后，单次生病概率为${sickChance}%。防风达到100时完全免疫。`);
        add("室外设施",stormFacilityProtection<100?`当地强风设施防护为${stormFacilityProtection}，当前地块有${damageChanceText(facilityChance)}概率随机损坏一座室外设施。`:`当地强风设施防护已达到100，强风暴不会损坏室外设施。`);
        add("临时加固","风暴期间仍可施工；已有且仍在期限内的加固继续生效。");
      }
    }
  }
  if(!hazards.length)add("天气平稳","今天没有灾害，不会产生灾害额外行动体力、采集限制、作物影响或设施损伤。");
  const stageRow=acidRain?`<div class="metric-row"><span>当前阶段</span><strong>${escapeHtml(acidRain.name)}</strong></div>`:"";
  const intensityLabel=STORM_INTENSITY_NAMES[weather.intensity]??weather.intensity;
  const intensityRow=hasWeatherHazard(weather,"storm")?`<div class="metric-row"><span>当前强度</span><strong>${escapeHtml(intensityLabel)}</strong></div>`:"";
  const forecast=renderWeatherForecast(state);
  return `${forecast?`<h2>天气详情</h2>${forecast}<h3>当前天气影响</h3>`:"<h2>当前天气影响</h2>"}<div class="metric-row"><span>天气</span><strong>${escapeHtml(weatherLabel(weather))}</strong></div>${stageRow}${intensityRow}<div class="metric-row"><span>当日基础温度</span><strong>${weather.temperature}℃</strong></div><div class="weather-effect-list">${effects.join("")}</div><p class="row-detail">种植、浇水、施肥、家养采收、喂养及温室升级的体力为固定消耗，不增加天气和体感费用。其他行动的具体体感加成、伤病和死亡风险，可点击顶部“体感”查看。</p>`;
}
export function renderTemperatureGuide(state){
  const details=getTemperatureBreakdown(state),felt=details.feltTemperature;
  const sicknessFactor=1-getOutdoorActionPreview(state,0).actionSicknessReduction,hotDangerChance=Math.round(.2*sicknessFactor*1000)/10,hotLethalChance=Math.round(.5*sicknessFactor*1000)/10;
  const bands=[
    {name:"致命严寒",range:"−10℃及以下",matches:value=>value<=-10,effect:"室外行动额外消耗2体力；死亡概率从20%起，每再低1℃增加3个百分点，最高80%；存活后有50%概率受伤。"},
    {name:"严寒（危险）",range:"−9℃～0℃",matches:value=>value>=-9&&value<=0,effect:"室外行动额外消耗1体力；行动前需要确认，行动后有20%概率受伤。"},
    {name:"寒冷（负荷）",range:"1℃～9℃",matches:value=>value>=1&&value<=9,effect:"室外行动额外消耗0.5体力。"},
    {name:"舒适",range:"10℃～30℃",matches:value=>value>=10&&value<=30,effect:"体感温度不会增加室外行动的体力消耗。"},
    {name:"炎热（负荷）",range:"31℃～39℃",matches:value=>value>=31&&value<=39,effect:"室外行动额外消耗0.5体力。"},
    {name:"酷热（危险）",range:"40℃～49℃",matches:value=>value>=40&&value<=49,effect:`室外行动额外消耗1体力；行动前需要确认，行动后有${hotDangerChance}%概率生病。`},
    {name:"致命酷热",range:"50℃及以上",matches:value=>value>=50,effect:`室外行动额外消耗2体力；死亡概率从20%起，每再高1℃增加3个百分点，最高80%；存活后有${hotLethalChance}%概率生病。`}
  ];
  const current=bands.find(entry=>entry.matches(felt));
  const signedTemperature=value=>`${value>=0?"+":""}${value}℃`;
  const adjustmentRows=details.entries.length
    ? details.entries.map(entry=>`<div class="temperature-guide-row"><div><strong>${escapeHtml(entry.label)}</strong><small>${escapeHtml(entry.type)}</small></div><b>${signedTemperature(entry.value)}</b></div>`).join("")
    : `<div class="empty">当前温度处于舒适区，没有额外温度调整</div>`;
  const rows=bands.map(entry=>`<div class="temperature-guide-row${entry===current?" current":""}"><div><strong>${entry.name}${entry===current?` <span class="tag good">当前</span>`:""}</strong><small>${entry.effect}</small></div><b>${entry.range}</b></div>`).join("");
  return `<h2>当前地块温度</h2><p class="row-detail">${escapeHtml(state.position)} ${escapeHtml(getAreaDisplayName(state.position))}</p><div class="metric-row"><span>当日基础温度</span><strong>${details.baseTemperature}℃</strong></div><div class="metric-row"><span>地块温差</span><strong>${signedTemperature(details.areaBias)}</strong></div><div class="metric-row survival-metric-total"><span>当前地块室外温度</span><strong>${details.outdoorTemperature}℃</strong></div><h3>当前生效的温度调整</h3><div class="temperature-guide-list">${adjustmentRows}</div><div class="metric-row survival-metric-total"><span>最终体感</span><strong>${felt}℃ · ${current?.name??getTemperatureBand(felt).name}</strong></div><p class="row-detail">保暖仅在环境低于10℃时生效，防热仅在环境高于30℃时生效；调整不会越过20℃。</p><p class="row-detail">这里的室外行动包括探索、移动、天然资源采集、资源点战斗、施工和修复；种植、浇水、施肥、家养采收、喂养及温室升级使用固定体力。</p><h3>体感温度分档</h3><div class="temperature-guide-list">${rows}</div>`;
}

function heading(title, detail) {
  return `<section class="page-heading wide"><div><h2>${title}</h2><p>${detail}</p></div></section>`;
}

function card(title, body, className = "", action = "") {
  return `<section class="card ${className}"><div class="card-header"><h3>${title}</h3>${action}</div><div class="card-body">${body}</div></section>`;
}

function dailyTasks(state) {
  if (state.dailyRewardClaimed) return "";
  const tasks = state.dailyTasks ?? [];
  const ready = tasks.length > 0 && tasks.every((task) => task.progress >= task.target);
  if (ready) {
    return `<section class="card wide daily-reward-card"><div class="card-header"><h3>每日任务</h3></div><div class="card-body"><button type="button" class="daily-lottery-button" data-action="claim-daily-reward"><span>抽取今日十连抽奖励！</span></button></div></section>`;
  }
  const boxes = tasks.map((task) => {
    const done = task.progress >= task.target;
    return `<div class="task-box ${done ? "done" : ""}"><small>${escapeHtml(task.family)} ${done ? "✓" : ""}</small><p>${escapeHtml(task.text)}</p><div class="progress"><span style="width:${100 * task.progress / task.target}%"></span></div></div>`;
  }).join("");
  return card("每日任务", `<div class="daily-grid">${boxes}</div>`, "wide");
}

function dietCard(state) {
  const buffText=(item)=>{
    const effect=item?.nextDayEffect??{},labels={attack:"攻击",warmth:"保暖",heat:"防热",rain:"防雨",storm:"防风"};
    const parts=Object.entries(labels).filter(([key])=>Number(effect[key]??0)>0).map(([key,label])=>`${label}+${effect[key]}`);
    return parts.length?` · 明日${parts.join("、")}`:"";
  };
  const planButton = (kind, plan) => {
    const item = plan ? ITEMS[plan.itemId] : null;
    const happiness = item?.happiness ?? 0;
    const detail = item ? `幸福度 ${happiness >= 0 ? "+" : ""}${happiness}${buffText(item)}` : "幸福度 −10";
    return `<button class="choice-button diet-plan ${item ? "selected" : ""}" data-action="open-diet" data-kind="${kind}"><strong>${item ? item.name : "未设定"}</strong><span>${detail}</span></button>`;
  };
  return card("今日饮食", `<div class="choice-grid"><div><p class="row-detail">食物</p>${planButton("food", state.selectedFood)}</div><div><p class="row-detail">饮料</p>${planButton("drink", state.selectedDrink)}</div></div>`);
}

function getDietOptions(state, kind) {
  return getMealSelectionOptions(state, kind)
    .filter((option) => option.sourceKey.startsWith("backpack:") || option.sourceKey.startsWith(`area:${state.position}:`))
    .map((option) => ({ ...option, item: ITEMS[option.itemId] }))
    .sort((a, b) => Number(b.selected) - Number(a.selected) || (b.item.happiness ?? 0) - (a.item.happiness ?? 0) || a.item.name.localeCompare(b.item.name, "zh-CN"));
}

function houseIcon(level, className) {
  const normalizedLevel = Math.max(1, Math.min(5, Number(level) || 1));
  return `<img class="${className}" src="${HOUSE_ICON_URLS[normalizedLevel]}" alt="" aria-hidden="true" data-house-level="${normalizedLevel}">`;
}

function localMapPreview(state, areaId) {
  const x = Number(areaId[1]) - 1;
  const y = areaId.charCodeAt(0) - 65;
  const houseLevel = state.housesByArea[areaId]?.level;
  return `<div class="local-map-preview" style="--map-x:${x};--map-y:${y}" aria-label="${areaId}地块地图局部">
    <img class="local-map-background" src="${MAP_IMAGE_URL}" alt="${areaId}地块地图局部">
    ${houseLevel ? houseIcon(houseLevel, "local-map-house") : ""}
  </div>`;
}

export function renderDietPicker(state, kind) {
  const isFood = kind === "food";
  const plan = isFood ? state.selectedFood : state.selectedDrink;
  const kindName = isFood ? "食物" : "饮料";
  const options = [...getDietOptions(state, kind).reduce((grouped, option) => {
    const existing = grouped.get(option.itemId);
    if (!existing) grouped.set(option.itemId, { ...option });
    else {
      existing.quantity += option.quantity;
      if (option.selected) Object.assign(existing, { selected: true, sourceKey: option.sourceKey });
    }
    return grouped;
  }, new Map()).values()];
  const rows = options.map(({ itemId, item, sourceKey, selected, quantity }) => {
    const happiness = item.happiness ?? 0;
    const effect=item.nextDayEffect??{},labels={attack:"攻击",warmth:"保暖",heat:"防热",rain:"防雨",storm:"防风"};
    const effects=Object.entries(labels).filter(([key])=>Number(effect[key]??0)>0).map(([key,label])=>`${label}+${effect[key]}`);
    return `<button type="button" class="diet-option-button${selected ? " selected" : ""}" data-action="choose-diet" data-item="${itemId}" data-source="${sourceKey}" aria-pressed="${selected ? "true" : "false"}"><strong>${item.name} ×${quantity}</strong><span>幸福度 ${happiness >= 0 ? "+" : ""}${happiness}${effects.length?` · 明日${effects.join("、")}`:""}</span></button>`;
  }).join("");
  const noChoice = `<button type="button" class="diet-option-button${plan ? "" : " selected"}" data-action="clear-diet" data-kind="${kind}" aria-pressed="${plan ? "false" : "true"}"><strong>不选择${kindName}</strong><span>幸福度 −10</span></button>`;
  return `<h2>选择今日${kindName}</h2><div class="diet-option-list">${noChoice}${rows}</div>`;
}

export function renderWoundTreatmentPicker(state) {
  const clinicBonus=Number(getLocalEffects(state).healing??0)>0?1:0;
  const options=Object.entries(ITEMS)
    .filter(([,item])=>Number(item.injuryHealing??0)>0)
    .map(([itemId,item])=>({itemId,item,quantity:countItem(state,itemId,state.position)}))
    .filter(option=>option.quantity>0)
    .sort((left,right)=>Number(right.item.injuryHealing)-Number(left.item.injuryHealing)||left.item.name.localeCompare(right.item.name,"zh-CN"));
  const disabled=state.player.injury<=0||state.dailyWoundTreatmentUsed;
  const rows=options.map(({itemId,item,quantity})=>`<button type="button" class="diet-option-button" data-action="use-medical" data-item="${itemId}"${disabled?" disabled":""}><strong>${item.name} ×${quantity}</strong><span>可减轻${Number(item.injuryHealing)+clinicBonus}级伤势${clinicBonus?"（含医务室加成1级）":""}</span></button>`).join("");
  const status=state.player.injury<=0?"当前没有伤势":state.dailyWoundTreatmentUsed?"今天已经使用过伤药了":"";
  const empty=status||"背包和当前地块没有可以处理伤口的物品";
  return `<h2>处理伤口</h2><p class="row-detail">所有伤药合计每天只能使用1份。</p>${rows?`<div class="diet-option-list">${rows}</div>${status?`<p class="row-detail">${status}</p>`:""}`:`<div class="empty">${empty}</div>`}`;
}

function cultivatedPlotConditionText(state,plot){
  const environment=getPlotEnvironmentEffects(state,plot),conditions=[];
  if(environment.greenhouse)conditions.push("温室");
  if(environment.rainAffected){
    const chance=Math.round(environment.rainDamageChance*100),chanceText=chance<100?`${chance}%几率`:"必定";
    conditions.push(`酸雨影响：今日${chanceText}失去${environment.rainFertilityLoss}点丰饶，丰饶为0时再受损会死亡`);
  }
  if(environment.heatAffected)conditions.push("酷暑影响：浇水需2份水");
  return conditions.length?`（${conditions.join("；")}）`:"";
}

function minimumNodeToolName(node){
  if(ITEMS[node.missingToolItem])return ITEMS[node.missingToolItem].name;
  const itemIds=node.methods.flatMap(method=>method.requiredItem
    ? [method.requiredItem]
    : Object.entries(method.yields??{}).filter(([itemId,quantity])=>Number(quantity)>0&&ITEMS[itemId]?.toolType===method.toolType).map(([itemId])=>itemId))
    .filter(itemId=>ITEMS[itemId])
    .sort((left,right)=>(RECIPES[left]?.tier??1)-(RECIPES[right]?.tier??1));
  return ITEMS[itemIds[0]]?.name??"缺少工具";
}

function areaCard(state,{visibleNaturalNodeCount=10}={}) {
  const area = state.areas[state.position];
  const preview = getOutdoorActionPreview(state, 3);
  const revealedNodes = Object.values(area.nodes).filter((node) => node.revealed);
  const naturalNodeLimit=Math.max(10,Math.floor(Number(visibleNaturalNodeCount)||10));
  const availableNaturalNodes=Object.values(area.nodes)
    .map((nodeState,discoveryIndex)=>({nodeState,discoveryIndex}))
    .filter(({nodeState})=>nodeState.revealed&&(nodeState.charges===null||nodeState.charges>0||nodeState.respawnRemaining>0))
    .sort((left,right)=>Number(right.nodeState.discoveryOrder??-1)-Number(left.nodeState.discoveryOrder??-1)||right.discoveryIndex-left.discoveryIndex);
  const naturalNodes = availableNaturalNodes.slice(0,naturalNodeLimit).map(({nodeState}) => {
    const node = NODES[nodeState.nodeId ?? nodeState.id];
    const special = Boolean(node.special);
    const available = nodeState.charges === null || nodeState.charges > 0;
    const waiting = !available && nodeState.respawnRemaining > 0;
    const methods = available ? getNodeMethods(state, nodeState.id) : [];
    const enemyId=getNodeEnemyId(state,nodeState.id);
    const directCombat=Boolean(ENEMIES[enemyId]?.boss);
    const actionPreview=getOutdoorActionPreview(state,node.stamina);
    const charge = nodeState.charges === null
      ? "不限量"
      : `${nodeState.charges}/${nodeState.maxCharges}`;
    const huntDrops=node.huntDrops?Object.keys(node.huntDrops).map(itemId=>ITEMS[itemId]?.name??itemId).join("、"):"";
    const randomDrops=node.randomOutputs?.map(output=>`${ITEMS[output.itemId]?.name??output.itemId}${Math.round(Number(output.chance)*100)}%`).join("、")??"";
    const captureTool=node.captureTool?Object.values(ITEMS).find(item=>item.toolType===node.captureTool):null;
    const weaknessName=node.weakness==="melee"?"近战":node.weakness==="ranged"?"远程":"对应";
    const huntDetail=node.huntAttack?` · 动物攻击${node.huntAttack} · 弱${weaknessName}：同级${weaknessName}武器可胜，同级另一类武器会失败${huntDrops?` · 战利品：${huntDrops}`:""}${captureTool&&node.captureOutput?` · 背包携带${captureTool.name}时有${Math.round(Number(node.captureChance??.1)*100)}%几率额外捕获${ITEMS[node.captureOutput].name}；成功捕获后消耗1个${captureTool.name}，未捕获时不消耗`:""}`:"";
    const detail = waiting
      ? `${charge} ${nodeState.respawnRemaining}日后恢复 消耗体力${formatStamina(actionPreview.totalStamina)}${huntDetail}${randomDrops?` · 可能取得：${randomDrops}`:""}`
      : `${charge} 消耗体力${formatStamina(actionPreview.totalStamina)}${huntDetail}${randomDrops?` · 可能取得：${randomDrops}`:""}`;
    const method=methods[0];
    const actionAttributes = enemyId && available
      ? `data-action="${directCombat?"fight":"open-combat"}" data-enemy="${enemyId}" data-node="${nodeState.id}"`
      : method
        ? `data-action="gather" data-node="${nodeState.id}" data-method="${method.id}"`
        : "disabled";
    const actionLabel = enemyId && available ? directCombat?"战斗":"查看战斗" : waiting ? "等待恢复" : method ? (node.interactionLabel??method.label) : minimumNodeToolName(node);
    return `<button type="button" class="node-row resource-node-button${special ? " special-node-row" : ""}" ${actionAttributes}><span class="row-main"><span class="row-title">${nodeState.siteLabel ?? node.name}${special ? ` <span class="tag thunder">特殊地点</span>` : ""}</span><span class="row-detail">${detail}</span></span><span class="resource-node-method">${actionLabel}</span></button>`;
  }).join("");
  const hiddenNaturalNodeCount=Math.max(0,availableNaturalNodes.length-naturalNodeLimit);
  const showMoreNaturalNodes=hiddenNaturalNodeCount
    ? `<button type="button" class="secondary-button resource-show-more-button" data-action="show-more-resource-nodes" aria-label="再显示10个资源点">Show more</button>`
    : "";
  const cultivatedMethod=getCultivatedHarvestMethod(state);
  const cultivatedNodes=(state.plotsByArea[state.position]??[]).map(plot=>{
    const crop=CROPS[plot.cropId],ready=plot.phase==="ready"&&plot.charges>0;
    const detail=ready?`${plot.charges}/${plot.maxCharges} 消耗体力0.5`:plot.phase==="regrowing"?`0/${plot.maxCharges||crop.stock} 恢复中，还需${plot.remaining}个浇水日`:`生长中，还需${plot.remaining}个浇水日`;
    const attributes=ready?`data-action="harvest" data-plot="${plot.id}"`:"disabled";
    return `<button type="button" class="node-row resource-node-button cultivated-node-button" ${attributes}><span class="row-main"><span class="row-title">家养${crop.name}${cultivatedPlotConditionText(state,plot)} <span class="tag good">人工资源点</span></span><span class="row-detail">${detail}</span></span><span class="resource-node-method">${ready?cultivatedMethod.label:plot.phase==="regrowing"?"等待恢复":"等待生长"}</span></button>`;
  }).join("");
  const emptyNodeMessage=revealedNodes.length
    ? state.position==="D6"?"暂无可采资源点，可继续探索":"本地资源点已经采完"
    : "尚未发现资源点";
  const nodes=cultivatedNodes+naturalNodes+showMoreNaturalNodes||`<div class="empty">${emptyNodeMessage}</div>`;
  return card(`${state.position} · ${AREAS[state.position].name}`, `
    <div class="area-overview">
      ${localMapPreview(state, state.position)}
      <div class="area-explore-controls">
        <div class="metric-row"><div class="row-main"><div class="row-title">探索度 ${area.exploration}%</div><div class="progress"><span style="width:${area.exploration}%"></span></div><div class="row-detail">本次体力 ${formatStamina(preview.totalStamina)} · 体感 ${preview.felt}℃</div></div><button class="action-button primary" data-action="explore">探索</button></div>
      </div>
    </div>
    <button class="map-button" data-action="open-map">打开岛屿地图 / 移动</button>
    ${nodes}
    `, "wide");
}

function launchCard(state){const launch=getLaunchStatus(state);if(!launch)return"";const fault=launch.pendingFault,helpers=launch.helpers.filter(id=>!launch.usedHelpers.includes(id)).map(id=>`<button class="action-button" data-action="resolve-launch" data-method="helper" data-helper="${id}">${CHARACTERS.find(n=>n.id===id).name}协助</button>`).join("");return card(`归航启动 · 第${launch.day}/3日`,`<div class="row-title">今日故障：${fault.name}</div><div class="row-detail">维护体力需求${formatStamina(fault.cost)}；当日独立维护体力3。${fault.inputs?`替代材料：${formatInputs(fault.inputs)}`:"可直接修复"}</div><div class="row-actions"><button class="action-button primary" data-action="resolve-launch" data-method="${fault.cost<=3?"stamina":"material"}">${fault.cost<=3?"使用维护体力":"使用3体力与材料"}</button>${helpers}<button class="action-button" data-action="abort-launch">中止本次启动</button></div>`,"wide");}

export function renderCombat(state,enemyId,nodeId=""){const p=getCombatPreview(state,enemyId);if(!p)return"<h2>未知敌人</h2>";const drops=Object.entries(p.enemy.drops).map(([id,[q,chance]])=>`${ITEMS[id].name}×${q} ${Math.round(chance*100)}%`).join(" · ");const rare=p.enemy.rareChance?`稀有战利品总概率${Math.round(p.enemy.rareChance*100)}%：${Object.keys(p.enemy.rare).map(id=>ITEMS[id].name).join("、")}`:"无随机稀有掉落";const weakness=p.enemy.weakness==="melee"?"近战武器":p.enemy.weakness==="ranged"?"远程武器":"无";const outcome=p.outcome==="win"?"可以战胜":p.outcome==="tie"?"攻击相同，只会僵持":`攻击不足，会受伤${p.defeatInjuryLevels}层`;const staminaText=nodeId?outdoorStaminaCostText(state,NODES[state.areas[state.position].nodes[nodeId]?.nodeId]?.stamina??2):"体力0";return `<h2>${p.enemy.name}</h2><p class="row-detail">本次消耗：${staminaText}</p><div class="metric-row"><span>有效攻击 / 敌人攻击</span><strong>${p.combat.attack} / ${p.enemy.attack}</strong></div><div class="metric-row"><span>弱点</span><strong>${weakness}</strong></div><div class="metric-row"><span>预计结果</span><strong>${outcome}</strong></div>${p.combat.matched?`<p class="row-detail">武器命中弱点，有效攻击+1。</p>`:""}${p.combat.mismatched?`<p class="row-detail danger-text">武器类型被克制，有效攻击-3。</p>`:""}${p.combat.tierBoost?`<p class="row-detail">高阶强攻饮食组合生效，可以挑战高一级敌人。</p>`:""}<p class="row-detail">普通掉落：${drops}</p><p class="row-detail">${rare}</p><button class="action-button primary" data-action="fight" data-enemy="${enemyId}" data-node="${nodeId}">确认战斗</button>`;}

function logCard(state) {
  const logs = state.logs.slice(-7).reverse().map((log) => `<div class="log-row"><div class="row-detail"><span class="accent">DAY ${log.day}</span>　${escapeHtml(log.text)}</div></div>`).join("");
  return card("生存记录", logs, "wide");
}

export function renderExplore(state,options={}) {
  return dailyTasks(state) +
    launchCard(state) +
    dietCard(state) + areaCard(state,options) + logCard(state);
}

export function renderEncounterResult(encounter) {
  const outcome=encounter.won?"战斗胜利":encounter.tied?"双方僵持":"战斗失败";
  const injury=encounter.injured?`你在战斗中受伤${encounter.injuryLevels??1}层。`:"你没有受伤。";
  const loot=encounter.won?(encounter.loot?.join("、")||"无战利品"):"没有战利品";
  const weakness=encounter.weakness==="melee"?"近战武器":"远程武器";
  return `<h2>遭到${escapeHtml(encounter.name)}袭击</h2><div class="metric-row"><span>战斗结果</span><strong>${outcome}</strong></div><div class="metric-row"><span>有效攻击 / 敌人攻击</span><strong>${encounter.playerAttack} / ${encounter.enemyAttack}</strong></div><div class="metric-row"><span>敌人弱点</span><strong>${weakness}</strong></div>${encounter.matchedWeakness?`<p class="row-detail">武器命中弱点，有效攻击+1。</p>`:""}${encounter.mismatchedWeakness?`<p class="row-detail danger-text">武器类型被克制，有效攻击-3。</p>`:""}${encounter.tierBoost?`<p class="row-detail">高阶强攻饮食组合生效，可以挑战高一级敌人。</p>`:""}<p class="row-detail">${injury}</p><p class="row-detail">战利品：${escapeHtml(loot)}</p>`;
}

export { recipeActionLabel };

function recipeRow(state, recipeId, recipe) {
  const primaryOutputs=(recipe.outputs??[recipe.output]).filter(Boolean);
  const output=primaryOutputs[0];
  const canUseReservedFood=ITEMS[output?.itemId]?.type==="food";
  const formatRecipeInputs=(inputSet)=>Object.entries(inputSet).map(([id,qty])=>{
    const available=countItem(state,id)+(canUseReservedFood&&state.selectedFood?.itemId===id?1:0);
    const insufficient=available<qty?" insufficient":"";
    return `<span class="recipe-material${insufficient}">${ITEMS[id].name} ${available}/${qty}</span>`;
  }).join(" · ");
  const inputs=formatRecipeInputs(getEffectiveRecipeInputs(state,recipe,recipe.inputs));
  const alternatives=(recipe.alternatives??[]).map((inputSet,index)=>{
    const efficient=recipe.rareAlternativeIndex!==undefined?index+1===recipe.rareAlternativeIndex:true;
    const quantity=recipe.alternativeOutputQuantities?.[index+1]??(efficient?recipe.alternativeQuantity:undefined);
    const outputText=quantity&&primaryOutputs.length===1?`（产出${ITEMS[output.itemId].name}×${quantity}）`:"";
    return formatRecipeInputs(getEffectiveRecipeInputs(state,recipe,inputSet))+outputText;
  }).join("；");
  const availability=getRecipeAvailability(state,recipeId);
  const productButton=(itemId,label)=>`<button type="button" class="recipe-name-button" data-action="open-item-reference" data-item="${itemId}" aria-label="查看${ITEMS[itemId].name}的详细功能">${escapeHtml(label)}</button>`;
  const heldCount=(itemId)=>{
    const idle=countItem(state,itemId);
    if(["device","furniture"].includes(ITEMS[itemId]?.type)){
      const placed=[...(state.devicesByArea?.[state.position]??[]),...(state.furnitureByArea?.[state.position]??[])]
        .filter(entry=>entry.itemId===itemId).length;
      return `闲置${idle} 摆放${placed}`;
    }
    if(EQUIPMENT[itemId]){
      const equipped=Object.values(state.player.equipment??{}).filter(equippedId=>equippedId===itemId).length;
      return `闲置${idle} 装备${equipped}`;
    }
    return String(idle);
  };
  const heldTitle=primaryOutputs.length===1
    ? `${productButton(output.itemId,recipe.name)}（${heldCount(output.itemId)}）`
    : `${escapeHtml(recipe.name)} · ${primaryOutputs.map(item=>`${productButton(item.itemId,ITEMS[item.itemId].name)}（${heldCount(item.itemId)}）`).join("、")}`;
  const outputs=[...primaryOutputs,...(recipe.bonusOutput?[recipe.bonusOutput]:[])].map(o=>`${ITEMS[o.itemId].name}×${o.quantity}`).join("、");
  return `<div class="recipe-row"><div class="row-main"><div class="row-title">${heldTitle}</div><div class="row-detail">产出：${outputs} · 材料：${inputs}${alternatives?` · 替代路线：${alternatives}`:""}</div></div><div class="row-actions"><button class="action-button" data-action="craft" data-recipe="${recipeId}" ${availability.ok ? "" : "disabled"}>${recipeActionLabel(recipe)}</button></div></div>`;
}

const STATION_CATEGORIES={
  cooking_table:"food",
  stone_pot:"food",
  bonfire:"food",
  wood_stove:"food",
  oven:"food",
  frying_pan:"food",
  juicer:"food",
  brewing_table:"food",
  smokehouse:"food",
  stone_mill:"food",
  workbench:"craft",
  masonry_table:"craft",
  tanning_rack:"craft",
  needle:"craft",
  compost:"craft",
  smithy:"smelt",
  smelter:"smelt",
  brick_kiln:"smelt",
  glass_furnace:"smelt",
  machine_shop:"industry",
  chemical_table:"industry",
  textile_table:"industry",
  boatwright_bench:"industry"
};

const PRODUCTION_CATEGORY_TABS=[
  {id:"all",label:"全部"},
  {id:"food",label:"食物"},
  {id:"craft",label:"手工"},
  {id:"smelt",label:"冶炼"},
  {id:"industry",label:"工业"}
];

let activeProductionCategory="all";
export function getActiveProductionCategory(){
  return activeProductionCategory;
}
export function setActiveProductionCategory(category){
  activeProductionCategory=category;
}

export function renderSettings(currentTheme="default"){
  const themes=[
    {id:"default",name:"原版"},
    {id:"strawberry",name:"草莓牛奶"},
    {id:"mint",name:"薄荷巧克"},
    {id:"monochrome",name:"黑白"},
    {id:"pastel-blue",name:"粉蓝"}
  ];
  const themeChoices=themes.map(t=>{
    const isSelected=currentTheme===t.id;
    return `<button type="button" class="theme-choice${isSelected?" selected":""}" data-action="set-theme" data-theme="${t.id}" role="radio" aria-checked="${isSelected}">`+
      `<span class="theme-choice-dot theme-dot-${t.id}"></span>`+
      `<span class="theme-choice-name">${t.name}</span>`+
    `</button>`;
  }).join("");

  return `<section class="settings-panel">`+
    `<h2>设置</h2>`+
    `<div class="setting-item">`+
      `<div class="row-title">配色</div>`+
      `<div class="theme-choices" role="radiogroup" aria-label="页面配色">${themeChoices}</div>`+
    `</div>`+
    `<div class="setting-item">`+
      `<div class="row-title">存档</div>`+
      `<div class="setting-reset-action">`+
        `<button class="icon-button compact-button" type="button" data-action="save-transfer">迁移</button>`+
      `</div>`+
    `</div>`+
    `<div class="setting-item">`+
      `<div class="row-title">保存</div>`+
      `<div class="setting-reset-action">`+
        `<button class="icon-button compact-button" type="button" data-action="install-pwa">安装</button>`+
      `</div>`+
    `</div>`+
    `<div class="setting-item setting-reset-section">`+
      `<div class="row-title">重置</div>`+
      `<div class="setting-reset-action">`+
        `<button id="new-game-button" class="icon-button restart-button compact-button" type="button" data-action="new-game">重开</button>`+
      `</div>`+
    `</div>`+
  `</section>`;
}

export function renderProduction(state) {
  const groups=new Map();
  for(const [recipeId,recipe] of Object.entries(RECIPES)){
    if(recipe.hidden||!state.ownedBlueprintIds.includes(recipe.blueprintId))continue;
    const stationId=recipe.station??"workbench",status=getStationStatus(state,stationId);
    if(!status.available&&!status.owned)continue;
    const groupKey=status.groupKey??stationId;
    if(!groups.has(groupKey))groups.set(groupKey,{groupKey,status,recipes:[]});
    groups.get(groupKey).recipes.push([recipeId,recipe]);
  }
  const orderedGroups=[...groups.values()].sort((left,right)=>Number(isKitchenStation(left.groupKey))-Number(isKitchenStation(right.groupKey)));
  const tabsHeader=`<div class="category-tabs" role="tablist">`+
    PRODUCTION_CATEGORY_TABS.map(tab=>{
      const active=activeProductionCategory===tab.id;
      return `<button type="button" class="category-tab-button${active?" active":""}" data-action="select-production-category" data-category="${tab.id}" role="tab" aria-selected="${active}">${tab.label}</button>`;
    }).join("")+
    `</div>`;
  const filteredGroups=activeProductionCategory==="all"
    ? orderedGroups
    : orderedGroups.filter(item=>{
        const cat=STATION_CATEGORIES[item.groupKey]??(isKitchenStation(item.groupKey)?"food":"craft");
        return cat===activeProductionCategory;
      });
  const sections=filteredGroups.map(({groupKey,status,recipes})=>{
    const usage=Number.isFinite(status.remaining)?`今日剩余 ${status.remaining}/${status.capacity} 次`:"不限次数";
    const unavailable=!status.available;
    const fuelInsufficient=status.productionFuelCost>0&&status.available&&status.remaining>0&&status.productionFuelCost>Number(state.fuelPointsByArea?.[state.position]??0);
    const fuelUsage=status.productionFuelCost>0?`<span class="production-fuel-usage${fuelInsufficient?" insufficient":""}">使用一次消耗${status.productionFuelCost}点燃料</span>`:"";
    const stationSummary=unavailable
      ? [status.name,`<span class="production-station-unavailable">${escapeHtml(status.unavailableState??"未开启")}</span>`,fuelUsage].filter(Boolean).join(" · ")
      : [status.name,usage,fuelUsage].filter(Boolean).join(" · ");
    const recipeListId=`production-recipes-${groupKey.replace(/[^a-zA-Z0-9_-]/g,"-")}`;
    return `<section class="card wide production-station-card${unavailable?" collapsed":""}" data-production-station="${groupKey}" data-default-collapsed="${unavailable}"><div class="card-header production-station-header"><h3><button type="button" class="production-station-toggle" data-action="toggle-production-station" data-station="${groupKey}" aria-expanded="${!unavailable}" aria-controls="${recipeListId}"><span>${stationSummary}</span><span class="production-station-toggle-hint"><span class="production-station-toggle-label">${unavailable?"展开":"收起"}</span><span class="production-station-toggle-icon" aria-hidden="true">⌃</span></span></button></h3></div><div class="card-body production-recipe-list" id="${recipeListId}"${unavailable?" hidden":""}>${recipes.map(([id,recipe])=>recipeRow(state,id,recipe)).join("")}</div></section>`;
  }).join("");
  return tabsHeader+(sections||card("当前没有可生产内容",`<div class="empty">当地没有可用的生产工具，或尚未获得它们对应的配方蓝图。</div>`,"wide"));
}

const PEN_TYPES={chicken_coop:"chicken",sheep_pen:"sheep",cattle_pen:"cattle",pig_pen:"pig"};
const ANIMAL_LABELS={chicken:{adult:"鸡",young:"小鸡"},sheep:{adult:"羊",young:"羊羔"},cattle:{adult:"牛",young:"牛犊"},pig:{adult:"猪",young:"猪仔"}};
const MANAGED_FACILITY_ORDER=["planting_bed","chicken_coop","sheep_pen","cattle_pen","pig_pen"];
const MANAGED_FACILITIES=new Set(MANAGED_FACILITY_ORDER);
const PRODUCTION_FURNITURE_IDS=Object.keys(DEVICES);
const LIVESTOCK_PRODUCT_DISPLAY_ORDER={
  chicken:["chicken_meat","egg","feather","manure"],
  sheep:["mutton","wool","large_bone","tendon","animal_fat","manure"],
  cattle:["beef","milk","cattle_pelt","large_bone","tendon","animal_fat","manure"],
  pig:["pork","pig_pelt","animal_fat","manure"]
};
const FACILITY_DESCRIPTIONS={
  bonfire:"每日提供99次加热生产；开启时使当地实际温度上升2℃，每日基础消耗2点燃料",
  wood_stove:"篝火的升级设施，建成后替换篝火；可制作全部篝火配方和柴火灶专属配方，每日共用99次生产；开启时使当地实际温度上升2℃，幸福度增加1，每日基础消耗2点燃料",
  smokehouse:"每天可以晾晒99次，可加工干肉和干鱼",
  rain_collector:"下雨时自动收集3份水",
  pumping_station:"水井的升级设施，建成后替换水井；每天自动获得20份水；酸雨设施防护增加20",
  drainage_ditch:"酸雨设施防护增加20",
  planting_bed:"浇水后施肥才有用",
  cellar:"提供10个不耗电的保鲜格",
  cellar_expansion:"地窖的升级设施，建成后替换地窖；提供15个不耗电的保鲜格",
  beehive_box:"每3日自动产出蜂蜜2份和蜂蜡1份",
  fireplace:"开启时使当地实际温度上升6℃；每日基础消耗3点燃料，壁炉结构使当地取暖燃料消耗减少30%",
  vent_hood:"当地降温3℃",
  wind_anchor:"强风设施防护增加30",
  drip_irrigation:"覆盖当地全部家养资源点；结束今天时按播种顺序直接消耗当地普通储物格中的水自动浇灌，不消耗体力",
  auto_feeder:"结束今天时只消耗当地普通储物格中的饲料，按猪、牛、羊、鸡的顺序逐座自动喂养，跳过损坏栏舍，不消耗体力",
  greenhouse:"获得蓝图后，可把单块栽培地永久升级为温室，免受酸雨和酷暑影响",
  kitchen:"幸福度增加2；当地全部厨具的每日可用次数变为2倍；厨具配方中每项需求量大于1的素材减少1份",
  wardrobe:"提供50格衣帽间，只能存放武器、护具和背包",
  seed_storage_room:"提供20格本地种子储存空间，只能存放种子",
  utility_room:"提供30格本地杂物储存空间，只能存放家具和工具（含便携生产工具）",
  workroom:"幸福度增加4；当地全部非厨具生产工具的每日可用次数变为2倍",
  auto_fertilizer:"仅照料已开启自动施肥的栽培地；结束今天时按播种顺序消耗箱内肥料自动施肥，施肥丰饶已满时不浪费，不消耗体力",
  drainage_system:"排水沟的升级设施，建成后替换排水沟；酸雨设施防护增加40",
  warm_lining:"居所保暖增加5℃",
  insulation_layer:"保暖夹层的升级设施，建成后替换保暖夹层；居所保暖增加10℃，取暖燃料消耗再减少25%",
  hydro_generator:"仅能在C3或C4建造；当地建成配电室后，每组每天为全岛提供5点可支配电力，每个地块最多20组，不消耗燃料，不会损坏",
  mining_machine:`需要至少一级房屋，仅能在铁矿、铜矿或煤矿地块建造；必须有本地储存空间才可以运行；每座每天耗电${BUILDINGS.mining_machine.effect.power}，供电优先度最低`,
  distribution_room:"仅能在已建成水力发电机组的C3或C4建造；建成后不会损坏，启用当地发电机组，电量全岛共享，其他地块无需配电室即可用电",
  air_conditioner:`仅可在永久避难所内建造；开启并供电时使当地室温降低25℃，幸福度增加${BUILDINGS.air_conditioner.effect.happiness}，每日耗电${BUILDINGS.air_conditioner.effect.power}；玩家离开后仍持续开启和耗电`,
  weather_station:"开启并供电时显示未来3日的准确天气，每日耗电1",
  clinic:"在当地使用伤药时额外减轻1级伤势；当天未使用伤药则日结时减轻1级伤势；连续舒适且正常饮食的养病时间从3天缩短为2天"
};

function formatChineseList(values){
  if(values.length<=1)return values[0]??"";
  return `${values.slice(0,-1).join("，")}和${values[values.length-1]}`;
}

function describeLivestockFacility(type){
  const livestock=LIVESTOCK[type];
  if(!livestock)return "";
  const preferred=LIVESTOCK_PRODUCT_DISPLAY_ORDER[type]??[],productIds=Object.keys(livestock.continuous??{});
  const orderedIds=[...preferred.filter(itemId=>productIds.includes(itemId)),...productIds.filter(itemId=>!preferred.includes(itemId))];
  const youngName=ITEMS[livestock.youngItem]?.name??ANIMAL_LABELS[type]?.young??"幼畜";
  const groupName=livestock.stages?.[livestock.stages.length-1]?.name??`${livestock.name}群`;
  return `放入${youngName}后${livestock.matureDays}天可以繁育出${groupName}，之后可以定期获得${formatChineseList(orderedIds.map(itemId=>ITEMS[itemId]?.name??itemId))}`;
}

function describeFacility(id,definition,state){
  if(id==="mining_machine"){
    const production=getMiningMachineProduction(state);
    return FACILITY_DESCRIPTIONS[id]+(production?`；正常运行时每台每日采集${production.quantity}个${ITEMS[production.itemId].name}。`:"。")+"建成后不会损坏。";
  }
  if(FACILITY_DESCRIPTIONS[id])return FACILITY_DESCRIPTIONS[id];
  const effect=definition.effect??{},parts=[];
  if(effect.animal)return describeLivestockFacility(effect.animal);
  if(effect.capacity&&!effect.animal)parts.push(`每日提供${effect.capacity}次生产`);
  if(effect.storage)parts.push(`普通储物格增加${effect.storage}`);
  if(effect.wardrobeStorage)parts.push(`衣帽间增加${effect.wardrobeStorage}格`);
  if(effect.seedStorage)parts.push(`本地种子储存格增加${effect.seedStorage}格，只能存放种子`);
  if(effect.utilityStorage)parts.push(`本地杂物储存格增加${effect.utilityStorage}格，只能存放家具和工具（含便携生产工具）`);
  if(effect.coldStorage)parts.push(`保鲜格增加${effect.coldStorage}`);
  if(effect.plots)parts.push(`提供${effect.plots}个种植位`);
  if(effect.farmExpanded)parts.push("当地栽培地上限提升至三十块");
  if(effect.pasture)parts.push("拥有五块自动照料草地，成熟后自动收割并转化为饲料入库");
  if(effect.herbField)parts.push("拥有专属药田地块，用于种植草药并收获新鲜药草");
  if(effect.water)parts.push(`每日自动获得水${effect.water}份`);
  if(effect.cooling)parts.push(`当地降温${effect.cooling}℃`);
  if(effect.happiness)parts.push(`幸福度增加${effect.happiness}`);
  if(effect.temperature)parts.push(`开启时使当地实际温度上升${effect.temperature}℃`);
  if(effect.warmth)parts.push(`当地保暖增加${effect.warmth}℃`);
  if(effect.fuelDaily)parts.push(`每日基础消耗${effect.fuelDaily}点燃料`);
  if(effect.powerGeneration)parts.push(`每天为全岛提供${effect.powerGeneration}点电力`);
  if(effect.power)parts.push(`每日耗电${effect.power}`);
  if(effect.acidRainFacilityProtection)parts.push(`酸雨设施防护增加${effect.acidRainFacilityProtection}`);
  if(effect.stormFacilityProtection)parts.push(`强风设施防护增加${effect.stormFacilityProtection}`);
  if(effect.stationBonus)for(const [station,quantity]of Object.entries(effect.stationBonus))parts.push(`${BUILDINGS[station]?.name??DEVICES[station]?.name??station}每日次数增加${quantity}`);
  return parts.join("；")||"完成后在当前地块提供对应功能";
}

function formatConstructionInputs(state,inputs){
  return Object.entries(inputs).map(([itemId,required])=>{
    const available=countItem(state,itemId,state.position);
    const insufficient=available<required?" insufficient":"";
    return `<span class="construction-material${insufficient}">${ITEMS[itemId].name} ${available}/${required}</span>`;
  }).join("、");
}

function outdoorStaminaCostText(state,baseStamina){
  const total=getOutdoorActionPreview(state,baseStamina).totalStamina;
  return `体力${formatStamina(total)}${total!==baseStamina?`（基础${formatStamina(baseStamina)}，受当前天气与体感影响）`:""}`;
}

export function formatOutdoorRiskDescription(preview){
  const harm=preview.felt<10?"受伤":"生病";
  const injuryChance=preview.injuryChance??(preview.band.id==="lethal"?.5:.2),injuryPercent=Math.round(injuryChance*1000)/10;
  return preview.band.id==="lethal"
    ? `强行行动有${Math.round(preview.band.risk*100)}%死亡风险，存活后有${injuryPercent}%概率${harm}。`
    : `强行行动有${injuryPercent}%概率${harm}。`;
}

function formatOutdoorStaminaCost(state,baseStamina){
  const insufficient=state.player.stamina<getOutdoorActionPreview(state,baseStamina).totalStamina;
  return `<span class="construction-material${insufficient?" insufficient":""}">${outdoorStaminaCostText(state,baseStamina)}</span>`;
}

function repairActionButton(state,id,suffix=""){
  const requirements=getRepairRequirements(state,id);
  if(!requirements)return "";
  return `<button class="action-button" data-action="repair" data-building="${id}">修复${suffix} · ${formatConstructionInputs(state,requirements.inputs)} · ${formatOutdoorStaminaCost(state,requirements.stamina)}</button>`;
}

function formatBuildPrerequisites(state,definition){
  const completed=(facilityId)=>Object.entries(state.buildingsByArea[state.position]??{}).some(([id,progress])=>id.replace(/__\d+$/u,"")===facilityId&&progress.completed);
  const completedAnywhere=(facilityId)=>(BUILDINGS[facilityId]?.allowedAreas??Object.keys(AREAS)).some(areaId=>Object.entries(state.buildingsByArea?.[areaId]??{}).some(([id,progress])=>id.replace(/__\d+$/u,"")===facilityId&&progress.completed));
  const facilityNames=(ids)=>ids.map(id=>BUILDINGS[id]?.name??id).join("、"),requirements=[];
  const requirement=(text,satisfied)=>`<span class="build-prerequisite${satisfied?"":" insufficient"}">${text}</span>`;
  if(definition.prerequisites?.length)requirements.push(requirement(`前置设施：${facilityNames(definition.prerequisites)}`,definition.prerequisites.every(completed)));
  if(definition.requiredFurniture)requirements.push(requirement(`需摆放：${FURNITURE[definition.requiredFurniture]?.name??ITEMS[definition.requiredFurniture]?.name??definition.requiredFurniture}`,(state.furnitureByArea[state.position]??[]).some(entry=>entry.itemId===definition.requiredFurniture)));
  if(definition.globalPrerequisites?.length)requirements.push(requirement(`全岛前置设施：${facilityNames(definition.globalPrerequisites)}`,definition.globalPrerequisites.every(completedAnywhere)));
  if(Number(definition.requiresAnyHouseLevel??0)>0)requirements.push(requirement("任意地块已建成永久避难所",Object.values(state.housesByArea??{}).some(house=>Number(house?.level??0)>=definition.requiresAnyHouseLevel)));
  if(definition.prerequisiteAny?.length)requirements.push(requirement(`任选前置（至少1座）：${facilityNames(definition.prerequisiteAny)}`,definition.prerequisiteAny.some(completed)));
  if(definition.prerequisiteAnyCount?.ids?.length){
    const completedCount=definition.prerequisiteAnyCount.ids.filter(completed).length;
    requirements.push(requirement(`任选前置（至少${definition.prerequisiteAnyCount.count}座）：${facilityNames(definition.prerequisiteAnyCount.ids)}`,completedCount>=definition.prerequisiteAnyCount.count));
  }
  return requirements.length?`<div class="row-detail build-prerequisites">${requirements.join("；")}</div>`:"";
}

function facilityDisplayName(state,id,definition){
  const baseId=id.replace(/__\d+$/u,"");
  if(Number(definition.maxPerArea??1)<=1)return definition.name;
  const completed=Object.entries(state.buildingsByArea[state.position]??{}).filter(([buildingId,progress])=>progress.completed&&buildingId.replace(/__\d+$/u,"")===baseId).length;
  return `${definition.name} ${completed}/${definition.maxPerArea}`;
}

function buildManagementRow(state,id,definition){
  const progress=state.buildingsByArea[state.position][id],alternatives=(definition.alternatives??[]).map(inputs=>formatConstructionInputs(state,inputs)).join("；");
  const currentProgress=progress?.progress??0;
  const baseId=id.replace(/__\d+$/,"");
  const functionText=definition.houseLevel?`建成后拥有${HOUSE_LEVELS[definition.houseLevel].space}空间 · 保暖${HOUSE_LEVELS[definition.houseLevel].warmth}℃ · 酸雨设施防护${HOUSE_LEVELS[definition.houseLevel].acidRainFacilityProtection} · 强风设施防护${HOUSE_LEVELS[definition.houseLevel].stormFacilityProtection}`:describeFacility(baseId,definition,state);
  const prerequisiteText=formatBuildPrerequisites(state,definition);
  return `<div class="management-row"><div class="management-row-head"><div class="row-main"><div class="row-title">${facilityDisplayName(state,id,definition)}</div><div class="row-detail">${functionText}</div>${prerequisiteText}<div class="row-detail">每步消耗：${formatConstructionInputs(state,definition.inputs)}${alternatives?`；也可用${alternatives}替代`:""} · ${formatOutdoorStaminaCost(state,definition.stamina)}</div><div class="progress"><span style="width:${100*currentProgress/definition.steps}%"></span></div></div><div class="row-actions"><button class="action-button" data-action="build" data-building="${id}">施工（${currentProgress}/${definition.steps}）</button></div></div></div>`;
}

function renderAnimalControls(state,type){
  const labels=ANIMAL_LABELS[type],slots=getAnimalPenSlots(state,type),penName=BUILDINGS[MANAGED_FACILITY_ORDER.find(id=>PEN_TYPES[id]===type)]?.name??"栏舍";
  const rows=slots.map((slot,index)=>{
    const animalRows=slot.animals.map(animal=>`<div class="row-detail"><strong>${getLivestockStageName(animal.type,animal.age)}</strong> · 成长${animal.age}日 · ${animal.fed?"今日已喂":"今日未喂"} · 挨饿${animal.hungryDays}日</div>`).join("");
    const action=slot.animals.length
      ? `<button class="action-button" data-action="feed" data-animal-type="${type}" data-pen="${slot.penId}"${slot.progress.damaged||slot.animals.every(animal=>animal.fed)?" disabled":""}>喂养</button>`
      : `<button class="action-button" data-action="add-animal" data-animal-type="${type}" data-pen="${slot.penId}"${slot.progress.damaged?" disabled":""}>放入${labels.young}</button>`;
    const feedingCost=slot.animals.length?`<div class="row-detail">每次喂养消耗：${formatInputs(LIVESTOCK[type].feed)} · 体力${formatStamina(FEED_ANIMALS_STAMINA_COST)}</div>`:"";
    return `<div class="facility-subrow livestock-pen-row" data-animal-pen="${slot.penId}"><div><strong>${penName}${slots.length>1?` ${index+1}`:""}</strong>${animalRows||`<div class="row-detail">栏舍里还没有${labels.adult}</div>`}${feedingCost}${slot.progress.damaged?`<div class="row-detail danger-text">栏舍已损坏，修复后才能喂养</div>`:""}</div><div class="row-actions livestock-actions">${action}</div></div>`;
  }).join("");
  return `<div class="management-row-controls">${rows}</div>`;
}

function renderFarmControls(state){
  const plots=state.plotsByArea[state.position]??[],slots=getFarmPlotSlots(state),capacity=slots.length;
  const automation=getFarmAutomationCoverage(state),knowsGreenhouse=state.ownedBlueprintIds.includes(BUILDINGS.greenhouse.blueprintId??"greenhouse");
  const renderAutoFertilizeSwitch=(bedId,index,status)=>{
    if(!status.available)return "";
    const paused=status.enabled&&!status.operational;
    return `<span class="plot-auto-fertilize-control"><span>自动施肥${paused?`<small>修复后运行</small>`:""}</span><button type="button" class="web-toggle-switch${status.enabled?" active":""}" role="switch" aria-checked="${status.enabled?"true":"false"}" aria-label="${status.enabled?"关闭":"开启"}栽培地 ${index+1} 自动施肥" data-action="toggle-plot-auto-fertilize" data-bed="${bedId}"><span aria-hidden="true"></span></button></span>`;
  };
  const renderPlotRow=(plot,index,bedId=plot.bedId)=>{
    const crop=CROPS[plot.cropId],ready=plot.phase==="ready",environment=getPlotEnvironmentEffects(state,plot);
    const conditionText=cultivatedPlotConditionText(state,plot);
    const autoFertilize=getPlotAutoFertilizeStatus(state,bedId);
    const automationText=[index<automation.water?"自动浇水":"",autoFertilize.operational?"自动施肥":""].filter(Boolean).join("、");
    const status=ready?`库存${plot.charges}/${plot.maxCharges} · 在探索页采收`:plot.phase==="regrowing"?`恢复中，还需${plot.remaining}个浇水日`:`生长中，还需${plot.remaining}个浇水日`;
    const upgradeButton=knowsGreenhouse&&!environment.greenhouse?`<button class="action-button" data-action="upgrade-greenhouse" data-plot="${plot.id}">升级为温室</button>`:"";
    const fertilityStatus=plot.fertilized?(plot.watered?"（今日结算后+1）":"（还需浇水才会增加）"):"";
    const careCost=ready?"":`<div class="row-detail">每次浇水：水×${environment.heatAffected?2:1} · 体力0.2；每次施肥：肥料×1 · 体力0.2</div>`;
    return `<div class="facility-subrow farm-plot-row" data-farm-bed="${bedId??""}"><div class="row-main"><strong>家养${crop.name}${conditionText}</strong><div class="row-detail">${status} · 施肥丰饶${plot.fertility}/5${fertilityStatus}${automationText?` · ${automationText}范围内`:""}</div>${careCost}</div><div class="row-actions farm-plot-actions">${ready?"":`<button class="action-button" data-action="water" data-plot="${plot.id}" ${plot.watered?"disabled":""}>浇水</button>${plot.fertility<5?`<button class="action-button" data-action="fertilize" data-plot="${plot.id}" ${plot.fertilized?"disabled":""}>施肥</button>`:""}`}<button class="action-button danger-button" data-action="uproot" data-plot="${plot.id}">拔除</button>${upgradeButton}${renderAutoFertilizeSwitch(bedId,index,autoFertilize)}</div></div>`;
  };
  const slottedPlotIds=new Set(slots.map(slot=>slot.plot?.id).filter(Boolean));
  const rows=slots.map(slot=>slot.plot
    ? renderPlotRow(slot.plot,slot.index,slot.bedId)
    : `<div class="facility-subrow farm-plot-row" data-farm-bed="${slot.bedId}"><div class="row-main"><strong>${slot.progress.greenhouse?"温室":"栽培地"} ${slot.index+1} · 空置</strong><div class="row-detail">${slot.progress.greenhouse?"温室升级永久保留，改种无需再次升级":"尚未种植作物"}</div>${slot.progress.damaged?`<div class="row-detail danger-text">栽培地已损坏，修复后才能播种</div>`:""}</div><div class="row-actions farm-plot-actions"><button class="action-button" data-action="choose-seed" data-bed="${slot.bedId}"${slot.progress.damaged?" disabled":""}>选择种子</button>${renderAutoFertilizeSwitch(slot.bedId,slot.index,getPlotAutoFertilizeStatus(state,slot.bedId))}</div></div>`
  ).concat(plots.filter(plot=>!slottedPlotIds.has(plot.id)).map((plot,index)=>renderPlotRow(plot,slots.length+index))).join("");
  const emptyText=capacity?"":"先用泥土和肥料整理一块栽培地";
  return `<div class="management-row-controls"><div class="row-detail">栽培地已用${plots.length}/${capacity}</div>${rows||`<span class="row-detail">${emptyText}</span>`}</div>`;
}

function miningMachineProductionDetails(state){
  const {production,hasStorage,hasRoom}=getMiningMachineStatus(state);
  if(!production)return `<div class="row-detail insufficient">当地没有可供采矿机开采的矿种，暂停用电和生产</div>`;
  const warning=!hasStorage?"没有本地储存空间，暂停用电和生产":!hasRoom?"当地普通储物格已满且没有同类矿石堆，暂停生产":"";
  return warning?`<div class="row-detail"><span class="insufficient">${warning}</span></div>`:"";
}

function facilitySwitchButton(definition,id,progress,number=null){
  const enabled=progress.enabled!==false,label=definition.name+(number===null?"":` ${number}号`);
  return `<button type="button" class="web-toggle-switch${enabled?" active":""}" role="switch" aria-checked="${enabled?"true":"false"}" aria-label="${enabled?"关闭":"开启"}${label}" data-action="toggle-facility" data-id="${id}"${progress.damaged?" disabled":""}><span aria-hidden="true"></span></button>`;
}

function renderPastureControls(state) {
  state.pastureByArea ??= {};
  const pasture = state.pastureByArea[state.position] ??= { plots: [ { growth: 0 }, { growth: 0 }, { growth: 0 }, { growth: 0 }, { growth: 0 } ] };
  while ((pasture.plots?.length ?? 0) < 5) (pasture.plots ??= []).push({ growth: 0 });
  const rows = pasture.plots.map((plot, index) => {
    const days = Number(plot.growth || 0);
    const progressText = days >= 3 ? "已长满" : `生长中 ${days}/3天`;
    return `<div class="facility-subrow"><div class="row-main"><strong>草料地 ${index + 1}</strong><div class="row-detail">${progressText}</div></div><div class="row-actions"><span class="tag">自动照料</span></div></div>`;
  }).join("");
  return `<div class="management-row-controls">${rows}</div>`;
}

function renderHerbFieldControls(state) {
  state.herbFieldsByArea ??= {};
  const field = state.herbFieldsByArea[state.position] ??= { planted: false, remaining: 5, watered: false, fertilized: false, fertility: 0, mature: false };
  const seedCount = countItem(state, "herb_seed");
  const waterCost = getOutdoorActionPreview(state, 0).weatherExtra ? 2 : 1;
  if (!field.planted) {
    return `<div class="management-row-controls"><div class="row-actions"><button class="action-button" data-action="plant-herb-field" ${seedCount > 0 ? "" : "disabled"}>播种草药种子</button></div></div>`;
  }
  const condition = field.mature
    ? "已成熟"
    : `生长中，还需${field.remaining}天，丰饶${field.fertility}/5${field.watered ? "，已浇水" : ""}${field.fertilized ? "，已施肥" : ""}`;
  const careCost = field.mature ? "" : `<div class="row-detail">水×${waterCost}，体力0.2；肥料×1，体力0.2</div>`;
  const harvestButton = field.mature ? `<button class="action-button primary" data-action="harvest-herb-field">采收新鲜药草</button>` : "";
  const waterButton = (!field.mature && !field.watered) ? `<button class="action-button" data-action="water-herb-field">浇水</button>` : "";
  const fertilizeButton = (!field.mature && !field.fertilized && field.fertility < 5) ? `<button class="action-button" data-action="fertilize-herb-field">施肥</button>` : "";
  return `<div class="management-row-controls"><div class="row-detail">${condition}</div>${careCost}<div class="row-actions">${harvestButton}${waterButton}${fertilizeButton}</div></div>`;
}

function renderBuiltFacilityRow(state,id,progress,includeFarmControls){
  const baseId=id.replace(/__\d+$/,""),definition=BUILDINGS[baseId];
  if(!definition)return "";
  const displayName=facilityDisplayName(state,id,definition);
  const power=Number(definition.effect?.power??0);
  const usesFuel=Number(definition.effect?.fuelDaily??0)>0,fuelCost=usesFuel?getFuelDailyCost(state,definition.effect,state.position):0;
  const payment=getDailyResourcePaymentStatus(state,progress,definition.effect),paymentStatus=payment.usesResources?(payment.paid?"已扣除今日消耗资源":"尚未扣除今日消耗资源"):"";
  const runningStatus=[progress.enabled===false?"已关闭":"已开启",paymentStatus,power&&progress.poweredToday===false?"本日未供电":""].filter(Boolean).join(" · ");
  const status=progress.damaged?["已损坏",paymentStatus].filter(Boolean).join(" · "):definition.switchable?runningStatus:"";
  const statusText=status;
  const automaticFeedStatus=baseId==="auto_feeder"?(()=>{
    const stored=countLocalStorageItem(state,"feed",state.position),demand=getAutomaticFeedDemand(state,state.position);
    return ` · <span class="facility-resource-status${stored<demand?" insufficient":""}">当地储存库饲料 ${stored}份 / 每日需消耗 ${demand}份</span>`;
  })():"";
  const actions=[];
  if(progress.damaged){
    actions.push(repairActionButton(state,id));
  }
  if(definition.switchable)actions.push(facilitySwitchButton(definition,id,progress));
  let controls="";
  if(baseId==="mining_machine"){
    const details=miningMachineProductionDetails(state);
    controls=details?`<div class="management-row-controls">${details}</div>`:"";
  }
  else if(baseId==="auto_fertilizer"){
    const itemId="fertilizer",available=countItem(state,itemId),stored=state.farmSuppliesByArea?.[state.position]?.[itemId]??0;
    controls=`<div class="management-row-controls"><div class="row-detail">设施内现有${ITEMS[itemId].name} ${stored}份 · 当前地块与背包可加入 ${available}份</div><div class="row-actions"><button class="action-button" data-action="load-farm-supply" data-item="${itemId}" data-quantity="1" ${available?"":"disabled"}>加入1份${ITEMS[itemId].name}</button><button class="action-button" data-action="load-farm-supply" data-item="${itemId}" data-quantity="all" ${available?"":"disabled"}>全部加入（${available}）</button></div></div>`;
  }
  else if(baseId==="distribution_room"){
    const grid=getGridPowerStatus(state),usage=Object.entries(grid.usageByArea).filter(([,value])=>value>0).map(([areaId,value])=>`${areaId}占用${value}点`).join("、")||"暂无地块用电";
    const transient=grid.spent?`；${state.returnTowerAreaId??""}归航塔今日广播已用${grid.spent}点`:"";
    const shortageRule=grid.consumers.some(consumer=>consumer.priority>0)?"先停止采矿机，若仍不足再随机让其他电器断电":"过夜时会随机让部分电器断电";
    const balance=grid.shortage?`<span class="insufficient">超出${grid.shortage}点；总电量不足，${shortageRule}</span>`:`剩余${grid.available}点`;
    controls=`<div class="management-row-controls"><div class="row-detail"><strong>全岛总电量${grid.generation}点</strong> · 已占用${grid.demand}点 · ${balance}</div><div class="row-detail">用电地块：${usage}${transient}</div>${renderGridPowerConnections(state)}</div>`;
  }
  else if(PEN_TYPES[baseId])controls=renderAnimalControls(state,PEN_TYPES[baseId]);
  else if(baseId==="pasture")controls=renderPastureControls(state);
  else if(baseId==="herb_field")controls=renderHerbFieldControls(state);
  else if(includeFarmControls)controls=renderFarmControls(state);
  return `<div class="management-row"><div class="management-row-head${definition.switchable?" management-row-head-toggle":""}"><div class="row-main"><div class="row-title">${displayName}</div><div class="row-detail">${describeFacility(baseId,definition,state)}${automaticFeedStatus}${usesFuel?` · 当前每日消耗${fuelCost}点`:""}${statusText?` · ${statusText}`:""}</div></div><div class="row-actions">${actions.join("")}</div></div>${controls}</div>`;
}

function renderManagedFacilityRow(state,baseId,instances){
  const definition=BUILDINGS[baseId],displayName=facilityDisplayName(state,instances[0][0],definition),actions=[];
  for(const [index,[id,progress]] of instances.entries()){
    const suffix=instances.length>1?`${index+1}`:"";
    if(progress.damaged){
      actions.push(repairActionButton(state,id,suffix));
    }
  }
  const damagedCount=instances.filter(([,progress])=>progress.damaged).length;
  const controls=baseId==="planting_bed"?renderFarmControls(state):renderAnimalControls(state,PEN_TYPES[baseId]);
  return `<div class="management-row managed-facility-row" data-managed-facility="${baseId}"><div class="management-row-head"><div class="row-main"><div class="row-title">${displayName}</div><div class="row-detail">${describeFacility(baseId,definition,state)}${damagedCount?` · 已损坏${damagedCount}座`:""}</div></div><div class="row-actions">${actions.join("")}</div></div>${controls}</div>`;
}

function renderRepeatableFacilityRow(state,baseId,instances){
  const definition=BUILDINGS[baseId],displayName=facilityDisplayName(state,instances[0][0],definition),actions=[];
  for(const [index,[id,progress]] of instances.entries()){
    const suffix=instances.length>1?`${index+1}`:"";
    if(progress.damaged){
      actions.push(repairActionButton(state,id,suffix));
    }
  }
  const damagedCount=instances.filter(([,progress])=>progress.damaged).length;
  const switches=definition.switchable?instances.map(([id,progress],index)=>{
    const number=index+1,status=[progress.enabled===false?"已关闭":"已开启",progress.damaged?"已损坏":"",Number(definition.effect?.power??0)>0&&progress.enabled!==false&&progress.poweredToday===false?"本日未供电":""].filter(Boolean).join(" · ");
    return `<div class="facility-subrow management-row-head management-row-head-toggle" data-facility-instance="${id}"><div class="row-main"><strong>${definition.name} ${number}号</strong><div class="row-detail">${status}</div></div><div class="row-actions">${facilitySwitchButton(definition,id,progress,number)}</div></div>`;
  }).join(""):"";
  const production=baseId==="mining_machine"?miningMachineProductionDetails(state):"";
  const controls=switches||production?`<div class="management-row-controls">${production}${switches}</div>`:"";
  return `<div class="management-row repeatable-facility-row" data-repeatable-facility="${baseId}"><div class="management-row-head"><div class="row-main"><div class="row-title">${displayName}</div><div class="row-detail">${describeFacility(baseId,definition,state)}${damagedCount?` · 已损坏${damagedCount}座`:""}</div></div><div class="row-actions">${actions.join("")}</div></div>${controls}</div>`;
}

function renderFuelStorageRow(state){
  if(!hasFuelStorage(state,state.position))return "";
  const points=state.fuelPointsByArea[state.position]??0;
  const buttons=Object.entries(FUEL_POINT_VALUES).map(([itemId,value])=>`<button class="action-button" data-action="load-fuel" data-item="${itemId}" ${countItem(state,itemId)?"":"disabled"}>加入${ITEMS[itemId].name}（+${value}）</button>`).join("");
  return `<div class="management-row fuel-storage-row"><div class="management-row-head"><div class="row-main"><div class="row-title">总燃料槽 · ${points}点</div><div class="row-detail">当前地块所有取暖、生产和燃料设备共用；燃料一旦投入便转为燃料点，不能取回</div></div><div class="row-actions">${buttons}</div></div></div>`;
}

function renderAutomaticWaterStorageRow(state){
  const hasDrip=Object.entries(state.buildingsByArea[state.position]??{}).some(([id,progress])=>id.replace(/__\d+$/,'')==="drip_irrigation"&&progress.completed);
  const hasWaterFurniture=(state.furnitureByArea[state.position]??[]).some(entry=>Number(FURNITURE[entry.itemId]?.effect?.waterDaily??0)>0);
  if(!hasDrip&&!hasWaterFurniture)return "";
  const {stored,expectedUse,shortage,consumers}=getAutomaticWaterStatus(state),{expectedProduction,producers}=getAutomaticWaterProductionStatus(state),priority="滴灌架 → 蒸发冷风器 → 浴缸/按摩浴缸";
  const summarize=(entries)=>entries.length?entries.map(entry=>`${entry.name}${entry.quantity}份`).join("、"):"无";
  const shortageText=shortage?` · <span class="insufficient">按当前库存缺水${shortage}份</span>`:" · 当前库存充足";
  return `<div class="management-row automatic-water-row"><div class="management-row-head"><div class="row-main"><div class="row-title">自动用水 · 当地普通储物格有水${stored}份 / 今晚预计用水${expectedUse}份 / 产水${expectedProduction}份</div><div class="row-detail">已开启设施用水：${summarize(consumers)}；今晚设施产水：${summarize(producers)}。只使用当地普通储物格；结算顺序：${priority}${shortageText}。设施会在自动扣水前先产水。</div></div></div></div>`;
}

function renderGridPowerConnections(state){
  const connections=getGridPowerConnections(state),counts=new Map(),indices=new Map();
  const keyFor=entry=>`${entry.areaId}:${entry.kind}:${entry.baseId}`;
  for(const entry of connections)counts.set(keyFor(entry),(counts.get(keyFor(entry))??0)+1);
  const rows=connections.map(entry=>{
    const key=keyFor(entry),index=(indices.get(key)??0)+1;
    indices.set(key,index);
    const name=`${entry.name}${counts.get(key)>1?` ${index}`:""}`;
    const status=entry.damaged?"已损坏":!entry.enabled?"已关闭":entry.standby?"异地待机":entry.powered?"供电中":entry.operating?"等待供电":"暂停用电";
    const reason=entry.disabledReason?` · ${escapeHtml(entry.disabledReason)}`:"";
    const label=`${entry.enabled?"关闭":"开启"}${entry.areaId} ${name}`;
    return `<div class="grid-power-connection"><div class="row-main"><div class="row-title">${escapeHtml(entry.areaId)} ${escapeHtml(entry.areaName)} · ${escapeHtml(name)}</div><div class="row-detail">每日耗电${entry.use} · ${status}${reason}</div></div><button type="button" class="web-toggle-switch${entry.enabled?" active":""}" role="switch" aria-checked="${entry.enabled}" aria-label="${escapeHtml(label)}" data-action="toggle-grid-power" data-area="${escapeHtml(entry.areaId)}" data-kind="${entry.kind}" data-id="${escapeHtml(entry.id)}"${entry.canToggle?"":" disabled"}><span aria-hidden="true"></span></button></div>`;
  }).join("");
  return `<div class="grid-power-connections"><div class="row-detail">全岛用电设备</div>${rows||`<div class="row-detail">尚无接入电网的用电设备</div>`}</div>`;
}

function renderReturnRows(state){
  const rows={existing:"",buildable:"",actions:""};
  if(!state.ownedBlueprintIds.includes("return_tower"))return rows;
  if(state.returnEnding||state.postgame)return {...rows,existing:`<div class="management-row"><div class="row-title">归航塔</div><div class="row-detail">归航塔已建成，通关记录已保存</div></div>`};
  if(!state.returnTowerAreaId)return {...rows,buildable:`<div class="management-row"><div class="management-row-head"><div class="row-main"><div class="row-title">归航塔</div><div class="row-detail">只能选择一个永久避难所地块作为归航塔据点；开工前需在当地建成机械工坊和气象站</div></div><button class="action-button" data-action="select-return-area">设为归航塔据点</button></div></div>`};
  if(state.returnTowerAreaId!==state.position)return {...rows,existing:`<div class="management-row"><div class="management-row-head"><div><div class="row-title">归航塔</div><div class="row-detail">唯一据点位于${state.returnTowerAreaId}</div></div></div></div>`};
  for(const stage of RETURN_STAGES){
    const progress=state.returnProgress[stage.id]??{progress:0};
    const details=progress.completed?"":`<div class="row-detail">每步消耗：${formatConstructionInputs(state,stage.inputs)} · ${formatOutdoorStaminaCost(state,stage.stamina)}${stage.id==="return_base"?" · 前置：当地建成机械工坊和气象站":""}${stage.id==="core_install"?" · 安装后进行三天坐标运算和广播":""}</div>`;
    rows[progress.completed?"existing":"buildable"]+=`<div class="management-row"><div class="management-row-head"><div class="row-main"><div class="row-title">归航塔 · ${stage.name}</div>${details}</div><button class="action-button" data-action="build-return" data-stage="${stage.id}" ${progress.completed?"disabled":""}><span>${progress.completed?"已完成":`施工（${progress.progress}/${stage.steps}）`}</span></button></div></div>`;
  }
  const departure=state.returnDeparture??{completedRuns:0,lastRunDay:0},ranToday=departure.lastRunDay===state.day;
  const resources=getReturnBroadcastResources(state);
  const actions=state.returnProgress.core_install?.completed?`<button class="action-button return-broadcast-button" data-action="broadcast" ${ranToday||departure.completedRuns>=3?"disabled":""}><span>坐标运算和广播（${departure.completedRuns}/3）</span></button><div class="row-detail return-broadcast-cost">消耗<span class="facility-resource-status${resources.powerAvailable<resources.powerRequired?" insufficient":""}">电力${resources.powerRequired}</span>，<span class="facility-resource-status${resources.fuelAvailable<resources.fuelRequired?" insufficient":""}">燃油${resources.fuelRequired}</span></div>${ranToday?`<div class="row-detail">今日已完成，明日继续。</div>`:""}`:"";
  if(actions)rows.actions=`<div class="management-final-actions">${actions}</div>`;
  return rows;
}

function renderFurnitureRows(state,house){
  const areaId=state.position,placedEntries=state.furnitureByArea[areaId]??[];
  const ids=Object.keys(FURNITURE).filter(itemId=>countItem(state,itemId)>0||placedEntries.some(entry=>entry.itemId===itemId));
  const used=placedEntries.reduce((sum,entry)=>sum+(FURNITURE[entry.itemId]?.space??0),0)
    +(state.devicesByArea[areaId]??[]).reduce((sum,entry)=>sum+(DEVICES[entry.itemId]?.space??0),0);
  const renderRow=(itemId,placed,title)=>{const definition=FURNITURE[itemId],actions=[];
    if(placed&&definition.switchable)actions.push(`<button class="action-button" data-action="toggle-placed" data-id="${placed.id}">运行：${placed.enabled===false?"关闭":"开启"}</button>`);
    actions.push(placed
      ? `<button type="button" class="web-toggle-switch active" role="switch" aria-checked="true" aria-label="收起${definition.name}" data-action="pickup-placed" data-id="${placed.id}"><span aria-hidden="true"></span></button>`
      : `<button type="button" class="web-toggle-switch" role="switch" aria-checked="false" aria-label="摆放${definition.name}" data-action="place" data-item="${itemId}"><span aria-hidden="true"></span></button>`);
    const placementLimit=definition.repeatable?"":` <span class="tag">只能放1件</span>`;
    const dailyUseTags=[["waterDaily","用水"],["power","用电"]]
      .filter(([key])=>Number(definition.effect?.[key]??0)>0)
      .map(([key,label])=>` <span class="tag">${label}${definition.effect[key]}</span>`).join("");
    return `<div class="management-row"><div class="management-row-head management-row-head-toggle"><div class="row-main"><div class="row-title">${title} <span class="tag">占${definition.space}空间</span>${placementLimit}${dailyUseTags}</div></div><div class="row-actions">${actions.join("")}</div></div></div>`;
  };
  const rows=ids.flatMap(itemId=>{
    const placed=placedEntries.filter(entry=>entry.itemId===itemId),available=countItem(state,itemId);
    if(!FURNITURE[itemId].repeatable)return [renderRow(itemId,placed[0],`${FURNITURE[itemId].name} ×${available+placed.length}`)];
    return [
      ...placed.map((entry,index)=>renderRow(itemId,entry,`${FURNITURE[itemId].name} ${index+1} · 已摆放`)),
      ...Array.from({length:available},(_,index)=>renderRow(itemId,null,`${FURNITURE[itemId].name} ${placed.length+index+1} · 待摆放`))
    ];
  }).join("");
  const productionFurnitureRows=PRODUCTION_FURNITURE_IDS.filter(itemId=>countItem(state,itemId)>0||(state.devicesByArea[areaId]??[]).some(entry=>entry.itemId===itemId)).flatMap(itemId=>{
    const definition=DEVICES[itemId],placed=(state.devicesByArea[areaId]??[]).filter(entry=>entry.itemId===itemId),available=countItem(state,itemId),total=available+placed.length;
    const maxPerArea=definition.maxPerArea??2;
    const space=` <span class="tag">占${definition.space}空间</span>`;
    const placementLimit=maxPerArea===1?` <span class="tag">只能放1件</span>`:"";
    const renderDeviceRow=(entry,title)=>{
      const action=entry
        ? `<button type="button" class="web-toggle-switch active" role="switch" aria-checked="true" aria-label="收起${definition.name}" data-action="pickup-placed" data-id="${entry.id}"><span aria-hidden="true"></span></button>`
        : `<button type="button" class="web-toggle-switch" role="switch" aria-checked="false" aria-label="摆放${definition.name}" data-action="place" data-item="${itemId}"${placed.length>=maxPerArea?` disabled title="同类设备每个地块最多${maxPerArea}台"`:""}><span aria-hidden="true"></span></button>`;
      return `<div class="management-row"><div class="management-row-head management-row-head-toggle"><div class="row-main"><div class="row-title">${title}${space}${placementLimit}</div></div><div class="row-actions">${action}</div></div></div>`;
    };
    if(maxPerArea>1)return [
      ...placed.map((entry,index)=>renderDeviceRow(entry,`${definition.name} ${index+1} · 已摆放`)),
      ...Array.from({length:available},(_,index)=>renderDeviceRow(null,`${definition.name} ${placed.length+index+1} · 待摆放`))
    ];
    return [renderDeviceRow(placed[0],`${definition.name} ×${total}`)];
  }).join("");
  return {used,html:productionFurnitureRows+rows||`<div class="empty">当前地块和背包里还没有家具</div>`};
}

function renderFacilitySection(key,title,content,meta=""){
  const contentId=`facility-section-${key}-content`;
  return `<section class="facility-management-section wide" data-facility-section="${key}"><div class="facility-section-heading"><h3><button type="button" class="facility-section-toggle" data-action="toggle-facility-section" data-section="${key}" aria-expanded="true" aria-controls="${contentId}"><span>${title}</span><span class="facility-section-toggle-hint"><span class="facility-section-toggle-label">收起</span><span class="facility-section-toggle-icon" aria-hidden="true">⌃</span></span></button></h3>${meta}</div><div class="management-list facility-section-body" id="${contentId}">${content}</div></section>`;
}

export function renderFacilities(state){
  const areaId=state.position,houseLevel=state.housesByArea[areaId]?.level??0,house=getHouse(state,areaId);
  const reinforcementActive=(state.reinforcementByArea?.[areaId]?.untilDay??0)>=state.day;
  const acidRainFacilityProtection=getOutdoorFacilityProtection(state,"rain",areaId),stormFacilityProtection=getOutdoorFacilityProtection(state,"storm",areaId);
  const completed=Object.entries(state.buildingsByArea[areaId]??{}).filter(([id,progress])=>{const baseId=id.replace(/__\d+$/,''),definition=BUILDINGS[baseId];return progress.completed&&definition&&!definition.houseLevel;});
  completed.sort(([,a],[,b])=>(a.completedOrder??0)-(b.completedOrder??0));
  const protectionRow=`<div class="management-row"><div class="management-row-head"><div class="row-main"><div class="row-title">当地酸雨设施防护 ${acidRainFacilityProtection}/100</div><div class="row-detail">使酸雨造成的室外设施破损率降低${acidRainFacilityProtection}%；达到100时完全免疫</div><div class="row-title">当地强风设施防护 ${stormFacilityProtection}/100</div><div class="row-detail">使强风暴造成的室外设施破损率降低${stormFacilityProtection}%；达到100时完全免疫</div></div></div></div>`;
  const houseRow=houseLevel?`<div class="management-row"><div class="management-row-head"><div class="row-main"><div class="row-title">${house.name}</div><div class="row-detail">房屋 · 空间${house.space} · 保暖${house.warmth}℃ · 酸雨设施防护${house.acidRainFacilityProtection} · 强风设施防护${house.stormFacilityProtection}</div></div>${reinforcementActive?"":`<button class="action-button" data-action="reinforce">临时加固</button>`}</div></div>`:"";

  const isLandscape=(baseId,definition)=>{
    if(MANAGED_FACILITIES.has(baseId))return false;
    if(definition.switchable)return false;
    if(definition.productionFuelCost||definition.capacity)return false;
    if(definition.autoWater||definition.autoFeed||definition.autoFertilize)return false;
    if(definition.water||definition.power||definition.powerGeneration||definition.gridAccess)return false;
    if(definition.coldStorage||definition.storage||definition.seedStorage||definition.utilityStorage||definition.wardrobeStorage)return false;
    if(definition.forecast||definition.healing||definition.bees)return false;
    return true;
  };
  const functionalCompleted=completed.filter(([id])=>{const baseId=id.replace(/__\d+$/,''),def=BUILDINGS[baseId];return !def||!isLandscape(baseId,def);});
  const landscapeCompleted=completed.filter(([id])=>{const baseId=id.replace(/__\d+$/,''),def=BUILDINGS[baseId];return def&&isLandscape(baseId,def);});

  const renderedRepeatableFacilities=new Set();
  const facilityRows=functionalCompleted.filter(([id])=>!MANAGED_FACILITIES.has(id.replace(/__\d+$/,''))).map(([id,progress])=>{
    const baseId=id.replace(/__\d+$/,''),definition=BUILDINGS[baseId];
    if(Number(definition.maxPerArea??1)<=1)return renderBuiltFacilityRow(state,id,progress,false);
    if(renderedRepeatableFacilities.has(baseId))return "";
    renderedRepeatableFacilities.add(baseId);
    const instances=functionalCompleted.filter(([buildingId])=>buildingId===baseId||buildingId.startsWith(`${baseId}__`));
    return renderRepeatableFacilityRow(state,baseId,instances);
  }).join("");

  const renderedRepeatableLandscape=new Set();
  const landscapeRows=landscapeCompleted.map(([id,progress])=>{
    const baseId=id.replace(/__\d+$/,''),definition=BUILDINGS[baseId];
    if(Number(definition.maxPerArea??1)<=1)return renderBuiltFacilityRow(state,id,progress,false);
    if(renderedRepeatableLandscape.has(baseId))return "";
    renderedRepeatableLandscape.add(baseId);
    const instances=landscapeCompleted.filter(([buildingId])=>buildingId===baseId||buildingId.startsWith(`${baseId}__`));
    return renderRepeatableFacilityRow(state,baseId,instances);
  }).join("");

  const managedRows=MANAGED_FACILITY_ORDER.map(baseId=>{
    const instances=completed.filter(([id])=>id===baseId||id.startsWith(`${baseId}__`));
    return instances.length?renderManagedFacilityRow(state,baseId,instances):"";
  }).join("");
  const returnRows=renderReturnRows(state);
  const existingRows=returnRows.actions+protectionRow+houseRow+renderFuelStorageRow(state)+renderAutomaticWaterStorageRow(state)+facilityRows+returnRows.existing+managedRows;
  const buildOptions=getBuildOptions(state);
  buildOptions.sort(([leftId],[rightId])=>{
    const leftRank=MANAGED_FACILITY_ORDER.indexOf(leftId.replace(/__\d+$/,'')),rightRank=MANAGED_FACILITY_ORDER.indexOf(rightId.replace(/__\d+$/,''));
    if(leftRank<0&&rightRank<0)return 0;
    if(leftRank<0)return -1;
    if(rightRank<0)return 1;
    return leftRank-rightRank;
  });
  const buildRows=buildOptions.map(([id,definition])=>buildManagementRow(state,id,definition)).join("")+returnRows.buildable;
  const furniture=renderFurnitureRows(state,house);
  const landscapeSection=landscapeRows?renderFacilitySection("landscape","景观",landscapeRows):"";
  return renderFacilitySection("existing","已有房子和设施",existingRows||`<div class="empty">当前地块还没有建成房子或设施</div>`)+
    landscapeSection+
    renderFacilitySection("buildable","可建造的房子和设施",buildRows||`<div class="empty">当前没有可建造项目</div>`)+
    renderFacilitySection("furniture","家具",furniture.html,`<strong>已占用 ${furniture.used}/${house.space} 空间</strong>`);
}

function itemGrid(stacks,source){
  const tiles=stacks.map((stack,index)=>{const item=ITEMS[stack.itemId];return `<button type="button" class="item-tile" draggable="true" data-action="open-item" data-source="${source}" data-index="${index}" aria-label="查看${item.name}，数量${stack.quantity}"><span>${item.name}</span><strong>×${stack.quantity}</strong></button>`;}).join("");
  return `<div class="item-grid${tiles?"":" empty-grid"}" data-inventory-location="${source}">${tiles||`<span class="item-grid-empty">空</span>`}</div>`;
}

export function captureInventoryScrollPositions(root){
  return new Map([...root.querySelectorAll("[data-inventory-location]")].map(grid=>[grid.dataset.inventoryLocation,grid.scrollLeft]));
}

export function restoreInventoryScrollPositions(root,positions){
  if(!positions?.size)return;
  for(const grid of root.querySelectorAll("[data-inventory-location]")){
    const scrollLeft=positions.get(grid.dataset.inventoryLocation);
    if(Number.isFinite(scrollLeft))grid.scrollLeft=scrollLeft;
  }
}

export function getEquipmentCollapsed() {
  try {
    return localStorage.getItem("dropped_survival_equipment_collapsed") === "1";
  } catch (e) {
    return false;
  }
}

export function renderEquipment(state) {
  const inv = getInventoryView(state);
  const backpackCapacity=getBackpackCapacity(state);
  const wardrobeCapacity=getWardrobeCapacity(state);
  const seedStorageCapacity=getSeedStorageCapacity(state);
  const utilityStorageCapacity=getUtilityStorageCapacity(state);
  const slots={head:"头部",body:"上身",legs:"下身",feet:"足部",hands:"手部",weapon:"武器",backpack:"背包"};
  const equipped=Object.entries(slots).map(([slot,name])=>`<button type="button" class="equipment-slot-button" data-action="open-equipment-slot" data-slot="${slot}" aria-label="选择${name}装备"><span>${name}</span><strong>${ITEMS[state.player.equipment[slot]]?.name??"未装备"}</strong></button>`).join("");
  const survivalMetrics=getSurvivalMetrics(state).map(metric=>`<button type="button" class="survival-metric-button" data-action="open-survival-metric" data-metric="${metric.id}" aria-label="查看${metric.label}${["injury","disease"].includes(metric.id)?"状态":"来源"}"><span>${metric.label}</span><strong>${formatSurvivalMetricValue(metric)}</strong></button>`).join("");
  const isCollapsed = getEquipmentCollapsed();
  const equipmentCard = `<section class="card wide equipment-card${isCollapsed ? " collapsed" : ""}" data-equipment-card="equipment"><div class="card-header production-station-header"><h3><button type="button" class="production-station-toggle" data-action="toggle-equipment-collapse" aria-expanded="${!isCollapsed}"><span>装备</span><span class="production-station-toggle-hint"><span class="production-station-toggle-label">${isCollapsed ? "展开" : "收起"}</span><span class="production-station-toggle-icon" aria-hidden="true">⌃</span></span></button></h3></div><div class="card-body equipment-card-body"${isCollapsed ? " hidden" : ""}><div class="equipment-slot-grid">${equipped}</div></div></section>`;
  return card("生存数值", `<div class="survival-metric-grid">${survivalMetrics}</div><div class="row-actions"><button class="action-button compact-button" data-action="open-wound-treatment">处理伤口</button><button class="action-button compact-button" data-action="use-medical" data-item="medicine">使用药剂</button></div>`) +
    equipmentCard +
    card(`背包保鲜格 ${inv.cold.length}/${backpackCapacity.cold}`, itemGrid(inv.cold, "cold")) +
    card(`背包普通格 ${inv.ordinary.length}/${backpackCapacity.ordinary}`, `<p class="row-detail">拖动物品可调整顺序或换行存放；手机上长按后拖动。</p>${itemGrid(inv.ordinary, "ordinary")}`, "", `<button type="button" class="compact-button secondary-button" data-action="consolidate-backpack">整理</button>`) +
    (wardrobeCapacity||inv.wardrobe.length?card(`衣帽间 ${inv.wardrobe.length}/${wardrobeCapacity}`,itemGrid(inv.wardrobe,"wardrobe")):"") +
    (seedStorageCapacity||inv.seedStorage.length?card(`本地种子储存室 ${inv.seedStorage.length}/${seedStorageCapacity}`,`<p class="row-detail">只能存放种子</p>${itemGrid(inv.seedStorage,"seed-storage")}`):"") +
    (utilityStorageCapacity||inv.utilityStorage.length?card(`本地杂物间 ${inv.utilityStorage.length}/${utilityStorageCapacity}`,`<p class="row-detail">只能存放家具和工具（含便携生产工具）</p>${itemGrid(inv.utilityStorage,"utility-storage")}`):"") +
    card(`本地保鲜库 ${inv.localCold.length}/${getColdStorageCapacity(state)}`, itemGrid(inv.localCold, "local-cold")) +
    card(`本地储存库 ${inv.storage.length}/${getStorageCapacity(state,state.position)}`, itemGrid(inv.storage, "storage")) +
    card(`地面物品 ${inv.ground.length}`, itemGrid(inv.ground, "ground"), "wide");
}

function getSurvivalMetrics(state){
  const stats=getPlayerStats(state),equipment=Object.values(state.player.equipment??{}).map(itemId=>ITEMS[itemId]).filter(Boolean);
  const equipmentEntries=(valueOf)=>equipment.map(item=>({label:item.name,value:Number(valueOf(item)??0)})).filter(entry=>entry.value!==0);
  const dietBuffs=state.player.dietBuffs??{},dietEntries=(key)=>Number(dietBuffs[key]??0)?[{label:`昨日饮食（${(dietBuffs.sources??[]).filter(source=>Number(source.effect?.[key]??0)>0).map(source=>source.name).join("、")}）`,value:Number(dietBuffs[key])}]:[];
  const attackBeforeInjury=Number(state.player.baseAttack??0)+equipment.reduce((sum,item)=>sum+Number(item.attack??0),0)+Number(dietBuffs.attack??0);
  const injuryEntry=(before,after)=>before===after?[]:[{label:`${state.player.injury}级伤势影响`,value:after-before}];
  const house=getHouse(state),localSources=getLocalEffectSources(state);
  const temperatureEntries=[
    ...equipmentEntries(item=>Number(item.env?.warmth??0)-Number(item.env?.heat??0)),
    ...dietEntries("warmth"),
    ...dietEntries("heat").map(entry=>({...entry,value:-entry.value})),
    ...(Math.max(0,Number(state.player.warmth??2)-2)?[{label:"自身耐寒",value:Math.max(0,Number(state.player.warmth??2)-2)}]:[]),
    ...(Math.max(0,Number(state.player.heatResist??0))?[{label:"自身耐热",value:-Math.max(0,Number(state.player.heatResist??0))}]:[]),
    ...(house.warmth?[{label:house.name,value:house.warmth}]:[]),
    ...localSources.temperature,
    ...localSources.warmth,
    ...localSources.cooling.map(entry=>({...entry,value:-entry.value}))
  ];
  const temperature=temperatureEntries.reduce((sum,entry)=>sum+entry.value,0);
  return [
    {id:"attack",label:"攻击",value:stats.attack,entries:[{label:"基础攻击",value:Number(state.player.baseAttack??0)},...equipmentEntries(item=>item.attack),...dietEntries("attack"),...injuryEntry(attackBeforeInjury,stats.attack)],description:dietBuffs.attackTierBoost?"高阶强攻食物与高阶强攻饮料已经组成完整攻势：未受伤时可以挑战高一级敌人。":""},
    {id:"temperature",label:"温度调整",value:temperature,unit:"℃",entries:temperatureEntries,description:"当前地块的升温与降温净值。正数表示升温，负数表示降温；具体体感仍会根据天气冷热分别采用对应效果。"},
    {id:"rain",label:"防雨",value:stats.rain,entries:[...equipmentEntries(item=>item.env?.rain),...dietEntries("rain")],empty:"当前装备和昨日饮食没有提供防雨加成。",description:"防雨用于降低酸雨天气下的生病概率：无房屋地块的每次耗体力行动都会判定；无论有无房屋，探索、天然资源采集和家养植物采收也都会判定。达到100时完全免疫。"},
    {id:"storm",label:"防风",value:stats.storm,entries:[...equipmentEntries(item=>item.env?.storm),...dietEntries("storm")],empty:"当前装备和昨日饮食没有提供防风加成。",description:"防风用于降低强风暴天气下的生病概率：无房屋地块的每次耗体力行动都会判定；无论有无房屋，探索、天然资源采集和家养植物采收也都会判定。达到100时完全免疫。"},
    {id:"injury",label:"伤势",value:state.player.injury,status:state.player.injury?`${state.player.injury}级伤势`:`无伤`,description:state.player.injury?`当前伤势会使攻击除以${2**state.player.injury}，最低为1。每天结束时只要体力仍大于0，就累计1个养伤日；连续3天后自然减轻1级伤势，体力耗尽会中断并清零累计。当前连续养伤：${Math.min(3,Math.max(0,Number(state.injuryRestDays??0)))}/3天。可在物资页点击“处理伤口”使用本地伤口用品，所有伤药合计每天只能使用1份。`:"当前没有伤势，不会削弱攻击。受伤后，每天结束时只要体力仍大于0，就累计1个养伤日；连续3天后自然减轻1级伤势，体力耗尽会中断并清零累计。"},
    {id:"disease",label:"疾病",value:state.player.sick?"有":"无",status:state.player.sick?"患病":"健康",description:state.player.sick?`当前处于患病状态。使用药剂可以立即治好；也可以在舒适温度下正常饮食并连续养病${Number(getLocalEffects(state).healing??0)>0?"2":"3"}天。`:"当前没有患病。"}
  ];
}

function formatSurvivalMetricValue(metric){
  if(metric.id==="temperature")return `${metric.value>0?"+":""}${metric.value}${metric.unit}`;
  return `${metric.value}${metric.unit??""}`;
}

export function renderSurvivalMetricDetails(state,metricId){
  const metric=getSurvivalMetrics(state).find(entry=>entry.id===metricId);
  if(!metric)return `<h2>生存数值</h2><div class="empty">没有找到这项生存数值</div>`;
  if(metric.status)return `<h2>${metric.label}状态</h2><div class="metric-row"><span>当前状态</span><strong>${metric.status}</strong></div><p class="row-detail">${metric.description}</p>`;
  const rows=metric.entries.map(entry=>`<div class="metric-row"><span>${escapeHtml(entry.label)}</span><strong class="${entry.value<0?"danger-text":""}">${entry.value>0?"+":""}${entry.value}${metric.unit??""}</strong></div>`).join("");
  return `<h2>${metric.label}来源</h2><div class="metric-row survival-metric-total"><span>当前总值</span><strong>${formatSurvivalMetricValue(metric)}</strong></div>${rows||`<div class="empty">${metric.empty??"当前没有提供这项加成的来源。"}</div>`}${metric.description?`<p class="row-detail">${metric.description}</p>`:""}`;
}

function itemFlavor(itemId,item){
  return item.description??"";
}

const ITEM_TEMPERATURE_LABELS=new Set(["保暖","防热","次日保暖","次日防热"]);
function renderItemDetailRows(details){
  return details.map(([label,value])=>`<div class="metric-row"><span>${label}</span><strong${ITEM_TEMPERATURE_LABELS.has(label)?' data-i18n-unit="celsius"':""}>${value}</strong></div>`).join("");
}

const ITEM_ENV_LABELS={warmth:"保暖",heat:"防热",rain:"防雨（降低酸雨生病率）",storm:"防风（降低风暴生病率）",rainStaminaReduction:"酸雨行动体力减免"};
const ITEM_SLOT_LABELS={head:"头部",body:"上身",legs:"下身",feet:"足部",hands:"手部",weapon:"武器",backpack:"背包"};
const WEAPON_STYLE_LABELS={melee:"近战",ranged:"远程"};

function appendItemFunctionDetails(itemId,item,details){
  const furnitureEffect=FURNITURE[itemId]?.effect??{},happiness=item.happiness??furnitureEffect.happiness;
  if(happiness!==undefined)details.push(["幸福度",`${happiness>=0?"+":""}${happiness}`]);
  if(Number(item.injuryHealing??0)>0){
    details.push(["治疗伤势",`减轻${item.injuryHealing}级`],["每日伤药上限","所有伤药合计1份"],["医务室加成","当地完好医务室额外减轻1级"],["使用方式","物资页 → 处理伤口"]);
  }
  if(itemId==="medicine")details.push(["治疗疾病","立即治愈"],["单次消耗","药剂1份"],["使用方式","物资页 → 使用药剂"]);
  for(const [key,label,unit] of [["warmth","保暖",""],["cooling","防热",""],["acidRainFacilityProtection","酸雨设施防护",""],["storage","普通储物格","格"],["coldStorage","保鲜储物格","格"]]){
    if(Number(furnitureEffect[key]??0)>0)details.push([label,`+${furnitureEffect[key]}${unit}`]);
  }
  if(Number(furnitureEffect.waterDaily??0)>0)details.push(["每日用水",`${furnitureEffect.waterDaily}份`]);
  if(Number(furnitureEffect.fuelDaily??0)>0)details.push(["每日燃料",`${furnitureEffect.fuelDaily}点`]);
  if(Number(furnitureEffect.power??0)>0)details.push(["每日用电",`${furnitureEffect.power}点`]);
  const dietLabels={attack:"次日攻击",warmth:"次日保暖",heat:"次日防热",rain:"次日防雨（降低酸雨生病率）",storm:"次日防风（降低风暴生病率）"};
  for(const [key,label] of Object.entries(dietLabels))if(Number(item.nextDayEffect?.[key]??0)>0)details.push([label,`+${item.nextDayEffect[key]}`]);
  if(item.attack)details.push(["攻击",`+${item.attack}`]);
  if(item.weaponStyle)details.push(["武器类型",`${WEAPON_STYLE_LABELS[item.weaponStyle]??item.weaponStyle} · ${item.weaponLevel}级`]);
  if(item.slot)details.push(["装备位置",ITEM_SLOT_LABELS[item.slot]??item.slot]);
  if(item.backpackCapacity){details.push(["普通格",`${item.backpackCapacity.ordinary}格`]);details.push(["保鲜格",`${item.backpackCapacity.cold}格`]);}
  for(const [key,value] of Object.entries(item.env??{}))details.push([ITEM_ENV_LABELS[key]??key,`${value>=0?"+":""}${value}`]);
  if(!["material","foodIngredient","rareMaterial","unique"].includes(item.type)&&ITEM_USAGE_DESCRIPTIONS[itemId])details.push([DEVICES[itemId]?"生产用途":"用途",ITEM_USAGE_DESCRIPTIONS[itemId]]);
  appendItemUseDetails(itemId,item,details);
}

function appendItemUseDetails(itemId,item,details){
  if(FURNITURE[itemId]){
    const definition=FURNITURE[itemId],effect=definition.effect??{};
    details.push(["占用空间",`${definition.space}格`]);
    const conditions=["摆放在当地"];
    if(definition.switchable)conditions.push("开启");
    if(effect.power)conditions.push("正常供电");
    if(effect.waterDaily)conditions.push("供水充足");
    if(effect.fuelDaily)conditions.push("燃料充足");
    details.push(["生效条件",conditions.join("、")]);
    if(effect.warmth)details.push(["保暖生效范围","寒冷时"]);
    if(effect.cooling)details.push(["防热生效范围","炎热时"]);
    if(["fan","evaporative_cooler"].includes(itemId))details.push(["降温叠加","风扇与蒸发冷风器的降温分别计算并相加"]);
    if(itemId==="fridge")details.push(["保鲜效果","正常供电时暂停其中物品的腐坏计时"]);
    if(itemId==="charcoal_dehumidifier")details.push(["行动生病几率",`本地块降低${Math.round(Number(effect.actionSicknessReduction??0)*100)}%`],["设施防护范围","本地块"]);
  }
  if(DEVICES[itemId]){
    const device=DEVICES[itemId],kitchen=isKitchenStation(itemId);
    details.push(["基础每日生产",`每台${device.capacity}次`],["占用空间",`${device.space}格`],["使用方式","摆放在当地房屋内"]);
    if(["stone_pot","frying_pan"].includes(itemId))details.push(["配套火源","当地未损坏的篝火或柴火灶"]);
    if(device.productionFuelCost)details.push(["单次生产燃料",`${device.productionFuelCost}点`]);
    details.push([kitchen?"厨房加成":"工作室加成","当地每日生产次数翻倍"]);
    if(itemId==="tanning_rack")details.push(["鞣皮工坊加成",`当地每日生产次数+${BUILDINGS.tannery.effect.stationBonus.tanning_rack}，再计算工作室加成`]);
  }
  if(FUEL_POINT_VALUES[itemId])details.push(["补充燃料",`每份${FUEL_POINT_VALUES[itemId]}点`],["使用方式","投入当地总燃料槽"]);
  if(itemId==="fuel")details.push(["其他用途","制作油灯，归航广播每次另需燃油1份"]);
  if(itemId==="fertilizer")details.push(["施肥效果","当天同时浇水，夜间丰饶+1，上限5"],["产量加成","每点丰饶增加50%基础库存，总库存向下取整"],["施肥消耗","每次肥料1份、体力0.2"],["使用限制","未长满的资源点，每处每天1次，丰饶已满时不可用"]);
  if(itemId==="feed")details.push(["饲料用量",`每座有动物的栏舍每天${LIVESTOCK.chicken.feed.feed}份`],["手动喂养体力",`${FEED_ANIMALS_STAMINA_COST}点/次`],["自动喂养","自动喂食机取用当地普通储物格的饲料"]);
  appendToolUseDetails(itemId,item,details);
  const cropEntry=Object.entries(CROPS).find(([,crop])=>crop.seedId===itemId);
  if(cropEntry){
    const [cropId,crop]=cropEntry;
    details.push(["种植条件","当地有完好的空栽培地"],["种植消耗","种子1份、体力1"],["成熟时间",`浇水照料${crop.growthDays}天`],["基础库存",`${ITEMS[cropId].name}${crop.stock}份（丰饶为0）`],["采空再生",`再次浇水照料${crop.growthDays}天`]);
  }
  const animalEntry=Object.entries(LIVESTOCK).find(([,animal])=>animal.youngItem===itemId);
  if(animalEntry){
    const [type,animal]=animalEntry,penId=Object.keys(PEN_TYPES).find(id=>PEN_TYPES[id]===type);
    details.push(["安置位置",`当地有空位且未损坏的${BUILDINGS[penId].name}`],["成熟时间",`累计喂养${animal.matureDays}天`],["饲料用量",`每座有动物的栏舍每天${animal.feed.feed}份`]);
    for(const [outputId,output] of Object.entries(animal.continuous))details.push([`产出${ITEMS[outputId].name}`,`成熟后每${output.every}个生产日${output.quantity}份`]);
    details.push(["生产条件","当天已喂养才成长或生产"],["逃跑条件","连续10天未喂养"]);
  }
}

function appendToolUseDetails(itemId,item,details){
  if(item.toolType||itemId==="stone_spear"){
    if(item.dailyProductionCapacity){
      details.push(["基础每日缝纫",`每根${item.dailyProductionCapacity}次，多根叠加`],["使用条件","放在背包或当地物资中，配合当地完好制作台"],["工作室加成","当地每日缝纫次数翻倍"]);
    }
    const captures=item.toolType?Object.values(NODES).filter(node=>node.captureTool===item.toolType):[];
    if(captures.length){
      details.push(["携带要求","必须放在背包中"],["捕获消耗","仅成功捕获时消耗1个笼子"]);
    }
    if(itemId==="kayak")details.push(["携带要求","必须放在背包中"]);
  }
}

function appendItemStorageDetails(itemId,item,details){
  if(itemId==="hot_water")details.push(["保存规则","非保鲜状态下过1夜后变成水"]);
  else details.push(["保鲜期",item.shelfLifeNights?`${item.shelfLifeNights}个夜晚`:"不会腐坏"]);
}

export function renderItemReference(state,itemId){
  const item=ITEMS[itemId];
  if(!item)return `<h2>物品说明</h2><div class="empty">没有找到这件物品的资料</div>`;
  const details=[["当前地块持有",`${countItem(state,itemId,state.position)}份`]];
  appendItemStorageDetails(itemId,item,details);
  appendItemFunctionDetails(itemId,item,details);
  const rows=renderItemDetailRows(details);
  return `<div class="item-detail"><h2>${item.name}</h2><p>${escapeHtml(itemFlavor(itemId,item))}</p>${rows}</div>`;
}

export function renderBlueprintReference(state,blueprintId){
  const blueprint=BLUEPRINTS.find(entry=>entry.id===blueprintId);
  if(!blueprint)return `<h2>蓝图说明</h2><div class="empty">没有找到这张蓝图的资料</div>`;
  const categoryLabels={crafting:"制作蓝图",food:"食物蓝图",equipment:"装备蓝图",furniture:"家具蓝图",facility:"设施蓝图"};
  const owned=state.ownedBlueprintIds.includes(blueprintId);
  return `<div class="item-detail"><h2>${escapeHtml(blueprint.name)}蓝图</h2><p>${escapeHtml(blueprint.description??"")}</p><div class="metric-row"><span>蓝图类型</span><strong>${categoryLabels[blueprint.category]??"蓝图"}</strong></div><div class="metric-row"><span>蓝图等级</span><strong>${blueprint.tier}级</strong></div><div class="metric-row"><span>当前状态</span><strong>${owned?"已经学会":"尚未学会"}</strong></div></div>`;
}

export function renderItemDetails(state,source,index){
  const inv=getInventoryView(state),collections={cold:inv.cold,ordinary:inv.ordinary,wardrobe:inv.wardrobe,"seed-storage":inv.seedStorage,"utility-storage":inv.utilityStorage,"local-cold":inv.localCold,storage:inv.storage,ground:inv.ground},stack=collections[source]?.[index];
  if(!stack)return `<h2>物品说明</h2><div class="empty">这件物品已经被移动了</div>`;
  const item=ITEMS[stack.itemId],details=[];
  appendItemStorageDetails(stack.itemId,item,details);
  if(stack.itemId==="hot_water"){
    details.push(["保存状态",["cold","local-cold"].includes(source)?"保鲜中，热水不会变成水":"热水会在过夜后变成水"]);
  }else if(item.shelfLifeNights){
    const freshness=getStackFreshnessRange(stack),range=freshness.min===freshness.max?`${freshness.min}个夜晚`:`${freshness.min}到${freshness.max}个夜晚`;
    details.push(["新鲜度",range]);
    details.push(["保存状态",["cold","local-cold"].includes(source)?"正在保鲜，腐坏时间不会增加":`还能在非保鲜状态下过夜${freshness.min===freshness.max?freshness.min:`${freshness.min}到${freshness.max}`}次`]);
  }
  appendItemFunctionDetails(stack.itemId,item,details);
  const rows=renderItemDetailRows(details);
  return `<div class="item-detail"><h2>${item.name} ×${stack.quantity}</h2><p>${escapeHtml(itemFlavor(stack.itemId,item))}</p>${rows}</div>`;
}

export function renderItemTransferActions(state,source,index){
  const labels={cold:"放到背包保鲜格",ordinary:"放到背包",wardrobe:"放到衣帽间","seed-storage":"放到种子储存室","utility-storage":"放到杂物间","local-cold":"放到本地保鲜库",storage:"放到储物箱",ground:"放到地面"};
  return getInventoryTransferTargets(state,source,index).map(target=>`<button type="button" class="action-button" data-action="transfer-item" data-source="${source}" data-index="${index}" data-target="${target}">${labels[target]}</button>`).join("");
}

export function renderEquipmentPicker(state,slot){
  const labels={head:"头部",body:"上身",legs:"下身",feet:"足部",hands:"手部",weapon:"武器",backpack:"背包"},label=labels[slot];
  if(!label)return `<h2>选择装备</h2><div class="empty">未知装备位置</div>`;
  const current=ITEMS[state.player.equipment[slot]]?.name??"未装备";
  const candidates=Object.entries(ITEMS).filter(([id,item])=>item.slot===slot&&countItem(state,id)>0).map(([id,item])=>{
    const stats=item.backpackCapacity?`普通格${item.backpackCapacity.ordinary} · 保鲜格${item.backpackCapacity.cold}`:(item.attack?`${WEAPON_STYLE_LABELS[item.weaponStyle]??"武器"}${item.weaponLevel?`${item.weaponLevel}级 · `:""}攻击增加${item.attack}`:"");
    const environment=Object.entries(item.env??{}).map(([key,value])=>`${({warmth:"保暖",heat:"防热",rain:"防雨（降低酸雨生病率）",storm:"防风（降低风暴生病率）",rainStaminaReduction:"酸雨体力减免"})[key]??key} ${value}`).join(" · ");
    const detail=[stats,environment,`可用${countItem(state,id)}件`].filter(Boolean).join(" · ");
    return `<button type="button" class="equipment-choice-button" data-action="equip" data-item="${id}"><span class="row-main"><strong class="row-title">${item.name}</strong><small class="row-detail">${detail}</small></span></button>`;
  }).join("");
  const unequipped=slot==="backpack"?state.player.equipment.backpack==="system_small_backpack":state.player.equipment[slot]==null;
  const none=slot==="backpack"
    ? `<button type="button" class="equipment-choice-button equipment-choice-none${unequipped?" selected":""}" data-action="unequip" data-slot="backpack"><span class="row-main"><strong class="row-title">系统小背包</strong><small class="row-detail">普通格10 · 保鲜格3${unequipped?" · 当前装备":""}</small></span></button>`
    : `<button type="button" class="equipment-choice-button equipment-choice-none${unequipped?" selected":""}" data-action="unequip" data-slot="${slot}"><span class="row-main"><strong class="row-title">不装备</strong><small class="row-detail">${unequipped?"当前已空置":`取下${current}`}</small></span></button>`;
  return `<h2>选择${label}装备</h2><p class="row-detail">当前：${current}。列表只包含背包和${state.position}当前地块的装备。</p><div class="equipment-choice-list">${none}${candidates}</div>`;
}

function tradeEntryDisplayName(entry){
  return `${entry.name}${entry.type==="blueprint"&&!entry.name.endsWith("蓝图")?"蓝图":""}`;
}

export function renderTrade(state) {
  const offers=(state.tradeOffers??[]).filter(offer=>offer.completed||offer.withdrawn||(!isForbiddenTradeOffer(offer)&&!isOutdatedNpcTradeGive(state,offer.give))).map(offer=>{
    const npc=CHARACTERS.find(n=>n.id===offer.npcId),disabled=offer.completed||offer.withdrawn,status=offer.completed?"已成交":offer.withdrawn?"已撤单":"";
    return `<div class="trade-offer-row"><button type="button" class="trade-offer${disabled?" disabled":""}" data-action="trade" data-offer="${offer.id}" ${disabled?"disabled":""}>${npcAvatar(npc)}<span class="trade-offer-copy"><small class="trade-npc-name">${npc.name}</small><strong class="trade-exchange-text">${escapeHtml(tradeEntryDisplayName(offer.give))}×${offer.give.quantity} <span aria-hidden="true">⇄</span> ${escapeHtml(offer.want.name)}×${offer.want.quantity}</strong></span>${status?`<span class="trade-offer-status">${status}</span>`:""}</button></div>`;
  }).join("")||`<div class="empty">今日没有可用报价</div>`;
  const receivedMails=getReceivedMails(state);
  const mailGroups=CHARACTERS.map(npc=>({npc,mails:receivedMails.filter(mail=>mail.npcId===npc.id).reverse()})).filter(group=>group.mails.length);
  const mails=mailGroups.map(({npc,mails:personMails})=>{
    const rows=personMails.map((mail,index)=>{const {text,attachmentSpec}=getMailContent(mail);return `<details class="mail-row"><summary><span>第${mail.number??personMails.length-index}封来信</span></summary><p>${escapeHtml(text)}</p>${attachmentSpec?`<p class="row-detail">附送：${escapeHtml(attachmentSpec)}</p>`:""}</details>`;}).join("");
    return `<details class="mail-contact" data-npc="${npc.id}"><summary>${npcAvatar(npc)}<span class="mail-contact-name"><strong>${npc.name}</strong><small>${personMails.length}封来信</small></span></summary><div class="mail-contact-body">${rows}</div></details>`;
  }).join("")||`<div class="empty">尚未收到邮件</div>`;
  return `<section class="card wide"><div class="card-body"><div class="trade-list">${offers}</div></div></section>`+card("信箱",mails,"wide");
}

export function renderTradeConfirmation(state,offerId){
  const offer=(state.tradeOffers??[]).find(entry=>entry.id===offerId);
  if(!offer||offer.completed||offer.withdrawn||isForbiddenTradeOffer(offer)||isOutdatedNpcTradeGive(state,offer.give))return `<h2>这条报价已经失效</h2><div class="row-actions trade-confirm-actions"><button class="secondary-button" data-action="cancel-trade">返回</button></div>`;
  const localWantTotal=countItem(state,offer.want.id,state.position);
  const reservedFood=state.selectedFood?.itemId===offer.want.id,reservedDrink=state.selectedDrink?.itemId===offer.want.id;
  const availableTotal=localWantTotal+(reservedFood?1:0)+(reservedDrink?1:0),insufficient=availableTotal<offer.want.quantity;
  const reservedWarning=reservedFood||reservedDrink?`<p class="trade-reservation-warning">如果普通库存不足，这次交换会取走今日预留的${reservedFood?"食物":"饮料"}，并把对应饮食改回未设定。</p>`:"";
  const insufficientWarning=insufficient?`<p class="trade-reservation-warning">当前地块与背包中的交换物不足，其他地块的物资不能远程用于交易。</p>`:"";
  const referenceLink=(entry,type,extra="")=>{const displayName=tradeEntryDisplayName({...entry,type});return `<button type="button" class="trade-item-link" data-action="open-trade-reference" data-reference-type="${type}" data-item="${entry.id}" data-offer="${offer.id}" aria-label="查看${escapeHtml(displayName)}的说明">${escapeHtml(displayName)}×${entry.quantity}</button>${extra}`;};
  const wantLink=referenceLink(offer.want,"item",`（当前共有${localWantTotal}份）`);
  const giveLink=referenceLink(offer.give,offer.give.type);
  return `<h2>确认交换</h2><div class="trade-confirmation"><div><span>你将交出</span><strong>${wantLink}</strong></div><div class="trade-confirm-arrow" aria-hidden="true">⇄</div><div><span>你将获得</span><strong>${giveLink}</strong></div></div>${reservedWarning}${insufficientWarning}<div class="row-actions trade-confirm-actions"><button class="secondary-button" data-action="cancel-trade">取消</button><button class="action-button primary" data-action="confirm-trade" data-offer="${offer.id}" ${insufficient?"disabled":""}>确定交换</button></div>`;
}

export function renderReinforcementConfirmation(state){
  const areaId=state.position,houseLevel=state.housesByArea[areaId]?.level??0;
  if(!houseLevel)return `<h2>这里还没有房子</h2><p>先建好房子，才能进行临时加固。</p><div class="row-actions"><button class="secondary-button" data-action="cancel-reinforce">返回</button></div>`;
  const preview=getOutdoorActionPreview(state,2),wood=countItem(state,"wood",areaId),plank=countItem(state,"plank",areaId);
  const lastDay=state.day+REINFORCEMENT_DURATION_DAYS-1,currentUntil=state.reinforcementByArea[areaId]?.untilDay??0;
  const alreadyFull=currentUntil>=lastDay,missingMaterials=wood<5||plank<3,missingStamina=state.player.stamina<preview.totalStamina;
  const unavailable=alreadyFull||missingMaterials||missingStamina;
  const materialHtml=formatConstructionInputs(state,{wood:5,plank:3});
  const currentText=currentUntil>=state.day
    ? `<p class="row-detail">当前加固仍会持续到第${currentUntil}天结束；再次加固不会叠加两项设施防护，只会把期限重新计算为连续${REINFORCEMENT_DURATION_DAYS}天。</p>`
    : "";
  const riskText=(preview.band.id==="danger"||preview.band.id==="lethal")
    ? `<div class="end-day-warning"><strong>当前体感${preview.felt}℃（${preview.band.name}），施工存在危险。</strong><p>${formatOutdoorRiskDescription(preview)}</p></div>`
    : "";
  const statusText=alreadyFull
    ? `<p class="row-detail">当前加固的剩余时间已经不少于重新加固后的时间，无需重复消耗材料。</p>`
    : "";
  return `<h2>临时加固${escapeHtml(areaId)}的房子？</h2><p>加固后，<strong>只有当前地块</strong>的酸雨设施防护和强风设施防护各增加20，从今天起连续${REINFORCEMENT_DURATION_DAYS}天（第${state.day}天至第${lastDay}天）。它会同时降低酸雨和强风暴损坏当地室外设施的概率，但不提供保温，也不保护其他地块。</p><div class="end-day-warning"><strong>本次消耗</strong><p>${materialHtml} · 体力 ${formatStamina(state.player.stamina)}/${formatStamina(preview.totalStamina)}${preview.totalStamina!==2?`（基础2，受当前天气与体感影响）`:""}</p></div>${currentText}${statusText}${riskText}<div class="row-actions"><button class="secondary-button" data-action="cancel-reinforce">取消</button><button class="action-button primary" data-action="confirm-reinforce" ${unavailable?"disabled":""}>确定加固</button></div>`;
}

export function renderEndDayConfirmation(state){
  const {warnings}=getEndDayWarnings(state);
  const warningHtml=warnings.length?`<div class="end-day-warning"><strong>结束今天后：</strong>${warnings.map(text=>`<p>${text}</p>`).join("")}</div>`:"";
  return `<h2>结束今天？</h2><p class="end-day-confirm-copy">确定要结束第${state.day}天，进入第${state.day+1}天吗？</p>${warningHtml}<div class="row-actions end-day-confirm-actions"><button class="secondary-button" data-action="cancel-end-day">取消</button><button class="action-button primary" data-action="confirm-end-day">确定进入下一天</button></div>`;
}

export function renderUprootConfirmation(state,plotId){
  const plot=(state.plotsByArea[state.position]??[]).find(entry=>entry.id===plotId),crop=CROPS[plot?.cropId];
  if(!plot||!crop)return `<h2>这个资源点已经不存在了</h2>`;
  const retainedText=getPlotEnvironmentEffects(state,plot).greenhouse?"拔除后栽培地和温室升级都会永久保留，改种无需再次升级":"拔除后栽培地会保留下来";
  return `<h2>拔除家养${crop.name}？</h2><p>${retainedText}，但已经消耗的${ITEMS[crop.seedId].name}不会返还。</p><div class="row-actions"><button class="secondary-button" data-action="cancel-uproot">取消</button><button class="action-button danger-button" data-action="confirm-uproot" data-plot="${plot.id}">确定拔除</button></div>`;
}

export function renderSeedPicker(state,bedId){
  const slot=getFarmPlotSlots(state).find(entry=>entry.bedId===bedId);
  if(!slot)return `<h2>这块栽培地当前不可用</h2>`;
  if(slot.progress.damaged)return `<h2>这块栽培地已损坏</h2><p>${slot.progress.greenhouse?"温室升级仍然保留，":""}修复后才能播种。</p>`;
  if(slot.plot)return `<h2>这块栽培地已经种了东西</h2>`;
  const options=Object.values(CROPS).map(crop=>({crop,quantity:countItem(state,crop.seedId)})).filter(entry=>entry.quantity>0);
  const buttons=options.map(({crop,quantity})=>`<button class="action-button" data-action="plant" data-crop="${crop.id}" data-bed="${bedId}">${ITEMS[crop.seedId].name} ×${quantity}</button>`).join("");
  return `<h2>选择种子</h2><p class="row-detail">${slot.progress.greenhouse?"这块栽培地已永久升级为温室，改种后仍受温室保护。":""}种植会消耗1份种子和1点体力。</p><div class="row-actions">${buttons||`<span class="row-detail">当前地块和背包里没有可播种的种子</span>`}</div>`;
}

export function renderGreenhouseUpgradeConfirmation(state,plotId){
  const plot=(state.plotsByArea[state.position]??[]).find(entry=>entry.id===plotId),crop=CROPS[plot?.cropId],definition=BUILDINGS.greenhouse;
  if(!plot||!crop)return `<h2>这个资源点已经不存在了</h2>`;
  if(getPlotEnvironmentEffects(state,plot).greenhouse)return `<h2>这块栽培地已经是温室</h2>`;
  const missingMaterials=Object.entries(definition.inputs).some(([itemId,quantity])=>countItem(state,itemId,state.position)<quantity),missingStamina=state.player.stamina<definition.stamina;
  return `<h2>将家养${crop.name}升级为温室？</h2><p>升级会永久保留在这块栽培地上；以后即使拔除并改种其他作物，仍不受酸雨和酷暑影响。</p><div class="end-day-warning"><strong>升级需要</strong><p>${formatConstructionInputs(state,definition.inputs)} · <span class="construction-material${missingStamina?" insufficient":""}">体力 ${formatStamina(state.player.stamina)}/${formatStamina(definition.stamina)}</span></p></div><div class="row-actions"><button class="secondary-button" data-action="cancel-greenhouse-upgrade">取消</button><button class="action-button primary" data-action="confirm-greenhouse-upgrade" data-plot="${plot.id}" ${missingMaterials||missingStamina?"disabled":""}>确定升级</button></div>`;
}

export function renderReceivedMails(mails){
  return (mails??[]).map((mail)=>{
    const npc=CHARACTERS.find(entry=>entry.id===mail.npcId);
    if(!npc)return "";
    const {text,attachmentSpec}=getMailContent(mail);
    return `<article class="received-mail"><div class="received-mail-sender">${npcAvatar(npc)}<div><p class="eyebrow">收到新来信</p><h2>${npc.name}</h2></div></div><p class="received-mail-text">${escapeHtml(text)}</p>${attachmentSpec?`<div class="received-mail-attachment"><strong>附送的东西</strong><p>${escapeHtml(attachmentSpec)}</p></div>`:""}</article>`;
  }).join("");
}

export function renderEnding(state,{fireworks=true}={}) {
  const ending=getReturnEnding(state);
  const messages={
    solo:"恭喜您成功从求生游戏中返回了现实并得到了一个亿的奖金",
    friends:"恭喜您成功带着所有的朋友从游戏中返回现实，并得到了两个亿的奖金。您带回的朋友有：",
    everyone:"恭喜您成功带领所有人离开了求生游戏回到了现实，并得到了十个亿的奖金"
  };
  const rewards={solo:1,friends:2,everyone:10};
  const friends=ending.kind==="friends"?ending.friendIds.map(id=>{
    const npc=CHARACTERS.find(character=>character.id===id);
    if(!npc)return "";
    return `<li class="ending-friend">${npcAvatar(npc)}<strong>${escapeHtml(npc.name)}</strong></li>`;
  }).join(""):"";
  const celebration=ending.kind==="everyone"&&fireworks?`<div class="ending-fireworks" aria-hidden="true">${Array.from({length:6},()=>`<span class="ending-firework"></span>`).join("")}</div>`:"";
  return `<article class="return-ending return-ending-${ending.kind}" data-ending="${ending.kind}">${celebration}<div class="ending-heading"><span class="ending-emblem" aria-hidden="true">✦</span><h2>归航成功</h2></div><p class="ending-reward"><span>奖金</span><strong>${rewards[ending.kind]}</strong><span>亿元</span></p><p class="ending-message">${messages[ending.kind]}</p>${friends?`<ul class="ending-friends" aria-label="一同返回现实的朋友">${friends}</ul>`:""}</article>`;
}

export function renderView(tab, state,options={}) {
  if (state.completed) return `<section class="card wide ending-card"><div class="card-body">${renderEnding(state,{fireworks:false})}<div class="ending-postgame"><p class="row-detail">通关记录已保存。可以继续保留这个岛屿进行自由经营。</p><button class="action-button primary" data-action="continue-postgame">继续自由经营</button></div></div></section>`;
  if (state.player.gameOver) return `<section class="card wide"><div class="card-body"><h2>本次求生结束</h2><p class="row-detail danger-text">结束原因：${escapeHtml(state.player.gameOverReason||"旧存档未记录具体原因")}</p><p class="muted">可以读取本日早晨的自动存档重新安排，也可以清除进度从头开始。</p><div class="row-actions"><button class="action-button primary" data-action="restart-day">重新开始本日</button><button class="action-button" data-action="new-game">从头开始</button></div></div></section>`;
  return ({ explore: renderExplore, production: renderProduction, facilities: renderFacilities, equipment: renderEquipment, trade: renderTrade }[tab] ?? renderExplore)(state,options);
}

export function renderMap(state) {
  const cells = [];
  for (let row = 0; row < 7; row += 1) for (let column = 0; column < 7; column += 1) {
    const id = `${String.fromCharCode(65 + row)}${column + 1}`;
    const opened = state.areas[id]?.opened;
    const current = id === state.position;
    const movement=getMoveAvailability(state,id);
    const movable=movement.ok;
    const houseLevel = state.housesByArea[id]?.level;
    const houseName = houseLevel ? HOUSE_LEVELS[houseLevel]?.name ?? `${houseLevel}级房屋` : "";
    const title = opened ? `${id} ${escapeHtml(getMapCellName(id))}${houseName ? ` · ${escapeHtml(houseName)}` : ""}${movable?"":` · ${escapeHtml(movement.message)}`}` : `${id} · 尚未开启`;
    cells.push(`<button class="map-cell ${opened ? "open" : ""} ${current ? "current" : ""}" ${movable ? `data-action="move" data-area="${id}"` : "disabled"} title="${title}"><span class="map-cell-id">${id}</span>${houseLevel ? houseIcon(houseLevel, "map-house-icon") : ""}</button>`);
  }
  return `<div class="map-modal-view"><div class="map-modal-heading"><div><h2>岛屿地图</h2><p class="row-detail">点击相邻的已开启地块移动，每格基础消耗1体力。</p></div><span class="tag">当前位置 ${state.position}</span></div><div class="map-wrap"><img src="${MAP_IMAGE_URL}" alt="岛屿地图"><div class="map-grid">${cells.join("")}</div></div></div>`;
}

export function renderMoveConfirmation(state,areaId){
  const availability=getMoveAvailability(state,areaId);
  if(!availability.ok)return `<h2>现在不能前往这里</h2><p>${escapeHtml(availability.message)}</p><div class="row-actions"><button class="secondary-button" data-action="cancel-move">返回地图</button></div>`;
  const preview=getOutdoorActionPreview(state,1);
  const destination=`${areaId} ${getMapCellName(areaId)}`;
  const risk=(preview.band.id==="danger"||preview.band.id==="lethal")
    ? `<div class="end-day-warning"><strong>当前体感${preview.felt}℃，移动存在危险。</strong><p>${formatOutdoorRiskDescription(preview)}</p></div>`:"";
  return `<h2>前往${escapeHtml(destination)}？</h2><p>确定要从${escapeHtml(state.position)}移动到${escapeHtml(destination)}吗？本次将消耗${formatStamina(preview.totalStamina)}体力。</p>${risk}<div class="row-actions move-confirm-actions"><button class="secondary-button" data-action="cancel-move">取消</button><button class="action-button primary" data-action="confirm-move" data-area="${areaId}">确定移动</button></div>`;
}

export function renderLottery(rewards) {
  const result = rewards.map((reward) => reward.type === "blueprint" ? `${reward.name}蓝图` : `${reward.name} ×${reward.quantity}`).join("　");
  return `<h2>每日任务奖励</h2><p class="lottery-result-line">${escapeHtml(result)}</p>`;
}

export function renderMonkeyLosses(losses) {
  const items = losses.map((entry) => `${entry.name}×${entry.quantity}`).join("、");
  if(losses.every(entry=>entry.cause==="sea"))return `<h2>海水冲过来了</h2><p>海水冲走了${escapeHtml(items)}。</p>`;
  return `<h2>猴子来过了</h2><p>猴子拿走了${escapeHtml(items)}。</p>`;
}

export function renderMonkeyGift(){
  return `<h2>猴子的礼物</h2><p>猴子给你送来了礼物，一枚草药种子。</p>`;
}

function overnightEventLocation(entry){
  return escapeHtml(`${entry.day!=null?`第${entry.day}天夜间 · `:""}地块 ${entry.areaId}`);
}

export function renderCropDeaths(cropDeaths){
  const rows=(cropDeaths??[]).map(entry=>`<div class="management-row"><p class="row-detail">${overnightEventLocation(entry)}</p><strong class="danger-text">家养${escapeHtml(entry.name??CROPS[entry.cropId]?.name??"作物")}死亡</strong><p class="row-detail">死因：${escapeHtml(entry.reason??"原因未记录")}</p></div>`).join("");
  return rows?`<h2>作物死亡</h2>${rows}`:"";
}

export function renderAnimalRunaways(runaways){
  const rows=(runaways??[]).map(entry=>`<div class="management-row"><p class="row-detail">${overnightEventLocation(entry)}</p><strong class="danger-text">${escapeHtml(entry.message)}</strong>${entry.reason?`<p class="row-detail">原因：${escapeHtml(entry.reason)}</p>`:""}</div>`).join("");
  return rows?`<h2>家畜跑掉了</h2>${rows}`:"";
}
