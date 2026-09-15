[![.github/workflows/test-workflow.yml](https://github.com/OpenFactorioServerManager/factorio-server-manager/workflows/.github/workflows/test-workflow.yml/badge.svg)](https://github.com/OpenFactorioServerManager/factorio-server-manager/actions)
[![Discord](https://img.shields.io/discord/779512040934342687?label=Discord)](https://discord.gg/SB647WmSbU)

# Factorio 服务器管理器（汉化版）

> **本仓库是上游项目的分支（fork）**
>
> 上游仓库：<https://github.com/OpenFactorioServerManager/factorio-server-manager>
>
> 本分支在上游 `develop` 的基础上做了以下改动：
>
> - **纯中文界面**：界面文案、操作提示、错误信息全部汉化（不提供多语言切换）
> - **《太空时代》DLC 总开关**：在模组页一键开启/关闭 `space-age`、`quality`、
>   `elevated-rails` 三个随游戏本体发布的官方模组
> - **新版选项自动补齐**：自动补上当前游戏版本新增、而旧 `server-settings.json` 中缺失的设置项，
>   并在界面上标记为「（新增）」
> - **修复**：服务器设置页无法保存、模组页「删除全部模组」按钮不显示、
>   模组版本兼容性判断错误（2.0 服务器把只支持 1.1 的模组显示为兼容）
>
> 改动明细见 [CHANGELOG.md](CHANGELOG.md)。本项目沿用上游的 MIT 许可证，版权归原作者所有。

Factorio 服务器管理器（FSM）是一个运行在 Factorio 服务器上的 Web 管理面板，
用来管理服务器进程、存档、模组以及各项设置。

## 功能

- **控制服务器**：启动、保存并停止、强制结束 Factorio 服务端进程
- **存档管理**：创建、上传、下载、删除存档，并可直接从存档加载模组
- **模组管理**：安装（对接官方模组门户）、上传、更新、删除、启用/禁用
- **游戏 DLC 开关**：一键切换服务器是否使用《太空时代》DLC
- **模组包**：把当前模组保存成模组包，随时一键切换不同配置
- **服务器设置**：网页上编辑 `server-settings.json`（含新版新增选项）
- **游戏设置 / 日志 / 控制台**：查看 `config.ini`、服务端日志，并可发送 RCON 指令
- **用户管理**：多用户登录认证，保护面板不被未授权访问
- **Docker 部署**：提供现成的镜像与 docker-compose 配置

## 界面截图

#### 服务器控制
![Factorio Server Manager Screenshot](screenshots/Screenshot_Controls.png)

#### 存档管理
![Factorio Server Manager Screenshot](screenshots/Screenshot_Saves.png)

#### 模组管理
![Factorio Server Manager Screenshot](screenshots/Screenshot_Mods.png)

## 安装与部署

### 前置要求

- 一份 **Factorio 服务端（headless）**文件，即包含 `bin/x64/factorio`（Windows 下是
  `bin/x64/factorio.exe`）与 `data/` 目录的那份游戏文件
- 操作系统：Linux x64 或 Windows x64
- 从源码构建的话还需要：Go 1.21+ 与 Node.js 18+

> 管理器会读写 Factorio 目录下的 `saves/`、`mods/`、`config/` 等目录，
> 所以运行账号必须对这些目录有读写权限。

### 方式一：使用编译好的发布包（推荐）

在 [Releases](../../releases) 页面下载对应平台的文件：

| 平台 | 文件 |
| --- | --- |
| Linux x64 | `factorio-server-manager-2.0-linux-x64.zip` |
| Windows x64 | `factorio-server-manager-2.0-windows-x64.zip` |

解压后得到：

```
factorio-server-manager/
├── factorio-server-manager          # Linux 可执行文件（Windows 下为 .exe）
├── app/                             # 前端静态文件（已编译好，无需 npm）
├── conf.json                        # 配置模板，需要按需修改
└── README.md
```

**部署步骤（以 Linux 为例）**

1. 把 `factorio-server-manager` 整个目录放到 Factorio 服务端目录里，例如：

   ```
   /opt/factorio/
   ├── bin/x64/factorio
   ├── data/
   ├── saves/
   └── factorio-server-manager/       # 本程序放在这里
   ```

2. 按需修改 `conf.json`（见下面的[配置说明](#配置说明)）。最少也要确认 RCON 密码与端口。

3. 启动。`--dir` 默认是 `./`，也就是「当前工作目录即 Factorio 目录」，
   所以最简单的做法是显式指定 Factorio 目录：

   ```bash
   cd /opt/factorio/factorio-server-manager
   chmod +x factorio-server-manager
   ./factorio-server-manager --dir /opt/factorio --port 80
   ```

4. 浏览器打开 `http://<服务器地址>:<端口>`，用首次启动时生成的账号登录
   （见[首次使用](#首次使用)）。

> Windows 下注意：程序默认去 `bin/x64/factorio` 找可执行文件，Windows 上需要显式指定
> `--bin "bin/x64/factorio.exe"`。

### 方式二：从源码构建

```bash
# 1) 编译前端（产物输出到 app/）
npm install
npm run build

# 2) 编译后端
cd src
go build -o ../factorio-server-manager .
```

也可以直接用 Makefile 一步打出发布包（需要 `make`、`zip`、`node`、`go`）：

```bash
make build          # 产物在 build/ 目录
```

### 方式三：Docker

仓库自带 Docker 镜像与 compose 配置，详细步骤（含 HTTPS 自动签发证书）见
[docker/README.md](docker/README.md)。

## 配置说明

### conf.json

程序默认读取当前目录下的 `conf.json`（可用 `--conf` 或环境变量 `FSM_CONF` 指定其他位置）。
如果该文件不存在，需要从 `conf.json.example` 复制一份。

```jsonc
{
  "rcon_pass": "",                    // RCON 密码，留空会在首次启动时随机生成并写入本文件
  "sq_lite_database_file": "sqlite.db", // 用户数据库文件（SQLite）
  "cookie_encryption_key": "",        // 会话 Cookie 加密密钥，留空会自动生成
  "settings_file": "server-settings.json", // Factorio 服务器设置文件（相对 config 目录）
  "log_file": "factorio-server-manager.log"
}
```

除了上面这几个，`conf.json` 还支持下列可选项（不写就用默认值，写了则**优先于命令行参数**）：

| 键 | 说明 |
| --- | --- |
| `factorio_dir` | Factorio 服务端目录 |
| `saves_dir` | 存档目录，默认 `<factorio_dir>/saves` |
| `mods_dir` | 模组目录，默认 `<factorio_dir>/mods` |
| `mod_pack_dir` | 模组包存放目录 |
| `basemod_dir` | base 模组目录，默认 `<factorio_dir>/data/base` |
| `factorio_binary` | 服务端可执行文件路径，默认 `<factorio_dir>/bin/x64/factorio` |
| `config_file` / `config_directory` | `config.ini` 与 `config/` 目录 |
| `factorio_admin_file` | 管理员列表文件（`server-adminlist.json`） |
| `rcon_port` | RCON 端口，为 0 时随机取 40000–45000 |
| `server_ip` / `server_port` | Web 面板监听地址与端口，默认 `0.0.0.0` / `80` |
| `factorio_ip` | 游戏服务端绑定地址，默认 `0.0.0.0` |
| `max_upload_size` | 上传大小上限 |
| `console_cache_size` | 控制台缓存行数，默认 25 |
| `console_log_file` / `chat_log_file` | 控制台日志与聊天日志文件 |
| `secure` | 会话 Cookie 是否只允许 HTTPS。**用 HTTP 访问时必须设为 `false`**，否则无法登录 |

> 程序在首次启动时会自动补上缺失的 `cookie_encryption_key` 与 `rcon_pass` 并回写 `conf.json`，
> 生成的 RCON 密码会打印在启动日志里。

### 命令行参数与环境变量

所有参数都有对应的 `FSM_` 前缀环境变量，适合容器化部署：

| 参数 | 环境变量 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `--conf` | `FSM_CONF` | `./conf.json` | 配置文件路径 |
| `--dir` | `FSM_DIR` | `./` | Factorio 目录 |
| `--port` | `FSM_PORT` | `80` | Web 面板端口 |
| `--host` | `FSM_SERVER_IP` | `0.0.0.0` | Web 面板监听地址 |
| `--game-bind-address` | `FSM_FACTORIO_IP` | `0.0.0.0` | 游戏服务端绑定地址 |
| `--bin` | `FSM_BINARY` | `bin/x64/factorio` | 服务端可执行文件 |
| `--config` | `FSM_FACTORIO_CONFIG_FILE` | `config/config.ini` | `config.ini` 路径 |
| `--max-upload` | `FSM_MAX_UPLOAD` | `20` | 上传上限（MB） |
| `--rcon-port` | `FSM_RCON_PORT` | `0`（随机） | RCON 端口 |
| `--mod-pack-dir` | `FSM_MODPACK_DIR` | `./mod_packs` | 模组包目录 |
| `--autostart` | `FSM_AUTOSTART` | `false` | 管理器启动时自动拉起 Factorio 服务端 |
| `--glibc-custom` | `FSM_GLIBC_CUSTOM` | `false` | 需要自带 glibc 时设为 `true` |
| `--glibc-loc` | `FSM_GLIBC_LOCATION` | `/opt/glibc-2.18/lib/ld-2.18.so` | 自定义 glibc 的 `ld.so` |
| `--glibc-lib-loc` | `FSM_GLIBC_LIB` | `/opt/glibc-2.18/lib` | 自定义 glibc 的库目录 |

## 首次使用

1. **拿到登录账号**：首次启动时会自动创建管理员账号 `admin`，密码为随机生成，
   打印在控制台/日志里，搜索 `Created default admin user` 即可看到。
   **请第一时间在「用户管理」页面修改密码。**

2. **确认能登录**：如果直接用 `http://` 访问面板，需要把 `conf.json` 里的
   `secure` 设为 `false`（否则会话 Cookie 只在 HTTPS 下发送，会一直登录失败）。

3. **切换《太空时代》DLC**：进入「模组管理」页面，最上方的
   「游戏 DLC（官方模组）」面板就是总开关。

   - 开启：服务器加载 `space-age`、`quality`、`elevated-rails`
   - 关闭：服务器以原版（不含 DLC 内容）运行
   - 面板里会列出三个官方模组的版本、安装位置与启用状态
   - **修改后需要重新启动服务器才生效**；若某个模组未安装会被自动跳过
   - ⚠️ 用《太空时代》创建的存档**无法**在没有 DLC 的服务器上加载，关闭前请确认

4. **服务器设置**：`server-settings.json` 在网页上直接编辑即可。若你的配置文件是旧版本
   留下的，页面会把新版游戏新增的选项按默认值补上并标注「（新增）」，保存后写入文件。

## 常见问题

**启动就报找不到存档 / 起不来游戏**
先确认 `--dir` 指向的是 Factorio 服务端目录，并且该目录下有 `data/` 与 `bin/x64/factorio`；
再确认「存档管理」页里至少有一个存档（Factorio 服务端在没有存档时无法启动）。

**面板打不开 / 一直提示登录失败**
HTTPS 与 Cookie 的问题最常见：用 `http://` 访问就要把 `conf.json` 的 `secure` 改成 `false`；
反之如果挂了 HTTPS，保持 `true` 更安全。

**模组页里看不到《太空时代》**
这三个官方模组随游戏本体安装在 `data/` 目录，不在 `mods/` 里。更新后的版本已经能在
「游戏 DLC（官方模组）」面板中识别并开关；如果面板提示「未检测到官方 DLC 模组」，
说明服务器上装的这份 Factorio 不含 DLC 内容。

**改完模组要不要重启服务器？**
要。模组的启用/禁用与 DLC 开关都是写进 `mod-list.json`，需要重启服务端才会加载。
另外服务器运行期间面板会禁止修改模组，避免存档与模组状态不一致。

**端口被占用**
用 `--port` 换一个端口，或加 `--host 127.0.0.1` 只监听本机再配合反向代理。

## 开发

```bash
# 前端：开发模式（带 watch）
npm install
npm run watch

# 前端：生产构建
npm run build

# 后端
cd src
go build ./...
go test ./factorio/        # 单元测试（存档解析、DLC 开关、设置补齐、版本兼容性）
```

> `src` 下的 `api` 包测试需要 `src/.env`（仓库只提供 `.env.example`），
> 本地没有这个文件时该包测试无法启动，属正常现象。

## 参与贡献

1. Fork 本仓库
2. 基于 `develop` 分支开发：`git checkout develop`
3. 新建特性分支：`git checkout -b my-new-feature`
4. 提交改动：`git commit -am 'Add some feature'`
5. 在 [CHANGELOG.md](CHANGELOG.md) 里用易读的方式记录你的改动
6. 推送分支：`git push origin my-new-feature`
7. 发起 Pull Request，目标分支选 `develop`

## 作者

* **Mitch Roote** - [roote.ca](https://roote.ca)
* **[knoxfighter](https://github.com/knoxfighter)**
* **[Jannaahs](https://github.com/jannaahs)**

## 特别鸣谢

- **[All Contributions](https://github.com/OpenFactorioServerManager/factorio-server-manager/graphs/contributors)**
- **mickael9** 逆向分析了 Factorio 存档格式：<https://forums.factorio.com/viewtopic.php?f=5&t=8568#>

## 许可证

本项目采用 MIT 许可证，详见 [LICENSE.md](LICENSE.md)。版权归原作者所有。
