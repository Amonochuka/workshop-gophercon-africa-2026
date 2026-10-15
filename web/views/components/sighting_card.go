package components

import "workshop/internal/domain/sighting"

// firstPhoto returns the first still image of a sighting, if it has one.
func firstPhoto(media []sighting.Media) (sighting.Media, bool) {
	for _, m := range media {
		if m.Type == "StillImage" && m.URL != "" {
			return m, true
		}
	}
	return sighting.Media{}, false
}
