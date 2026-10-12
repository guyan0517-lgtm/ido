import { LEGACY_ROLLBACK_KEYS, LEGACY_SAVE_KEYS, ROLLBACK_KEY, SAVE_KEY } from "./data.js";
import {
  buildStep,
  buildReturnStage,
  abortReturnLaunch,
  broadcastReturnSignal,
  acceptTrade,
  refreshOutdatedTradeOffers,
  addAnimalToPen,
  claimDailyTaskReward,
  claimMail,
  clearConsumableSelection,
  craftRecipe,
  createNewGame,
  continueAfterEnding,
  deserializeState,
  endDay,
  equipItem,
  explore,
  feedAnimals,
  fertilizePlot,
  fightEnemy,
  formatStamina,
  gatherNode,
  harvestPlot,
  loadFarmSupply,
  loadFuel,
  moveTo,
  pickupPlacedObject,
  placeObject,
  plantCrop,
  repairFacility,
  reinforceArea,
  reorderInventoryStack,
  restartDay,
  resolveLaunchDay,
  selectReturnTowerArea,
  selectConsumableFrom,
  serializeState,
  startReturnLaunch,
  transferStack,
  togglePlacedObject,
  toggleFacility,
  toggleGridPowerConnection,
  togglePlotAutoFertilize,
  unequipItem,
  upgradePlotToGreenhouse,
  uprootCrop,
  useMedical,
  waterPlot,
  plantHerbField,
  waterHerbField,
  fertilizeHerbField,
  harvestHerbField,
  consolidateBackpack
} from "./engine.js";
import { captureInventoryScrollPositions, formatOutdoorRiskDescription, renderAnimalRunaways, renderBlueprintReference, renderCombat, renderCropDeaths, renderDietPicker, renderEncounterResult, renderEnding, renderEndDayConfirmation, renderEquipmentPicker, renderGreenhouseUpgradeConfirmation, renderHappinessDetails, renderItemDetails, renderItemReference, renderItemTransferActions, renderLottery, renderMap, renderMonkeyGift, renderMonkeyLosses, renderMoveConfirmation, renderReceivedMails, renderReinforcementConfirmation, renderSeedPicker, renderStaminaGuide, renderStatus, renderSurvivalMetricDetails, renderTemperatureGuide, renderTradeConfirmation, renderUprootConfirmation, renderView, renderWeatherDetails, renderWoundTreatmentPicker, restoreInventoryScrollPositions } from "./ui.js";

import { renderGameInfo, renderSettings, setActiveProductionCategory } from "./ui.js";
import { getLanguage, hasLanguagePreference, localizePage, setLanguage, t } from "./i18n.js";
import { createPageModal } from "./page-modal.js";

const view = document.querySelector("#view");
const statusStrip = document.querySelector("#status-strip");
const modal = createPageModal(document.querySelector("#modal"), { background: document.querySelector(".app-shell") });
const modalContent = document.querySelector("#modal-content");
const modalActions = modal.querySelector(".modal-actions");
const toast = document.querySelector("#toast");
const nav = document.querySelector(".bottom-nav");
const nextDayButton = document.querySelector("#next-day-button");
let tab = "explore";
let deferredInstallPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
});
let toastTimer;
let pointerInventoryDrag=null;
let nativeInventoryDrag=null;
let suppressItemClickUntil=0;
let dailyLotteryAnimating=false;
let returnFeedback=null;
let endDayProcessing=false;
let endingPresented=false;
let pendingConfirmation=null;
const collapsedProductionStations=new Set();
const expandedUnavailableProductionStations=new Set();
const collapsedFacilitySections=new Set(["landscape"]);
const visibleResourceNodeCountsByArea=new Map();
const RESOURCE_NODE_PAGE_SIZE=10;

function loadGame() {
  try {
    const saved = [SAVE_KEY, ...LEGACY_SAVE_KEYS].map((key) => localStorage.getItem(key)).find(Boolean);
    const loaded = saved ? deserializeState(saved) : createNewGame();
    const serialized=serializeState(loaded);
    localStorage.setItem(SAVE_KEY,serialized);
    const storedDayStart=[ROLLBACK_KEY,...LEGACY_ROLLBACK_KEYS].map((key)=>localStorage.getItem(key)).find(Boolean);
    let hasUsableDayStart=false;
    if(storedDayStart){
      try{
        const dayStart=deserializeState(storedDayStart);
        const sameRun=dayStart.seed===loaded.seed;
        const validDay=dayStart.day===loaded.day||(loaded.player.gameOver&&dayStart.day<loaded.day);
        if(sameRun&&validDay&&!dayStart.player.gameOver){
          localStorage.setItem(ROLLBACK_KEY,serializeState(dayStart));
          hasUsableDayStart=true;
        }
      }catch(error){console.error(error);}
    }
    if(!hasUsableDayStart&&!loaded.player.gameOver)localStorage.setItem(ROLLBACK_KEY,serialized);
    return loaded;
  } catch (error) {
    console.error(error);
    const fresh = createNewGame();
    const serialized=serializeState(fresh);
    localStorage.setItem(SAVE_KEY,serialized);
    localStorage.setItem(ROLLBACK_KEY,serialized);
    return fresh;
  }
}

