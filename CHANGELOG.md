# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.11.0] - TBD
### Added
- 游戏 DLC（官方模组）总开关：可以在模组页一键开启/关闭《太空时代》DLC
  （`space-age`、`quality`、`elevated-rails`）。这些模组随游戏本体安装在 `data` 目录中，
  并不会出现在普通的模组列表里，因此以前无法在管理器中开关。
- 自动补齐新版游戏新增的服务器设置项：加载 `server-settings.json` 时，会把当前游戏版本
  （如 2.0）默认文件中存在、而配置文件里缺失的选项自动补上，并在界面中以“（新增）”标记。
- 中文文档：重写 `README.md` 与 `docker/README.md`，补充安装部署、配置项说明、
  命令行参数与环境变量、首次使用步骤与常见问题

### Changed
- Configuration environment variables are now uppercase and prefixed with FSM
- updated all dependencies - Thanks to @jannaahs and @knoxfighter
- removed CGO as dependency
- 界面、提示信息与错误信息全部改为中文
- 模组门户的版本兼容性判断改为与已安装模组一致（必须主次版本相同），
  修复了 2.0 服务器上把 1.1 版本模组显示为“兼容”的问题
- 修复服务器设置页面表单字段未注册、导致无法保存的问题
- 修复模组页“删除全部模组”按钮因 `&&` 链接写法而不显示的问题

## [0.10.1] - 2021-03-09
### Fixed
- Single admin user can no longer be deleted (so there is always a user)
- fixed incompatibility to glibc 2.32 by linking dynamic on linux
- Moved from alpine to ubuntu docker image base, to prevent factorio not running correctly

## [0.10.0] - 2021-02-10
### Added
- Config files can be defined with absolute paths. - Thanks to @FoxAmes
- Support for >= 1.1.14 factorio saves - Thanks to @knoxfighter
- Setting in `info.json` to allow usage without ssl/tls - Thanks to @knoxfighter

### Changed
- Rework of the authentication, to have a bit more security. - Thanks to @knoxfighter
- Changed from leveldb to sqlite3 as backend database. - Thanks to @knoxfighter
- generate new random passwords, if no exist, or if they are "factorio". - Thanks to @knoxfighter
- Use "OpenFactorioServerManager" instead of "mroote" as go package name. - Thanks to @mroote
- Disable mods-page, while server is running - Thanks to @knoxfighter
- Renamed GO-package from `mroote` to `OpenFactorioServerManager` to match git repo - Thanks to @mroote

### Fixed
- old factorio versions depended by mods always shown as compatible - Thanks to @knoxfighter
- Crosscompilation with mingw-w64 on linux. (Broke with sqlite3) - Thanks to @knoxfighter
- Crash on async writing to websocket room array. - Thanks to @knoxfighter

## [0.9.0] - 2021-01-07
### Added
- Autostart factorio, when starting the server-manager - Thanks to @Psychomantis71

### Changed
- Complete rework of the UI - Thanks to @jannaahs
- Backend is refactored and improved - Thanks to @knoxfighter and @jannaahs
- Rework of the docker image, so it allows easy updating of factorio - Thanks to @ita-sammann

### Fixed
- Console page is now working correctly - Thanks to @jannaahs
- Mod Search fixed by new implementation, which does not rely on the search endpoint of the mod portal - Thanks to @jannaahs
- Listen on port 80, previously port 8080 was used. Can be changed with `--port <port>`
- Update version numbers in Docker containers

## [0.8.2] - 2020-01-08
Many bugfixes and a few small features in this release.
- Adds a flag for a custom glibc version, required on some distros such as CentOS
- bugfixes with file handling
- UI fixes and improvements
- CI bug fixes and build improvements
- and more bugfixes

Special thanks to @knoxfighter for all the contributions.

### Added
- Support for 0.17 server-adminlist.json
- Support for custom glibc location (RHEL/CENTOS)

### Changed
- Use bootstrap-fileinputs for savefile upload
- Login-Page uses bootstrap 4

### Fixed
- Login Page Design
- Sweetalert2 API changes
- allow_commands not misinterpreted as boolean anymore
- Fixed some filepaths on windows
- Fixed hardcoded Settings Path
- Fixed Upgrading, Removing Mods on Windows results in error

