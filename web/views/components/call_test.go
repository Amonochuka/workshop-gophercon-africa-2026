package components

import (
	"os"
	"regexp"
	"testing"

	"workshop/internal/domain/species"
)

func TestCallSoundsExist(t *testing.T) {
	t.Parallel()

	src, err := os.ReadFile("../../assets/js/callsynth.js")
	if err != nil {
		t.Fatal(err)
	}
	defined := map[string]bool{}
	for _, m := range regexp.MustCompile(`(?m)^\t\t(\w+)\(out, t`).FindAllStringSubmatch(string(src), -1) {
		defined[m[1]] = true
	}

	used := map[string]string{}
	for name, s := range speciesSounds {
		used[name] = s
	}
	for name, s := range genusSounds {
		used[name] = s
	}
	for _, fam := range []string{"Felidae", "Hyaenidae", "Ursidae", "Elephantidae", "Bovidae", "Balaenopteridae", "Delphinidae", "Phocidae", "Hominidae", "Unknown"} {
		used[fam] = familyCall(species.Species{Family: fam}).Sound
	}
	for _, class := range []string{"Aves", "Elasmobranchii", "Crocodylia", "Testudines"} {
		used[class] = familyCall(species.Species{Class: class}).Sound
	}

	for name, s := range used {
		if !defined[s] {
			t.Errorf("%s uses sound %q, which callsynth.js doesn't define", name, s)
		}
	}
}

func TestCallOf(t *testing.T) {
	t.Parallel()

	tt := map[string]struct {
		sp   species.Species
		want Call
	}{
		"Lion roars":         {species.Species{Family: "Felidae", CanonicalName: "Panthera leo"}, Call{"pounce", "lion"}},
		"Leopard saws":       {species.Species{Family: "Felidae", Genus: "Panthera", CanonicalName: "Panthera pardus"}, Call{"pounce", "saw"}},
		"Cheetah chirps":     {species.Species{Family: "Felidae", Genus: "Acinonyx", CanonicalName: "Acinonyx jubatus"}, Call{"pounce", "cheetah"}},
		"Genus from name":    {species.Species{Family: "Hyaenidae", CanonicalName: "Crocuta crocuta"}, Call{"pounce", "laugh"}},
		"Unknown cat growls": {species.Species{Family: "Felidae", CanonicalName: "Lynx lynx"}, Call{"pounce", "growl"}},
		"Nothing known":      {species.Species{}, Call{"wiggle", "rustle"}},
	}
	for name, test := range tt {
		t.Run(name, func(t *testing.T) {
			t.Parallel()
			if got := callOf(test.sp); got != test.want {
				t.Errorf("got %+v, want %+v", got, test.want)
			}
		})
	}
}