let state = loadGame();
if (!hasLanguagePreference()) showLanguageChoice(true);

function saveCurrentProgress(serialized=serializeState(state)){
  localStorage.setItem(SAVE_KEY, serialized);
}

function saveDayStart(serialized=serializeState(state)) {
  localStorage.setItem(ROLLBACK_KEY, serialized);
}

function showToast(message) {
  toast.textContent = message;
  localizePage(toast);
  if (typeof toast.showPopover === "function" && !toast.matches(":popover-open")) toast.showPopover();
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
    if (typeof toast.hidePopover === "function" && toast.matches(":popover-open")) toast.hidePopover();
  }, 2200);
}

function showModal(html, kind = "default", actionHtml = "", closeButtonHtml = `<button type="button" class="secondary-button" data-action="close-modal">关闭</button>`) {
  pendingConfirmation=null;
  modalContent.innerHTML = html;
  modalActions.innerHTML = `${actionHtml}${closeButtonHtml}`;
  modal.dataset.kind = kind;
  localizePage(modal.element??modal);
  document.documentElement.classList.add("modal-open");
  document.body.classList.add("modal-open");
  const focusTarget=modalContent.querySelector("h2")??modalContent;
  if(focusTarget!==modalContent)focusTarget.id="modal-title";
  modal.element?.setAttribute("aria-labelledby",focusTarget===modalContent?"modal-content":"modal-title");
  focusTarget.setAttribute("tabindex","-1");
  if (!modal.open) modal.showModal();
  focusTarget.focus({preventScroll:true});
}

function showConfirmation(message,onConfirm,{danger=false}={}){
  const previous=modal.open?{html:modalContent.innerHTML,kind:modal.dataset.kind,actions:modalActions.innerHTML,scrollTop:modalContent.scrollTop}:null;
  const requestedState=state;
  const paragraphs=String(message).split(/\n+/).map(line=>`<p class="end-day-confirm-copy${danger?" danger-text":""}">${line.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}</p>`).join("");
  showModal(`<h2${danger?' class="danger-text"':""}>请确认</h2>${paragraphs}`,"confirmation",`<button type="button" class="secondary-button" data-action="cancel-confirmation">取消</button><button type="button" class="action-button primary" data-action="confirm-action">确认</button>`,"");
  pendingConfirmation={onConfirm,previous,state:requestedState};
}

function resolveConfirmation(confirmed){
  const pending=pendingConfirmation;
  if(!pending)return;
  pendingConfirmation=null;
  if(pending.previous&&state===pending.state){
    showModal(pending.previous.html,pending.previous.kind,pending.previous.actions,"");
    modalContent.scrollTop=pending.previous.scrollTop;
  }else if(modal.open)modal.close();
  if(confirmed&&state===pending.state)pending.onConfirm();
}

const THEME_STORAGE_KEY = "dropped_survival_theme";

function getSavedTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) || "default";
  } catch (e) {
    return "default";
  }
}

function applyTheme(themeId) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
  } catch (e) {}
  document.documentElement.dataset.theme = themeId;
  const themeMetaColors = {
    "default": "#0b0f12",
    "strawberry": "#fff5f8",
    "mint": "#1c2321",
    "monochrome": "#000000",
    "pastel-blue": "#f8f9fa"
  };
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor && themeMetaColors[themeId]) {
    metaThemeColor.setAttribute("content", themeMetaColors[themeId]);
  }
}

function showSettings() {
  const currentTheme = getSavedTheme();
  showModal(renderSettings(currentTheme), "settings");
}

function showGameInfo() {
  showModal(renderGameInfo(getLanguage()), "game-info", `<button type="button" class="action-button" data-action="open-language">切换语言</button>`);
}

function showLanguageChoice(required = false) {
  const selected = hasLanguagePreference() ? getLanguage() : null;
  const choices = [["zh", "zh-CN", "中文"], ["en", "en", "English"]]
    .map(([language, lang, label]) => `<button type="button" class="language-choice${selected === language ? " selected" : ""}" data-action="choose-language" data-language="${language}" lang="${lang}" translate="no" aria-current="${selected === language}">${label}</button>`)
    .join("");
  const backButton = required ? "" : `<button type="button" class="secondary-button" data-action="return-game-info">返回</button>`;
  const heading = required ? "选择语言 / Choose Language" : "选择语言";
  showModal(`<section class="language-picker"><h2>${heading}</h2><div class="language-choices">${choices}</div></section>`, required ? "language-required" : "language", "", backButton);
}

function chooseLanguage(language) {
  if (!["zh", "en"].includes(language)) return;
  const initialChoice = modal.dataset.kind === "language-required";
  setLanguage(language);
  if (modal.open) modal.close();
  render();
  if (!initialChoice) showGameInfo();
}

function setProductionStationCollapsed(card,collapsed){
  const toggle=card.querySelector(".production-station-toggle");
  const recipeList=card.querySelector(".production-recipe-list");
  if(!toggle||!recipeList)return;
  card.classList.toggle("collapsed",collapsed);
  toggle.setAttribute("aria-expanded",String(!collapsed));
  recipeList.hidden=collapsed;
  const label=toggle.querySelector(".production-station-toggle-label");
  if(label)label.textContent=t(collapsed?"展开":"收起");
}

