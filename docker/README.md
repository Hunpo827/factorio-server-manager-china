# Factorio Server Manager Docker 镜像

## 前置要求

需要先安装 [Docker](https://docs.docker.com/engine/install/) 与
[Docker Compose](https://docs.docker.com/compose/install/)。

## 快速开始

把本目录下的 `docker-compose.yaml` 与 `.env` 复制到服务器上任意位置。

然后编辑 `.env`：

* `RCON_PASS`（默认空）：Factorio RCON 密码，管理器通过它和游戏服务端通信。\
  留空的话，首次启动时会随机生成一个并写入 `fsm-data/conf.json`，也可以在容器日志里找到。
* `DOMAIN_NAME`（**必须手动设置**）：面板将要使用的域名。
  必须填写，[Let's Encrypt](https://letsencrypt.org/) 才能为该域名签发有效的 HTTPS 证书。
* `EMAIL_ADDRESS`（**必须手动设置**）：你的邮箱地址，仅用于 Let's Encrypt。

也可以完全不用 `.env`，直接改 `docker-compose.yaml` 里的 `environment` 部分。
但要注意：**只要 `.env` 文件存在，其中的值会覆盖 `docker-compose.yaml` 里的同名值。**

之后启动容器：

```
docker-compose up -d
```

### 不带 HTTPS 的简化配置

如果你不在意 HTTPS，只想跑一个管理器，或者在本地机器上测试，
可以直接用 `docker-compose.simple.yaml`：忽略 `.env` 里的 `DOMAIN_NAME` 与
`EMAIL_ADDRESS`，然后执行

```
docker-compose -f docker-compose.simple.yaml up -d
```

该配置把面板的 80 端口与游戏端口 34197/udp 直接映射到宿主机。

### 选择 Factorio 版本

默认会下载 Factorio 的**最新稳定版**。要固定版本，改
`docker-compose.yaml` 里的 `FACTORIO_VERSION` 即可：

* `latest` —— 最新的测试版
* `stable` —— 最新的稳定版
* 具体版本号（如 `2.0.32`）—— 指定版本

### 数据卷说明

容器把数据分成两块持久化在宿主机上，升级镜像不会丢数据：

| 宿主机目录 | 容器内路径 | 说明 |
| --- | --- | --- |
| `./fsm-data` | `/opt/fsm-data` | 管理器自己的数据：`conf.json`、用户数据库等 |
| `./factorio-data/saves` | `/opt/factorio/saves` | 游戏存档 |
| `./factorio-data/mods` | `/opt/factorio/mods` | 模组与 `mod-list.json`（DLC 开关也写在这里） |
| `./factorio-data/config` | `/opt/factorio/config` | `server-settings.json`、`config.ini` 等 |
| `./factorio-data/mod_packs` | `/opt/fsm/mod_packs` | 模组包 |

## 访问面板

用浏览器打开 `.env` 里配置的域名；如果是本地运行，访问 <http://localhost> 即可。

### 首次启动

容器启动后会先下载 Factorio 服务端压缩包，**下载完成后**管理器才会启动。
所以当 docker-compose 打印出

```
Creating factorio-server-manager ... done
```

时，还需要再等几秒到几十秒（取决于网速），面板才能访问。

如果启用了 HTTPS，Let's Encrypt 签发证书也需要时间，
刚启动的头几分钟浏览器可能提示「您的连接不是私密连接」。
只要参数配置正确，几分钟后该提示会自行消失。

## 用户与凭据管理

首次启动会自动创建管理员账号 `admin`，密码随机生成并打印在**容器日志**里：

```
docker logs factorio-server-manager
```

在日志里搜索 `Created default admin user` 就能看到密码，请尽快登录并在
「用户管理」页面修改。之后可以在该页面新增、删除用户。

## 更新 Factorio

目前还不支持在面板里升降级 Factorio 版本，但可以用 Docker 在保留安全设置、
存档和模组的前提下更新：

1. 在面板里保存游戏并停止 Factorio 服务端
2. 执行 `docker-compose restart`
   （简化配置则是 `docker-compose -f docker-compose.simple.yaml restart`）

容器重启后会下载并安装指定版本（默认最新稳定版）的 Factorio。

## 安全建议

面板自带登录认证，但仍建议只在 VPN 或内网中暴露管理界面；
如果必须公网访问，请务必使用 HTTPS（默认的 `docker-compose.yaml` 已经内置
Traefik + Let's Encrypt），并考虑再加一层 Basic Auth
（`docker-compose.yaml` 里注释掉的 `fsm-auth` 中间件就是为此准备的）。

## 关于本汉化版

`docker-compose.yaml` 里默认拉取的 `ofsm/ofsm:latest` 是**上游官方镜像**，
不包含本分支的汉化与新功能。要使用汉化版镜像，需要从本仓库源码本地构建：

```
cd docker
./build.sh          # 会自动编译前后端、打包，并构建镜像 factorio-server-manager:dev
```

`build.sh` 做的事情是：回到仓库根目录执行 `make build`，把生成的
`build/factorio-server-manager-linux.zip` 复制到 `docker/` 目录，
再用 `Dockerfile-local` 构建镜像。

如果不想用脚本，也可以手动构建（前提是已经把 Linux 发布包放到
`docker/factorio-server-manager-linux.zip`）：

```
cd docker
docker build -f Dockerfile-local -t factorio-server-manager:dev .
```

随后把 `docker-compose.yaml` 里的
`image: "ofsm/ofsm:latest"` 改成 `image: "factorio-server-manager:dev"` 即可。

## 开发

为了方便开发，也可以直接用本地源码构建镜像：在 `docker` 目录下执行 `build.sh`。
该脚本会先清理旧的构建产物与 `node_modules`（即执行 `make build`），
构建出的镜像标签为 `factorio-server-manager:dev`。

### 生成发布包

仓库包含 `Dockerfile-build` 用于生成发布压缩包。请使用 Docker 20 及以上版本
（需要 BUILDKIT，Docker 19 上有已知问题）。

在仓库根目录执行：

```
DOCKER_BUILDKIT=1 docker build --no-cache -f docker/Dockerfile-build -t ofsm-build --target=build -o dist .
```

产物会输出到 `dist` 目录。

## 给读到最后的人

现在，去建点漂亮的工厂吧！
