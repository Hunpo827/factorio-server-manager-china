package factorio

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/OpenFactorioServerManager/factorio-server-manager/bootstrap"
)

// DlcModNames are the mods, that are shipped with the official "Space Age"
// DLC. They are not placed inside the `mods`-directory (they are shipped
// inside the `data`-directory of the factorio installation), so they never
// show up in the normal mod-list. Whether they are loaded or not, is - like
// for every other mod - controlled by `mods/mod-list.json`.
var DlcModNames = []string{"space-age", "quality", "elevated-rails"}

// dlcModTitles maps the internal mod-name to a human readable title
var dlcModTitles = map[string]string{
	"space-age":      "Space Age",
	"quality":        "Quality",
	"elevated-rails": "Elevated Rails",
}

// DlcModState is the state of a single official DLC mod
type DlcModState struct {
	Name      string `json:"name"`
	Title     string `json:"title"`
	Version   string `json:"version"`
	Installed bool   `json:"installed"`
	Enabled   bool   `json:"enabled"`
	Location  string `json:"location"`
}

// DlcState describes, if the DLC is installed and if the server currently
// runs with it.
type DlcState struct {
	Available bool          `json:"available"`
	Enabled   bool          `json:"enabled"`
	Mods      []DlcModState `json:"mods"`
}

// readModInfoFromPath reads the info.json of a mod, that is either an
// unpacked folder or a zip-file containing the mod.
func readModInfoFromPath(path string) (ModInfo, error) {
	var modInfo ModInfo

	stat, err := os.Stat(path)
	if err != nil {
		return modInfo, err
	}

	if stat.IsDir() {
		raw, err := ioutil.ReadFile(filepath.Join(path, "info.json"))
		if err != nil {
			return modInfo, err
		}

		return modInfo, json.Unmarshal(raw, &modInfo)
	}

	rc, err := OpenArchiveFile(path, "info.json")
	if err != nil {
		return modInfo, err
	}
	defer rc.Close()

	raw, err := ioutil.ReadAll(rc)
	if err != nil {
		return modInfo, err
	}

	return modInfo, json.Unmarshal(raw, &modInfo)
}

// findDlcMod searches one of the official DLC mods in the factorio
// installation. Normally the DLC mods live in the `data`-directory, but for
// completeness the mods-directory is checked as well.
func findDlcMod(modName string) DlcModState {
	config := bootstrap.GetConfig()

	return findDlcModIn(config.FactorioDir, config.FactorioModsDir, modName)
}

// findDlcModIn looks for one of the official DLC mods inside the given
// directories.
func findDlcModIn(factorioDir string, modsDir string, modName string) DlcModState {
	state := DlcModState{
		Name:  modName,
		Title: dlcModTitles[modName],
	}
	if state.Title == "" {
		state.Title = modName
	}

	// 1) the mods coming with the game itself
	dataDir := filepath.Join(factorioDir, "data")
	dataEntries, err := ioutil.ReadDir(dataDir)
	if err != nil {
		log.Printf("error reading factorio data directory %s: %s", dataDir, err)
	}

	for _, entry := range dataEntries {
		if !entry.IsDir() {
			continue
		}

		// the version might be part of the folder name: space-age_2.0.32
		if entry.Name() != modName && !strings.HasPrefix(entry.Name(), modName+"_") {
			continue
		}

		modInfo, err := readModInfoFromPath(filepath.Join(dataDir, entry.Name()))
		if err != nil {
			log.Printf("error reading info.json of DLC mod %s: %s", entry.Name(), err)
			continue
		}

		state.Version = modInfo.Version
		state.Location = "data"
		state.Installed = true
		return state
	}

	// 2) the mod might be installed as a normal mod
	modEntries, err := ioutil.ReadDir(modsDir)
	if err != nil {
		log.Printf("error reading factorio mods directory %s: %s", modsDir, err)
		return state
	}

	for _, entry := range modEntries {
		name := entry.Name()
		var modPath string

		if entry.IsDir() {
			if name != modName {
				continue
			}
			modPath = filepath.Join(modsDir, name)
		} else {
			if !strings.HasSuffix(name, ".zip") || !strings.HasPrefix(name, modName+"_") {
				continue
			}
			modPath = filepath.Join(modsDir, name)
		}

		modInfo, err := readModInfoFromPath(modPath)
		if err != nil || modInfo.Name != modName {
			continue
		}

		state.Version = modInfo.Version
		state.Location = "mods"
		state.Installed = true
		return state
	}

	return state
}

// GetDlcState returns the current state of the official DLC mods
func GetDlcState() (DlcState, error) {
	config := bootstrap.GetConfig()

	return getDlcStateIn(config.FactorioDir, config.FactorioModsDir)
}

func getDlcStateIn(factorioDir string, modsDir string) (DlcState, error) {
	state := DlcState{
		Mods: make([]DlcModState, 0, len(DlcModNames)),
	}

	modList, err := newModSimpleList(modsDir)
	if err != nil {
		log.Printf("error reading mod-list.json for DLC state: %s", err)
		return state, err
	}

	installedCount := 0
	enabledCount := 0

	for _, modName := range DlcModNames {
		modState := findDlcModIn(factorioDir, modsDir, modName)

		for _, simpleMod := range modList.Mods {
			if simpleMod.Name == modName {
				modState.Enabled = simpleMod.Enabled
				break
			}
		}

		if modState.Installed {
			installedCount++
			if modState.Enabled {
				enabledCount++
			}
		}

		state.Mods = append(state.Mods, modState)
	}

	state.Available = installedCount > 0
	// the DLC only counts as enabled, if every installed DLC mod is enabled
	state.Enabled = state.Available && enabledCount == installedCount

	return state, nil
}

// SetDlcEnabled enables or disables all official DLC mods.
// It returns the new state and the names of the mods, that could not be
// enabled, because they are not installed.
func SetDlcEnabled(enabled bool) (DlcState, []string, error) {
	config := bootstrap.GetConfig()

	return setDlcEnabledIn(config.FactorioDir, config.FactorioModsDir, enabled)
}

func setDlcEnabledIn(factorioDir string, modsDir string, enabled bool) (DlcState, []string, error) {
	skipped := make([]string, 0)

	modList, err := newModSimpleList(modsDir)
	if err != nil {
		log.Printf("error reading mod-list.json for setting DLC state: %s", err)
		return DlcState{}, skipped, err
	}

	for _, modName := range DlcModNames {
		modState := findDlcModIn(factorioDir, modsDir, modName)

		// never enable a mod that is not there, factorio would refuse to start
		if enabled && !modState.Installed {
			skipped = append(skipped, modName)
			continue
		}

		if _, err := modList.SetModEnabled(modName, enabled); err != nil {
			log.Printf("error setting DLC mod %s to enabled=%v: %s", modName, enabled, err)
			return DlcState{}, skipped, err
		}
	}

	state, err := getDlcStateIn(factorioDir, modsDir)

	return state, skipped, err
}
