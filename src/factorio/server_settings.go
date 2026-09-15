package factorio

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"path/filepath"
	"sort"

	"github.com/OpenFactorioServerManager/factorio-server-manager/bootstrap"
)

// ServerSettingsExampleNames are the file names, that factorio ships its
// default server settings with. The name changed between game versions, so
// all known ones are probed.
var ServerSettingsExampleNames = []string{
	"server-settings.example.json",
	"server-settings.json",
}

// addedServerSettings keeps the options, that were added after loading the
// server settings, because the installed factorio version ships them but the
// (maybe older) server-settings.json did not contain them.
var addedServerSettings = make([]string, 0)

// GetAddedServerSettings returns the options, that were added to the server
// settings while loading them.
func GetAddedServerSettings() []string {
	return addedServerSettings
}

func addToAddedServerSettings(keys []string) {
	for _, key := range keys {
		found := false

		for _, existing := range addedServerSettings {
			if existing == key {
				found = true
				break
			}
		}

		if !found {
			addedServerSettings = append(addedServerSettings, key)
		}
	}
}

// LoadServerSettingsExample loads the default server settings of the
// installed factorio version from the games `data`-directory.
func LoadServerSettingsExample() (map[string]interface{}, error) {
	config := bootstrap.GetConfig()

	return loadServerSettingsExampleFrom(config.FactorioDir)
}

// loadServerSettingsExampleFrom loads the default server settings of the
// game version that is installed in the given factorio directory.
func loadServerSettingsExampleFrom(factorioDir string) (map[string]interface{}, error) {
	var lastErr error

	for _, name := range ServerSettingsExampleNames {
		examplePath := filepath.Join(factorioDir, "data", name)

		raw, err := ioutil.ReadFile(examplePath)
		if err != nil {
			lastErr = err
			continue
		}

		example := make(map[string]interface{})
		if err = json.Unmarshal(raw, &example); err != nil {
			log.Printf("error reading default server settings %s: %s", examplePath, err)
			lastErr = err
			continue
		}

		log.Printf("Loaded default server settings of the installed factorio version from %s", examplePath)
		return example, nil
	}

	return nil, lastErr
}

// MergeServerSettingsDefaults adds every option, that the installed factorio
// version ships in its default server settings, but that is missing in the
// given (maybe created by an older version) settings. This way new options of
// a newer factorio version show up in the settings page, without the user
// having to delete or recreate their server-settings.json.
// It returns the names of the added options.
func MergeServerSettingsDefaults(settings map[string]interface{}) []string {
	config := bootstrap.GetConfig()

	return mergeServerSettingsDefaultsFrom(settings, config.FactorioDir)
}

// mergeServerSettingsDefaultsFrom adds every option of the given factorio
// installation, that is missing in the given settings.
func mergeServerSettingsDefaultsFrom(settings map[string]interface{}, factorioDir string) []string {
	added := make([]string, 0)

	if settings == nil {
		return added
	}

	example, err := loadServerSettingsExampleFrom(factorioDir)
	if err != nil {
		log.Printf("could not load default server settings, skipping adding new options: %s", err)
		return added
	}

	for key, value := range example {
		if _, exists := settings[key]; exists {
			continue
		}

		settings[key] = value
		added = append(added, key)
	}

	sort.Strings(added)
	addToAddedServerSettings(added)

	return added
}