function restoreProductionStationCollapseState(){
  view.querySelectorAll("[data-production-station]").forEach(card=>{
    const station=card.dataset.productionStation;
    const defaultCollapsed=card.dataset.defaultCollapsed==="true"&&!expandedUnavailableProductionStations.has(station);
    setProductionStationCollapsed(card,collapsedProductionStations.has(station)||defaultCollapsed);
  });
}

function setFacilitySectionCollapsed(section,collapsed){
  const toggle=section.querySelector(".facility-section-toggle");
  const body=section.querySelector(".facility-section-body");
  if(!toggle||!body)return;
  section.classList.toggle("collapsed",collapsed);
  toggle.setAttribute("aria-expanded",String(!collapsed));
  body.hidden=collapsed;
  const label=toggle.querySelector(".facility-section-toggle-label");
  if(label)label.textContent=t(collapsed?"展开":"收起");
}

function restoreFacilitySectionCollapseState(){
  view.querySelectorAll("[data-facility-section]").forEach(section=>{
    setFacilitySectionCollapsed(section,collapsedFacilitySections.has(section.dataset.facilitySection));
  });
}

function scrollPageToTop(){
  const scrollRoot=document.scrollingElement??document.documentElement;
  scrollRoot.scrollTop=0;
  window.scrollTo(0,0);
  window.requestAnimationFrame(()=>{
    scrollRoot.scrollTop=0;
    window.scrollTo(0,0);
  });
}

function render(serializedProgress=null) {
  if(refreshOutdatedTradeOffers(state))serializedProgress=null;
  saveCurrentProgress(serializedProgress??serializeState(state));
  if (tab === "explore") {
    statusStrip.style.display = "";
    statusStrip.innerHTML = renderStatus(state);
  } else {
    statusStrip.style.display = "none";
    statusStrip.innerHTML = "";
  }
  const inventoryScrollPositions = captureInventoryScrollPositions(view);
  const visibleNaturalNodeCount=visibleResourceNodeCountsByArea.get(state.position)??RESOURCE_NODE_PAGE_SIZE;
  view.innerHTML = renderView(tab, state,{visibleNaturalNodeCount});
  restoreProductionStationCollapseState();
  restoreFacilitySectionCollapseState();
  restoreInventoryScrollPositions(view,inventoryScrollPositions);
  nav.querySelectorAll("[data-tab]").forEach((button) => button.classList.toggle("active", button.dataset.tab === tab));
  nextDayButton.disabled=state.completed||state.player.gameOver;
  localizePage();
  if(!state.completed)endingPresented=false;
  else if(!endingPresented&&!(modal.open&&modal.dataset?.kind==="language-required")){
    endingPresented=true;
    showModal(renderEnding(state),"ending",`<button type="button" class="action-button primary" data-action="continue-postgame">继续自由经营</button>`,`<button type="button" class="secondary-button" data-action="new-game">重开一局</button>`);
  }
}

function waitForNextPaint(){
  return new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
}

async function finishDay(target){
  if(endDayProcessing||state.player.gameOver)return;
  const finishingState=state;
  endDayProcessing=true;
  target.disabled=true;
  target.textContent=t("正在结算…");
  try{
    await waitForNextPaint();
    if(state!==finishingState)return;
    const result=endDay(state,true);
    if(result.ok){
      if(modal.open)modal.close();
      const serialized=serializeState(state);
      if(!state.player.gameOver)saveDayStart(serialized);
      showToast(`已进入第${state.day}天`);
      tab="explore";
      render(serialized);
      const dayResults=[result.rewards?renderLottery(result.rewards):"",result.monkeyLosses?.length?renderMonkeyLosses(result.monkeyLosses):"",result.monkeyGift?renderMonkeyGift():"",result.cropDeaths?.length?renderCropDeaths(result.cropDeaths):"",result.animalRunaways?.length?renderAnimalRunaways(result.animalRunaways):""].filter(Boolean);
      if(dayResults.length)showModal(dayResults.join("<hr>"),"day-results");
    }else{
      showToast(result.message??"今天还不能结束");
      render();
      target.disabled=false;
      target.textContent=t("确定进入下一天");
    }
  }catch(error){
    console.error(error);
    showToast("过夜结算失败，请重试");
    target.disabled=false;
    target.textContent=t("确定进入下一天");
  }finally{
    endDayProcessing=false;
  }
}

function confirmRisk(result, retry) {
  if (!result.needsConfirmation) return false;
  const { preview } = result;
  const danger = preview
    ? `当前体感${preview.felt}℃（${preview.band.name}），本次总计消耗${formatStamina(preview.totalStamina)}体力。${formatOutdoorRiskDescription(preview)}`
    : result.message;
  showConfirmation(`${danger}\n\n仍要继续吗？`,()=>retry(true));
  return true;
}

function resolveResult(result, retry) {
  if (result.ok) {
    if (result.message) showToast(result.message);
    if (state.lastLottery) {
      showModal(renderLottery(state.lastLottery));
      state.lastLottery = null;
    }
    render();
    return;
  }
  if (confirmRisk(result, retry)) return;
  showToast(result.message ?? "行动失败");
  render();
}

