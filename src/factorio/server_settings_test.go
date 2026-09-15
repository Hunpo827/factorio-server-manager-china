package factorio

import (
	"encoding/json"
	"io/ioutil"
	"os"
	"path/filepath"
	"testing"
)

// writeServerSettingsExample writes a server-settings.example.json, like the
// one, that factorio ships inside its `data`-directory.
func writeServerSettingsExample(t *testing.T, factorioDir string, settings map[string]interface{}) {
	t.Helper()

	dataDir := filepath.Join(factorioDir, "data")
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		t.Fatalf("could not create data directory: %s", err)
	}

	raw, err := json.Marshal(settings)
	if err != nil {
		t.Fatalf("could not marshal default settings: %s", err)
	}

	examplePath := filepath.Join(dataDir, "server-settings.example.json")
	if err := ioutil.WriteFile(examplePath, raw, 0644); err != nil {
		t.Fatalf("could not write default settings: %s", err)
	}
}

func TestMergeServerSettingsDefaultsAddsNewOptions(t *testing.T) {
	factorioDir := t.TempDir()

	// the game of the "new" version ships two options, that the used
	// server-settings.json does not know yet
	writeServerSettingsExample(t, factorioDir, map[string]interface{}{
		"name": "My Server",
		"_comment_name": "Name of the game",
		"max_upload_in_kilobytes_per_second": 0,
		"_comment_max_upload_in_kilobytes_per_second": "Maximum upload speed",
		"max_upload_slots": 5,
	})

	settings := map[string]interface{}{
		"name": "My old Server",
	}

	added := mergeServerSettingsDefaultsFrom(settings, factorioDir)

	expected := []string{
		"_comment_max_upload_in_kilobytes_per_second",
		"_comment_name",
		"max_upload_in_kilobytes_per_second",
		"max_upload_slots",
	}

	if len(added) != len(expected) {
		t.Fatalf("expected %v to be added, got %v", expected, added)
	}
	for i, key := range expected {
		if added[i] != key {
			t.Errorf("expected added[%d] to be %s, got %s", i, key, added[i])
		}
	}

	// existing options must never be overwritten by the defaults
	if settings["name"] != "My old Server" {
		t.Errorf("expected the existing option to be kept, got %v", settings["name"])
	}
	if settings["max_upload_slots"] != float64(5) {
		t.Errorf("expected the new option to be added, got %v", settings["max_upload_slots"])
	}
}

func TestMergeServerSettingsDefaultsWithoutExample(t *testing.T) {
	factorioDir := t.TempDir()

	settings := map[string]interface{}{
		"name": "My Server",
	}

	added := mergeServerSettingsDefaultsFrom(settings, factorioDir)

	if len(added) != 0 {
		t.Errorf("expected nothing to be added, got %v", added)
	}
	if len(settings) != 1 {
		t.Errorf("expected the settings to be untouched, got %v", settings)
	}
}
