# Komari Linnux 主题

这是为 [Komari Monitor](https://github.com/komari-monitor/komari) 制作的 Linnux 定制主题，基于 [BITJEBE/nezha-BITJEBE](https://github.com/BITJEBE/nezha-BITJEBE) 二次开发。

![主题预览](preview.png)

## 功能特点

- 简洁的亮色与暗色服务器监控界面
- 展示服务器状态、资源用量、网络流量和分组筛选
- 支持流量进度条、服务可用性、全球地图和资产卡片等可选功能
- 可在 Komari 的主题管理中配置 Logo、背景图、自定义链接和显示选项

## 安装方法

### 通过 Komari 面板安装

1. 从本仓库的 Releases 页面下载主题压缩包。
2. 打开 Komari 管理面板，进入“主题管理”。
3. 上传压缩包并启用 `komari-linnux` 主题。

### 从源代码构建

```bash
git clone https://github.com/linnux-x/komari-linnux.git
cd komari-linnux
npm ci
npm run build
```

构建完成后，将生成的 `dist/` 目录和根目录的 `komari-theme.json` 一同压缩为 ZIP 文件，再上传到 Komari。

## 配置说明

在 Komari 的主题管理中可设置站点 Logo、桌面端与移动端背景图、强制主题、顶部链接和卡片显示选项。站点名称和描述优先使用 Komari 后端的站点设置。

## 致谢与许可证

本项目派生自 [BITJEBE/nezha-BITJEBE](https://github.com/BITJEBE/nezha-BITJEBE)，其上游为 [Akizon77/nezha-dash-v1](https://github.com/Akizon77/nezha-dash-v1)。Komari 监控后端由 [komari-monitor/komari](https://github.com/komari-monitor/komari) 提供。

本仓库遵循 [Apache License 2.0](LICENSE) 许可证。