function showReturnButtonFeedback(target, finish) {
  saveCurrentProgress();
  const feedback={state,day:state.day};
  returnFeedback=feedback;
  const wasDisabled=target.disabled;
  target.disabled=true;
  target.classList.add("return-feedback-activating");
  window.setTimeout(()=>{
    if(returnFeedback!==feedback)return;
    returnFeedback=null;
    target.classList.remove("return-feedback-activating");
    target.disabled=wasDisabled;
    if(state!==feedback.state||state.day!==feedback.day||!target.isConnected)return;
    finish();
  },800);
}

function runAction(target) {
  const action = target.dataset.action;
  if (!action) return;
  if(action==="confirm-action")return resolveConfirmation(true);
  if(action==="cancel-confirmation")return resolveConfirmation(false);
  if(action==="close-modal"){
    if(modal.dataset.kind==="language-required")return;
    if(pendingConfirmation)return resolveConfirmation(false);
    if(modal.dataset.kind==="move-confirm") return showModal(renderMap(state),"map");
    if(modal.open)modal.close();
    return;
  }
  if(pendingConfirmation)return;
  if (dailyLotteryAnimating||returnFeedback) return;
  if(action==="toggle-facility-section"){
    const sectionKey=target.dataset.section;
    const section=target.closest("[data-facility-section]");
    if(!sectionKey||!section)return;
    const collapsed=section.classList.contains("collapsed");
    if(collapsed)collapsedFacilitySections.delete(sectionKey);
    else collapsedFacilitySections.add(sectionKey);
    setFacilitySectionCollapsed(section,!collapsed);
    return;
  }
  if(action==="toggle-production-station"){
    const station=target.dataset.station;
    const card=target.closest("[data-production-station]");
    if(!station||!card)return;
    const collapsed=card.classList.contains("collapsed");
    if(collapsed){
      collapsedProductionStations.delete(station);
      if(card.dataset.defaultCollapsed==="true")expandedUnavailableProductionStations.add(station);
    }else{
      expandedUnavailableProductionStations.delete(station);
      collapsedProductionStations.add(station);
    }
    setProductionStationCollapsed(card,!collapsed);
    return;
  }
  if(action==="show-more-resource-nodes"){
    const current=visibleResourceNodeCountsByArea.get(state.position)??RESOURCE_NODE_PAGE_SIZE;
    visibleResourceNodeCountsByArea.set(state.position,current+RESOURCE_NODE_PAGE_SIZE);
    render();
    return;
  }
  if (action === "toggle-equipment-collapse") {
    const isCollapsed = localStorage.getItem("dropped_survival_equipment_collapsed") === "1";
    localStorage.setItem("dropped_survival_equipment_collapsed", isCollapsed ? "0" : "1");
    render();
    return;
  }
  if (action === "consolidate-backpack") {
    const res = consolidateBackpack(state);
    showToast(res.transferredCount > 0 ? "已整理同类物资" : "背包已是整齐状态");
    render();
    return;
  }
  if (action === "install-pwa") {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      deferredInstallPrompt.userChoice.then(() => {
        deferredInstallPrompt = null;
      });
    } else {
      showToast("在浏览器菜单选择添加到主屏幕即可");
    }
    return;
  }
  if (action === "open-settings") return showSettings();
  if (action === "set-theme") {
    const chosen = target.closest("[data-theme]")?.dataset.theme ?? target.dataset.theme;
    if (chosen) {
      applyTheme(chosen);
      render();
      showSettings();
    }
    return;
  }
  if (action === "select-production-category") {
    const category = target.closest("[data-category]")?.dataset.category ?? target.dataset.category;
    if (category) {
      setActiveProductionCategory(category);
      render();
    }
    return;
  }
  if (action === "open-game-info" || action === "return-game-info") return showGameInfo();
  if (action === "open-language") return showLanguageChoice();
  if (action === "choose-language") return chooseLanguage(target.dataset.language);
  if (action === "save-transfer") return showSaveTransfer();
  if (action === "save-transfer-export") return saveTransferExport();
  if (action === "save-transfer-import") return saveTransferImport();
  if (state.launch && !["resolve-launch","abort-launch"].includes(action)) return showToast("归航启动期间无法离开据点或处理其他工作");
  if (action === "continue-postgame") {
    const result=continueAfterEnding(state);
    if(result.ok&&modal.open)modal.close();
    return resolveResult(result,()=>{});
  }
  if (action === "abort-launch") return resolveResult(abortReturnLaunch(state),()=>{});
  if (action === "open-map") return showModal(renderMap(state), "map");
  if (action === "open-stamina-guide") return showModal(renderStaminaGuide(state), "stamina-guide");
  if (action === "open-happiness") return showModal(renderHappinessDetails(state), "happiness");
  if (action === "open-weather-details") return showModal(renderWeatherDetails(state), "weather-details");
  if (action === "open-temperature-guide") return showModal(renderTemperatureGuide(state), "temperature-guide");
  if (action === "open-survival-metric") return showModal(renderSurvivalMetricDetails(state,target.dataset.metric), "survival-metric");
  if (action === "open-diet") return showModal(renderDietPicker(state, target.dataset.kind), "diet");
  if (action === "open-wound-treatment") return showModal(renderWoundTreatmentPicker(state), "wound-treatment");
  if (action === "open-combat") return showModal(renderCombat(state,target.dataset.enemy,target.dataset.node??""),"combat");
  if (action === "open-equipment-slot") return showModal(renderEquipmentPicker(state,target.dataset.slot),"equipment");
  if (action === "open-item-reference") return showModal(renderItemReference(state,target.dataset.item),"item-reference");
  if (action === "open-trade-reference") {
    const referenceHtml=target.dataset.referenceType==="blueprint"?renderBlueprintReference(state,target.dataset.item):renderItemReference(state,target.dataset.item);
    const closeButton=`<button type="button" class="secondary-button" data-action="return-trade-confirm" data-offer="${target.dataset.offer}">关闭</button>`;
    return showModal(referenceHtml,"trade-reference","",closeButton);
  }
  if (action === "return-trade-confirm") return showModal(renderTradeConfirmation(state,target.dataset.offer),"trade-confirm");
  if (action === "open-item") {if(Date.now()<suppressItemClickUntil)return;const source=target.dataset.source,index=Number(target.dataset.index);return showModal(renderItemDetails(state,source,index),"item",renderItemTransferActions(state,source,index));}
  if (action === "claim-daily-reward") {
    const result = claimDailyTaskReward(state);
    if (!result.ok) return showToast(result.message);
    saveCurrentProgress();
    dailyLotteryAnimating = true;
    target.disabled = true;
    target.closest(".daily-reward-card")?.classList.add("lottery-activating");
    window.setTimeout(() => {
      dailyLotteryAnimating = false;
      render();
      showModal(renderLottery(result.rewards), "lottery");
    }, 800);
    return;
  }
  if (action === "craft") return resolveResult(craftRecipe(state, target.dataset.recipe), () => {});
  if (action === "load-fuel") return resolveResult(loadFuel(state,target.dataset.item),()=>{});
  if (action === "load-farm-supply") return resolveResult(loadFarmSupply(state,target.dataset.item,target.dataset.quantity??1),()=>{});
  if (action === "place") return resolveResult(placeObject(state,target.dataset.item),()=>{});
  if (action === "toggle-placed") return resolveResult(togglePlacedObject(state,target.dataset.id),()=>{});
  if (action === "toggle-facility") return resolveResult(toggleFacility(state,target.dataset.id),()=>{});
  if (action === "toggle-grid-power") return resolveResult(toggleGridPowerConnection(state,target.dataset.area,target.dataset.kind,target.dataset.id),()=>{});
  if (action === "pickup-placed") return resolveResult(pickupPlacedObject(state,target.dataset.id),()=>{});
  if (action === "equip") {const result=equipItem(state,target.dataset.item);if(result.ok&&modal.open)modal.close();return resolveResult(result,()=>{});}
  if (action === "unequip") {const result=unequipItem(state,target.dataset.slot);if(result.ok&&modal.open)modal.close();return resolveResult(result,()=>{});}
  if (action === "use-medical") {const result=useMedical(state,target.dataset.item);if(result.ok&&modal.open&&modal.dataset.kind==="wound-treatment")modal.close();return resolveResult(result,()=>{});}
  if (action === "choose-seed") return showModal(renderSeedPicker(state,target.dataset.bed),"seed-picker");
  if (action === "plant") {const result=plantCrop(state,target.dataset.crop,target.dataset.bed??null);if(result.ok&&modal.open&&modal.dataset.kind==="seed-picker")modal.close();return resolveResult(result,()=>{});}
  if (action === "water") return resolveResult(waterPlot(state,target.dataset.plot),()=>{});
  if (action === "fertilize") return resolveResult(fertilizePlot(state,target.dataset.plot),()=>{});
  if (action === "toggle-plot-auto-fertilize") return resolveResult(togglePlotAutoFertilize(state,target.dataset.bed),()=>{});
  if (action === "harvest") return resolveResult(harvestPlot(state,target.dataset.plot),()=>{});
  if (action === "plant-herb-field") return resolveResult(plantHerbField(state),render);
  if (action === "water-herb-field") return resolveResult(waterHerbField(state),render);
  if (action === "fertilize-herb-field") return resolveResult(fertilizeHerbField(state),render);
  if (action === "harvest-herb-field") return resolveResult(harvestHerbField(state),render);
  if (action === "uproot") return showModal(renderUprootConfirmation(state,target.dataset.plot),"uproot-confirm");
  if (action === "cancel-uproot") {if(modal.open)modal.close();return;}
  if (action === "confirm-uproot") {const result=uprootCrop(state,target.dataset.plot);if(result.ok&&modal.open)modal.close();return resolveResult(result,()=>{});}
  if(action==="upgrade-greenhouse")return showModal(renderGreenhouseUpgradeConfirmation(state,target.dataset.plot),"greenhouse-upgrade-confirm");
  if(action==="cancel-greenhouse-upgrade"){if(modal.open)modal.close();return;}
  if(action==="confirm-greenhouse-upgrade"){const result=upgradePlotToGreenhouse(state,target.dataset.plot);if(result.ok&&modal.open)modal.close();return resolveResult(result,()=>{});}
  if (action === "add-animal") return resolveResult(addAnimalToPen(state,target.dataset.animalType,target.dataset.pen??null),()=>{});
  if (action === "feed") return resolveResult(feedAnimals(state,target.dataset.animalType,target.dataset.pen??null),()=>{});
  if (action === "trade") return showModal(renderTradeConfirmation(state,target.dataset.offer),"trade-confirm");
  if (action === "cancel-trade") { if(modal.open)modal.close(); return; }
  if (action === "confirm-trade") {
    const finishTrade=(tradeResult)=>{resolveResult(tradeResult,()=>{});if(tradeResult.ok&&tradeResult.newMails?.length)showModal(renderReceivedMails(tradeResult.newMails),"mail");};
    const result=acceptTrade(state,target.dataset.offer,true);
    if(result.ok&&modal.open)modal.close();
    return finishTrade(result);
  }
  if (action === "cancel-end-day") { if(modal.open)modal.close(); return; }
  if (action === "confirm-end-day") return finishDay(target);
  if (action === "claim-mail") {
    const result=claimMail(state,target.dataset.mail);
    if(result.ok&&modal.open&&modal.dataset.kind==="mail")modal.close();
    return resolveResult(result,()=>{});
  }
  if (action === "select-return-area") return resolveResult(selectReturnTowerArea(state),()=>{});
  if (action === "build-return") {
    if(endDayProcessing)return;
    const handleBuildReturn=(risk=false)=>{
      const result=buildReturnStage(state,target.dataset.stage,risk);
      if(result.ok&&result.completed)return showReturnButtonFeedback(target,()=>resolveResult(result,()=>{}));
      return resolveResult(result,handleBuildReturn);
    };
    return handleBuildReturn();
  }
  if (action === "broadcast") {
    if(endDayProcessing)return;
    const result=broadcastReturnSignal(state);
    const showDepartureNotice=result.ok&&result.departureProgress<3&&result.message;
    const finishBroadcast=()=>{
      resolveResult(showDepartureNotice?{...result,message:null}:result,()=>{});
      if(showDepartureNotice)showModal(`<p>${result.message}</p>`,"return-departure");
    };
    if(result.ok)return showReturnButtonFeedback(target,finishBroadcast);
    return finishBroadcast();
  }
  if (action === "start-launch") return resolveResult(startReturnLaunch(state),()=>{});
  if (action === "resolve-launch") return resolveResult(resolveLaunchDay(state,target.dataset.method,target.dataset.helper),()=>{});
  if (action === "fight") {
    const handleFight=(risk=false)=>{
      const result=fightEnemy(state,target.dataset.enemy,target.dataset.node||null,risk);
      if((result.ok||result.died)&&modal.open)modal.close();
      return resolveResult(result,handleFight);
    };
    return handleFight();
  }
  if (action === "choose-diet") {
    const result = selectConsumableFrom(state, target.dataset.item, target.dataset.source);
    if (result.ok) modal.close();
    return resolveResult(result, () => {});
  }
  if (action === "clear-diet") {
    const result = clearConsumableSelection(state, target.dataset.kind);
    if (result.ok) modal.close();
    return resolveResult(result, () => {});
  }
  if (action === "transfer-item") {const result=transferStack(state,target.dataset.source,Number(target.dataset.index),target.dataset.target);if(result.ok&&modal.open)modal.close();return resolveResult(result,()=>{});}
  if (action === "transfer") return resolveResult(transferStack(state, target.dataset.source, Number(target.dataset.index), target.dataset.target), () => {});
  if (action === "explore") {
    const handleExplore=(risk=false)=>{
      const result=explore(state,risk);
      if(!result.ok){if(confirmRisk(result,()=>handleExplore(true)))return;showToast(result.message??"行动失败");render();return;}
      if(result.message)showToast(result.message);
      render();
      if(result.encounter)showModal(renderEncounterResult(result.encounter),"encounter-result");
    };
    return handleExplore();
  }
  if (action === "gather") return resolveResult(gatherNode(state, target.dataset.node, target.dataset.method), (risk) => resolveResult(gatherNode(state, target.dataset.node, target.dataset.method, risk), () => {}));
  if (action === "build") return resolveResult(buildStep(state, target.dataset.building), (risk) => resolveResult(buildStep(state, target.dataset.building, risk), () => {}));
  if (action === "repair") return resolveResult(repairFacility(state,target.dataset.building),(risk)=>resolveResult(repairFacility(state,target.dataset.building,risk),()=>{}));
  if (action === "reinforce") return showModal(renderReinforcementConfirmation(state),"reinforce-confirm");
  if (action === "cancel-reinforce") {if(modal.open)modal.close();return;}
  if (action === "confirm-reinforce") {
    const result=reinforceArea(state,true);
    if((result.ok||result.died)&&modal.open)modal.close();
    return resolveResult(result,()=>{});
  }
  if (action === "move") return showModal(renderMoveConfirmation(state,target.dataset.area),"move-confirm");
  if (action === "cancel-move") return showModal(renderMap(state),"map");
  if (action === "confirm-move") {
    const result=moveTo(state,target.dataset.area,true);
    if((result.ok||result.died)&&modal.open)modal.close();
    return resolveResult(result,()=>{});
  }
  if (action === "new-game") return showConfirmation("清除当前进度并重新开始？",()=>{
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(ROLLBACK_KEY);
    for (const key of [...LEGACY_SAVE_KEYS, ...LEGACY_ROLLBACK_KEYS]) localStorage.removeItem(key);
    state = createNewGame();
    if(modal.open)modal.close();
    tab = "explore";
    visibleResourceNodeCountsByArea.clear();
    saveDayStart();
    render();
  },{danger:true});
  if (action === "restart-day") return showConfirmation(`放弃第${state.day}天的当前进度，重新从本日早晨开始？本次重新开始会重新生成随机结果。`,()=>{
    try {
      const saved=localStorage.getItem(ROLLBACK_KEY);
      if(!saved)return showToast("没有可读取的本日自动存档");
      const restored=restartDay(saved,state);
      if(restored.player.gameOver||restored.seed!==state.seed||restored.day>state.day)return showToast("没有可读取的本日自动存档");
      state=restored;
      if(modal.open)modal.close();
      tab="explore";
      visibleResourceNodeCountsByArea.clear();
      render();
      showToast(`已重新开始第${state.day}天`);
    } catch(error) {
      console.error(error);
      showToast("本日自动存档无法读取");
    }
  });
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (target) runAction(target);
});

