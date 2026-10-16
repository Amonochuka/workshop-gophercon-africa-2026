package species

// BattleStats holds combat attributes for an animal
type BattleStats struct {
	Name        string
	WeightKg    int
	HeightCm    int
	LengthCm    int
	Attack      int  // 1-100
	Defense     int  // 1-100
	Speed       int  // 1-100
	Stamina     int  // 1-100
	SpecialMove string
	SpecialDesc string
	Class       string // "mammal", "bird", "reptile", "fish", "amphibian"
}

// Battle stats for each animal - based on real biology, scaled for game balance
var BattleData = map[Animal]BattleStats{
	AnimalLion: {
		Name: "Lion", WeightKg: 190, HeightCm: 120, LengthCm: 250,
		Attack: 92, Defense: 75, Speed: 80, Stamina: 70,
		SpecialMove: "THROAT CLAMP", SpecialDesc: "Crushing bite to windpipe — instant KO chance",
		Class: "mammal",
	},
	AnimalTiger: {
		Name: "Tiger", WeightKg: 220, HeightCm: 110, LengthCm: 290,
		Attack: 95, Defense: 78, Speed: 82, Stamina: 75,
		SpecialMove: "AMBUSH STRIKE", SpecialDesc: "First strike deals double damage",
		Class: "mammal",
	},
	AnimalLeopard: {
		Name: "Leopard", WeightKg: 65, HeightCm: 70, LengthCm: 160,
		Attack: 85, Defense: 65, Speed: 88, Stamina: 80,
		SpecialMove: "TREE DRAG", SpecialDesc: "Drags prey up — opponent loses next turn",
		Class: "mammal",
	},
	AnimalCheetah: {
		Name: "Cheetah", WeightKg: 55, HeightCm: 90, LengthCm: 140,
		Attack: 70, Defense: 45, Speed: 100, Stamina: 50,
		SpecialMove: "BLITZ", SpecialDesc: "Three rapid strikes — 30% each",
		Class: "mammal",
	},
	AnimalElephant: {
		Name: "Elephant", WeightKg: 6000, HeightCm: 330, LengthCm: 600,
		Attack: 88, Defense: 95, Speed: 40, Stamina: 90,
		SpecialMove: "TRUNK SLAM", SpecialDesc: "AoE stun — 3 turn cooldown",
		Class: "mammal",
	},
	AnimalRhinoceros: {
		Name: "Rhinoceros", WeightKg: 2300, HeightCm: 180, LengthCm: 350,
		Attack: 90, Defense: 98, Speed: 55, Stamina: 85,
		SpecialMove: "HORN CHARGE", SpecialDesc: "Piercing damage ignores 50% defense",
		Class: "mammal",
	},
	AnimalHippopotamus: {
		Name: "Hippopotamus", WeightKg: 1500, HeightCm: 150, LengthCm: 350,
		Attack: 94, Defense: 85, Speed: 45, Stamina: 80,
		SpecialMove: "JAWS OF DEATH", SpecialDesc: "180° gape — 40% instant KO",
		Class: "mammal",
	},
	AnimalGiraffe: {
		Name: "Giraffe", WeightKg: 1200, HeightCm: 550, LengthCm: 450,
		Attack: 75, Defense: 70, Speed: 55, Stamina: 75,
		SpecialMove: "KICK OF DOOM", SpecialDesc: "Single kick — 2000 PSI, 25% KO",
		Class: "mammal",
	},
	AnimalSpottedHyena: {
		Name: "Spotted Hyena", WeightKg: 65, HeightCm: 80, LengthCm: 130,
		Attack: 82, Defense: 60, Speed: 75, Stamina: 95,
		SpecialMove: "BONE CRUSHER", SpecialDesc: "Bite ignores armor, heals 10% HP",
		Class: "mammal",
	},
	AnimalAfricanWildDog: {
		Name: "African Wild Dog", WeightKg: 25, HeightCm: 75, LengthCm: 110,
		Attack: 65, Defense: 40, Speed: 90, Stamina: 100,
		SpecialMove: "PACK TACTICS", SpecialDesc: "Calls ally — 2v1 for 3 turns",
		Class: "mammal",
	},
	AnimalWildebeest: {
		Name: "Wildebeest", WeightKg: 250, HeightCm: 140, LengthCm: 220,
		Attack: 55, Defense: 55, Speed: 70, Stamina: 85,
		SpecialMove: "STAMPEDE", SpecialDesc: "Trample — hits all adjacent",
		Class: "mammal",
	},
	AnimalZebra: {
		Name: "Zebra", WeightKg: 350, HeightCm: 140, LengthCm: 230,
		Attack: 50, Defense: 50, Speed: 75, Stamina: 80,
		SpecialMove: "KICK BACK", SpecialDesc: "Counter-attack on hit",
		Class: "mammal",
	},
	AnimalAfricanBuffalo: {
		Name: "African Buffalo", WeightKg: 700, HeightCm: 150, LengthCm: 300,
		Attack: 80, Defense: 85, Speed: 55, Stamina: 90,
		SpecialMove: "BOSS HORNS", SpecialDesc: "Gore + knockback",
		Class: "mammal",
	},
	AnimalImpala: {
		Name: "Impala", WeightKg: 55, HeightCm: 90, LengthCm: 130,
		Attack: 30, Defense: 35, Speed: 85, Stamina: 75,
		SpecialMove: "PRONK", SpecialDesc: "Leap away — dodge next attack",
		Class: "mammal",
	},
	AnimalCommonWarthog: {
		Name: "Common Warthog", WeightKg: 80, HeightCm: 75, LengthCm: 150,
		Attack: 60, Defense: 70, Speed: 50, Stamina: 80,
		SpecialMove: "TUSK GORE", SpecialDesc: "Bleed damage over 3 turns",
		Class: "mammal",
	},
	AnimalOrca: {
		Name: "Orca", WeightKg: 4500, HeightCm: 250, LengthCm: 800,
		Attack: 96, Defense: 85, Speed: 85, Stamina: 95,
		SpecialMove: "WAVE WASH", SpecialDesc: "Knocks off ice/land — reposition",
		Class: "mammal",
	},
	AnimalSpermWhale: {
		Name: "Sperm Whale", WeightKg: 40000, HeightCm: 600, LengthCm: 1800,
		Attack: 85, Defense: 90, Speed: 50, Stamina: 100,
		SpecialMove: "SONIC BOOM", SpecialDesc: "230dB click — stuns all",
		Class: "mammal",
	},
	AnimalHumpbackWhale: {
		Name: "Humpback Whale", WeightKg: 30000, HeightCm: 500, LengthCm: 1500,
		Attack: 70, Defense: 88, Speed: 45, Stamina: 95,
		SpecialMove: "BUBBLE NET", SpecialDesc: "Traps opponent — 2 turns",
		Class: "mammal",
	},
	AnimalBlueWhale: {
		Name: "Blue Whale", WeightKg: 150000, HeightCm: 600, LengthCm: 3000,
		Attack: 60, Defense: 92, Speed: 40, Stamina: 100,
		SpecialMove: "TAIL SLAP", SpecialDesc: "Massive AoE — tsunami wave",
		Class: "mammal",
	},
	AnimalGreatWhiteShark: {
		Name: "Great White Shark", WeightKg: 1100, HeightCm: 150, LengthCm: 500,
		Attack: 93, Defense: 70, Speed: 85, Stamina: 80,
		SpecialMove: "BREACH STRIKE", SpecialDesc: "Leaps from water — unavoidable",
		Class: "fish",
	},
	AnimalWhaleShark: {
		Name: "Whale Shark", WeightKg: 19000, HeightCm: 400, LengthCm: 1200,
		Attack: 20, Defense: 85, Speed: 35, Stamina: 90,
		SpecialMove: "FILTER FEED", SpecialDesc: "Heals 30% HP — pacifist",
		Class: "fish",
	},
	AnimalNileCrocodile: {
		Name: "Nile Crocodile", WeightKg: 500, HeightCm: 100, LengthCm: 500,
		Attack: 88, Defense: 80, Speed: 60, Stamina: 70,
		SpecialMove: "DEATH ROLL", SpecialDesc: "Grapple — 90% limb loss",
		Class: "reptile",
	},
	AnimalSaltwaterCrocodile: {
		Name: "Saltwater Crocodile", WeightKg: 1000, HeightCm: 120, LengthCm: 600,
		Attack: 90, Defense: 85, Speed: 65, Stamina: 75,
		SpecialMove: "DEATH ROLL", SpecialDesc: "Grapple — 95% limb loss",
		Class: "reptile",
	},
	AnimalPolarBear: {
		Name: "Polar Bear", WeightKg: 600, HeightCm: 160, LengthCm: 250,
		Attack: 92, Defense: 80, Speed: 65, Stamina: 85,
		SpecialMove: "ICE CRUSH", SpecialDesc: "Smashes terrain — creates hazards",
		Class: "mammal",
	},
	AnimalBrownBear: {
		Name: "Brown Bear", WeightKg: 400, HeightCm: 150, LengthCm: 220,
		Attack: 90, Defense: 78, Speed: 60, Stamina: 85,
		SpecialMove: "BEAR HUG", SpecialDesc: "Crushing grapple — 3 turn lock",
		Class: "mammal",
	},
	AnimalGorilla: {
		Name: "Gorilla", WeightKg: 180, HeightCm: 170, LengthCm: 180,
		Attack: 88, Defense: 75, Speed: 55, Stamina: 80,
		SpecialMove: "SILVERBACK SMASH", SpecialDesc: "Ground pound — AoE stun",
		Class: "mammal",
	},
	AnimalChimpanzee: {
		Name: "Chimpanzee", WeightKg: 55, HeightCm: 100, LengthCm: 85,
		Attack: 75, Defense: 55, Speed: 70, Stamina: 75,
		SpecialMove: "FURY SWIPES", SpecialDesc: "5 rapid attacks — escalating damage",
		Class: "mammal",
	},
	AnimalBaldEagle: {
		Name: "Bald Eagle", WeightKg: 5, HeightCm: 90, LengthCm: 75,
		Attack: 70, Defense: 40, Speed: 95, Stamina: 70,
		SpecialMove: "TALON DIVE", SpecialDesc: "Dive bomb — 200 mph impact",
		Class: "bird",
	},
	AnimalScarletMacaw: {
		Name: "Scarlet Macaw", WeightKg: 1, HeightCm: 90, LengthCm: 85,
		Attack: 25, Defense: 20, Speed: 70, Stamina: 60,
		SpecialMove: "SCREAM", SpecialDesc: "Deafens — accuracy -50%",
		Class: "bird",
	},
	AnimalEmperorPenguin: {
		Name: "Emperor Penguin", WeightKg: 35, HeightCm: 115, LengthCm: 80,
		Attack: 40, Defense: 55, Speed: 45, Stamina: 90,
		SpecialMove: "HUDDLE", SpecialDesc: "Team defense +50%",
		Class: "bird",
	},
	AnimalKomodoDragon: {
		Name: "Komodo Dragon", WeightKg: 80, HeightCm: 70, LengthCm: 260,
		Attack: 85, Defense: 70, Speed: 55, Stamina: 75,
		SpecialMove: "VENOM BITE", SpecialDesc: "DoT + prevents healing",
		Class: "reptile",
	},
	AnimalGreenTurtle: {
		Name: "Green Turtle", WeightKg: 200, HeightCm: 100, LengthCm: 120,
		Attack: 30, Defense: 95, Speed: 25, Stamina: 100,
		SpecialMove: "SHELL UP", SpecialDesc: "Invulnerable 2 turns",
		Class: "reptile",
	},
}

// GetBattleStats returns battle stats for an animal
func (a Animal) GetBattleStats() BattleStats {
	if stats, ok := BattleData[a]; ok {
		return stats
	}
	// Default generic stats
	return BattleStats{
		Name:        string(a),
		WeightKg:    100,
		HeightCm:    100,
		LengthCm:    150,
		Attack:      50,
		Defense:     50,
		Speed:       50,
		Stamina:     50,
		SpecialMove: "STRIKE",
		SpecialDesc: "Basic attack",
		Class:       "mammal",
	}
}

// BattleClass returns the combat class for UI styling
func (b BattleStats) BattleClass() string {
	switch b.Class {
	case "mammal":
		return "mammal"
	case "bird":
		return "bird"
	case "reptile":
		return "reptile"
	case "fish":
		return "fish"
	case "amphibian":
		return "amphibian"
	default:
		return "mammal"
	}
}