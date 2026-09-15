[![.github/workflows/test-workflow.yml](https://github.com/OpenFactorioServerManager/factorio-server-manager/workflows/.github/workflows/test-workflow.yml/badge.svg)](https://github.com/OpenFactorioServerManager/factorio-server-manager/actions)
[![Discord](https://img.shields.io/discord/779512040934342687?label=Discord)](https://discord.gg/SB647WmSbU)

# Factorio Server Manager

> **本仓库是上游项目的分支（fork）**
>
> 上游仓库：<https://github.com/OpenFactorioServerManager/factorio-server-manager>
>
> 本分支的改动（基于上游 `develop`）：
>
> - **纯中文界面**：界面文案、操作提示、错误信息全部汉化（不提供多语言切换）
> - **《太空时代》DLC 总开关**：在模组页一键开启/关闭 `space-age`、`quality`、
>   `elevated-rails` 三个随游戏本体发布的官方模组
> - **新版选项自动补齐**：自动补上当前游戏版本新增、而旧 `server-settings.json` 缺失的设置项
> - **修复**：服务器设置页无法保存、模组页「删除全部模组」按钮不显示、
>   模组版本兼容性判断错误（2.0 服务器把 1.1 模组显示为兼容）
>
> 改动明细见 [CHANGELOG.md](CHANGELOG.md)。本项目沿用上游的 MIT 许可证，版权归原作者所有。

### A tool for managing Factorio servers.
This tool runs on a Factorio server and allows management of the Factorio server, saves, mods and many other features.

## Features
* Allows control of the Factorio Server, starting and stopping the Factorio binary.
* Allows the management of save files, upload, download and delete saves.
* Manage installed mods, upload new ones and more
* Manage modpacks, so it is easier to play with different configurations
* Allow viewing of the server logs and current configuration.
* Authentication for protecting against unauthorized users
* Available as a Docker container

#### Manage Factorio Server
![Factorio Server Manager Screenshot](screenshots/Screenshot_Controls.png)

#### Manage save files
![Factorio Server Manager Screenshot](screenshots/Screenshot_Saves.png)

#### Manage mods
![Factorio Server Manager Screenshot](screenshots/Screenshot_Mods.png)

## [Installation and Usage](https://github.com/OpenFactorioServerManager/factorio-server-manager/wiki/Installation-and-Usage)

## [Development](https://github.com/OpenFactorioServerManager/factorio-server-manager/wiki/Development)

## Contributing
1. Fork it!
2. Checkout the develop branch, only use that as a base: `git checkout develop`
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Add your changes a in human readable way into CHANGELOG.md
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request, with `develop` as base :D

## Authors

* **Mitch Roote** - [roote.ca](https://roote.ca)
* **[knoxfighter](https://github.com/knoxfighter)**
* **[Jannaahs](https://github.com/jannaahs)**

## Special Thanks
- **[All Contributions](https://github.com/OpenFactorioServerManager/factorio-server-manager/graphs/contributors)**
- **mickael9** for reverseengineering the factorio-save-file: https://forums.factorio.com/viewtopic.php?f=5&t=8568#

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