function moveInventoryStack(source,index,target,insertionIndex){
  if(!target)return;
  const result=source===target
    ?reorderInventoryStack(state,source,Number(index),insertionIndex)
    :transferStack(state,source,Number(index),target);
  if(result.ok&&result.changed===false)return;
  resolveResult(result,()=>{});
}

function getInventoryDropTarget(element,clientX){
  const zone=element?.closest("[data-inventory-location]");
  if(!zone)return null;
  const tiles=[...zone.querySelectorAll(".item-tile")];
  const insertionIndex=tiles.findIndex(tile=>{const rect=tile.getBoundingClientRect();return clientX<rect.left+rect.width/2;});
  return {zone,location:zone.dataset.inventoryLocation,insertionIndex:insertionIndex<0?tiles.length:insertionIndex,tiles};
}

function showInventoryDropTarget(element,clientX,drag){
  clearInventoryDropTargets();
  const target=getInventoryDropTarget(element,clientX);
  if(!target)return;
  target.zone.classList.add("drop-target");
  if(target.location!==drag.source)return;
  if(target.insertionIndex===drag.index||target.insertionIndex===drag.index+1)return;
  const nextTile=target.tiles[target.insertionIndex];
  if(nextTile)nextTile.classList.add("drop-before");
  else target.tiles.at(-1)?.classList.add("drop-after");
}

