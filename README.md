# Mind-Bubbles / 思绪气泡

本地思维导图与气泡图应用：在画布上创建节点与连线、物理模拟、撤销重做、Mermaid 导入导出、JSON 存读、快照、深色模式、中英双语等。**无需 API Key，纯前端运行。**

## 主要功能

- **节点与连线**：圆形/矩形气泡、拖拽、连线、关系标签
- **物理模拟**：排斥力、弹簧、向心力、阻尼，可调参数
- **撤销 / 重做**：历史栈与快照恢复
- **导入导出**：Mermaid 代码、JSON/.mb 文件、PNG 图片
- **多语言与主题**：中文 / 英文，浅色 / 深色
- **搜索、磁铁模式、快捷键**：见应用内「操作说明」

## 本地运行

**环境要求：** Node.js

1. 安装依赖：`npm install`
2. 启动开发服务：`npm run dev`
3. 浏览器打开：`http://localhost:3000`

无需配置 `.env` 或 API Key。

## 生产构建与部署

- 构建：`npm run build`
- 预览构建结果：`npm run preview`
- 生产环境默认部署在子路径 `/mind-bubbles/`（见 `vite.config.ts` 的 `base`），若部署在根路径需修改 `base: '/'`。

## 技术栈

React 19、Vite 6、TypeScript、lucide-react。
