package components

import "workshop/internal/domain/species"

// Call is how a tile reacts on hover: the way it moves and the sound it makes.
type Call struct {
	Motion string
	Sound  string
}

// callOf picks a species' hover reaction from its family, then its class.
func callOf(sp species.Species) Call {
	switch sp.Family {
	case "Felidae":
		return Call{"pounce", "roar"}
	case "Hyaenidae", "Ursidae", "Canidae":
		return Call{"pounce", "growl"}
	case "Elephantidae":
		return Call{"stomp", "trumpet"}
	case "Hippopotamidae", "Rhinocerotidae", "Bovidae", "Cervidae", "Giraffidae", "Suidae":
		return Call{"stomp", "bellow"}
	case "Equidae":
		return Call{"stomp", "whinny"}
	case "Balaenopteridae", "Eschrichtiidae", "Balaenidae", "Monodontidae":
		return Call{"sway", "whalesong"}
	case "Physeteridae":
		return Call{"sway", "clicks"}
	case "Delphinidae", "Iniidae", "Phocoenidae":
		return Call{"sway", "whistle"}
	case "Phocidae", "Odobenidae", "Otariidae":
		return Call{"sway", "bark"}
	case "Hominidae", "Cercopithecidae":
		return Call{"swing", "chatter"}
	case "Strigidae":
		return Call{"flutter", "hoot"}
	case "Accipitridae":
		return Call{"flutter", "screech"}
	case "Spheniscidae", "Phoenicopteridae":
		return Call{"flutter", "honk"}
	}
	switch sp.Class {
	case "Aves":
		return Call{"flutter", "chirp"}
	case "Elasmobranchii":
		return Call{"sway", "jaws"}
	case "Crocodylia", "Squamata", "Reptilia":
		return Call{"stomp", "hiss"}
	case "Testudines":
		return Call{"sway", "hiss"}
	}
	return Call{"wiggle", "rustle"}
}