function clearInventoryDropTargets(){
  view.querySelectorAll(".item-grid.drop-target").forEach(zone=>zone.classList.remove("drop-target"));
  view.querySelectorAll(".item-tile.drop-before, .item-tile.drop-after").forEach(tile=>tile.classList.remove("drop-before","drop-after"));
}
function clearInventoryDropState(){
  clearInventoryDropTargets();
  view.querySelectorAll(".item-tile.dragging").forEach(tile=>tile.classList.remove("dragging"));
}

view.addEventListener("dragstart",event=>{
  const tile=event.target.closest(".item-tile");if(!tile)return;
  if(pointerInventoryDrag){event.preventDefault();return;}
  nativeInventoryDrag={source:tile.dataset.source,index:Number(tile.dataset.index)};
  event.dataTransfer.effectAllowed="move";
  event.dataTransfer.setData("text/plain",JSON.stringify(nativeInventoryDrag));
  tile.classList.add("dragging");suppressItemClickUntil=Date.now()+400;
});
view.addEventListener("dragover",event=>{
  if(!nativeInventoryDrag||!event.target.closest("[data-inventory-location]"))return;
  event.preventDefault();event.dataTransfer.dropEffect="move";
  showInventoryDropTarget(event.target,event.clientX,nativeInventoryDrag);
});
view.addEventListener("drop",event=>{
  const drag=nativeInventoryDrag,target=getInventoryDropTarget(event.target,event.clientX);
  if(!drag||!target)return;
  event.preventDefault();nativeInventoryDrag=null;clearInventoryDropState();suppressItemClickUntil=Date.now()+500;
  moveInventoryStack(drag.source,drag.index,target.location,target.insertionIndex);
});
view.addEventListener("dragleave",event=>{if(!view.contains(event.relatedTarget))clearInventoryDropTargets();});
view.addEventListener("dragend",()=>{nativeInventoryDrag=null;clearInventoryDropState();suppressItemClickUntil=Date.now()+500;});