## [0.8.1] - 2019-03-01
### Fixed
- Fixed redirect, when not logged in
- Fixed login page completely white

## [0.8.0] - 2019-02-27
This release contains many bug fixes and features. Thanks to @knoxfighter @sean-callahan for the contributions!
- Fixes error in Factorio 0.17 saves
- Refactors and various bug fixes

## [0.7.5] - 2018-08-08
## Fixed
- fixes crash when mods have no basemodversion defined

## [0.7.4] - 2018-08-04
- Ability to auto download mods used in a save file courtesy @knoxfighter
- Fix bug in mod logging courtesy @c0nnex

## [0.7.3] - 2018-06-02
- Fixes fields in the settings dialog unable to be set to false. Courtesy @winadam.
- Various bugfixes in the mod settings page regarding version compatability. Courtesy @knoxfighter.

## [0.7.2] - 2018-05-02
### Fixed
- Fixes an error when searching in the mod portal.

## [0.7.1] - 2018-02-11
### Fixed
- Fixes an error in the configuration form where some fields were not editable.

## [0.7.0] - 2018-01-21
- Rewritten mods section now supporting installing mods directly from the Factorio mod portal and many other features courtesy @knoxfighter
- Various bug fixes

## [0.6.1] - 2017-12-22
- Adds the ability to specify the IP address for the Factorio game server to bind too.
- Updates the --rcon-password flag
- Small fixes

## [0.6.0] - 2017-01-25
This release adds a console feature using rcon to send commands and chat from the management interface.

## [0.5.2] - 2016-11-01
This release moves the server-settings.json config file. It will now save the file in the factorio/config directory.

## [0.5.1] - 2016-10-31
- Fixed bug where server-settings.json file is overwritten with default settings
- Started adding UI for editing the server-settings.json file

## [0.5.0] - 2016-10-11
- This release adds beta support for Windows users.
- Various updates for Factorio 0.14 are also included.

## [0.4.3] - 2016-09-15
This release has some small bug fixes in order to support Factorio server 0.14.
- Made the --latency-ms optional as it is removed in version 0.14
- Improved some error handling messages when starting the server.

## [0.4.2] - 2016-07-13
This release fixes a bug with Factorio 0.13 where the full path for save files must be specified when launching the server.

## [0.4.1] - 2016-05-15
This release fixes a bug where the UI reports an error when the Factorio Server was successfully started.

## [0.4.0] - 2016-05-15
### New features
- Abillity to create modpacks for easy distribution of mods
- Multiple users are now supported, create and delete users in the settings menu

### Features
- Allows control of the Factorio Server, starting and stopping the Factorio binary.
- Allows the management of save files, upload, download and delete saves.
- Manage installed mods, upload new ones, delete uneeded mods. Enable or disable individual mods.
- Allow viewing of the server logs and current configuration.
- Authentication for protecting against unauthorized users
- Available as a Docker container
- Abillity to create modpacks for easy distribution of mods
- Multiple users are now supported, create and delete users in the settings menu

## [0.3.1] - 2016-05-03
### Fixed
Fixes bug in #24 where Docker container cannot find conf.json file.

## [0.3.0] - 2016-05-01
### New features
- This release adds an authentication feature in Factorio Server Manager.
- Now able to be installed as a Docker container.
- Admin user credentials are configured in the conf.json file included in the release zip file.

### Features
- Allows control of the Factorio Server, starting and stopping the Factorio binary.
- Allows the management of save files, upload, download and delete saves.
- Manage installed mods, upload new ones, delete uneeded mods. Enable or disable individual mods.
- Allow viewing of the server logs and current configuration.
- Authentication for protecting against unauthorized users
- Available as a Docker container

## [0.2.0] - 2016-04-27
This release adds the ability to control the Factorio server. Allows stopping and starting of the server binary with advanced options.

### Features
- Allows control of the Factorio Server, starting and stopping the Factorio binary.
- Allows the management of save files, upload, download and delete saves.
- Manage installed mods, upload new ones, delete uneeded mods. Enable or disable individual mods.
- Allow viewing of the server logs and current configuration.

## [0.1.0] - 2016-04-25
First release of Factorio Server Manager

### Features
- Managing save files, create, download, delete saves
- Managing installed mods
- Factorio log tailing
- Factorio server configuration viewing
