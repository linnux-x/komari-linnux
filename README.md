# Komari Linnux Theme

为 [Komari Monitor](https://github.com/komari-monitor/komari) 制作的 Linnux 定制主题，基于 [BITJEBE/nezha-BITJEBE](https://github.com/BITJEBE/nezha-BITJEBE) 二次开发。

![Theme preview](preview.png)

## 特性

- 清爽的亮/暗色服务器监控界面
- 服务器状态、资源用量、网络流量与分组筛选
- 流量进度条、服务可用性、全球地图和资产卡片等可选功能
- 可在 Komari 主题管理中配置 Logo、背景图、自定义链接与显示选项

## 安装

### 通过 Komari 面板

1. 从本仓库的 Releases 下载主题压缩包。
2. 打开 Komari 管理面板，进入“主题管理”。
3. 上传压缩包并启用 `komari-linnux`。

### 从源码构建

```bash
git clone https://github.com/linnux-x/komari-linnux.git
cd komari-linnux
npm ci
npm run build
```

将构建生成的 `dist/` 目录与根目录的 `komari-theme.json` 一同压缩为 ZIP 后上传。

## 配置

在 Komari 的主题管理中可设置站点 Logo、桌面/移动端背景、强制主题、顶部链接和卡片显示选项。站点名称与描述优先使用 Komari 后端的站点设置。

## 致谢与许可

本项目派生自 [BITJEBE/nezha-BITJEBE](https://github.com/BITJEBE/nezha-BITJEBE)，其上游为 [Akizon77/nezha-dash-v1](https://github.com/Akizon77/nezha-dash-v1)。Komari 监控后端由 [komari-monitor/komari](https://github.com/komari-monitor/komari) 提供。

本仓库遵循 [Apache License 2.0](LICENSE)。
