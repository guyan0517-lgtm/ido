import { ITEM_DESCRIPTIONS, ITEM_USAGE_DESCRIPTIONS, BLUEPRINT_DESCRIPTIONS } from './item-descriptions.js';

const rows = text => text.trim().split('\n').map(line => line.split('|'));
export const EN_ITEM_TEXT = Object.fromEntries(rows(`
apple|Wild and a little sour, but at least it fills my stomach.
mushroom|These aren't poisonous... right?
carrot|Whenever I eat one raw, I imagine I'm a rabbit.
potato|A quick roast turns this into a proper staple.
tomato|How did such bright red tomatoes end up on a deserted island?
corn|Now that I have corn, can I make something a little fancier?
blueberry|Not very sweet, but food is food.
banana|Ooh ooh! I'm a happy little monkey.
pumpkin|Something this big has to be filling.
onion|I'm not crying because of the onion. I'm homesick.
lemon|Smells lovely, but it's far too sour to eat on its own.
cheese|An ingredient for cooking. Cannot be eaten directly.
rice|REAL! WHITE! RICE!
bread|Smells amazing fresh from the oven. Gets a bit hard if I leave it too long.
dried_meat|Tough to chew, but at least it won't spoil.
dried_fish|Doesn't smell great, but tastes all right.
roast_potato|Nice and hot. A little pepper would make it even better... Who am I kidding?
boiled_egg|Finally, something with proper nutrition.
roast_mushroom|Smells wonderful... Hopefully I won't start seeing tiny people afterward.
roast_pumpkin|I'm eating my fill today.
roast_fish|Fish is still meat. There isn't much seasoning, but I'm happy to have meat at all.
roast_shrimp|Honestly, I prefer grilled fish. Shrimp doesn't have much fat. Still, stranded here, I can't be picky.
roast_marten|Roasted meat makes me happy.
sashimi|Please don't have parasites... Stomach first, worries later.
honey_apple|Sweet and refreshing.
honey_blueberry|Honey adds a few more calories. Feels like my stamina might last a little longer.
honey_banana|I'm eating better than the monkeys.
mushroom_soup|Lovely and warm. Makes me feel all floaty... That's not poisoning, is it?
fish_soup|Delicious. Today, I'm a three Michelin star chef.
tomato_egg_soup|This tastes like home.
corn_cake|Full stomach, stronger body. That's the feeling.
apple_jam_bread|Reminds me of breakfast before elementary school.
blueberry_jam_bread|My jam turned out pretty well.
roast_chicken|Chicken wings are my favorite.
fish_rice|Meat and rice. I'm finally living well.
rice_ball|Fish wrapped in vinegared rice. Perfect for taking on the road.
egg_sandwich|With this, I can almost pretend I'm on a picnic instead of stranded on an island.
butter_bread|Much better than the bread they serve on planes.
corn_chowder|Warms me right up.
roast_pork|BIG. BITES. OF. MEAT.
roast_beef|I feel strong from head to toe after eating this.
roast_mutton|A squeeze of lemon would be lovely, but tearing into it like this is satisfying enough.
honey_chicken|All that's missing is an ice cold cola.
cheese_sandwich|Tastes decent, and it's very filling.
apple_pie|I never thought I'd get to eat something this proper again.
cream_potato|I'll close my eyes and pretend I'm in a restaurant.
tomato_meat_noodle|My seasoning is incredible.
chicken_burger|A fine working lunch. After this, it's back to hauling bricks. Literally.
mushroom_pizza|Delicious. Authentic Canadian cuisine. Absolutely. Definitely.
seafood_fried_rice|More seafood, less rice.
beef_stew|After eating this, I feel as solid as a mountain.
chicken_stew|Exactly what I crave when I have a cold.
fried_chicken|When do I unlock the technology to make cola?!
beef_pizza|Make it myself, then pretend I ordered takeout.
cream_chicken_stew|Food that warms the heart.
beef_rice|My knife skills aren't quite good enough for those paper thin slices...
vinaigrette_salad|Tangy and refreshing. Finally, a proper dish that lets me eat a mountain of vegetables.
lamb_platter|I'm finally living the good life.
crab_soup|Even the shells went into the stock. Not a bit of flavor wasted.
honey_pork_ribs|Crisp outside, tender inside, and coated in sweet honey glaze.
island_feast|Eating something this lavish all alone feels a little lonely.
banana_boat|Pile ice cream onto a banana, and the island dessert shop is officially open.
blueberry_yogurt_cup|Silky yogurt and sweet blueberries. Far too elegant for a deserted island.
return_feast|I don't care. I deserve the very best!
water|Looks fairly clean. Maybe the system purified it.
alcohol|Drinking this as a beverage feels a bit risky... Let's call it extra calories.
milk|If I drink enough, could I still grow a little taller?
yogurt|The system has kept me from getting an upset stomach in this miserable place, but a little yogurt is still good for the gut.
hot_water|Have some hot water.
ice_water|Nothing beats a sip of this on a hot day.
apple_juice|The apples were sour, so of course the juice is sour too...
carrot_juice|Carrot juice is surprisingly good.
corn_juice|Just as good as the stuff from the supermarket.
blueberry_juice|A little mild without added sugar.
sweet_milk|Sweet milk makes me sleepy.
green_tea|My life is getting rather refined.
coffee|Fuel for a workhorse. Drink up, then back to the grind.
apple_shake|Once I escape this place, I could definitely get a job at a milk tea shop.
blueberry_shake|Something this fancy always cheers me up.
banana_shake|This is a date drink. Will someone please take me on a date?
rice_wine|Sweet, with a lovely warmth afterward.
ice_cream|Brings me back to life in the heat.
milk_tea|Wonderful. Civilization is back on the menu.
latte|Add a little milk to the coffee. Be kind to yourself.
honey_lemon_tea|So good. I'd better hide it from the monkeys.
apple_milk_tea|Perfectly balanced. I am the master of milk tea.
wood|Building, burning... I need this for everything. I wish I had a chainsaw.
stone|I hereby declare that I have entered the Stone Age.
grass|It'll do for fiber. Can you spin dry grass into thread?
clay|Without the system, I couldn't tell clay from ordinary river mud...
limestone|This is probably useful... The system certainly thinks so.
seawater|So heavy... I'll need a lot if I want to make salt.
rotten|It stinks... Why am I keeping this?
feed|Animal feed made from two portions of grass. Each occupied chicken coop, sheep pen, cattle pen, or pig pen needs one portion per day.
rope|My hands are red from twisting this...
hardwood|This wood really is hard.
sand|Time to make a CPU by hand!
iron_ore|I couldn't carry this without the system's help.
copper_ore|Lucky I can tell ore apart from all those other rocks.
charcoal|Chopping wood and burning charcoal in the southern mountains...
corundum|It's actually quite pretty.
sulfur|What a smell...
crude_oil|There's oil here, so where's the US military?! Come rescue me already!
clean_ice|So cold! Only the summit has ice like this.
marten_pelt|Good thing I don't have to skin it myself. The little creatures are rather cute...
lion_pelt|Hmph. That's what happens when you lose to me.
iron_ingot|I need this everywhere. If only I could just buy it.
copper_ingot|This island really has everything...
steel|I have entered the Industrial Age.
glass|Careful. Let it cool first.
corundum_abrasive|I can make this by hand too?
optical_lens|Wow. What am I making this for? Am I about to win?
battery|The age of electricity!
soil|Looks like ordinary dirt. In reality... it is ordinary dirt.
plank|I need these for everything. I need a lumber mill.
brick|Looks decent. Seems to have fired at just the right temperature.
stone_brick|Grinding stone bricks is exhausting...
lime|I suppose I'm in civil engineering now.
cement|With this, I feel like I could build any house.
concrete|A modern home might finally be possible!
rusty_iron|Rusty, yes. But iron is iron.
rock_salt|Crush it and it's salt... Leave it whole, and hey, isn't it one of those $3,000 salt grilling slabs?
glass_panel|Impressively smooth. That's the system for you.
copper_wire|In survival games, this usually goes into a communicator... Oh, right. No one's calling me.
gear|Will handmade gears really mesh properly...?
precision_part|No idea what it is. I put the materials in, and this came out.
insulated_cable|Electricity: the lifeblood of modern civilization.
rubber|Industrial rubber synthesized from petroleum fractions and strengthened with sulfur.
honey|A little sweetness in a bitter life.
beeswax|Now I can make all natural candles.
salt|My most important seasoning.
leather|Making even one piece takes a lot of work.
wool_cloth|Thick and warm. A little smelly, though.
cotton_cloth|The system wove it nice and evenly. If I'd done it myself, it would be full of holes.
linen_cloth|Feels just right for a cleaning rag.
bone_glue|This should work as glue, right?
fertilizer|It stinks, but my crops depend on it.
simple_poultice|Not exactly sterile, but a little medicine has to be better than none.
bandage|The system made it look quite respectable. Seems reliable.
advanced_wound_medicine|Looks like advanced technology. The sort of miracle treatment that could heal anything.
medicine|Tastes like traditional herbal medicine.
cooking_oil|I love fried food.
wool|Smelly wool. I'll have to wash it thoroughly.
feather|Gathering this many was no small feat.
small_fur|Sew a few together and they should work like one big piece.
tendon|Very tough and flexible.
large_bone|I don't have a dog, but there must be other uses for this.
animal_fat|Give me oil!
manure|It stinks.
venom|Handle with care. Put it on a weapon.
crab_shell|Can't just throw it away. It must be useful for something.
tough_tentacle|What doesn't kill me makes me stronger. In other words, my enemies become my equipment.
scorpion_venom|Looks extremely poisonous. Perfect for a weapon.
scorpion_chitin|Nice and hard. I should be able to make something with it.
wandering_lion_pelt|Never thought I'd live to see the day I could beat a lion.
lion_fang|I'll find something to make with this tooth.
snow_sheep_pelt|Such a lovely white sheepskin.
snow_sheep_tendon|Feels very tough.
snow_sheep_bone|Mustn't let the bones go to waste either.
giant_python_venom|Put it on a weapon.
giant_python_pelt|Just right for making bags.
giant_python_bone|I didn't realize python bones could be this big.
snow_elephant_pelt|What a huge hide.
snow_elephant_fat|This will make plenty of oil.
snow_elephant_tendon|Very tough.
snow_elephant_bone|What a huge bone.
cattle_pelt|Would this make a nice leather jacket?
pig_pelt|Better turn it into leather before it starts to stink.
flour|Finally, flour to eat!
corn_flour|Isn't this what people in Mexico eat every day?
coffee_powder|No coffee machine. Hot water will have to do.
vinegar|Nice and sour. The fermentation went well.
apple_jam|Plenty of honey. Finally, it isn't so sour.
blueberry_jam|Tasty, and it keeps well too.
tomato_sauce|This needs fries.
cotton|Cotton! Oh, that softness! Used to make cotton cloth.
flax|So prickly... At least I can make linen with it. Used for fishing nets and linen cloth.
fish|Yes! I didn't come back empty handed.
honeycomb|There are still bees in it. I'm scared to take it out of my backpack.
rice_grain|Getting a bowl of plain rice is harder than it sounds.
wheat|Prickly. I'll have to husk and grind it before I can eat it.
tea_leaf|A little more variety for my drinks.
coffee_bean|I should grind and brew these, right?
shrimp|Pretty big shrimp.
egg|A fine source of protein.
marten_meat|Cute as you were, you bit me. Now you're dinner.
crab_meat|That was one big crab.
giant_octopus_meat|Is this really edible...?
wandering_lion_meat|Doesn't smell great, but it's certainly a rare treat.
snow_sheep_meat|Does this mean I can have mutton hot pot?
snow_elephant_meat|What an enormous piece of meat.
chicken_meat|I need to find a way to eat chicken every day.
mutton|Looks tender.
beef|Marbled beef. The cattle here are quite plump.
pork|Now I'm craving twice cooked pork.
butter|All that churning, aching hands, and this is all I got.
herb|Looks like any other weed to me, but if the system says it's medicinal, I'll believe it.
firewood|Adds 10 fuel points when loaded into the local fuel reserve.
coal|Adds 50 fuel points when loaded into the local fuel reserve.
fuel|Adds 200 fuel points when loaded into the local fuel reserve.
wood_stick|A melee weapon.
short_bow|A ranged weapon.
stone_knife|Used to cut plants, gather honeycomb, and more.
stone_axe|Used to chop trees. Has unlimited durability and never breaks.
stone_pick|Used to mine stone and minerals. Has unlimited durability and never breaks.
iron_pick|Used to mine stone and minerals.
iron_axe|Used to chop trees.
wood_bucket|Used to collect freshwater or seawater.
wood_shovel|Used to dig soil, clay, and sand.
iron_hook|For catching fish. Or coming home empty handed.
wood_needle|Smooth it down, and it'll just about do for sewing.
iron_needle|Just like the needles in Grandma's sewing kit. I can't believe I made this myself. I'm proud of me.
fishing_net|Used to catch fish from shoals.
trap|Carry this in your backpack when successfully attacking a chicken flock for a 10% chance to catch a chick. A successful catch consumes one trap; an unsuccessful attempt consumes none.
large_trap|Carry this in your backpack when successfully attacking sheep, cattle, or wild boar for a 10% chance to catch a lamb, calf, or piglet. A successful catch consumes one large trap; an unsuccessful attempt consumes none.
oil_pump|Used to extract up to 5 portions of crude oil at a time.
kayak|I never expected being transported here would mean learning to paddle... Let alone taking such a tiny boat out to sea.
chick|Place in a chicken coop and feed daily. It spends 3 days as a young chicken, then 5 days as a broody hen before becoming a flock. The flock produces 1 egg, 1 feather, and 1 manure daily, plus 1 chicken meat every 3 productive days. It runs away after 10 consecutive days without feed.
lamb|Place in a sheep pen and feed daily. It spends 4 days as a young sheep, then 5 days as an ewe with lamb before becoming a flock. The flock produces 1 wool and 1 manure daily, plus 1 each of mutton, large bone, animal sinew, and animal fat every 3 productive days. It runs away after 10 consecutive days without feed.
calf|Place in a cattle pen and feed daily. It spends 6 days as a young cow, then 10 days as a cow with calf before becoming a herd. The herd produces 1 milk and 1 manure daily, plus 1 beef, 2 cowhide, 1 large bone, 1 animal sinew, and 1 animal fat every 4 productive days. It runs away after 10 consecutive days without feed.
piglet|Place in a pig pen and feed daily. It spends 4 days as a young pig, then 5 days as a sow with piglet before becoming a herd. The herd produces 1 manure daily, plus 1 each of pork, pigskin, and animal fat every 3 productive days. It runs away after 10 consecutive days without feed.
snow_leopard_pelt|That's what you get for standing in my way.
eagle_feather|Quite pretty, actually.
return_core|I suspect this has something to do with winning this wretched game.
space_module|No idea what it is. Looks like another item I need to finish the game.
coordinate_module|I don't understand it, but the system will tell me where it goes. Right?
thunder_glass|Looks powerful, with lightning shimmering inside. Did this really form naturally?
glossy_feather|Large flight feathers and soft down.
complete_tendon|Good thing I don't have to strip this out by hand.
thick_pelt|That was a hard fight.
dense_bone|Rings like metal or stone when struck.
ordinary_clothes|If I'd known I'd be transported here, I would have ordered a bulletproof vest.
warm_grass_armor_head|Hopefully the grass sticking out of my head doesn't make me look like I'm for sale.
warm_grass_armor_body|Grass clothing looks shabby, but it's better than my old thin outfit.
warm_grass_armor_feet|Weave straw shoes thick enough, and they can keep your feet warm.
warm_grass_armor_hands|Grass gloves. They look like they'll wear through easily.
rain_grass_armor_head|Like wearing a grass umbrella on my head.
rain_grass_armor_body|At least my clothes won't be soaking wet underneath.
rain_grass_armor_feet|Rain boots made of grass. A little waterproof, I suppose.
rain_grass_armor_hands|At least my hands won't get too wet.
wind_grass_armor_head|A feather hood secured with grass rope. Hard for the wind to blow off.
wind_grass_armor_body|Layered grass and feathers guide strong winds around the body.
wind_grass_armor_legs|Tightly bound grass leggings won't flap about in the wind.
wind_grass_armor_feet|Grass rope secures the soles, keeping my footing steady in strong winds.
wind_grass_armor_hands|Woven grass gloves with feather edging to block the wind.
shade_grass_armor_head|This hat makes hot weather a little more bearable.
shade_grass_armor_body|Keeps the sun from burning my skin raw.
shade_grass_armor_feet|Basically woven grass sandals.
shade_grass_armor_hands|Fairly cool gloves.
wool_leather_armor_head|A light, fluffy down hat that holds warmth in.
wool_leather_armor_body|A warm, down filled jacket, good for low temperatures before the bitter cold arrives.
wool_leather_armor_legs|Warm, down filled trousers, good for low temperatures before the bitter cold arrives.
wool_leather_armor_feet|Fluffy down booties that keep out the cold from the ground.
wool_leather_armor_hands|Light, fluffy down gloves.
breathable_leather_armor_head|A thin, breathable linen headscarf.
breathable_leather_armor_body|A loose, airy linen top for hot weather.
breathable_leather_armor_legs|Loose, airy linen trousers for hot weather.
breathable_leather_armor_feet|Light, breathable linen foot coverings.
breathable_leather_armor_hands|Linen hand wraps protect my hands from touching things heated by the sun.
fur_iron_armor_head|The soft lining is wonderfully comfortable and warm.
fur_iron_armor_body|The soft lining is wonderfully comfortable and warm.
storm_iron_armor_head|Composite steel armor upgraded from fleece lined iron armor. Provides both warmth and wind protection.
vented_iron_armor_head|Strong and surprisingly cool. I have no idea what futuristic technology makes it work.
heat_steel_armor_head|Composite steel armor upgraded from ventilated iron armor. Provides both heat and rain protection.
waterproof_boots|When worn on the feet, adds 15 rain protection and reduces the extra stamina cost of each outdoor action in acid rain by 0.5, to a minimum of zero.
thick_pelt_coat|So warm.
glossy_feather_heat_leggings|No idea why these feel so cool to wear.
thunder_glass_goggles|These goggles keep the wind out and look rather cool doing it.
rare_rain_boots|When worn on the feet, adds 100 rain protection and reduces the extra stamina cost of each outdoor action in acid rain by 1, to a minimum of zero.
system_small_backpack|A backpack from the system, packed with impossible technology. Holds 10 regular slots and 3 chilled slots.
cotton_travel_backpack|A technologically impossible cotton backpack. Holds 14 regular slots and 4 chilled slots.
leather_hiking_backpack|It looks like an ordinary leather pack, but impossible technology gives it 20 regular slots and 6 chilled slots.
insulated_expedition_backpack|A soft, padded backpack full of impossible technology. Holds 28 regular slots and 10 chilled slots.
modular_survival_backpack|No attempt to hide the futuristic technology this time. Holds 36 regular slots and 15 chilled slots.
rare_beast_pack|Proof of a mighty survivor. Holds 45 regular slots and 20 chilled slots.
carrot_seed|Plant in a growing plot for a steady supply of carrots.
potato_seed|Plant in a growing plot for a steady supply of potatoes.
corn_seed|Plant in a growing plot for a steady supply of corn.
mushroom_spawn|Plant in a growing plot for a steady supply of mushrooms.
tomato_seed|Plant in a growing plot for a steady supply of tomatoes.
blueberry_seed|Plant in a growing plot for a steady supply of blueberries.
wheat_seed|Plant in a growing plot for a steady supply of wheat.
rice_grain_seed|Plant in a growing plot for a steady supply of rice grain.
cotton_seed|Plant in a growing plot for a steady supply of cotton.
flax_seed|Plant in a growing plot for a steady supply of flax.
pumpkin_seed|Plant in a growing plot for a steady supply of pumpkins.
onion_seed|Plant in a growing plot for a steady supply of onions.
tea_leaf_seed|Plant in a growing plot for a steady supply of tea leaves.
coffee_bean_seed|Plant in a growing plot for a steady supply of coffee beans.
lemon_seed|Plant in a growing plot for a steady supply of lemons.
banana_seed|Plant in a growing plot for a steady supply of bananas.
herb_seed|Plant in a growing plot for a steady supply of herbs.
apple_seed|Plant in a growing plot for a steady supply of apples.
tree_seed|Plant in a growing plot for a steady supply of wood.
grass_seed|Plant in a growing plot for a steady supply of grass.
stone_pot|Only useful when placed over a fire.
oven|Let's try baking some bread first.
stone_mill|For grinding things. Who turns the mill? Me, of course.
tanning_rack|Now I can make leather.
juicer|Finally, something different to drink.
wood_tableware|No more eating rice with my hands.
ceramic_tableware|There are even little pink flowers painted on it.
grass_bed|Sleeping on this leaves my back aching.
plank_bed|A proper bed, at last. A bit hard, though.
feather_bed|So comfortable! I don't want to get up.
wood_table|I really need somewhere to sit.
sofa|Feels like modern life again.
cupboard|I don't have much tableware, but a dedicated cupboard still makes me happy.
building_blocks_table|Something to play with in my spare time.
dumbbell|I do plenty of physical labor, but the muscles on the other side need exercise too.
dartboard|Quite nice for unwinding.
rocking_chair|I want to spend the whole day in this.
electric_light|Ah, light!
oil_lamp|A little smoky, but anything beats sitting in the dark.
storage_chest|The monkeys can't take things out of a chest, can they?
bathtub|Ah. This is the life.
massage_bathtub|The water and massage jets wash the fatigue right away.
charcoal_dehumidifier|Place indoors to absorb moisture. No extra charcoal needed.
evaporative_cooler|Cools the room a little.
wool_blanket|Soft and warm.
fridge|An impossibly advanced refrigerator. It limits the number of item types, not the quantity.
fan|Better than nothing in hot weather.
electric_heater|Ah, warmth.
candle|A candle made of all natural beeswax.
feather_pillow|Soft and soothing for my aching neck.
snow_leopard_tapestry|I really am a mighty warrior.
eagle_ornament|Look at these beautiful trophies.
lion_specimen|This majestic mounted lion makes even my little cabin look grand.
`));

