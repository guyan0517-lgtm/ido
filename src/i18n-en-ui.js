// {n} placeholders retain the order of values in the Chinese rendering template.
export const EN_UI = `
游戏信息|Game Info
制作人：水螅|Created by HydrozoaWorks
版本号：{0}|Version: {0}
切换语言|Change Language
选择语言|Choose Language
停歇|Lull
大风|Strong Winds
加强大风|Intense Winds
酸雨·{0}|Acid Rain · {0}
未知雨势|Unknown Rainfall
强风暴·{0}|Severe Storm · {0}
未知风势|Unknown Wind
似乎接下来会平静下来|Calmer weather seems to be coming
似乎{0}要来了|{0} seems to be approaching
似乎接下来也很平静|The calm seems likely to continue
似乎{0}还会持续|{0} seems likely to continue
似乎要降温了|It seems to be getting colder
似乎要升温了|It seems to be getting warmer
似乎温度变化不大|The temperature seems steady
日期|Day
第 {0} 天|Day {0}
位置|Location
体力|Stamina
查看体力与幸福度的关系|View how happiness affects stamina
幸福|Happiness
查看幸福来源|View happiness breakdown
天气|Weather
查看当前天气与灾害影响|View current weather and disaster effects
体感|Feels-Like Temperature
查看当前地块温度明细|View local temperature breakdown
体力与幸福度|Stamina and Happiness
当前幸福度|Current Happiness
幸福度带来的体力修正|Stamina Adjustment from Happiness
幸福度计算后的基础上限|Base Stamina Limit after Happiness Adjustment
当前体力|Current Stamina
幸福来源|Happiness Breakdown
没有发生影响幸福度的事情|Nothing affected your happiness.
各项合计{0}，幸福度最低为−10，最终为{1}。|The total is {0}. Happiness cannot fall below −10, so the final value is {1}.
各项合计{0}。|Total: {0}.
第{0}天结束时的结算明细|End of Day {0} Breakdown
明天|Tomorrow
后天|In 2 Days
大后天|In 3 Days
第{0}天 · {1}|Day {0} · {1}
基础气温|Base Temperature
灾害|Disaster
无灾害|None
未来三天天气|Three Day Forecast
不足1%|Less than 1%
当日基础温度为{0}℃；寒冷造成的行动体力、受伤和死亡风险按最终体感温度计算。|Today's base temperature is {0}°C. Cold-related stamina costs, injury, and death risks use your final feels-like temperature.
当日基础温度为{0}℃；炎热造成的行动体力、疾病和死亡风险按最终体感温度计算。非温室的生长期作物每次浇水需要2份水。|Today's base temperature is {0}°C. Heat-related stamina costs, illness, and death risks use your final feels-like temperature. Growing crops outside greenhouses require 2 water per watering.
行动体力|Action Stamina
探索、移动、天然资源采集、资源点战斗、施工及修复，每次因当前灾害额外消耗{0}体力；多种灾害叠加时取最高加成，不重复累加。酸雨各阶段都可以正常探索和采集。|Exploring, moving, gathering wild resources, fighting at resource nodes, building, and repairs each cost {0} extra stamina due to the current disaster. Overlapping disasters use only the highest surcharge. All acid rain stages still allow exploration and gathering.
种植|Planting
未升级为温室的生长中或待收获作物，结束今天时{0}失去{1}点丰饶；丰饶已经为0时再次受损，作物死亡。|At day's end, growing or harvestable crops outside greenhouses {0} lose {1} abundance. Further damage at zero abundance kills the crop.
有{0}%几率|have a {0}% chance to
必定|will always
人物状态|Player Status
当前地块虽有房屋，但探索、采集天然资源和采收家养植物仍会独立进行酸雨生病判定；其他耗体力行动受房屋保护。计入当前装备、昨日饮食及当地行动生病减免后，单次生病概率为{0}%。防雨达到100时完全免疫。|A local house protects actions that consume stamina, except exploring, gathering wild resources, and harvesting crops, which still roll independently for acid rain illness. After equipment, yesterday's diet, and local illness reductions, each roll has a {0}% chance. Rain protection of 100 grants full immunity.
在当前无房屋地块，每次消耗体力的行动都会独立进行酸雨生病判定；计入当前装备、昨日饮食及当地行动生病减免后，单次生病概率为{0}%。防雨达到100时完全免疫。|With no local house, every action that uses stamina independently rolls for acid rain illness. After equipment, yesterday's diet, and local illness reductions, each roll has a {0}% chance. Rain protection of 100 grants full immunity.
室外设施|Outdoor Facilities
当地酸雨设施防护为{0}，每座室外设施有{1}概率受损；受损后必须修好才能继续使用。|Local acid rain protection for facilities is {0}. Each outdoor facility has a {1} chance of damage and must be repaired before use.
当地酸雨设施防护已达到100，酸雨不会损坏室外设施。|Local acid rain protection for facilities has reached 100. Acid rain cannot damage outdoor facilities.
酸雨期间结束今天时，每座集水器收集3份水。|During acid rain, each rain collector gathers 3 water at day's end.
今天处于强风暴期，但当前风势间歇：不增加行动体力、不限制采集，也不会造成设施受损。临时加固仍可正常施工。|The storm is in a lull today: no extra stamina cost, gathering restrictions, or facility damage. Temporary reinforcement can still be built.
探索、移动、天然资源采集、资源点战斗、施工及修复，每次因当前灾害额外消耗{0}体力；多种灾害叠加时取最高加成，不重复累加。{1}|Exploring, moving, gathering wild resources, fighting at resource nodes, building, and repairs each cost {0} extra stamina due to the current disaster. Overlapping disasters use only the highest surcharge. {1}
加强版强风暴期间天然资源点禁止采集。|Wild resource gathering is blocked during intense storm winds.
普通强风暴仍可正常采集。|Normal storm winds still allow gathering.
当前地块虽有房屋，但探索、采集天然资源和采收家养植物仍会独立进行强风暴生病判定；其他耗体力行动受房屋保护。计入当前装备、昨日饮食及当地行动生病减免后，单次生病概率为{0}%。防风达到100时完全免疫。|A local house protects actions that consume stamina, except exploring, gathering wild resources, and harvesting crops, which still roll independently for storm illness. After equipment, yesterday's diet, and local illness reductions, each roll has a {0}% chance. Wind protection of 100 grants full immunity.
在当前无房屋地块，每次消耗体力的行动都会独立进行强风暴生病判定；计入当前装备、昨日饮食及当地行动生病减免后，单次生病概率为{0}%。防风达到100时完全免疫。|With no local house, every action that uses stamina independently rolls for storm illness. After equipment, yesterday's diet, and local illness reductions, each roll has a {0}% chance. Wind protection of 100 grants full immunity.
当地强风设施防护为{0}，当前地块有{1}概率随机损坏一座室外设施。|Local wind protection for facilities is {0}. This area has a {1} chance for one random outdoor facility to be damaged.
当地强风设施防护已达到100，强风暴不会损坏室外设施。|Local wind protection for facilities has reached 100. Storms cannot damage outdoor facilities.
临时加固|Temporary Reinforcement
风暴期间仍可施工；已有且仍在期限内的加固继续生效。|Can be built during a storm. Existing reinforcement remains active until it expires.
天气平稳|Calm Weather
今天没有灾害，不会产生灾害额外行动体力、采集限制、作物影响或设施损伤。|No disaster today: no disaster-related stamina surcharge, gathering restrictions, crop effects, or facility damage.
当前阶段|Current Stage
当前强度|Current Intensity
当日基础温度|Today's Base Temperature
种植、浇水、施肥、家养采收、喂养及温室升级的体力为固定消耗，不增加天气和体感费用。其他行动的具体体感加成、伤病和死亡风险，可点击顶部“体感”查看。|Planting, watering, fertilizing, harvesting crops, feeding, and greenhouse upgrades have fixed stamina costs, without weather or temperature surcharges. Tap "Feels-Like Temperature" above for other actions' temperature costs, injury, illness, and death risks.
天气详情|Weather Details
当前天气影响|Current Weather Effects
致命严寒|Lethal Cold
−10℃及以下|−10°C or below
室外行动额外消耗2体力；死亡概率从20%起，每再低1℃增加3个百分点，最高80%；存活后有50%概率受伤。|Outdoor actions cost 2 extra stamina. Death risk starts at 20%, increasing by 3 percentage points per degree below the threshold, up to 80%. Survivors have a 50% chance of injury.
严寒（危险）|Severe Cold (Danger)
室外行动额外消耗1体力；行动前需要确认，行动后有20%概率受伤。|Outdoor actions cost 1 extra stamina and require confirmation. Each action has a 20% chance of injury.
寒冷（负荷）|Cold (Strain)
室外行动额外消耗0.5体力。|Outdoor actions cost 0.5 extra stamina.
体感温度不会增加室外行动的体力消耗。|Temperature adds no extra stamina cost to outdoor actions.
炎热（负荷）|Hot (Strain)
酷热（危险）|Severe Heat (Danger)
室外行动额外消耗1体力；行动前需要确认，行动后有{0}%概率生病。|Outdoor actions cost 1 extra stamina and require confirmation. Each action has a {0}% chance of illness.
致命酷热|Lethal Heat
50℃及以上|50°C or above
室外行动额外消耗2体力；死亡概率从20%起，每再高1℃增加3个百分点，最高80%；存活后有{0}%概率生病。|Outdoor actions cost 2 extra stamina. Death risk starts at 20%, increasing by 3 percentage points per degree above the threshold, up to 80%. Survivors have a {0}% chance of illness.
当前温度处于舒适区，没有额外温度调整|The temperature is comfortable. No further adjustment applies.
当前|Current
当前地块温度|Local Temperature
地块温差|Area Temperature Offset
当前地块室外温度|Local Outdoor Temperature
当前生效的温度调整|Active Temperature Adjustments
最终体感|Final Feels-Like Temperature
保暖仅在环境低于10℃时生效，防热仅在环境高于30℃时生效；调整不会越过20℃。|Warmth applies only below 10°C; heat protection only above 30°C. Neither adjustment can cross 20°C.
这里的室外行动包括探索、移动、天然资源采集、资源点战斗、施工和修复；种植、浇水、施肥、家养采收、喂养及温室升级使用固定体力。|Outdoor actions here include exploring, moving, wild gathering, resource node combat, construction, and repair. Planting, watering, fertilizing, harvesting crops, feeding, and greenhouse upgrades use fixed stamina.
体感温度分档|Feels-Like Temperature Ranges
抽取今日十连抽奖励！|Claim Today's Ten Draws!
· 明日{0}|· Tomorrow: {0}
幸福度 {0}{1}{2}|Happiness {0}{1}{2}
幸福度 −10|Happiness −10
未设定|Not Selected
今日饮食|Today's Food and Drink
{2}地块地图局部|Map detail of area {2}
{4}地块地图局部|Map detail of area {4}
幸福度 {6}{7}{8}|Happiness {6}{7}{8}
不选择{3}|No {3}
选择今日{0}|Choose Today's {0}
可减轻{4}级伤势{5}|Heals {4} injury levels{5}
（含医务室加成1级）| (includes +1 from the infirmary)
背包和当前地块没有可以处理伤口的物品|No wound treatments in your backpack or this area.
处理伤口|Treat Wounds
所有伤药合计每天只能使用1份。|Only one dose of wound medicine can be used per day, across all types.
{0}%几率|{0}% chance
酸雨影响：今日{0}失去{1}点丰饶，丰饶为0时再受损会死亡|Acid rain: today, {0} lose {1} abundance. Further damage at zero abundance kills the crop.
酷暑影响：浇水需2份水|Heat wave: watering requires 2 water.
不限量|Unlimited
近战|Melee
远程|Ranged
对应|Matching
· 动物攻击{0} · 弱{1}：同级{2}武器可胜，同级另一类武器会失败{3}{4}|· Animal attack {0} · Weak to {1}: a same tier {2} weapon wins; the other weapon type at that tier loses{3}{4}
· 战利品：{0}|· Loot: {0}
· 背包携带{0}时有{1}%几率额外捕获{2}；成功捕获后消耗1个{3}，未捕获时不消耗|· Carry {0} in your backpack for a {1}% chance to catch {2}. A successful catch consumes 1 {3}; an unsuccessful attempt consumes none.
{0} {1}日后恢复 消耗体力{2}{3}{4}|{0} Restocks in {1} days · Stamina {2}{3}{4}
· 可能取得：{0}|· Possible finds: {0}
{0} 消耗体力{1}{2}{3}|{0} · Stamina {1}{2}{3}
战斗|Fight
查看战斗|View Combat
缺少工具|Tool Needed
特殊地点|Special Location
再显示10个资源点|Show 10 More Nodes
{0}/{1} 消耗体力0.5|{0}/{1} · Stamina 0.5
0/{0} 恢复中，还需{1}个浇水日|0/{0} Regrowing · {1} more watered days
生长中，还需{0}个浇水日|Growing · {0} more watered days
家养{1}{2}|Cultivated {1}{2}
人工资源点|Cultivated Resource Nodes
等待生长|Waiting to Grow
暂无可采资源点，可继续探索|No harvestable nodes. Keep exploring.
本地资源点已经采完|All local resources have been gathered.
尚未发现资源点|No resource nodes discovered yet.
探索度 {1}%|Explored {1}%
本次体力 {3} · 体感 {4}℃|Stamina cost {3} · Feels like {4}°C
打开岛屿地图 / 移动|Island Map / Travel
{1}协助|{1} assists
归航启动 · 第{0}/3日|Homeward Launch · Day {0}/3
今日故障：{0}|Today's Fault: {0}
维护体力需求{1}；当日独立维护体力3。{2}|Maintenance needs {1} stamina; 3 separate maintenance stamina available today. {2}
中止本次启动|Abort Launch
替代材料：{0}|Alternative materials: {0}
可直接修复|Ready to Repair
使用维护体力|Use Maintenance Stamina
使用3体力与材料|Use 3 Stamina and Materials
稀有战利品总概率{0}%：{1}|Total rare loot chance {0}%: {1}
无随机稀有掉落|No random rare drops
近战武器|Melee Weapon
远程武器|Ranged Weapon
无|None
可以战胜|Victory Expected
攻击相同，只会僵持|Equal Attack: Stalemate
攻击不足，会受伤{0}层|Insufficient Attack: {0} Injury Levels
体力0|Stamina 0
本次消耗：{1}|Cost: {1}
有效攻击 / 敌人攻击|Effective Attack / Enemy Attack
弱点|Weakness
预计结果|Expected Outcome
普通掉落：{9}|Common Loot: {9}
确认战斗|Confirm Fight
武器命中弱点，有效攻击+1。|Your weapon exploits the weakness: effective attack +1.
武器类型被克制，有效攻击-3。|Your weapon type is resisted: effective attack −3.
高阶强攻饮食组合生效，可以挑战高一级敌人。|The advanced attack food and drink combo lets you challenge enemies one tier higher.
生存记录|Survival Log
战斗胜利|Victory
双方僵持|Stalemate
战斗失败|Defeat
你在战斗中受伤{0}层。|You suffered {0} injury levels in combat.
你没有受伤。|You were unharmed.
没有战利品|No Loot
遭到{0}袭击|Attacked by {0}
战斗结果|Combat Result
敌人弱点|Enemy Weakness
战利品：{9}|Loot: {9}
（产出{0}×{1}）| (produces {0} ×{1})
查看{1}的详细功能|View details for {1}
闲置{0} 摆放{1}|Stored {0} · Placed {1}
闲置{0} 装备{1}|Stored {0} · Equipped {1}
产出：{1} · 材料：{2}{3}|Output: {1} · Materials: {2}{3}
· 替代路线：{0}|· Alternative recipe: {0}
今日剩余 {0}/{1} 次|Uses Left Today: {0}/{1}
不限次数|Unlimited Uses
使用一次消耗{1}点燃料|Each use costs {1} fuel points
展开|Expand
收起|Collapse
当前没有可生产内容|Nothing Available to Produce
当地没有可用的生产工具，或尚未获得它们对应的配方蓝图。|No usable local production tools, or their recipe blueprints have not been obtained.
每日提供99次加热生产；开启时使当地实际温度上升2℃，每日基础消耗2点燃料|Provides 99 heated production uses per day. When on, raises local temperature by 2°C and uses 2 base fuel points daily.
篝火的升级设施，建成后替换篝火；可制作全部篝火配方和柴火灶专属配方，每日共用99次生产；开启时使当地实际温度上升2℃，幸福度增加1，每日基础消耗2点燃料|Replaces the campfire when completed. Handles all campfire and wood stove recipes, sharing 99 uses per day. When on, raises local temperature by 2°C, adds 1 happiness, and uses 2 base fuel points daily.
每天可以晾晒99次，可加工干肉和干鱼|99 drying uses daily. Produces dried meat and dried fish.
下雨时自动收集3份水|Automatically collects 3 water when it rains.
水井的升级设施，建成后替换水井；每天自动获得20份水；酸雨设施防护增加20|Replaces the well when completed. Automatically produces 20 water daily. Adds 20 acid rain protection for facilities.
酸雨设施防护增加20|Adds 20 acid rain protection for facilities.
浇水后施肥才有用|Fertilize only after watering.
提供10个不耗电的保鲜格|Provides 10 chilled slots without electricity.
地窖的升级设施，建成后替换地窖；提供15个不耗电的保鲜格|Replaces the cellar when completed. Provides 15 chilled slots without electricity.
每3日自动产出蜂蜜2份和蜂蜡1份|Automatically produces 2 honey and 1 beeswax every 3 days.
开启时使当地实际温度上升6℃；每日基础消耗3点燃料，壁炉结构使当地取暖燃料消耗减少30%|When on, raises local temperature by 6°C and uses 3 base fuel points daily. Its structure reduces local heating fuel consumption by 30%.
当地降温3℃|Lowers local temperature by 3°C.
强风设施防护增加30|Adds 30 wind protection for facilities.
覆盖当地全部家养资源点；结束今天时按播种顺序直接消耗当地普通储物格中的水自动浇灌，不消耗体力|Covers all local cultivated nodes. At day's end, waters them in planting order using water from local regular storage. No stamina cost.
结束今天时只消耗当地普通储物格中的饲料，按猪、牛、羊、鸡的顺序逐座自动喂养，跳过损坏栏舍，不消耗体力|At day's end, feeds each pen using only feed in local regular storage, in the order pigs, cattle, sheep, chickens. Skips damaged pens. No stamina cost.
获得蓝图后，可把单块栽培地永久升级为温室，免受酸雨和酷暑影响|With the blueprint, permanently upgrade one growing plot to a greenhouse, protecting it from acid rain and heat waves.
幸福度增加2；当地全部厨具的每日可用次数变为2倍；厨具配方中每项需求量大于1的素材减少1份|Adds 2 happiness. Doubles daily uses for all local kitchen tools. Reduces each ingredient quantity greater than 1 by one in their recipes.
提供50格衣帽间，只能存放武器、护具和背包|Provides 50 wardrobe slots for weapons, armor, and backpacks only.
提供20格本地种子储存空间，只能存放种子|Provides 20 local slots for seeds only.
提供30格本地杂物储存空间，只能存放家具和工具（含便携生产工具）|Provides 30 local slots for furniture and tools, including portable production tools.
幸福度增加4；当地全部非厨具生产工具的每日可用次数变为2倍|Adds 4 happiness. Doubles daily uses for all local production tools other than kitchen tools.
仅照料已开启自动施肥的栽培地；结束今天时按播种顺序消耗箱内肥料自动施肥，施肥丰饶已满时不浪费，不消耗体力|Tends only plots with automatic fertilization enabled. At day's end, uses fertilizer from the box in planting order. Does not waste fertilizer on plots at maximum fertilized abundance. No stamina cost.
排水沟的升级设施，建成后替换排水沟；酸雨设施防护增加40|Replaces the drainage ditch when completed. Adds 40 acid rain protection for facilities.
居所保暖增加5℃|Adds 5°C of home warmth.
保暖夹层的升级设施，建成后替换保暖夹层；居所保暖增加10℃，取暖燃料消耗再减少25%|Replaces the insulation lining when completed. Adds 10°C of home warmth and reduces heating fuel consumption by a further 25%.
仅能在C3或C4建造；当地建成配电室后，每组每天为全岛提供5点可支配电力，每个地块最多20组，不消耗燃料，不会损坏|Build only in C3 or C4. A local power distribution room activates each generator's 5 daily power for the whole island. Up to 20 per area. Uses no fuel and cannot be damaged.
需要至少一级房屋，仅能在铁矿、铜矿或煤矿地块建造；必须有本地储存空间才可以运行；每座每天耗电{0}，供电优先度最低|Requires at least a level 1 house. Build only in iron, copper, or coal areas. Needs local storage to run. Each uses {0} power daily, at the lowest priority.
仅能在已建成水力发电机组的C3或C4建造；建成后不会损坏，启用当地发电机组，电量全岛共享，其他地块无需配电室即可用电|Build only in C3 or C4 with a completed hydroelectric generator. Cannot be damaged. Activates local generators and shares power islandwide. Other areas need no distribution room to use it.
仅可在永久避难所内建造；开启并供电时使当地室温降低25℃，幸福度增加{0}，每日耗电{1}；玩家离开后仍持续开启和耗电|Build only in a permanent shelter. When on and powered, lowers local indoor temperature by 25°C and adds {0} happiness, using {1} power daily. Remains on and uses power when you leave.
开启并供电时显示未来3日的准确天气，每日耗电1|When on and powered, shows an accurate three day forecast. Uses 1 power daily.
在当地使用伤药时额外减轻1级伤势；当天未使用伤药则日结时减轻1级伤势；连续舒适且正常饮食的养病时间从3天缩短为2天|Local wound medicine heals 1 extra injury level. If none is used that day, heals 1 injury level at day's end. Reduces illness recovery from 3 to 2 consecutive comfortable days with proper food and drink.
{0}和{1}|{0} and {1}
幼畜|Young Animal
{0}群|{0} Herd
放入{0}后{1}天可以繁育出{2}，之后可以定期获得{3}|Add {0}; after {1} days, it develops into {2}, then regularly produces {3}.
；正常运行时每台每日采集{0}个{1}。|; each operating machine gathers {0} {1} daily.
建成后不会损坏。|Cannot be damaged once completed.
每日提供{0}次生产|Provides {0} production uses daily.
普通储物格增加{0}|Adds {0} regular storage slots.
衣帽间增加{0}格|Adds {0} wardrobe slots.
本地种子储存格增加{0}格，只能存放种子|Adds {0} local slots for seeds only.
本地杂物储存格增加{0}格，只能存放家具和工具（含便携生产工具）|Adds {0} local slots for furniture and tools, including portable production tools.
保鲜格增加{0}|Adds {0} chilled slots.
提供{0}个种植位|Provides {0} growing spaces.
每日自动获得水{0}份|Automatically produces {0} water daily.
当地降温{0}℃|Lowers local temperature by {0}°C.
幸福度增加{0}|Adds {0} happiness.
开启时使当地实际温度上升{0}℃|Raises local temperature by {0}°C when on.
当地保暖增加{0}℃|Adds {0}°C of local warmth.
每日基础消耗{0}点燃料|Uses {0} base fuel points daily.
每天为全岛提供{0}点电力|Provides {0} power daily to the whole island.
每日耗电{0}|Daily power: {0}
酸雨设施防护增加{0}|Adds {0} acid rain protection for facilities.
强风设施防护增加{0}|Adds {0} wind protection for facilities.
{0}每日次数增加{1}|Adds {1} daily uses to {0}.
完成后在当前地块提供对应功能|Provides its functions in this area once completed.
体力{0}{1}|Stamina {0}{1}
（基础{0}，受当前天气与体感影响）| (base {0}, adjusted for current weather and feels-like temperature)
强行行动有{0}%死亡风险，存活后有{1}%概率{2}。|Proceeding risks a {0}% chance of death. Survivors have a {1}% chance of {2}.
强行行动有{0}%概率{1}。|Proceeding risks a {0}% chance of {1}.
修复{1} · {2} · {3}|Repair {1} · {2} · {3}
前置设施：{0}|Required facilities: {0}
需摆放：{0}|Must be placed: {0}
全岛前置设施：{0}|Required anywhere on the island: {0}
任意地块已建成永久避难所|A permanent shelter completed in any area
任选前置（至少1座）：{0}|Choose at least 1 prerequisite: {0}
任选前置（至少{0}座）：{1}|Choose at least {0} prerequisites: {1}
建成后拥有{0}空间 · 保暖{1}℃ · 酸雨设施防护{2} · 强风设施防护{3}|On completion: Furniture capacity: {0} slots · Warmth: {1}°C · Facility acid-rain protection: {2} · Facility wind protection: {3}
每步消耗：{3}{4} · {5}|Cost per step: {3}{4} · {5}
施工（{8}/{9}）|Build ({8}/{9})
；也可用{0}替代|; alternatively use {0}
栏舍|Animal Pen
· 成长{1}日 · {2} · 挨饿{3}日|· Growth: {1} days · {2} · Unfed: {3} days
今日已喂|Fed Today
今日未喂|Not Fed Today
喂养|Feed
放入{3}|Add {3}
每次喂养消耗：{0} · 体力{1}|Per feeding: {0} · Stamina {1}
栏舍里还没有{0}|No {0} in this pen yet.
{3}栽培地 {4} 自动施肥|{3} Growing Plot {4}: Automatic Fertilization
自动施肥{0}|Automatic Fertilization {0}
修复后运行|Runs After Repair
自动浇水|Automatic Watering
自动施肥|Automatic Fertilization
库存{0}/{1} · 在探索页采收|Stock {0}/{1} · Harvest on the Explore page
恢复中，还需{0}个浇水日|Regrowing · {0} more watered days
升级为温室|Upgrade to Greenhouse
（今日结算后+1）| (+1 at day's end)
（还需浇水才会增加）| (water first to increase)
每次浇水：水×{0} · 体力0.2；每次施肥：肥料×1 · 体力0.2|Each watering: Water ×{0} · Stamina 0.2; each fertilization: Fertilizer ×1 · Stamina 0.2
{3} · 施肥丰饶{4}/5{5}{6}|{3} · Fertilized abundance {4}/5{5}{6}
拔除|Uproot
· {0}范围内|· Covered by {0}
浇水|Water
施肥|Fertilize
{1} {2} · 空置|{1} {2} · Empty
选择种子|Choose Seeds
温室升级永久保留，改种无需再次升级|Greenhouse upgrades are permanent. Changing crops does not require another upgrade.
尚未种植作物|No Crop Planted
栽培地已损坏，修复后才能播种|This plot is damaged. Repair it before planting.
先用泥土和肥料整理一块栽培地|Build a growing plot with soil and fertilizer first.
栽培地已用{0}/{1}|Growing Plots Used: {0}/{1}
当地没有可供采矿机开采的矿种，暂停用电和生产|No compatible local ore. Power use and production paused.
没有本地储存空间，暂停用电和生产|No local storage. Power use and production paused.
当地普通储物格已满且没有同类矿石堆，暂停生产|Local regular storage is full with no matching ore stack. Production paused.
{0}号|#{0}
已扣除今日消耗资源|Today's resources paid
尚未扣除今日消耗资源|Today's resources not yet paid
已关闭|Off
已开启|On
本日未供电|Unpowered Today
当地储存库饲料 {1}份 / 每日需消耗 {2}份|Feed in local storage: {1} / Daily requirement: {2}
设施内现有{0} {1}份 · 当前地块与背包可加入 {2}份|Stored inside: {0} ×{1} · Available locally and in backpack: {2}
加入1份{5}|Add 1 {5}
全部加入（{8}）|Add All ({8})
{0}占用{1}点|{0}: {1} power used
暂无地块用电|No areas using power
；{0}归航塔今日广播已用{1}点|; {0} Homeward Tower used {1} power broadcasting today
先停止采矿机，若仍不足再随机让其他电器断电|Mining machines stop first; if still insufficient, other appliances lose power at random.
过夜时会随机让部分电器断电|Some appliances will lose power at random overnight.
超出{0}点；总电量不足，{1}|Over capacity by {0}. Insufficient power: {1}
剩余{0}点|{0} remaining
全岛总电量{0}点|Island Power Supply: {0}
· 已占用{1}点 · {2}|· Used: {1} · {2}
用电地块：{3}{4}|Powered areas: {3}{4}
· 当前每日消耗{0}点|· Current daily use: {0}
· 已损坏{0}座|· Damaged: {0}
{1} {2}号|{1} #{2}
加入{2}（+{3}）|Add {2} (+{3})
总燃料槽 · {0}点|Shared Fuel Reserve · {0} points
当前地块所有取暖、生产和燃料设备共用；燃料一旦投入便转为燃料点，不能取回|Shared by all local heating, production, and fuel powered devices. Loaded fuel becomes fuel points and cannot be retrieved.
滴灌架 → 蒸发冷风器 → 浴缸/按摩浴缸|Drip Irrigation → Evaporative Cooler → Bathtub / Whirlpool Tub
{0}{1}份|{0} ×{1}
按当前库存缺水{0}份|Short by {0} water at current stock
· 当前库存充足|· Enough in stock
自动用水 · 当地普通储物格有水{0}份 / 今晚预计用水{1}份 / 产水{2}份|Automatic Water Use · Local regular stock {0} / Expected use tonight {1} / Production {2}
已开启设施用水：{3}；今晚设施产水：{4}。只使用当地普通储物格；结算顺序：{5}{6}。设施会在自动扣水前先产水。|Active facilities use: {3}; tonight's water production: {4}. Uses only local regular storage. Processing order: {5}{6}. Facilities produce water before automatic use.
异地待机|Standby (Away)
供电中|Powered
等待供电|Awaiting Power
暂停用电|Power Use Paused
每日耗电{3} · {4}{5}|Daily Power {3} · {4}{5}
全岛用电设备|Island Electrical Devices
尚无接入电网的用电设备|No electrical devices connected yet.
归航塔已建成，通关记录已保存|Homeward Tower completed. Completion record saved.
只能选择一个永久避难所地块作为归航塔据点；开工前需在当地建成机械工坊和气象站|Choose one permanent shelter area as your Homeward Tower base. Complete a local machine shop and weather station before construction.
设为归航塔据点|Set as Homeward Base
唯一据点位于{0}|Your only base is in {0}.
每步消耗：{0} · {1}{2}{3}|Cost per step: {0} · {1}{2}{3}
· 前置：当地建成机械工坊和气象站|· Requires a completed local machine shop and weather station
· 安装后进行三天坐标运算和广播|· After installation, compute coordinates and broadcast on three days
归航塔 · {0}|Homeward Tower · {0}
已完成|Completed
施工（{0}/{1}）|Build ({0}/{1})
坐标运算和广播（{1}/3）|Compute Coordinates and Broadcast ({1}/3)
消耗|Cost
电力{3}|Power {3}
燃油{5}|Fuel Oil {5}
今日已完成，明日继续。|Done for today. Continue tomorrow.
运行：{1}|Operation: {1}
收起{0}|Pack Away {0}
摆放{0}|Place {0}
只能放1件|Limit: 1 per Area
用水|Water Use
用电|Power Use
占{1}空间|Space: {1}
{0} {1} · 已摆放|{0} {1} · Placed
{0} {1} · 待摆放|{0} {1} · Not Placed
占{0}空间|Space: {0}
同类设备每个地块最多{0}台|Limit of {0} devices of this type per area
当前地块和背包里还没有家具|No furniture in this area or your backpack.
当地酸雨设施防护 {0}/100|Local Facility Acid Rain Protection {0}/100
使酸雨造成的室外设施破损率降低{1}%；达到100时完全免疫|Reduces outdoor facility damage chance from acid rain by {1}%. Full immunity at 100.
当地强风设施防护 {2}/100|Local Facility Wind Protection {2}/100
使强风暴造成的室外设施破损率降低{3}%；达到100时完全免疫|Reduces outdoor facility damage chance from storms by {3}%. Full immunity at 100.
房屋 · 空间{1} · 保暖{2}℃ · 酸雨设施防护{3} · 强风设施防护{4}|House · Furniture capacity: {1} slots · Warmth: {2}°C · Facility acid-rain protection: {3} · Facility wind protection: {4}
已有房子和设施|Existing Houses and Facilities
当前地块还没有建成房子或设施|No completed houses or facilities in this area yet.
可建造的房子和设施|Buildable Houses and Facilities
当前没有可建造项目|Nothing Available to Build
已占用 {0}/{1} 空间|Space Used: {0}/{1}
查看{2}，数量{3}|View {2}, quantity {3}
空|Empty
选择{1}装备|Choose {1} Equipment
未装备|Unequipped
查看{1}{2}|View {1}{2}
状态|Status
来源|Sources
生存数值|Survival Stats
使用药剂|Use Medicine
拖动物品可调整顺序或换行存放；手机上长按后拖动。|Drag items to reorder or move between rows. On a phone, press and hold before dragging.
背包保鲜格 {0}/{1}|Chilled Backpack Slots {0}/{1}
背包普通格 {0}/{1}|Regular Backpack Slots {0}/{1}
衣帽间 {0}/{1}|Wardrobe {0}/{1}
本地种子储存室 {0}/{1}|Local Seed Store {0}/{1}
只能存放种子|Seeds Only
本地杂物间 {0}/{1}|Local Utility Room {0}/{1}
只能存放家具和工具（含便携生产工具）|Furniture and Tools Only (Including Portable Production Tools)
本地保鲜库 {0}/{1}|Local Chilled Storage {0}/{1}
本地储存库 {0}/{1}|Local Storage {0}/{1}
地面物品 {0}|On the Ground: {0}
昨日饮食（{0}）|Yesterday's Diet ({0})
{0}级伤势影响|Effect of Level {0} Injury
自身耐寒|Natural Cold Resistance
自身耐热|Natural Heat Resistance
基础攻击|Base Attack
高阶强攻食物与高阶强攻饮料已经组成完整攻势：未受伤时可以挑战高一级敌人。|Your advanced attack food and drink form a complete combo: while uninjured, you can challenge enemies one tier higher.
温度调整|Temperature Adjustment
当前地块的升温与降温净值。正数表示升温，负数表示降温；具体体感仍会根据天气冷热分别采用对应效果。|Net local heating and cooling. Positive means warmer; negative means cooler. Your feels-like temperature uses the relevant effect for the current heat or cold.
当前装备和昨日饮食没有提供防雨加成。|Your current equipment and yesterday's diet provide no rain protection.
防雨用于降低酸雨天气下的生病概率：无房屋地块的每次耗体力行动都会判定；无论有无房屋，探索、天然资源采集和家养植物采收也都会判定。达到100时完全免疫。|Rain protection reduces illness risk in acid rain. Every action that consumes stamina in an area without a house triggers an illness check. Exploring, wild gathering, and harvesting crops trigger rolls even with a house. Full immunity at 100.
当前装备和昨日饮食没有提供防风加成。|Your current equipment and yesterday's diet provide no wind protection.
防风用于降低强风暴天气下的生病概率：无房屋地块的每次耗体力行动都会判定；无论有无房屋，探索、天然资源采集和家养植物采收也都会判定。达到100时完全免疫。|Wind protection reduces illness risk during storms. Every action that consumes stamina in an area without a house triggers an illness check. Exploring, wild gathering, and harvesting crops trigger rolls even with a house. Full immunity at 100.
伤势|Injury
{0}级伤势|Level {0} Injury
无伤|Uninjured
当前伤势会使攻击除以{0}，最低为1。每天结束时只要体力仍大于0，就累计1个养伤日；连续3天后自然减轻1级伤势，体力耗尽会中断并清零累计。当前连续养伤：{1}/3天。可在物资页点击“处理伤口”使用本地伤口用品，所有伤药合计每天只能使用1份。|Your injury divides attack by {0}, to a minimum of 1. Ending a day with stamina above zero adds one recovery day. Three consecutive days heal 1 injury level; exhausting stamina resets the count. Current recovery: {1}/3 days. Use "Treat Wounds" on Supplies to apply local treatments. Only one dose per day across all wound medicines.
当前没有伤势，不会削弱攻击。受伤后，每天结束时只要体力仍大于0，就累计1个养伤日；连续3天后自然减轻1级伤势，体力耗尽会中断并清零累计。|No injury; attack is unaffected. When injured, ending a day with stamina above zero adds one recovery day. Three consecutive days heal 1 injury level; exhausting stamina resets the count.
疾病|Illness
有|Yes
患病|Ill
健康|Healthy
当前处于患病状态。使用药剂可以立即治好；也可以在舒适温度下正常饮食并连续养病{0}天。|You are ill. Medicine cures you immediately. Alternatively, recover for {0} consecutive days at a comfortable temperature with proper food and drink.
当前没有患病。|You are not ill.
没有找到这项生存数值|Survival stat not found.
{0}状态|{0} Status
当前状态|Current Status
{0}来源|{0} Sources
当前总值|Current Total
当前没有提供这项加成的来源。|No active sources for this bonus.
防雨（降低酸雨生病率）|Rain Protection (Reduces Acid Rain Illness)
防风（降低风暴生病率）|Wind Protection (Reduces Storm Illness)
酸雨行动体力减免|Acid Rain Stamina Discount
幸福度|Happiness
治疗伤势|Injury Healing
减轻{0}级|Heals {0} levels
每日伤药上限|Daily Wound Medicine Limit
所有伤药合计1份|1 dose across all types
医务室加成|Infirmary Bonus
当地完好医务室额外减轻1级|An intact local infirmary heals 1 extra level
使用方式|How to Use
物资页 → 处理伤口|Supplies → Treat Wounds
治疗疾病|Illness Treatment
立即治愈|Instant Cure
单次消耗|Cost per Use
药剂1份|Medicine ×1
物资页 → 使用药剂|Supplies → Use Medicine
酸雨设施防护|Facility Acid Rain Protection
普通储物格|Regular Storage Slots
格|slots
保鲜储物格|Chilled Storage Slots
每日用水|Daily Water Use
{0}份|{0} units
每日燃料|Daily Fuel Use
{0}点|{0} points
每日用电|Daily Power Use
次日攻击|Next Day Attack
次日保暖|Next Day Warmth
次日防热|Next Day Heat Protection
次日防雨（降低酸雨生病率）|Next Day Rain Protection (Reduces Acid Rain Illness)
次日防风（降低风暴生病率）|Next Day Wind Protection (Reduces Storm Illness)
武器类型|Weapon Type
{0} · {1}级|{0} · Tier {1}
装备位置|Equipment Slot
普通格|Regular Slots
{0}格|{0} slots
保鲜格|Chilled Slots
生产用途|Production Uses
用途|Uses
占用空间|Space Used
摆放在当地|Placed Locally
正常供电|Powered
供水充足|Enough Water
燃料充足|Enough Fuel
生效条件|Activation Requirements
保暖生效范围|Warmth Applies
寒冷时|In Cold Weather
防热生效范围|Heat Protection Applies
炎热时|In Hot Weather
降温叠加|Cooling Effect Stacking
风扇与蒸发冷风器的降温分别计算并相加|The cooling effects of a fan and an evaporative cooler are calculated separately and added together.
保鲜效果|Preservation
正常供电时暂停其中物品的腐坏计时|Stops spoilage timers for stored items while powered.
行动生病几率|Action Illness Risk
本地块降低{0}%|Reduced by {0}% in this area
设施防护范围|Facility Protection Range
本地块|This Area
基础每日生产|Base Daily Production
每台{0}次|{0} uses per device
摆放在当地房屋内|Placed inside a local house
配套火源|Required Heat Source
当地未损坏的篝火或柴火灶|An intact local campfire or wood stove
单次生产燃料|Fuel per Use
厨房加成|Kitchen Bonus
工作室加成|Workshop Bonus
当地每日生产次数翻倍|Doubles local daily production uses
鞣皮工坊加成|Tannery Bonus
当地每日生产次数+{0}，再计算工作室加成|Adds {0} local daily uses before the workshop bonus
补充燃料|Refuel
每份{0}点|{0} points per unit
投入当地总燃料槽|Load into the local shared fuel reserve
其他用途|Other Uses
制作油灯，归航广播每次另需燃油1份|Make oil lamps. Each homeward broadcast also requires 1 fuel oil.
施肥效果|Fertilization Effect
当天同时浇水，夜间丰饶+1，上限5|Water on the same day to gain 1 abundance overnight, up to 5.
产量加成|Yield Bonus
每点丰饶增加50%基础库存，总库存向下取整|Each abundance point adds 50% of base stock. Total stock rounds down.
施肥消耗|Fertilization Cost
每次肥料1份、体力0.2|1 fertilizer and 0.2 stamina per use
使用限制|Restrictions
未长满的资源点，每处每天1次，丰饶已满时不可用|Once per day per growing node. Unavailable at full growth or maximum abundance.
饲料用量|Feed Needed
每座有动物的栏舍每天{0}份|{0} per occupied pen daily
手动喂养体力|Manual Feeding Stamina
{0}点/次|{0} per use
自动喂养|Automatic Feeding
自动喂食机取用当地普通储物格的饲料|The automatic feeder takes feed from local regular storage.
种植条件|Planting Requirements
当地有完好的空栽培地|An intact, empty local growing plot
种植消耗|Planting Cost
种子1份、体力1|1 seed and 1 stamina
成熟时间|Time to Maturity
浇水照料{0}天|{0} days of watering
基础库存|Base Harvestable Amount
{0}{1}份（丰饶为0）|{0} ×{1} (with no Abundance bonus)
采空再生|Regrowth Time after Full Harvest
再次浇水照料{0}天|{0} more days of watering
安置位置|Housing
当地有空位且未损坏的{0}|An intact local {0} with room
累计喂养{0}天|{0} fed days in total
产出{0}|Produces {0}
成熟后每{0}个生产日{1}份|{1} units every {0} productive days after maturity
生产条件|Production Requirement
当天已喂养才成长或生产|Grows or produces only when fed that day
逃跑条件|Runs Away After
连续10天未喂养|10 consecutive days without feed
基础每日缝纫|Base Daily Sewing
每根{0}次，多根叠加|{0} uses per needle; multiple needles add together
使用条件|Use Requirements
放在背包或当地物资中，配合当地完好制作台|Keep in your backpack or local supplies, with an intact local workbench.
当地每日缝纫次数翻倍|Doubles local daily sewing uses
携带要求|Carrying Requirement
必须放在背包中|Must be in your backpack
捕获消耗|Capture Cost
仅成功捕获时消耗1个笼子|Consumes 1 trap only on a successful capture
物品说明|Item Details
没有找到这件物品的资料|No information found for this item.
当前地块持有|Owned in This Area
保鲜期|Shelf Life
{0}个夜晚|{0} nights
不会腐坏|Does Not Spoil
蓝图说明|Blueprint Details
没有找到这张蓝图的资料|No information found for this blueprint.
制作蓝图|Crafting Blueprint
食物蓝图|Food Blueprint
装备蓝图|Equipment Blueprint
家具蓝图|Furniture Blueprint
设施蓝图|Facility Blueprint
蓝图类型|Blueprint Type
蓝图等级|Blueprint Tier
{3}级|Tier {3}
已经学会|Learned
尚未学会|Not Learned
这件物品已经被移动了|This item has already been moved.
{0}到{1}个夜晚|{0}–{1} nights
新鲜度|Freshness
保存状态|Storage Status
保存规则|Storage Rules
非保鲜状态下过1夜后变成水|Turns into Water after one night without preservation.
保鲜中，热水不会变成水|Preserved: Hot Water stays hot.
热水会在过夜后变成水|Hot Water will turn into Water overnight.
正在保鲜，腐坏时间不会增加|Chilled: spoilage timer paused
还能在非保鲜状态下过夜{0}次|Lasts {0} more nights without chilling
{0}到{1}|{0}–{1}
放到背包保鲜格|Move to Chilled Backpack Slots
放到背包|Move to Regular Backpack Slots
放到衣帽间|Move to Wardrobe
放到种子储存室|Move to Seed Store
放到杂物间|Move to Utility Room
放到本地保鲜库|Move to Local Chilled Storage
放到储物箱|Move to Local Storage
放到地面|Place on Ground
选择装备|Choose Equipment
普通格{0} · 保鲜格{1}|Regular Slots {0} · Chilled Slots {1}
{0}{1}攻击增加{2}|{0}{1}Attack +{2}
{0}级 ·|Tier {0} ·
酸雨体力减免|Acid Rain Stamina Discount
可用{0}件|{0} Available
普通格10 · 保鲜格3{1}|Regular Slots 10 · Chilled Slots 3{1}
· 当前装备|· Currently Equipped
不装备|Unequip
当前已空置|Currently Empty
取下{0}|Remove {0}
选择{0}装备|Choose {0} Equipment
当前：{1}。列表只包含背包和{2}当前地块的装备。|Currently equipped: {1}. Only equipment in your backpack or the current area ({2}) is shown.
已成交|Completed Trade
已撤单|Withdrawn
今日没有可用报价|No Offers Available Today
第{0}封来信|Letter {0}
附送：{0}|Enclosed: {0}
{3}封来信|{3} Letters
尚未收到邮件|No Letters Yet
信箱|Mailbox
这条报价已经失效|This offer is no longer valid.
返回|Back
如果普通库存不足，这次交换会取走今日预留的{0}，并把对应饮食改回未设定。|If regular stock is insufficient, this trade will use today's reserved {0} and clear that food or drink selection.
当前地块与背包中的交换物不足，其他地块的物资不能远程用于交易。|Insufficient goods in this area and your backpack. Supplies in other areas cannot be traded remotely.
查看{3}的说明|View details for {3}
（当前共有{0}份）| (currently own {0})
确认交换|Confirm Trade
你将交出|You Give
你将获得|You Receive
取消|Cancel
请确认|Please Confirm
确认|Confirm
确定交换|Confirm Trade
这里还没有房子|No House Here Yet
先建好房子，才能进行临时加固。|Complete a house before adding temporary reinforcement.
当前加固仍会持续到第{0}天结束；再次加固不会叠加两项设施防护，只会把期限重新计算为连续{1}天。|Current reinforcement lasts through Day {0}. Reinforcing again does not stack either protection bonus; it only resets the duration to {1} consecutive days.
当前体感{0}℃（{1}），施工存在危险。|Feels like {0}°C ({1}). Construction is dangerous.
当前加固的剩余时间已经不少于重新加固后的时间，无需重复消耗材料。|Current reinforcement already lasts at least as long as a new application. No need to spend materials again.
临时加固{0}的房子？|Temporarily Reinforce the House in {0}?
加固后，|Reinforcement adds 20 acid rain and 20 wind protection for facilities in
只有当前地块|this area only
的酸雨设施防护和强风设施防护各增加20，从今天起连续{1}天（第{2}天至第{3}天）。它会同时降低酸雨和强风暴损坏当地室外设施的概率，但不提供保温，也不保护其他地块。|, lasting {1} consecutive days from today (Days {2}–{3}). It reduces damage to local outdoor facilities from both acid rain and storms. It provides no warmth and does not protect other areas.
本次消耗|Cost
{4} · 体力 {5}/{6}{7}|{4} · Stamina {5}/{6}{7}
确定加固|Confirm Reinforcement
（基础2，受当前天气与体感影响）| (base 2, adjusted for weather and feels-like temperature)
结束今天后：|After Today Ends:
结束今天？|End Today?
确定要结束第{0}天，进入第{1}天吗？|End Day {0} and begin Day {1}?
确定进入下一天|Start Next Day
这个资源点已经不存在了|This resource node no longer exists.
拔除后栽培地和温室升级都会永久保留，改种无需再次升级|The plot and its greenhouse upgrade remain permanently after uprooting. No new upgrade is needed when changing crops.
拔除后栽培地会保留下来|The plot remains after uprooting.
拔除家养{0}？|Uproot Cultivated {0}?
{1}，但已经消耗的{2}不会返还。|{1} Spent {2} will not be refunded.
确定拔除|Confirm Uprooting
这块栽培地当前不可用|This plot is unavailable.
这块栽培地已损坏|This Plot Is Damaged
{0}修复后才能播种。|{0}Repair it before planting.
温室升级仍然保留，|The greenhouse upgrade remains. 
这块栽培地已经种了东西|This plot is already planted.
{0}种植会消耗1份种子和1点体力。|{0}Planting costs 1 seed and 1 stamina.
这块栽培地已永久升级为温室，改种后仍受温室保护。|This plot has a permanent greenhouse upgrade. New crops remain protected.
当前地块和背包里没有可播种的种子|No plantable seeds in this area or your backpack.
将家养{0}升级为温室？|Add a Greenhouse to Cultivated {0}?
升级会永久保留在这块栽培地上；以后即使拔除并改种其他作物，仍不受酸雨和酷暑影响。|The upgrade remains permanently on this plot. Even after uprooting and replanting, crops remain protected from acid rain and heat waves.
升级需要|Upgrade Requirements
体力 {3}/{4}|Stamina {3}/{4}
确定升级|Confirm Upgrade
收到新来信|New Letter Received
附送的东西|Enclosed Gifts
恭喜您成功从求生游戏中返回了现实并得到了一个亿的奖金|Congratulations! You escaped the survival game, returned to the real world, and won a prize of 100 million.
恭喜您成功带着所有的朋友从游戏中返回现实，并得到了两个亿的奖金。您带回的朋友有：|Congratulations! You brought your friends out of the game into the real world and won a prize of 200 million. Returning with you:
恭喜您成功带领所有人离开了求生游戏回到了现实，并得到了十个亿的奖金|Congratulations! You led everyone out of the survival game into the real world and won a prize of 1 billion.
归航成功|Home at Last
奖金|Prize
亿元|× ¥100 Million
一同返回现实的朋友|Friends Returning with You
通关记录已保存。可以继续保留这个岛屿进行自由经营。|Your completion record is saved. You can keep playing freely on this island.
继续自由经营|Continue Playing
本次求生结束|Your Survival Run Has Ended
结束原因：{0}|Cause of death: {0}
旧存档未记录具体原因|This older save did not record the cause of death.
在室外行动时未能从致命严寒中幸存|You died from lethal cold while acting outdoors.
在室外行动时未能从致命酷热中幸存|You died from lethal heat while acting outdoors.
露营时未能从致命严寒中幸存|You died from lethal cold while camping overnight.
露营时未能从致命酷热中幸存|You died from lethal heat while camping overnight.
连续3天没有吃饭也没有喝水|You went without both food and water for 3 consecutive days.
连续10天未能同时完成吃饭和喝水|For 10 consecutive days, you missed food, water, or both.
连续3天在无房屋地块经历极端温度（体感0℃及以下或40℃及以上）|You spent 3 consecutive days without a house in extreme feels-like temperatures (0°C or below, or 40°C or above).
连续3天在无房屋地块经历极端温度（体感0℃及以下或40℃及以上），未能活下来|You died after 3 consecutive days without a house in extreme feels-like temperatures (0°C or below, or 40°C or above).
可以读取本日早晨的自动存档重新安排，也可以清除进度从头开始。|Load this morning's autosave to try again, or clear your progress and start over.
重新开始本日|Restart Day
从头开始|New Game
{0}级房屋|Level {0} House
{0} · 尚未开启|{0} · Not Unlocked
岛屿地图|Island Map
点击相邻的已开启地块移动，每格基础消耗1体力。|Tap an adjacent unlocked area to travel. Base cost: 1 stamina per area.
当前位置 {0}|Current Location: {0}
现在不能前往这里|You Can't Travel Here Yet
返回地图|Back to Map
当前体感{0}℃，移动存在危险。|Feels like {0}°C. Travel is dangerous.
前往{0}？|Travel to {0}?
确定要从{1}移动到{2}吗？本次将消耗{3}体力。|Travel from {1} to {2}? This costs {3} stamina.
确定移动|Confirm Travel
每日任务奖励|Daily Task Rewards
海水冲过来了|A Wave Washed Ashore
海水冲走了{0}。|The sea washed away {0}.
猴子来过了|A Monkey Stopped By
猴子拿走了{0}。|A monkey took {0}.
猴子的礼物|A Monkey's Gift
猴子给你送来了礼物，一枚草药种子。|A monkey brought you a gift: one herb seed.
{0}地块 {1}|Area {0}: {1}
第{0}天夜间 ·|Night of Day {0} ·
家养{1}死亡|Cultivated {1} Died
死因：{2}|Cause of death: {2}
原因未记录|Cause Not Recorded
作物死亡|Crop Deaths
原因：{0}|Cause: {0}
家畜跑掉了|Livestock Ran Away
重开一局|Start a New Game
正在结算…|Processing…
已进入第{0}天|Day {0} Begins
今天还不能结束|You cannot end today yet.
过夜结算失败，请重试|Overnight processing failed. Please try again.
当前体感{0}℃（{1}），本次总计消耗{2}体力。{3}|Feels like {0}°C ({1}). Total stamina cost: {2}. {3}
仍要继续吗？|Continue anyway?
行动失败|Action Failed
归航启动期间无法离开据点或处理其他工作|You cannot leave the base or do other work during launch.
清除当前进度并重新开始？|Clear your current progress and start a new game?
放弃第{0}天的当前进度，重新从本日早晨开始？本次重新开始会重新生成随机结果。|Discard your current progress on Day {0} and restart from this morning? Random outcomes will be rerolled.
没有可读取的本日自动存档|No autosave available for this morning.
已重新开始第{0}天|Restarted Day {0}
本日自动存档无法读取|This morning's autosave could not be loaded.
请先处理今日归航故障或中止启动|Resolve today's launch fault or abort the launch first.
查看游戏信息|View Game Info
主要功能|Main Navigation
被扔进一个求生游戏|Dropped Into Survival
设施|Facilities
物资|Supplies
交易|Trade
进入下一天|Next Day
日结|End of Day
结束今天时|At Day's End
不小于|at least
不大于|at most
钢制生存护具·{0}|Steel Survival Armor · {0}
雪地鞋|Snowshoes
你在D4的露天地面醒来。天黑前，最好先想办法搭起一顶茅草帐篷。|You wake up on the bare ground in D4. Better find a way to build a thatch tent before nightfall.
你听到了一个声音：“活下去并通关赢得奖金返回现实吧。”|You hear a voice: “Survive, complete the game, win the prize money, and return to reality.”
暂不支持此存档版本|This save version is not supported.
暂不支持此存档格式|This save format is not supported.
已有永久避难所|Permanent Shelter Already Built
已有{0}|Already Have {0}
{0}建成|{0} Completed
铁撬棍|Iron Crowbar
钢制生存护具|Steel Survival Armor
羊毛衬里皮甲|Wool Lined Leather Armor
羊毛温暖套装|Warm Wool Outfit
透气皮甲|Breathable Leather Armor
风暴铁甲|Storm Iron Armor
防风衣|Windbreaker
耐热钢甲|Heat-Resistant Steel Armor
淬毒连弩|Poisoned Repeating Crossbow
小雨|Light Rain
大雨|Heavy Rain
暴雨|Downpour
{0}：{1}因总燃料槽不足自动关闭|{0}: {1} switched off automatically because the shared fuel reserve was insufficient.
总燃料槽|Shared Fuel Reserve
{0}：{1}因{2}不足自动关闭|{0}: {1} switched off automatically due to insufficient {2}.
环境温度|Ambient Temperature
装备保暖|Equipment Warmth
装备防热|Equipment Heat Protection
房屋保暖|House Warmth
家具/设施保暖|Furniture / Facility Warmth
昨日饮食|Yesterday's Diet
饮食保暖|Dietary Warmth
角色额外保暖|Extra Character Warmth
角色保暖|Character Warmth
家具/设施防热|Furniture / Facility Heat Protection
饮食防热|Dietary Heat Protection
角色额外防热|Extra Character Heat Protection
角色防热|Character Heat Protection
舒适温度调整限制|Comfortable Temperature Adjustment Limit
规则限制|Rule Limit
{0}与归航基地|{0} and Homeward Base
舒适|Comfortable
负荷|Strain
危险|Dangerous
致命|Lethal
和|and
{0}遭遇{1}，生病了|{0}, you encountered {1} and fell ill.
在室外探索或采集时|While exploring or gathering outdoors
在无房屋地块行动时|While acting in an area without a house
体力不足，需要{0}|Insufficient stamina. Requires {0}.
你没能从极端温度中活下来。|You did not survive the extreme temperature.
极端温度使你{0}。|The extreme temperature caused {0}.
受伤|injury
生病|illness
得到{0}|Received {0}
取得{0}|Obtained {0}
背包保鲜格|Chilled Backpack Slots
背包普通格|Regular Backpack Slots
{0}储物|{0} Storage
{0}保鲜库|{0} Chilled Storage
{0}地面|{0} Ground
{0}已满，预留的{1}已放到{2}地面。|{0} is full. The reserved {1} was placed on the ground in {2}.
{0}：旧滴灌架储水{1}份已转回当地普通储物格{2}|{0}: {1} water from the old drip irrigation reserve was returned to local regular storage{2}.
，其中{0}份因储物格已满放到地面|; {0} was placed on the ground because storage was full
徒手|Bare Hands
已损坏|Damaged
未开启|Off
木针或铁针|Wooden or Iron Needle
针具|Needles
未摆放|Not Placed
需要当地摆放{0}|Requires {0} placed locally.
火源已损坏|Heat Source Damaged
缺少火源|Heat Source Needed
{0}必须配合当地未损坏的篝火或柴火灶才可以使用|{0} requires an intact local campfire or wood stove.
加工|Process
烹饪|Cook
制作|Craft
未知配方|Unknown Recipe
尚未获得蓝图|Blueprint Not Obtained
当地缺少该设备的前置工坊|The required local workshop is missing.
当地缺少{0}|Missing local {0}.
需要当地{0}|Requires local {0}.
{0}今日次数已用完|No uses left today for {0}.
需要当地总燃料槽；建成或摆放需要燃料的设施、家具后会自动出现|A local shared fuel reserve is required. It appears automatically when you build or place a facility or furnishing that uses fuel.
当地燃料点不足，使用{0}一次需要{1}点|Insufficient local fuel. One use of {0} requires {1} points.
材料不足|Insufficient Materials
制作了{0}。|Crafted {0}.
这不是燃料|This is not fuel.
建成或摆放需要燃料的设施、家具后才会自动出现当地总燃料槽|The local shared fuel reserve appears when you build or place a facility or furnishing that uses fuel.
燃料不足|Insufficient Fuel
{0}加入当地燃料槽，现有{1}点。|Added {0} to the local fuel reserve. Current total: {1} points.
滴灌架会直接使用当地普通储物格中的水，无需装填|Drip irrigation uses water directly from local regular storage. No loading needed.
这种物资不能放入自动农务设施|This material cannot be loaded into an automated farming facility.
当地没有{0}|No {0} in this area.
{0}不足|Insufficient {0}
{0}×{1}加入{2}，设施内现有{3}份。|Added {0} ×{1} to {2}. It now holds {3} units.
已加入{0}×{1}|Added {0} ×{1}
当地没有房屋|No Local House
这件物品不能摆放|This item cannot be placed.
当地房屋等级不足|Local house level is too low.
物品不在当地或背包|This item is not in the area or your backpack.
房间已经摆满了，先收起一些家具吧。|The room is full. Pack away some furniture first.
柴草床、木床和羽毛床只能摆放一张|Only one bed may be placed, whether straw, wooden, or feather.
浴缸和按摩浴缸只能摆放一个|Only one bathtub or whirlpool tub may be placed.
同名家具在一个地块只摆放一件|Only one furnishing of each name may be placed in an area.
{0}已摆放在{1}。|Placed {0} in {1}.
当地普通储物格中没有水|No water in local regular storage.
当地普通储物格中的水不足，开启{0}需要{1}份水|Insufficient water in local regular storage. Turning on {0} requires {1} water.
当前没有{0}|No {0} Available
当前{0}不足，开启{1}需要{2}份{3}|Insufficient {0}. Turning on {1} requires {2} {3}.
当地还没有需要燃料的设施或家具|No local facilities or furniture require fuel yet.
总燃料槽不足，开启{0}需要{1}点燃料|Insufficient fuel in the shared reserve. Turning on {0} requires {1} fuel points.
{0}已开启，将在结束今天时按自动用水顺序扣除运行资源|{0} is on. Running resources will be consumed at day's end in the automatic watering order.
{0}已开启，今天不会再次扣运行资源|{0} is on. No further running resources will be charged today.
这件家具摆放后始终生效，不需要开关|This furnishing is always active when placed. No switch needed.
家具损坏，修复后才能开启|This furnishing is damaged. Repair it before switching it on.
当地没有该物品|This item is not in the area.
便携生产工具摆放后始终可用，不需要开关|Portable production tools are always available when placed. No switch needed.
{0}已关闭|{0} switched off.
{0}已开启|{0} switched on.
这座设施不需要开关|This facility does not need a switch.
设施尚未建成|Facility Not Completed
设施损坏，修复后才能开启|This facility is damaged. Repair it before switching it on.
当地没有可供采矿机开采的矿种|No ore here is compatible with mining machines.
当地需先摆放{0}|Place {0} locally first.
必须有本地储存空间才可以运行|Local storage is required to operate.
{0}已收起并放到{1}地面。|Packed away {0} and placed it on the ground in {1}.
{0}已收起并放到地面|Packed away {0} and placed it on the ground.
{0}容量减少，{1}已放到{2}地面。|{0} capacity decreased. {1} was placed on the ground in {2}.
储物|Storage
保鲜|Chilled
储物箱已收起，箱内的{0}已放到地面|Storage chest packed away. Its contents, {0}, were placed on the ground.
冰箱已收起，超出保鲜容量的{0}已放到地面|Refrigerator packed away. {0}, exceeding chilled capacity, was placed on the ground.
这件物品不能直接装备|This item cannot be equipped directly.
背包内物资超过{0}的容量，请先把一部分物资放到地面或储物处|Your supplies exceed the capacity of {0}. Move some to the ground or storage first.
未知装备位置|Unknown Equipment Slot
系统小背包装不下当前物资，请先把一部分物资放到地面或储物处|The starter backpack cannot hold your supplies. Move some to the ground or storage first.
当前没有伤势|You are not injured.
今天已经使用过伤药了|You have already used wound medicine today.
缺少{0}|Missing {0}
已使用{0}，伤势减轻{1}级{2}|Used {0}, healing {1} injury levels{2}.
（医务室加成1级）| (includes +1 from the infirmary)
当前没有疾病|You are not ill.
缺少药剂|Medicine Needed
无法使用|Cannot Use
全岛可支配电力不足，开启还需要{0}点电|Insufficient available island power. Needs {0} more power to switch on.
必须在已建成配电室的地块操作|Operate from an area with a completed power distribution room.
没有该电网设备|Grid Device Not Found
只能在{0}建造|Can only be built in {0}.
或|or
任意地块需先建成永久避难所|Complete a permanent shelter in any area first.
全岛前置设施不足|Islandwide prerequisites are missing.
当地前置设施不足|Local prerequisites are missing.
当地任选前置设施不足|Not enough optional local prerequisites.
当地进阶前置设施数量不足|Not enough advanced local prerequisites.
需要当地已建成自动施肥箱和栽培地|Requires a completed local automatic fertilizer box and growing plot.
这块栽培地的自动施肥已{0}|Automatic fertilization for this plot is now {0}.
开启|On
关闭|Close
未知作物|Unknown Crop
当地没有空种植位|No empty growing space in this area.
缺少种子|Seeds Needed
{0}已种下，形成家养{1}|Planted {0}, creating cultivated {1}.
这个资源点已经长满，无需浇水|This node is fully grown and needs no watering.
今天已经浇过水|Already Watered Today
需要水×{0}和体力0.2|Requires Water ×{0} and 0.2 stamina.
今天不能再施肥|Cannot fertilize again today.
丰饶已经满了，无需施肥|Abundance is at maximum. No fertilizer needed.
需要肥料×1和体力0.2|Requires Fertilizer ×1 and 0.2 stamina.
资源点尚未成熟|This resource node is not mature yet.
体力不足，需要0.5|Insufficient stamina. Requires 0.5.
从家养{0}取得{1}×{2}{3}。|Harvested {1} ×{2} from cultivated {0}{3}.
这个家养资源点已经不存在了|This cultivated node no longer exists.
拔除了家养{0}，栽培地重新空了出来。|Uprooted cultivated {0}. The plot is empty again.
作物|Crop
已经拔除，种子不会返还|Uprooted. Seeds are not refunded.
尚未获得温室蓝图|Greenhouse Blueprint Not Obtained
这块栽培地已经是温室|This plot already has a greenhouse.
没有找到这块栽培地|Growing Plot Not Found
升级温室的材料不足|Insufficient materials for a greenhouse upgrade.
{0}的一块栽培地升级成了温室。|Upgraded a growing plot in {0} to a greenhouse.
这块栽培地已升级为温室|This plot has been upgraded to a greenhouse.
{0}：滴灌架自动浇水{1}处，消耗水{2}|{0}: drip irrigation watered {1} plots, using {2} water.
{0}：另有{1}处因当地普通储物格水不足未浇灌|{0}: {1} more plots were not watered due to insufficient water in local regular storage.
{0}：自动施肥箱为{1}处家养资源点施肥，消耗肥料{2}|{0}: the automatic fertilizer box treated {1} cultivated nodes, using {2} fertilizer.
{0}：另有{1}处因自动施肥箱存料不足未施肥|{0}: {1} more plots were not fertilized because the box had insufficient fertilizer.
未知动物|Unknown Animal
当地栏舍已满|Local Pens Are Full
这座栏舍当前不可用|This pen is unavailable.
这座栏舍已经不存在了|This pen no longer exists.
栏舍已损坏，修复后才能喂养|This pen is damaged. Repair it before feeding.
没有需要喂养的动物|No Animals Need Feeding
饲料或体力不足|Insufficient Feed or Stamina
动物|Animal
攻击|Attack
资源点尚未发现|Resource Node Not Discovered
等待恢复|Waiting to Restock
这个资源点已经采完了|This resource node is depleted.
加强版强风暴期间禁止采集|Gathering is blocked during intense storm winds.
缺少可用工具|No Usable Tool
你的有效攻击{0}低于{1}的攻击{2}，攻击失败并受伤了|Your effective attack ({0}) is below {1}'s attack ({2}). You lost and were injured.
你的有效攻击{0}与{1}的攻击{2}相同，双方僵持，什么也没有发生|Your effective attack ({0}) equals {1}'s attack ({2}). Stalemate; nothing happened.
；消耗{0}×1|; consumed {0} ×1
成功攻击{0}，{1}{2}。|Defeated {0}: {1}{2}.
没有取得战利品|No loot obtained
；{0}捕获了{1}{2}|; {0} captured {1}{2}
打开沉船宝箱。|Opened the shipwreck chest.
{0}蓝图|{0} Blueprint
设施需要空间稳定模块和世界坐标模块|The facility requires the Spatial Stabilization Module and World Coordinate Module.
神秘设施完成检测：取得归航核心与归航塔蓝图。|Mysterious facility scan complete: obtained the Homeward Core and Homeward Tower blueprint.
得到归航核心×1、归航塔蓝图|Received Homeward Core ×1 and the Homeward Tower blueprint.
在{0}取得{1}×{2}。|Gathered {1} ×{2} at {0}.
同时取得{0}×{1}。|Also obtained {0} ×{1}.
拔草时还找到了{0}×1。|Also found {0} ×1 while gathering grass.
鱼获中还有虾×1。|The catch also included Shrimp ×1.
地图开启：{0} {1}。|Area unlocked: {0} {1}.
先看看已经发现的东西吧。|Check what you've already discovered first.
木屋方案|Wooden House Plans
木板蓝图|Planks Blueprint
必然获知：{0}。|Guaranteed discovery: {0}.
探索了{0} {1}，{2}。{3}|Explored {0} {1}: {2}. {3}
发现了{0}|discovered {0}
没有发现新的资源点|No new resource nodes found
焦黑石柱之间散落着雷击形成的玻璃结晶。|Glass crystals formed by lightning lie scattered between the blackened pillars.
探索途中遭到{0}主动袭击，战斗立即开始。|While exploring, {0} attacked you. Combat began immediately.
发现特殊地点：{0}|Special location found: {0}
发现新资源点：{0}|New resource node found: {0}
本次探索没有发现新资源点|No new resource nodes found on this exploration.
遭到{0}袭击，战斗胜利{1}，获得{2}|Attacked by {0}. You won{1} and received {2}.
但受伤| but were injured
无战利品|No Loot
遭到{0}袭击，双方攻击相同，僵持后分开|Attacked by {0}. Equal attack led to a stalemate, and you parted ways.
遭到{0}袭击，攻击不足，战斗失败{1}|Attacked by {0}. Your attack was insufficient. You lost{1}.
并受伤{0}层| and suffered {0} injury levels
你已经在这个地块|You are already in this area.
该地块尚未开启|This area is not unlocked yet.
两地之间没有可通行路线|No passable route connects these areas.
前往该地块需要背包里携带皮划艇|Carry a kayak in your backpack to travel here.
移动到{0} {1}。|Moved to {0} {1}.
未知敌人|Unknown Enemy
{0}已经被击败|{0} has already been defeated.
这里已经没有这只动物了|This animal is no longer here.
{0}使你受伤{1}层。|{0} inflicted {1} injury levels.
{0}×1（稀有）|{0} ×1 (Rare)
击败{0}，获得{1}。|Defeated {0} and received {1}.
无额外掉落|No Extra Drops
你的有效攻击与{0}相同，双方僵持后分开。|Your effective attack equals {0}'s. After a stalemate, you parted ways.
攻击不足，未能击败{0}。|Insufficient attack. You failed to defeat {0}.
击败{0}，获得{1}|Defeated {0} and received {1}.
与{0}僵持，什么也没有发生|Stalemate with {0}. Nothing happened.
未能击败{0}，受伤{1}层|Failed to defeat {0}. Suffered {1} injury levels.
未知工程|Unknown Construction Project
温室需要在栽培地上升级|Add a greenhouse by upgrading a growing plot.
当前条件不能施工此项目|Current conditions do not allow this construction.
此地不能建房|Houses Cannot Be Built Here
当地缺少所需生产设备|Required local production equipment is missing.
已经完成|Already Completed
石屋建成|Stone House Completed
船工台建成|Boatbuilding Bench Completed
在{0} {1}建好了{2}。|Completed {2} in {0} {1}.
{0}施工{1}/{2}。|{0}: construction {1}/{2}.
设施无需修复|This facility needs no repairs.
修复材料不足|Insufficient Repair Materials
当前地块还没有可以加固的房子|No house to reinforce in this area.
当前地块的临时加固仍完整有效，无需重复加固|Local temporary reinforcement is still fully active. No need to repeat it.
临时加固需要木材×5、木板×3|Temporary reinforcement requires Wood ×5 and Planks ×3.
当地从今天起连续{0}天酸雨设施防护和强风设施防护各增加20|Local facilities gain 20 acid rain protection and 20 wind protection for {0} consecutive days from today.
这不是可直接食用的物品|This item cannot be consumed directly.
没有可预留的这件物品|None of this item is available to reserve.
未知饮食类型|Unknown Diet Type
该物品没有被今日饮食预留|This item is not reserved for today's food or drink.
采集|Gather
采集{0}{1}份|Gather {0} ×{1}
烹饪{0}次|Cook {0} Times
设定今日食物|Choose Today's Food
设定今日饮料|Choose Today's Drink
设定幸福度不小于2的今日食物|Choose Food with at Least 2 Happiness
设定幸福度不小于2的今日饮料|Choose a Drink with at Least 2 Happiness
结束今天时体温处于舒适状态|End Today at a Comfortable Temperature
结束今天时位于有房地块|End Today in an Area with a House
完成1次加工|Process Once
完成1次制作|Craft Once
完成1次施工|Build Once
完成1次探索|Explore Once
给家养资源点浇水1次|Water a Cultivated Node Once
喂养任意栏舍|Feed Any Pen
收获家养资源点1次|Harvest a Cultivated Node Once
结束今天时剩余体力不小于1|End Today with at Least 1 Stamina
修复1个设施|Repair One Facility
开启环境设备并结束今天|Turn On a Climate Device and End Today
完成{0}次探索|Explore {0} Times
饮食|Food and Drink
环境|Environment
生产|Production
烹饪1次|Cook Once
施工|Build
完成3次探索|Explore 3 Times
经营|Management
维护|Maintenance
今天的十连抽已经领取过了|Today's ten draws have already been claimed.
完成三个每日任务后才能抽取奖励|Complete all three daily tasks to draw rewards.
领取每日任务十连抽：获得{0}张蓝图和{1}组素材。|Claimed the daily ten draws: {0} blueprints and {1} material bundles.
每日任务|Daily Tasks
未知来源|Unknown Source
从{0}获得蓝图：{1}。|Obtained a blueprint from {0}: {1}.
未进食|No Food
未饮水|No Drink
报价已经失效|Offer Expired
这条报价包含不可交易的物品，已经失效|This offer includes untradeable items and is no longer valid.
NPC不再出售珍稀素材|NPCs no longer sell rare materials.
这条报价的食物或饮料幸福度低于昨日饮食，已经失效|This offer's food or drink provides less happiness than yesterday's diet and is no longer valid.
已持有更高级的同类物品，这条报价已失效|You already own a better item of this type. This offer is no longer valid.
近战武器之间、远程武器之间不能互换|Melee weapons cannot be traded for other melee weapons, nor ranged weapons for other ranged weapons.
交换物不足|Insufficient Trade Goods
这笔交换会取走今日预留的{0}，并把对应饮食改回未设定。|This trade will take today's reserved {0} and clear that food or drink selection.
与{0}交易：交出{1}×{2}，获得{3}×{4}。|Traded with {0}: gave {1} ×{2}, received {3} ×{4}.
交易完成，已获得{0}蓝图|Trade complete. Obtained {0} Blueprint.
交易完成，获得{0}×{1}|Trade complete. Received {0} ×{1}.
抗风保温钢甲完整五件|Full Five Piece Windproof Insulated Steel Armor Set
防风衣完整五件|Full Five Piece Windbreaker Set
风暴铁甲完整五件|Full Five Piece Storm Iron Armor Set
羽绒温暖套装完整五件|Full Five Piece Warm Down Outfit
羊毛温暖套装完整五件|Full Five Piece Warm Wool Outfit
羊毛衬里皮甲完整五件|Full Five Piece Wool Lined Leather Armor Set
茶树、咖啡、柠檬、香蕉种子各×2|Tea, Coffee, Lemon, and Banana Seeds ×2 Each
茶树种子|Tea Seeds
茶叶种子|Tea Seeds
咖啡种子|Coffee Seeds
咖啡豆种子|Coffee Seeds
邮件不存在|Letter Not Found
附件已经领取|Attachments Already Claimed
收到{0}的礼物（第{1}封来信）：{2}。|Received a gift from {0} (Letter {1}): {2}.
通关记录已保存|Completion Record Saved
归航基地|Homeward Base
归航塔基|Tower Foundation
钢铁塔身|Steel Tower Body
能源阵列|Power Array
冷却系统|Cooling System
计算中心|Computing Center
通讯阵列|Communications Array
核心安装|Core Installation
尚未取得归航塔蓝图|Homeward Tower Blueprint Not Obtained
当地必须先建成永久避难所|Complete a permanent shelter in this area first.
归航塔已经锁定在其他地块|The Homeward Tower is assigned to another area.
必须位于选定的归航塔地块|You must be in the designated Homeward Tower area.
未知归航工程|Unknown Homeward Project
该归航工程已经完成|This homeward project is already complete.
前一阶段尚未完成|Previous Stage Not Completed
当地缺少机械工坊|A local machine shop is missing.
当地缺少已建成的气象站|A completed local weather station is missing.
幸存者连接网尚未达到100%（需完成40次交易、与6位角色交易）|The survivor network has not reached 100% (requires 40 trades and trading with 6 characters).
当地材料不足|Insufficient Local Materials
归航塔（核心安装完成）|Homeward Tower (Core Installed)
归航塔尚未完成核心安装|The Homeward Tower's core is not installed yet.
坐标运算和广播已经完成|Coordinate Computation and Broadcasts Completed
今天已进行坐标运算和广播，请明天继续|You already computed coordinates and broadcast today. Continue tomorrow.
需要全岛可支配电力10、燃油1|Requires 10 available island power and 1 fuel oil.
在{0} {1}发送了归航广播（第{2}次坐标运算和广播）。|Sent a homeward broadcast from {0} {1} (coordinate computation and broadcast #{2}).
再进行两次坐标运算和广播即可离开此处|Two more coordinate computations and broadcasts, and you can leave.
再进行一次坐标运算和广播即可离开此处|One more coordinate computation and broadcast, and you can leave.
请在核心安装完成后进行坐标运算和广播|Install the core before computing coordinates and broadcasting.
信号漂移|Signal Drift
塔身松动|Loose Tower Structure
冷却管堵塞|Blocked Coolant Pipe
电力浪涌|Power Surge
坐标重新校准|Coordinate Recalibration
塔基裂缝|Cracked Foundation
当前没有进行中的归航启动|No Homeward Launch in Progress
已中止本次启动，归航塔与关键物不受损|Launch aborted. The tower and key items are undamaged.
尚未通关|Game Not Completed Yet
{0}：{1}腐坏×{2}|{0}: {1} ×{2} spoiled.
{0}：干净冰融化×{1}|{0}: Clean Ice ×{1} melted.
{0}：热水冷却成水×{1}|{0}: Hot Water ×{1} cooled into Water.
海水冲走了|Washed away by the sea
猴子拿走了|Taken by a monkey
{0}：采矿机产出{1}×{2}，已收入当地储物格|{0}: mining machines produced {1} ×{2}, placed in local storage.
{0}：采矿机因当地普通储物格已满而停产|{0}: mining machines stopped because local regular storage was full.
{0}：{1}因全岛电力不足{2}断电，本日停机|{0}: {1} lost power {2} due to insufficient island supply and stopped for the day.
随机|at random
全岛可支配电力不足，共有{0}件电器在本次过夜结算中断电|Insufficient island power. {0} appliances lost power overnight.
{0}：家养{1}在酸雨中因丰饶已经为0而死亡|{0}: cultivated {1} died in acid rain because its abundance was already zero.
酸雨侵蚀时丰饶已为0|Abundance was already zero when acid rain struck.
家养{0}死亡：{1}|Cultivated {0} died: {1}
{0}：家养{1}受酸雨影响，丰饶降低{2}点|{0}: acid rain reduced cultivated {1}'s abundance by {2}.
{0}：家养{1}已经长满（{2}/{3}）|{0}: cultivated {1} is fully grown ({2}/{3}).
{0}：自动喂食机按猪、牛、羊、鸡的顺序喂养{1}座栏舍，消耗饲料{2}|{0}: automatic feeders fed {1} pens in the order pigs, cattle, sheep, chickens, using {2} feed.
{0}：{1}座栏舍因损坏未自动喂养，请先修复|{0}: {1} damaged pens were not fed automatically. Repair them first.
{0}：另有{1}座栏舍因当地普通储物格饲料不足未喂养|{0}: {1} more pens were not fed due to insufficient feed in local regular storage.
一直没有吃的，养的{0}全跑掉了|With no food for so long, all your {0} ran away.
一直没有吃的，养的{0}有{1}群跑掉了|With no food for so long, {1} groups of your {0} ran away.
连续{0}天未喂养|Not fed for {0} consecutive days
{0}：{1}受酸雨损坏|{0}: {1} was damaged by acid rain.
{0}：{1}受损|{0}: {1} was damaged.
食物|Food
饮料|Drink
今日{0}未设定|Today's {0} Is Not Selected
将在室外露营：体感{0}℃（{1}）、休息环境-2{2}|You will camp outdoors. Feels-like temperature: {0}°C ({1}). Happiness from sleeping conditions: −2.{2}
将在室外露营：体感{0}℃（{1}）、休息环境-2、50%温度伤病率|You will camp outdoors. Feels-like temperature: {0}°C ({1}). Happiness from sleeping conditions: −2. Temperature-related injury or illness risk: 50%.
将在室外露营：体感{0}℃（{1}）、休息环境-2、{2}%死亡率，存活后必得温度伤病|You will camp outdoors. Feels-like temperature: {0}°C ({1}). Happiness from sleeping conditions: −2. Death risk: {2}%. Survivors always suffer a temperature-related injury or illness.
、50%温度伤病率|, 50% chance of temperature related injury or illness
、{0}%死亡率，存活后必得温度伤病|, {0}% chance of death; survivors always suffer temperature related injury or illness
全岛可支配电力不足：发电{0}点、已占用{1}点，过夜时会随机让部分电器断电|Insufficient island power: supply {0}, usage {1}. Some appliances will lose power at random overnight.
{0}自动用水不足：当地库存{1}份＋今晚预计产水{2}份，需要{3}份，缺{4}份|{0}: automatic water shortage. Local stock {1} + expected production tonight {2}; needs {3}, short by {4}.
{0}自动燃料不足：总燃料槽有{1}点，需要{2}点，缺{3}点|{0}: automatic fuel shortage. Shared reserve {1}; needs {2}, short by {3}.
{0}自动喂食饲料不足：当地普通储物格有{1}份，需要{2}份，缺{3}份|{0}: automatic feed shortage. Local regular stock {1}; needs {2}, short by {3}.
保暖|Warmth
防热|Heat Protection
防雨|Rain Protection
防风|Wind Protection
强攻组合：可挑战高一级敌人|Attack Combo: Can Challenge Enemies One Tier Higher
今日十连抽奖励还没有领取，请先点击每日任务里的抽奖按钮|Today's ten draws have not been claimed. Use the lottery button under Daily Tasks first.
{0}，仍要进入下一天吗？|{0}. Start the next day anyway?
结束今天时食用了{0}（幸福度{1}{2}）。|Ate {0} at day's end (happiness {1}{2}).
结束今天时饮用了{0}（幸福度{1}{2}）。|Drank {0} at day's end (happiness {1}{2}).
背包|Backpack
猴子送来草药种子×1|A monkey brought Herb Seeds ×1.
收到猴子的礼物：草药种子×1。|Received a monkey's gift: Herb Seeds ×1.
露营时遭受温度伤病|Suffered temperature related injury or illness while camping.
未能在致命温度的露营中幸存|Did not survive camping at a lethal temperature.
熬过了致命温度的露营，但必然受到温度伤病|Survived camping at a lethal temperature, but suffered the inevitable temperature related injury or illness.
连续3天保留体力后自然恢复一层伤势|Naturally healed 1 injury level after ending 3 consecutive days with stamina left.
医务室护理使伤势减轻一层|Infirmary care healed 1 injury level.
在医务室连续养病2天后痊愈|Recovered from illness after 2 consecutive days of infirmary care.
连续舒适作息3天后自然痊愈|Naturally recovered from illness after 3 consecutive comfortable days.
收到关系邮件|Received a Relationship Letter
剩余体力充足|Enough Stamina Left
体力耗尽|Stamina Exhausted
露营过夜|Camped Outdoors
体感温度不适|Uncomfortable Temperature
受伤{0}层|{0} Injury Levels
连续3天没有吃饭也没有喝水，未能活下来|You died after 3 consecutive days without food or drink.
连续10天未能同时完成吃饭和喝水，未能活下来|You died after 10 consecutive days without both eating and drinking each day.
次日饮食加成：{0}|Next Day Diet Bonuses: {0}
进入第{0}日。幸福度{1}{2}，体力恢复至{3}。|Day {0} begins. Happiness {1}{2}; stamina restored to {3}.
无效的搬运位置|Invalid Transfer Location
物品已经不在原处|This item is no longer in its original location.
在这片水域不能把皮划艇从背包放到地面|You cannot take the kayak out of your backpack while in this water area.
衣帽间只能存放武器、护具和背包|Wardrobes hold only weapons, armor, and backpacks.
种子储存室只能存放种子|Seed stores hold only seeds.
杂物间只能存放家具和工具|Utility rooms hold only furniture and tools.
没有腐坏期限的物品不能放入保鲜格|Nonperishable items cannot be placed in chilled slots.
目标位置没有空格|No Free Slots at the Destination
无效的排序位置|Invalid Reorder Position
搬运了{0}×{1}。|Moved {0} ×{1}.
未知区域|Unknown Area
武器|Weapons
装备|Equipment
工具|Tools
家具|Furniture
蓝图|Blueprints
种子|Seeds
珍稀素材|Rare Materials
基础素材|Basic Materials
加工素材|Processed Materials
食材|Ingredients
美食|Prepared Food
每步消耗：|Cost per Step:
明日{0}|Tomorrow: {0}
动物攻击{0} · 弱{1}：同级{2}武器可胜，同级另一类武器会失败{3}{4}|Animal Attack {0} · Weak to {1}: a same tier {2} weapon wins; the other weapon type at that tier loses{3}{4}
战利品：{0}|Loot: {0}
可能取得：{0}|Possible finds: {0}
背包携带{0}时有{1}%几率额外捕获{2}；成功捕获后消耗1个{3}，未捕获时不消耗|Carry {0} in your backpack for a {1}% chance to catch {2}. A successful catch consumes 1 {3}; an unsuccessful attempt consumes none.
当前每日消耗{0}点|Current Daily Use: {0}
已开启设施用水：{0}；今晚设施产水：{1}。只使用当地普通储物格；结算顺序：{2} ·|Active facilities use: {0}; tonight's water production: {1}. Uses only local regular storage. Processing order: {2} ·
。设施会在自动扣水前先产水。|. Facilities produce water before automatic use.
· 已占用{0}点 ·|· Used: {0} ·
近战{0}级|Tier {0} Melee
远程{0}级|Tier {0} Ranged
攻击增加{0}|Attack +{0}
动物攻击{0}|Animal Attack {0}
弱{0}：同级{1}武器可胜，同级另一类武器会失败|Weak to {0}: a same tier {1} weapon wins; the other weapon type at that tier loses.
这块栽培地的自动施肥已关闭|Automatic fertilization for this plot is now off.
这块栽培地的自动施肥已开启|Automatic fertilization for this plot is now on.
运行：关闭|Status: Off
运行：开启|Status: On
关闭{0}|Turn Off {0}
开启{0}|Turn On {0}
成品食物|Prepared Food
衣物|Clothing
选择语言 / Choose Language|Choose Language
体力{0}（基础{1}，受当前天气与体感影响）|Stamina {0} (base {1}, adjusted for current weather and temperature)
正常运行时每台每日采集{0}个{1}|Each operating machine gathers {0} {1} daily
需要至少一级房屋，仅能在铁矿、铜矿或煤矿地块建造；必须有本地储存空间才可以运行；每座每天耗电{0}，供电优先度最低；正常运行时每台每日采集{1}个{2}。建成后不会损坏。|Requires at least a level 1 house. Build only in iron, copper, or coal areas. Needs local storage to run. Each uses {0} power daily, at the lowest priority, and gathers {1} {2} per day while operating. Cannot be damaged once completed.
{0}探索度提升至{1}%。|Exploration in {0} increased to {1}%.
发现资源点：{0}。|Discovered a resource site: {0}.
{0}的{1}建造完成。|Construction of {1} in {0} is complete.
必然获知：{0}。|Guaranteed discovery: {0}.
地图开启：{0}。|New area revealed: {0}.
制作了{0}×{1}。|Crafted {0} ×{1}.
当前：未装备。列表只包含背包和{0}当前地块的装备。|Currently equipped: None. Only equipment in your backpack or the current area ({0}) is shown.
摆放在当地、开启、供水充足|Placed in the current area, switched on, and supplied with enough water
摆放在当地、开启、正常供电|Placed in the current area, switched on, and supplied with power
摆放在当地、开启、燃料充足|Placed in the current area, switched on, and supplied with enough fuel
`.trim().split('\n').map(line => line.split('|'));
