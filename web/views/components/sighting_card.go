package components

import (
	"strings"

	"workshop/internal/domain/sighting"
)

// photoCaption names the animal, where it was seen and who took the photo.
func photoCaption(s sighting.Sighting, m sighting.Media) string {
	caption := displayName(s.Species) + " · " + place(s.Location)
	if m.Creator != "" {
		caption += " · © " + m.Creator
	}
	return strings.TrimSpace(caption)
}

// firstPhoto returns the first still image of a sighting, if it has one.
func firstPhoto(media []sighting.Media) (sighting.Media, bool) {
	for _, m := range media {
		if m.Type == "StillImage" && m.URL != "" {
			return m, true
		}
	}
	return sighting.Media{}, false
}
