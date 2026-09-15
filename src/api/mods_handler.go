package api

import (
	"archive/zip"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/OpenFactorioServerManager/factorio-server-manager/bootstrap"
	"github.com/OpenFactorioServerManager/factorio-server-manager/factorio"
	"github.com/OpenFactorioServerManager/factorio-server-manager/lockfile"
)

func CreateNewMods(w http.ResponseWriter) (modList factorio.Mods, resp interface{}, err error) {
	config := bootstrap.GetConfig()
	modList, err = factorio.NewMods(config.FactorioModsDir)
	if err != nil {
		resp = fmt.Sprintf("创建模组对象失败：%s", err)
		log.Println(resp)
		w.WriteHeader(http.StatusInternalServerError)
	}
	return
}

func ReadFromRequestBody(w http.ResponseWriter, r *http.Request, data interface{}) (resp interface{}, err error) {
	//Get Data out of the request
	body, resp, err := ReadRequestBody(w, r)
	if err != nil {
		return
	}

	err = json.Unmarshal(body, data)
	if err != nil {
		resp = fmt.Sprintf("解析请求 JSON 失败：%s", err)
		log.Println(resp)
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	return
}

// Returns JSON response of all mods installed in factorio/mods
func ListInstalledModsHandler(w http.ResponseWriter, r *http.Request) {
	var err error
	var resp interface{}

	defer func() {
		WriteResponse(w, resp)
	}()

	w.Header().Set("Content-Type", "application/json;charset=UTF-8")

	modList, resp, err := CreateNewMods(w)
	if err != nil {
		return
	}

	resp = modList.ListInstalledMods().ModsResult
}

func ModToggleHandler(w http.ResponseWriter, r *http.Request) {
	var err error
	var resp interface{}

	defer func() {
		WriteResponse(w, resp)
	}()

	w.Header().Set("Content-Type", "application/json;charset=UTF-8")

	var data struct {
		Name string `json:"name"`
	}

	resp, err = ReadFromRequestBody(w, r, &data)
	if err != nil {
		return
	}

	mods, resp, err := CreateNewMods(w)
	if err != nil {
		return
	}

	err, resp = mods.ModSimpleList.ToggleMod(data.Name)
	if err != nil {
		resp = fmt.Sprintf("切换模组启用状态失败：%s", err)
		log.Println(resp)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
}

func ModDeleteHandler(w http.ResponseWriter, r *http.Request) {
	var err error
	var resp interface{}

	defer func() {
		WriteResponse(w, resp)
	}()

	w.Header().Set("Content-Type", "application/json;charset=UTF-8")

	var data struct {
		Name string `json:"name"`
	}

	// Get Data out of the request
	resp, err = ReadFromRequestBody(w, r, &data)
	if err != nil {
		return
	}

	modList, resp, err := CreateNewMods(w)
	if err != nil {
		return
	}

	err = modList.DeleteMod(data.Name)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		resp = fmt.Sprintf("删除模组 {%s} 失败：%s", data.Name, err)
		log.Println(resp)
		return
	}

	resp = data.Name
}

func ModDeleteAllHandler(w http.ResponseWriter, r *http.Request) {
	var err error
	var resp interface{}

	defer func() {
		WriteResponse(w, resp)
	}()

	w.Header().Set("Content-Type", "application/json;charset=UTF-8")

	//delete mods folder
	err = factorio.DeleteAllMods()
	if err != nil {
		resp = fmt.Sprintf("删除全部模组失败：%s", err)
		log.Println(resp)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	resp = nil
}

func ModUpdateHandler(w http.ResponseWriter, r *http.Request) {
	var err error
	var resp interface{}

	defer func() {
		WriteResponse(w, resp)
	}()

	w.Header().Set("Content-Type", "application/json;charset=UTF-8")

	//Get Data out of the request
	var modData struct {
		Name        string `json:"modName"`
		DownloadUrl string `json:"downloadUrl"`
		Filename    string `json:"fileName"`
	}

	resp, err = ReadFromRequestBody(w, r, &modData)
	if err != nil {
		return
	}

	mods, resp, err := CreateNewMods(w)
	if err != nil {
		return
	}

	err = mods.UpdateMod(modData.Name, modData.DownloadUrl, modData.Filename)
	if err != nil {
		resp = fmt.Sprintf("更新模组 {%s} 失败：%s", modData.Name, err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	installedMods := mods.ListInstalledMods().ModsResult
	for _, mod := range installedMods {
		if mod.Name == modData.Name {
			resp = mod
			return
		}
	}

	resp = fmt.Sprintf(`找不到模组 %s`, modData.Name)
	log.Println(resp)
	w.WriteHeader(http.StatusNotFound)
	return
}

func ModUploadHandler(w http.ResponseWriter, r *http.Request) {
	var err error
	var resp interface{}

	defer func() {
		WriteResponse(w, resp)
	}()

	w.Header().Set("Content-Type", "application/json;charset=UTF-8")

	formFile, fileHeader, err := r.FormFile("mod_file")
	if err != nil {
		resp = fmt.Sprintf("获取上传文件失败：%s", err)
		log.Println(resp)
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	defer formFile.Close()

	mods, resp, err := CreateNewMods(w)
	if err != nil {
		return
	}

	// if the file is a zip file, we handle it as mod
	// if the file is mod-settings.dat or mod-list.json, we just replace the
	if filepath.Ext(fileHeader.Filename) == ".zip" {
		err = mods.UploadMod(formFile, fileHeader)
		if err != nil {
			resp = fmt.Sprintf("保存模组文件失败：%s", err)
			log.Println(resp)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
	} else if fileHeader.Filename == "mod-settings.dat" || fileHeader.Filename == "mod-list.json" {
		modsDir := filepath.Join(bootstrap.GetConfig().FactorioModsDir, fileHeader.Filename)
		file, err := os.Create(modsDir)
		if err != nil {
			resp = fmt.Sprintf("创建文件 %s 失败：%s", fileHeader.Filename, err)
			log.Println(resp)
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		_, err = io.Copy(file, formFile)
		if err != nil {
			resp = fmt.Sprintf("保存文件 %s 失败：%s", fileHeader.Filename, err)
			log.Println(resp)
			w.WriteHeader(http.StatusBadRequest)
			return
		}
	} else {
		resp = fmt.Sprintf("上传的文件必须是模组压缩包（.zip）、mod-settings.dat 或 mod-list.json")
		log.Println(resp)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	resp = mods.ListInstalledMods()
}

func ModDownloadHandler(w http.ResponseWriter, r *http.Request) {
	var err error

	zipWriter := zip.NewWriter(w)
	defer zipWriter.Close()
	config := bootstrap.GetConfig()
	//iterate over folder and create everything in the zip
	err = filepath.Walk(config.FactorioModsDir, func(path string, info os.FileInfo, err error) error {
		if info.IsDir() == false {
			//Lock the file, that we are want to read
			err := factorio.FileLock.RLock(path)
			if err != nil {
				log.Printf("error locking file for reading, something else has locked it")
				return err
			}
			defer factorio.FileLock.RUnlock(path)

			writer, err := zipWriter.Create(info.Name())
			if err != nil {
				log.Printf("error on creating new file inside zip: %s", err)
				return err
			}

			file, err := os.Open(path)
			if err != nil {
				log.Printf("error on opening modfile: %s", err)
				return err
			}
			defer file.Close()

			_, err = io.Copy(writer, file)
			if err != nil {
				log.Printf("error on copying file into zip: %s", err)
				return err
			}

			err = file.Close()
			if err != nil {
				log.Printf("error closing file: %s", err)
				return err
			}
		}

		return nil
	})
	if err == lockfile.ErrorAlreadyLocked {
		w.WriteHeader(http.StatusLocked)
		return
	}
	if err != nil {
		log.Printf("error on walking over the mods: %s", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	writerHeader := w.Header()
	writerHeader.Set("Content-Type", "application/zip;charset=UTF-8")
	writerHeader.Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", "all_installed_mods.zip"))
}

// DlcStateResponse is the answer of the DLC-endpoints. Skipped contains the
// DLC-mods, that could not be enabled, because they are not installed.
type DlcStateResponse struct {
	factorio.DlcState
	Skipped []string `json:"skipped"`
}

func newDlcStateResponse(state factorio.DlcState, skipped []string) DlcStateResponse {
	if skipped == nil {
		skipped = make([]string, 0)
	}

	return DlcStateResponse{
		DlcState: state,
		Skipped:  skipped,
	}
}

// GetDlcStateHandler returns the state of the official "Space Age" DLC mods
func GetDlcStateHandler(w http.ResponseWriter, r *http.Request) {
	var err error
	var resp interface{}

	defer func() {
		WriteResponse(w, resp)
	}()

	w.Header().Set("Content-Type", "application/json;charset=UTF-8")

	var state factorio.DlcState
	state, err = factorio.GetDlcState()
	if err != nil {
		resp = fmt.Sprintf("读取 DLC 状态失败: %s", err)
		log.Println(resp)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	resp = newDlcStateResponse(state, nil)
}

// SetDlcStateHandler enables or disables the official "Space Age" DLC mods
func SetDlcStateHandler(w http.ResponseWriter, r *http.Request) {
	var err error
	var resp interface{}

	defer func() {
		WriteResponse(w, resp)
	}()

	w.Header().Set("Content-Type", "application/json;charset=UTF-8")

	var data struct {
		Enabled bool `json:"enabled"`
	}
	resp, err = ReadFromRequestBody(w, r, &data)
	if err != nil {
		return
	}

	state, skipped, err := factorio.SetDlcEnabled(data.Enabled)
	if err != nil {
		resp = fmt.Sprintf("切换 DLC 状态失败: %s", err)
		log.Println(resp)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if data.Enabled && len(skipped) > 0 {
		log.Printf("could not enable DLC mods %s, they are not installed", strings.Join(skipped, ", "))
	}

	resp = newDlcStateResponse(state, skipped)
}

// LoadModsFromSaveHandler returns JSON response with the found mods
func LoadModsFromSaveHandler(w http.ResponseWriter, r *http.Request) {
	var err error
	var resp interface{}

	defer func() {
		WriteResponse(w, resp)
	}()

	w.Header().Set("Content-Type", "application/json;charset=UTF-8")

	//Get Data out of the request
	var saveFileStruct struct {
		Name string `json:"saveFile"`
	}

	resp, err = ReadFromRequestBody(w, r, &saveFileStruct)
	if err != nil {
		return
	}

	config := bootstrap.GetConfig()
	path := filepath.Join(config.FactorioSavesDir, saveFileStruct.Name)

	f, err := factorio.OpenArchiveFile(path, "level.dat", "level-init.dat")
	if err != nil {
		resp = fmt.Sprintf("无法打开存档的 level 文件：%v", err)
		log.Println(resp)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer f.Close()

	var header factorio.SaveHeader
	err = header.ReadFrom(f)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		resp = fmt.Sprintf("无法读取存档头部信息：%v", err)
		log.Println(resp)
		return
	}

	resp = header
}
