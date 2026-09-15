package factorio

import (
	"encoding/json"
	"io/ioutil"
	"os"
	"path/filepath"
	"testing"
)

// createTestInstall creates a factorio-installation-lookalike inside a
// temporary directory. dlcMods are placed inside the games `data`-directory,
// enabledMods are written into `mods/mod-list.json`.
func createTestInstall(t *testing.T, dlcMods []string, modList []ModSimple) (factorioDir string, modsDir string) {
	t.Helper()

	factorioDir = t.TempDir()
	modsDir = filepath.Join(factorioDir, "mods")

	if err := os.MkdirAll(filepath.Join(factorioDir, "data"), 0755); err != nil {
		t.Fatalf("could not create data directory: %s", err)
	}
	if err := os.MkdirAll(modsDir, 0755); err != nil {
		t.Fatalf("could not create mods directory: %s", err)
	}

	for _, modName := range dlcMods {
		modDir := filepath.Join(factorioDir, "data", modName)
		if err := os.MkdirAll(modDir, 0755); err != nil {
			t.Fatalf("could not create dlc mod directory %s: %s", modName, err)
		}

		info := ModInfo{
			Name:    modName,
			Title:   modName,
			Version: "2.0.32",
		}
		raw, err := json.Marshal(info)
		if err != nil {
			t.Fatalf("could not marshal mod info: %s", err)
		}

		if err := ioutil.WriteFile(filepath.Join(modDir, "info.json"), raw, 0644); err != nil {
			t.Fatalf("could not write mod info for %s: %s", modName, err)
		}
	}

	if modList != nil {
		raw, err := json.Marshal(ModSimpleList{Mods: modList})
		if err != nil {
			t.Fatalf("could not marshal mod-list: %s", err)
		}

		if err := ioutil.WriteFile(filepath.Join(modsDir, "mod-list.json"), raw, 0644); err != nil {
			t.Fatalf("could not write mod-list.json: %s", err)
		}
	}

	return factorioDir, modsDir
}

func readModList(t *testing.T, modsDir string) ModSimpleList {
	t.Helper()

	raw, err := ioutil.ReadFile(filepath.Join(modsDir, "mod-list.json"))
	if err != nil {
		t.Fatalf("could not read mod-list.json: %s", err)
	}

	var modList ModSimpleList
	if err := json.Unmarshal(raw, &modList); err != nil {
		t.Fatalf("could not unmarshal mod-list.json: %s", err)
	}

	return modList
}

func modEnabled(modList ModSimpleList, modName string) (enabled bool, found bool) {
	for _, mod := range modList.Mods {
		if mod.Name == modName {
			return mod.Enabled, true
		}
	}

	return false, false
}

func TestGetDlcStateIn(t *testing.T) {
	factorioDir, modsDir := createTestInstall(t, DlcModNames, []ModSimple{
		{Name: "base", Enabled: true},
		{Name: "space-age", Enabled: true},
		{Name: "quality", Enabled: false},
		{Name: "elevated-rails", Enabled: false},
	})

	state, err := getDlcStateIn(factorioDir, modsDir)
	if err != nil {
		t.Fatalf("error getting dlc state: %s", err)
	}

	if !state.Available {
		t.Error("expected the DLC to be detected as installed")
	}

	// one of three mods is enabled, so the DLC does not count as enabled
	if state.Enabled {
		t.Error("expected the DLC to be disabled, when not every DLC-mod is enabled")
	}

	if len(state.Mods) != 3 {
		t.Fatalf("expected 3 DLC mods, got %d", len(state.Mods))
	}

	for _, mod := range state.Mods {
		if !mod.Installed {
			t.Errorf("expected mod %s to be installed", mod.Name)
		}
		if mod.Location != "data" {
			t.Errorf("expected mod %s to be located in the games data dir, got %s", mod.Name, mod.Location)
		}
		if mod.Version != "2.0.32" {
			t.Errorf("expected version 2.0.32 for mod %s, got %s", mod.Name, mod.Version)
		}
	}
}