function cancelPointerInventoryDrag(){
  const drag=pointerInventoryDrag;if(!drag)return;
  clearTimeout(drag.holdTimer);pointerInventoryDrag=null;
  if(drag.tile.hasPointerCapture?.(drag.pointerId))drag.tile.releasePointerCapture(drag.pointerId);
  clearInventoryDropState();
}

view.addEventListener("pointerdown",event=>{
  if(event.pointerType==="mouse")return;
  if(pointerInventoryDrag){cancelPointerInventoryDrag();return;}
  const tile=event.target.closest(".item-tile");if(!tile)return;
  const drag={pointerId:event.pointerId,pointerType:event.pointerType,tile,source:tile.dataset.source,index:Number(tile.dataset.index),startX:event.clientX,startY:event.clientY,dragging:false};
  pointerInventoryDrag=drag;
  if(event.pointerType==="touch")drag.holdTimer=setTimeout(()=>{
    if(pointerInventoryDrag!==drag)return;
    drag.dragging=true;tile.classList.add("dragging");suppressItemClickUntil=Date.now()+500;
    tile.setPointerCapture?.(event.pointerId);
  },350);
  else tile.setPointerCapture?.(event.pointerId);
});
view.addEventListener("pointermove",event=>{
  const drag=pointerInventoryDrag;if(!drag||drag.pointerId!==event.pointerId)return;
  if(!drag.dragging&&Math.hypot(event.clientX-drag.startX,event.clientY-drag.startY)<10)return;
  if(!drag.dragging&&drag.pointerType==="touch"){cancelPointerInventoryDrag();return;}
  drag.dragging=true;event.preventDefault();drag.tile.classList.add("dragging");
  showInventoryDropTarget(document.elementFromPoint(event.clientX,event.clientY),event.clientX,drag);
});
// Cancel native touch scrolling only after a long press has activated dragging.
view.addEventListener("touchmove",event=>{if(pointerInventoryDrag?.dragging)event.preventDefault();},{passive:false});
view.addEventListener("contextmenu",event=>{if(pointerInventoryDrag&&event.target.closest(".item-tile"))event.preventDefault();});
function finishPointerInventoryDrag(event){
  const drag=pointerInventoryDrag;if(!drag||drag.pointerId!==event.pointerId)return;
  const target=getInventoryDropTarget(document.elementFromPoint(event.clientX,event.clientY),event.clientX);
  cancelPointerInventoryDrag();
  if(!drag.dragging)return;
  event.preventDefault();suppressItemClickUntil=Date.now()+500;
  moveInventoryStack(drag.source,drag.index,target?.location,target?.insertionIndex);
}
view.addEventListener("pointerup",finishPointerInventoryDrag);
view.addEventListener("pointercancel",event=>{if(pointerInventoryDrag?.pointerId===event.pointerId)cancelPointerInventoryDrag();});