export const EN_USAGE_TEXT = Object.fromEntries(rows(`
wood|Make planks or firewood, or build houses and facilities.
stone|Make stone tools or stone bricks, or build facilities.
grass|Make grass rope, animal feed, or grass armor.
clay|Fire bricks or make cement and ceramic tableware.
limestone|Burn into lime or melt into glass.
seawater|Make salt or purify into drinking water.
fish|Make grilled fish, sashimi, or fish soup, or preserve as dried fish.
rotten|Process into fertilizer at a compost heap.
rope|Make tools, clothing, or furniture, or build facilities.
hardwood|Make metal tools, bows, and crossbows.
sand|Make cement, concrete, and glass.
iron_ore|Smelt into iron ingots in a smelter.
copper_ore|Smelt into copper ingots in a smelter.
charcoal|Make a moisture absorbing charcoal box.
corundum|Grind into corundum abrasive at a stone mill.
sulfur|Make rubber and batteries at a chemistry bench.
crude_oil|Make fuel oil and rubber at a chemistry bench.
clean_ice|Melt into water, or make ice water and ice cream.
honeycomb|Process into honey and beeswax, or build a beehive box.
rice_grain|Cook rice in a wooden pot.
wheat|Grind into flour at a stone mill.
tea_leaf|Make green tea, milk tea, and other drinks.
coffee_bean|Grind into coffee grounds at a stone mill.
marten_pelt|Process into leather at a tanning rack.
iron_ingot|Make iron tools, steel, and gears, or build facilities.
copper_ingot|Make copper wire and batteries.
steel|Make advanced equipment, or use for electrical facilities and the homeward project.
glass|Make glass panels, optical lenses, and batteries.
corundum_abrasive|Make optical lenses, precision parts, and a precision alloy venom blade.
optical_lens|Build the Homeward Tower's computing center and communications array.
battery|Build the Homeward Tower's power array.
thunder_glass|Make stormglass goggles and a rare hide expedition pack, or increase optical lens and battery production yields.
soil|Build growing plots.
plank|Make furniture, or build houses and facilities.
brick|Make an oven, or build facilities such as a smelter.
stone_brick|Build wood stoves, cellars, wells, and other facilities.
lime|Make cement.
cement|Make concrete, or build a large cellar and drainage system.
concrete|Build a power distribution room, homeward base, and tower foundation.
rusty_iron|Smelt into iron ingots in a smelter.
rock_salt|Process into salt at a workbench.
glass_panel|Build greenhouses, a weather station, and the homeward tower body.
copper_wire|Make insulated cable and appliances, or build electrical facilities.
gear|Make bows, crossbows, and oil pumps, or build mechanical facilities.
precision_part|Make advanced equipment, or build a weather station and the Homeward Tower.
insulated_cable|Make appliances and advanced backpacks, or use in the homeward project.
rubber|Make insulated cable and protective equipment.
honey|Make food, drinks, and medicine.
beeswax|Make candles and waterproof equipment.
salt|Cook meals or tan leather.
leather|Make clothing, backpacks, and kayaks.
wool_cloth|Make bandages, warm clothing, and furniture.
cotton_cloth|Make backpacks, clothing, and feather bedding.
linen_cloth|Make clothing, backpacks, and a snow leopard tapestry.
bone_glue|Make a fine steel blade.
cooking_oil|Make fried chicken and vegetable salad with vinaigrette.
shrimp|Make grilled shrimp and seafood fried rice.
egg|Make boiled eggs and tomato and egg soup.
wool|Process into wool cloth at a workbench.
feather|Make clothing, feather bedding, and dartboards.
tendon|Make short bows, hunting bows, and crossbows.
large_bone|Process into bone glue in a wooden pot.
animal_fat|Process into cooking oil in a wooden pot.
venom|Make a poisoned halberd, precision alloy venom blade, and Soulreaper Venom Crossbow.
marten_meat|Make roasted marten, or preserve as dried meat.
crab_meat|Make creamy crab soup, or preserve as dried meat.
crab_shell|Burn into lime or make creamy crab soup.
giant_octopus_meat|Preserve as dried meat in a drying shed.
tough_tentacle|Replace animal sinew in bows and crossbows.
scorpion_venom|Replace venom in poisoned weapons.
scorpion_chitin|Grind into corundum abrasive at a stone mill.
wandering_lion_meat|Replace beef in cooking, or preserve as dried meat.
wandering_lion_pelt|Process into leather at a tanning rack, or make a mounted lion. First acquisition unlocks its blueprint.
lion_fang|Replace large bones when making bone glue.
snow_sheep_meat|Replace mutton in cooking, or preserve as dried meat.
snow_elephant_fat|Replace animal fat when making cooking oil.
chicken_meat|Make roast chicken, chicken stew, and other dishes, or preserve as dried meat.
mutton|Make roast mutton and grilled lamb chop platters, or preserve as dried meat.
beef|Make roast beef, beef stew, and other dishes, or preserve as dried meat.
pork|Make roast pork and honey roasted pork ribs, or preserve as dried meat.
glossy_feather|Make lustrous feather insulated trousers or a rare hide expedition pack, or replace feathers when making a feather pillow.
complete_tendon|Make lustrous feather insulated trousers, rare hide rain boots, and a rare hide expedition pack.
thick_pelt|Make an extreme cold fur coat, rare hide rain boots, and a rare hide expedition pack, or process into leather.
dense_bone|Make an extreme cold fur coat, stormglass goggles, and a rare hide expedition pack, or process into bone glue.
flour|Make bread, pasta, and pastries.
corn_flour|Make corn cakes.
coffee_powder|Make coffee and lattes.
butter|Make buttered bread, apple pie, and creamy dishes.
cheese|Make cheese sandwiches, potato gratin, and pizza.
vinegar|Make cheese, sushi, and vegetable salad with vinaigrette.
apple_jam|Make bread with apple jam, apple pie, and apple green milk tea.
blueberry_jam|Make bread with blueberry jam.
tomato_sauce|Make pasta with meat sauce and pizza.
cotton|Process into cotton cloth at a loom.
flax|Make fishing nets, or process into linen at a loom.
herb|Make crude poultices, medicine, and advanced wound medicine.
kayak|Travel to Volcanic Island (A7), Small Island (B6), Twin Island Strait (B7), and Ocean (C7, D7).
snow_leopard_pelt|Make a snow leopard tapestry.
eagle_feather|Make a giant eagle feather ornament.
return_core|Final core installation in the Homeward Tower requires 1 Homeward Core.
space_module|Pass the mysterious facility's scan together with the World Coordinate Module. Final core installation in the Homeward Tower requires 1 Spatial Stabilization Module.
coordinate_module|Pass the mysterious facility's scan together with the Spatial Stabilization Module. Final core installation in the Homeward Tower requires 1 World Coordinate Module.
stone_pot|Rice, soups, hot drinks, bone glue, cooking oil, and more.
frying_pan|Fried rice, fried chicken, wok dishes, and more.
oven|Bread, cakes, pizza, roasted meat dishes, and more.
stone_mill|Flour, cornmeal, ground coffee, and corundum abrasive.
tanning_rack|Process hides and fur into leather.
juicer|Fruit and vegetable juices, milkshakes, butter, and ice cream.
fertilizer|Increase cultivated resource abundance, or build growing plots.
feed|Feed chickens, sheep, cattle, and pigs.
`));
export const EN_BLUEPRINT_TEXT = Object.fromEntries(rows(`
feed|Automatically unlocks feed production when your first chicken coop, sheep pen, cattle pen, or pig pen is completed.
rubber|Unlocks rubber production: 4 crude oil and 1 sulfur produce 4 rubber per batch.
battery|Unlocks battery production: 2 copper ingots, 2 iron ingots, 1 sulfur, and 2 glass produce 2 batteries per batch. Using 2 stormglass instead produces 4 batteries.
lion_specimen|Automatically unlocks the mounted lion recipe when you obtain a male lion pelt.
seed_storage_room|Unlocks construction of a seed store. Requires a local house of level 3 or higher. Provides 20 local slots exclusively for seeds.
utility_room|Unlocks construction of a utility room. Requires a local house of level 3 or higher. Provides 30 local slots exclusively for furniture and tools.
cellar_expansion|Unlocks construction of a large cellar. Requires an existing local cellar. Provides 15 chilled slots without using electricity.
greenhouse|Unlocks a permanent greenhouse upgrade for one growing plot. The upgrade remains after uprooting or changing crops.
auto_fertilizer|Unlocks construction of an automatic fertilizer box. Always active once built, but supplies only plots whose individual automatic fertilization switch is on.
insulation_layer|Can only be drawn after acquiring the insulation lining blueprint. Upgrades a completed insulation lining into a thermal storage layer.
hydro_generator|Obtained after completing the permanent shelter. Hydroelectric generators can only be built in C3 or C4. Once a local power distribution room is completed, each generator supplies 5 power per day to the entire island. Cannot be damaged after completion.
distribution_room|Obtained after completing your first hydroelectric generator. Can only be built in C3 or C4 where a generator already exists. Cannot be damaged after completion. Activates all local generators, sharing their power across the island. Other areas can use this power without a local distribution room.
mining_machine|A level 3 blueprint included in the guaranteed level 3 progression pool of the daily ten draws. Unlocks mining machines in iron, copper, and coal areas, up to 5 per area. Requires at least a local thatch tent. Each machine takes 5 construction steps; each step costs 2 gears, 1 steel, 1 copper wire, and 1 base stamina. Local regular storage, such as a warehouse or storage chest, is required to operate. Once switched on and powered by the island grid, each machine uses 2 power per day at the lowest power priority. Each night it deposits an entire resource node's stock into local regular storage: 10 iron ore, 8 copper ore, or 10 coal. It pauses if local storage disappears, or stops producing if storage is full and stacking is impossible. Does not deplete natural deposits and cannot be damaged after completion.
`));
export const EN_DESCRIPTIONS = [
  ...Object.entries(EN_ITEM_TEXT).map(([id, text]) => [ITEM_DESCRIPTIONS[id], text]),
  ...Object.entries(EN_USAGE_TEXT).map(([id, text]) => [ITEM_USAGE_DESCRIPTIONS[id], text]),
  ...Object.entries(EN_BLUEPRINT_TEXT).map(([id, text]) => [BLUEPRINT_DESCRIPTIONS[id], text]),
  ['获得后会解锁{0}的制作。', 'Unlocks the recipe for {0}.'],
  ['获得后会解锁{0}的建造。', 'Unlocks construction of {0}.'],
];