func TestGetDlcStateWithoutDlc(t *testing.T) {
	factorioDir, modsDir := createTestInstall(t, nil, []ModSimple{
		{Name: "base", Enabled: true},
	})

	state, err := getDlcStateIn(factorioDir, modsDir)
	if err != nil {
		t.Fatalf("error getting dlc state: %s", err)
	}

	if state.Available {
		t.Error("expected the DLC not to be detected")
	}
	if state.Enabled {
		t.Error("expected the DLC not to be enabled")
	}

	for _, mod := range state.Mods {
		if mod.Installed {
			t.Errorf("expected mod %s not to be installed", mod.Name)
		}
	}
}

func TestSetDlcEnabledEnablesAllInstalledDlcMods(t *testing.T) {
	factorioDir, modsDir := createTestInstall(t, DlcModNames, []ModSimple{
		{Name: "base", Enabled: true},
	})

	state, skipped, err := setDlcEnabledIn(factorioDir, modsDir, true)
	if err != nil {
		t.Fatalf("error enabling dlc: %s", err)
	}

	if len(skipped) != 0 {
		t.Errorf("expected no skipped mods, got %v", skipped)
	}
	if !state.Enabled {
		t.Error("expected the dlc to be enabled after enabling it")
	}

	modList := readModList(t, modsDir)
	if enabled, found := modEnabled(modList, "base"); !found || !enabled {
		t.Error("expected the base mod to stay enabled")
	}

	for _, modName := range DlcModNames {
		if enabled, found := modEnabled(modList, modName); !found || !enabled {
			t.Errorf("expected mod %s to be enabled in mod-list.json", modName)
		}
	}
}

func TestSetDlcEnabledSkipsMissingDlcMods(t *testing.T) {
	factorioDir, modsDir := createTestInstall(t, nil, []ModSimple{
		{Name: "base", Enabled: true},
	})

	state, skipped, err := setDlcEnabledIn(factorioDir, modsDir, true)
	if err != nil {
		t.Fatalf("error enabling dlc: %s", err)
	}

	if len(skipped) != len(DlcModNames) {
		t.Errorf("expected all %d dlc mods to be skipped, got %v", len(DlcModNames), skipped)
	}
	if state.Enabled {
		t.Error("expected the dlc not to be enabled")
	}

	// a mod, that is not installed, must never be added as enabled,
	// otherwise factorio would refuse to start
	modList := readModList(t, modsDir)
	for _, modName := range DlcModNames {
		if enabled, found := modEnabled(modList, modName); found && enabled {
			t.Errorf("mod %s must not be enabled, it is not installed", modName)
		}
	}
}

func TestSetDlcEnabledDisablesDlcMods(t *testing.T) {
	factorioDir, modsDir := createTestInstall(t, DlcModNames, []ModSimple{
		{Name: "base", Enabled: true},
		{Name: "space-age", Enabled: true},
		{Name: "quality", Enabled: true},
		{Name: "elevated-rails", Enabled: true},
	})

	state, skipped, err := setDlcEnabledIn(factorioDir, modsDir, false)
	if err != nil {
		t.Fatalf("error disabling dlc: %s", err)
	}

	if len(skipped) != 0 {
		t.Errorf("expected no skipped mods, got %v", skipped)
	}
	if state.Enabled {
		t.Error("expected the dlc to be disabled after disabling it")
	}

	modList := readModList(t, modsDir)
	if enabled, found := modEnabled(modList, "base"); !found || !enabled {
		t.Error("expected the base mod to stay enabled")
	}

	for _, modName := range DlcModNames {
		if enabled, found := modEnabled(modList, modName); !found || enabled {
			t.Errorf("expected mod %s to be disabled in mod-list.json", modName)
		}
	}
}

func TestSetDlcEnabledDisableKeepsModListInSync(t *testing.T) {
	// disabling the DLC on an installation without the DLC must not fail and
	// must leave the mod-list.json valid
	factorioDir, modsDir := createTestInstall(t, nil, nil)

	_, _, err := setDlcEnabledIn(factorioDir, modsDir, false)
	if err != nil {
		t.Fatalf("error disabling dlc: %s", err)
	}

	modList := readModList(t, modsDir)
	if enabled, found := modEnabled(modList, "base"); !found || !enabled {
		t.Error("expected the base mod to be present and enabled")
	}
}