nav.addEventListener("click", (event) => {
  if(returnFeedback)return;
  const button = event.target.closest("[data-tab]");
  if (!button) return;
  tab = button.dataset.tab;
  render();
  scrollPageToTop();
});

modal.addEventListener("close", () => {
  if(modal.open)return;
  pendingConfirmation=null;
  document.documentElement.classList.remove("modal-open");
  document.body.classList.remove("modal-open");
  if(modal.dataset.kind==="ending")modalContent.innerHTML="";
  modal.dataset.kind = "default";
});
modal.addEventListener("cancel", (event) => {
  if (modal.dataset.kind === "language-required") event.preventDefault();
  else if(pendingConfirmation){event.preventDefault();resolveConfirmation(false);}
});
nextDayButton.addEventListener("click", () => {
  if(returnFeedback)return;
  if(state.completed||state.player.gameOver)return;
  if (state.launch) return showToast("请先处理今日归航故障或中止启动");
  if(!state.dailyRewardClaimed&&state.dailyTasks?.length&&state.dailyTasks.every(task=>task.progress>=task.target))return showToast("今日十连抽奖励还没有领取，请先点击每日任务里的抽奖按钮");
  showModal(renderEndDayConfirmation(state),"end-day-confirm");
});

applyTheme(getSavedTheme());

function dumpLocalStorageData() {
  const data = {};
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    data[key] = localStorage.getItem(key);
  }
  return JSON.stringify(data);
}

function showSaveTransfer() {
  showModal(
    `<section class="save-transfer">
      <h2>存档迁移</h2>
      <p>从旧网页复制存档文本，粘贴到下方输入框，点击「导入存档」。也可点击「导出当前存档」下载本网页的存档文件。</p>
      <textarea id="save-transfer-textarea" rows="8" style="width:100%;box-sizing:border-box;resize:vertical;" placeholder="在此粘贴存档文本…"></textarea>
    </section>`,
    "save-transfer",
    `<button type="button" class="secondary-button" data-action="save-transfer-export">导出当前存档</button><button type="button" class="action-button primary" data-action="save-transfer-import">导入存档</button>`
  );
  const ta = modalContent.querySelector("#save-transfer-textarea");
  if (ta) ta.value = dumpLocalStorageData();
}

function saveTransferExport() {
  const ta = modalContent.querySelector("#save-transfer-textarea");
  const text = (ta && ta.value) ? ta.value : dumpLocalStorageData();
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "survival-save-export.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast("存档已导出为文件");
}

function saveTransferImport() {
  const ta = modalContent.querySelector("#save-transfer-textarea");
  const raw = (ta ? ta.value : "").trim();
  if (!raw) return showToast("请先粘贴存档文本");
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    return showToast("存档文本格式不正确，请检查是否完整复制");
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) return showToast("存档内容无效");
  try {
    for (const key of Object.keys(data)) {
      const value = data[key];
      localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
    }
  } catch (e) {
    return showToast("写入失败：" + e.message);
  }
  showToast("导入成功，正在刷新…");
  setTimeout(() => location.reload(), 600);
}

render();
