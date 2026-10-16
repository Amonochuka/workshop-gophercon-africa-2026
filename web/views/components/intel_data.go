package components

import (
	"encoding/json"
	"workshop/internal/domain/species"
	"github.com/a-h/templ"
)

func IntelDataScript() templ.Component {
	data := make(map[string]interface{})
	for _, a := range species.Animals() {
		stats := a.GetBattleStats()
		key := string(a)
		data[key] = map[string]interface{}{
			"name":         stats.Name,
			"scientific":   getScientific(key),
			"class":        stats.Class,
			"weightKg":     stats.WeightKg,
			"heightCm":     stats.HeightCm,
			"lengthCm":     stats.LengthCm,
			"attack":       stats.Attack,
			"defense":      stats.Defense,
			"speed":        stats.Speed,
			"stamina":      stats.Stamina,
			"specialMove":  stats.SpecialMove,
			"specialDesc":  stats.SpecialDesc,
			"conservation": getConservation(key),
			"habitat":      getHabitat(key),
			"diet":         getDiet(key),
			"lifespan":     getLifespan(key),
			"funFact":      getFunFact(key),
		}
	}
	b, _ := json.Marshal(data)
	return templ.Raw("<script id=\"intel-data\" type=\"application/json\">" + string(b) + "</script>")
}

func getScientific(key string) string {
	sci := map[string]string{
		"lion": "Panthera leo", "tiger": "Panthera tigris", "leopard": "Panthera pardus",
		"cheetah": "Acinonyx jubatus", "elephant": "Loxodonta africana", "rhinoceros": "Diceros bicornis",
		"giraffe": "Giraffa camelopardalis", "zebra": "Equus quagga", "hippopotamus": "Hippopotamus amphibius",
		"african_buffalo": "Syncerus caffer", "spotted_hyena": "Crocuta crocuta",
		"african_wild_dog": "Lycaon pictus", "wildebeest": "Connochaetes taurinus",
		"impala": "Aepyceros melampus", "common_warthog": "Phacochoerus africanus",
		"blue_whale": "Balaenoptera musculus", "humpback_whale": "Megaptera novaeangliae",
		"sperm_whale": "Physeter macrocephalus", "fin_whale": "Balaenoptera physalus",
		"orca": "Orcinus orca", "nile_crocodile": "Crocodylus niloticus",
		"polar_bear": "Ursus maritimus", "brown_bear": "Ursus arctos",
		"gorilla": "Gorilla gorilla", "chimpanzee": "Pan troglodytes",
		"bald_eagle": "Haliaeetus leucocephalus", "great_white_shark": "Carcharodon carcharias",
		"komodo_dragon": "Varanus komodoensis", "emperor_penguin": "Aptenodytes forsteri",
	}
	if s, ok := sci[key]; ok { return s }
	return "Unknown"
}

func getConservation(key string) string {
	cons := map[string]string{
		"lion": "VU", "tiger": "EN", "leopard": "VU", "cheetah": "VU",
		"elephant": "EN", "rhinoceros": "CR", "giraffe": "VU",
		"hippopotamus": "VU", "african_buffalo": "NT", "spotted_hyena": "LC",
		"african_wild_dog": "EN", "blue_whale": "EN", "humpback_whale": "LC",
		"sperm_whale": "VU", "fin_whale": "VU", "orca": "DD",
		"nile_crocodile": "LC", "polar_bear": "VU", "brown_bear": "LC",
		"gorilla": "CR", "chimpanzee": "EN", "bald_eagle": "LC",
		"great_white_shark": "VU", "komodo_dragon": "EN", "emperor_penguin": "NT",
	}
	if s, ok := cons[key]; ok { return s }
	return "LC"
}

func getHabitat(key string) string {
	hab := map[string]string{
		"lion": "African savanna, grasslands", "tiger": "Asian forests, mangroves",
		"elephant": "African savanna, forests", "giraffe": "African savanna, open woodlands",
		"hippopotamus": "Sub-Saharan rivers, lakes", "polar_bear": "Arctic sea ice",
		"orca": "All oceans, coastal to pelagic", "bald_eagle": "North American coasts, lakes",
		"great_white_shark": "Temperate coastal waters", "komodo_dragon": "Indonesian islands",
		"emperor_penguin": "Antarctic pack ice",
	}
	if s, ok := hab[key]; ok { return s }
	return "Various"
}

func getDiet(key string) string {
	diet := map[string]string{
		"lion": "Hyper-carnivore (ungulates)", "tiger": "Hyper-carnivore (deer, boar)",
		"elephant": "Herbivore (grass, bark, fruit)", "giraffe": "Browser (acacia leaves)",
		"hippopotamus": "Herbivore (grass, aquatic plants)", "polar_bear": "Hyper-carnivore (seals)",
		"orca": "Apex predator (fish, mammals)", "bald_eagle": "Carnivore (fish, waterfowl)",
		"great_white_shark": "Apex predator (seals, fish)", "komodo_dragon": "Carnivore (carrion, deer)",
		"emperor_penguin": "Piscivore (fish, squid, krill)",
	}
	if s, ok := diet[key]; ok { return s }
	return "Varied"
}

func getLifespan(key string) string {
	life := map[string]string{
		"lion": "10-14 years (wild)", "tiger": "8-10 years (wild)",
		"elephant": "60-70 years", "giraffe": "20-25 years",
		"hippopotamus": "40-50 years", "polar_bear": "15-18 years",
		"orca": "50-80 years", "bald_eagle": "20-30 years",
		"great_white_shark": "30-70 years", "komodo_dragon": "30 years",
		"emperor_penguin": "15-20 years",
	}
	if s, ok := life[key]; ok { return s }
	return "Unknown"
}

func getFunFact(key string) string {
	facts := map[string]string{
		"lion": "Only cats that live in social groups (prides); females do 90% of hunting.",
		"tiger": "Each tiger has unique stripes like fingerprints; can swim 6km+.",
		"elephant": "Largest land animal; communicates via infrasound below human hearing.",
		"cheetah": "Fastest land animal (112 km/h); only big cat that can't roar.",
		"giraffe": "Tallest animal; 45cm tongue; only 5-30 min sleep per day.",
		"hippopotamus": "Secretes red 'blood sweat' as sunscreen/antibiotic; kills more humans than lions.",
		"polar_bear": "Black skin under white fur; can smell seals 1.6km away under ice.",
		"orca": "Not whales but largest dolphins; culture varies by pod (dialects, hunting).",
		"bald_eagle": "Not actually bald; 'balde' = white-headed; builds largest tree nests.",
		"great_white_shark": "300 serrated teeth in rows; can detect 1 drop blood in 100L water.",
		"komodo_dragon": "Venomous bite; can eat 80% body weight in one meal.",
		"emperor_penguin": "Breeds in -40°C winter; males incubate eggs on feet for 65 days.",
	}
	if s, ok := facts[key]; ok { return s }
	return "Classified."
}