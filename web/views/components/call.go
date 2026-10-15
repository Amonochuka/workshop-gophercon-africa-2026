package components

import (
	"cmp"
	"strings"

	"workshop/internal/domain/species"
)

// Call is how a tile reacts on hover: the way it moves and the sound it makes.
type Call struct {
	Motion string
	Sound  string
}

// speciesSounds are the calls that differ within a genus, by canonical name.
var speciesSounds = map[string]string{
	"Panthera leo":               "lion",
	"Panthera tigris":            "tiger",
	"Panthera pardus":            "saw",
	"Panthera onca":              "saw",
	"Equus quagga":               "kwaha",
	"Equus grevyi":               "donkey",
	"Balaenoptera musculus":      "lowmoan",
	"Balaenoptera physalus":      "pulse",
	"Balaenoptera acutorostrata": "boing",
}

// genusSounds are each genus' real call, by the synth's name for it.
var genusSounds = map[string]string{
	"Acinonyx":        "cheetah",
	"Puma":            "scream",
	"Crocuta":         "laugh",
	"Ursus":           "growl",
	"Loxodonta":       "trumpet",
	"Elephas":         "trumpet",
	"Hippopotamus":    "hippo",
	"Ceratotherium":   "snort",
	"Diceros":         "snort",
	"Syncerus":        "bellow",
	"Bison":           "bellow",
	"Aepyceros":       "impala",
	"Connochaetes":    "gnu",
	"Alces":           "moan",
	"Equus":           "kwaha",
	"Hydrochoerus":    "purr",
	"Bradypus":        "sloth",
	"Choloepus":       "hiss",
	"Pongo":           "longcall",
	"Phascolarctos":   "koala",
	"Vombatus":        "wombat",
	"Ornithorhynchus": "platypus",
	"Orcinus":         "orca",
	"Delphinapterus":  "beluga",
	"Monodon":         "beluga",
	"Physeter":        "clicks",
	"Megaptera":       "song",
	"Eschrichtius":    "knock",
	"Phoca":           "sealgrowl",
	"Hydrurga":        "trill",
	"Odobenus":        "walrus",
	"Carcharodon":     "bubbles",
	"Rhincodon":       "bubbles",
	"Chelonia":        "breath",
	"Dermochelys":     "breath",
	"Alligator":       "gator",
	"Crocodylus":      "hiss",
	"Gavialis":        "hiss",
	"Haliaeetus":      "piping",
	"Fratercula":      "puffin",
	"Balaeniceps":     "clatter",
	"Phoenicopterus":  "honk",
	"Ara":             "squawk",
	"Spheniscus":      "donkey",
	"Aptenodytes":     "warble",
	"Bubo":            "hoot",
}

// callOf picks a species' hover reaction: its movement from its family,
// its sound from the species, then its genus, then its family.
func callOf(sp species.Species) Call {
	c := familyCall(sp)
	name := cmp.Or(sp.CanonicalName, sp.ScientificName)
	first, _, _ := strings.Cut(name, " ")
	genus := cmp.Or(sp.Genus, first)
	if s, ok := speciesSounds[name]; ok {
		c.Sound = s
	} else if s, ok := genusSounds[genus]; ok {
		c.Sound = s
	}
	return c
}

// familyCall is the fallback for animals the maps above don't name.
func familyCall(sp species.Species) Call {
	switch sp.Family {
	case "Felidae":
		return Call{"pounce", "growl"}
	case "Hyaenidae":
		return Call{"pounce", "laugh"}
	case "Ursidae", "Canidae":
		return Call{"pounce", "growl"}
	case "Elephantidae":
		return Call{"stomp", "trumpet"}
	case "Hippopotamidae", "Rhinocerotidae", "Bovidae", "Cervidae", "Giraffidae", "Suidae", "Equidae":
		return Call{"stomp", "bellow"}
	case "Balaenopteridae", "Eschrichtiidae", "Balaenidae", "Monodontidae", "Physeteridae":
		return Call{"sway", "song"}
	case "Delphinidae", "Iniidae", "Phocoenidae":
		return Call{"sway", "whistle"}
	case "Phocidae", "Odobenidae", "Otariidae":
		return Call{"sway", "sealgrowl"}
	case "Hominidae", "Cercopithecidae":
		return Call{"swing", "longcall"}
	}
	switch sp.Class {
	case "Aves":
		return Call{"flutter", "chirp"}
	case "Elasmobranchii":
		return Call{"sway", "bubbles"}
	case "Crocodylia", "Squamata", "Reptilia":
		return Call{"stomp", "hiss"}
	case "Testudines":
		return Call{"sway", "breath"}
	}
	return Call{"wiggle", "rustle"}
}
