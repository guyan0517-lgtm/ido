export const ACTIVE_ATTACK_CHANCE = 0.1;

// 潜在主动袭击来源按地块配置；G7仅在当次发现雷鸣石阵时必遇雄狮，其他地块按概率触发。
// 同一地块列出多种敌人时，探索触发后从中随机一种。
export const ACTIVE_ATTACK_ENEMY_IDS_BY_AREA = Object.freeze(Object.fromEntries(Object.entries({
  C3: ["wild_chicken"], C4: ["wild_chicken"], C5: ["wild_chicken"], D3: ["wild_chicken"],
  E3: ["giant_rat"], E4: ["giant_rat"], E5: ["giant_rat"], D5: ["giant_rat"],
  B3: ["venom_snake"], B4: ["venom_snake"], B5: ["venom_snake"],
  B2: ["marten_enemy"], C2: ["marten_enemy"], D2: ["marten_enemy"], E2: ["marten_enemy"],
  E6: ["wolf_pack"], F6: ["wolf_pack"], F3: ["wolf_pack"], F4: ["wolf_pack"], F5: ["wolf_pack"],
  A6: ["giant_crab"], C6: ["giant_crab"], D6: ["giant_crab"], F7: ["giant_crab"],
  G2: ["snow_sheep"], F2: ["snow_sheep"], F1: ["snow_sheep"], E1: ["snow_sheep"], G1: ["snow_sheep"],
  A3: ["giant_python"], A4: ["giant_python"], A5: ["giant_python"],
  B1: ["snow_elephant"], C1: ["snow_elephant"], D1: ["snow_elephant"], A2: ["snow_elephant"], A1: ["snow_elephant"],
  G3: ["lion_pride"], G4: ["lion_pride"], G5: ["lion_pride"], G6: ["lion_pride"],
  B6: ["giant_octopus"], B7: ["giant_octopus"], C7: ["giant_octopus"], D7: ["giant_octopus"], E7: ["giant_octopus"],
  A7: ["giant_scorpion"], G7: ["wandering_lion"]
}).map(([areaId, enemyIds]) => [areaId, Object.freeze(enemyIds)])));

export function getAreaDistanceFromCamp(areaId) {
  if (!/^[A-G][1-7]$/u.test(String(areaId))) return null;
  const x = areaId.charCodeAt(0) - 65;
  const y = Number(areaId[1]) - 1;
  return Math.abs(x - 3) + Math.abs(y - 3);
}

export function getActiveAttackEnemyIds(areaId) {
  return [...(ACTIVE_ATTACK_ENEMY_IDS_BY_AREA[areaId] ?? [])];
}

export function getActiveAttackAreasForEnemy(enemyId) {
  return Object.entries(ACTIVE_ATTACK_ENEMY_IDS_BY_AREA)
    .filter(([, enemyIds]) => enemyIds.includes(enemyId))
    .map(([areaId]) => areaId);
}
