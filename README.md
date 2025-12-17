# NESH

基于 Svelte + Vite + Tailwind 的 NES 模拟器前端，内置 jsnes，已适配移动端触控与桌面键盘。

## 在线体验
- https://nesh-gilt.vercel.app

## 功能特性
- NES 模拟：使用 jsnes 渲染画面与音频，支持音频 Worklet 回退方案。
- 多端输入：触控摇杆与按键，桌面键盘映射（方向、Z= A、X= B、Enter= Start、Shift= Select、Esc= Home）。
- ROM 管理：`public/roms/index.json` 配置 ROM、封面、描述路径；支持多 ROM 目录结构。
- UI 适配：移动端全屏操作，大屏以 375×667 视图居中显示。

## 开发
```bash
pnpm install
pnpm dev
```
访问 http://localhost:5173

## 目录结构（节选）
- `src/` 应用源码（Svelte 组件、模拟器逻辑）
- `public/roms/` ROM 资源及元数据
- `public/js/audio-processor.js` 音频 Worklet 处理器

## ROM 配置
- 在 `public/roms/index.json` 中新增条目：
```json
{
  "id": "example",
  "title": "示例",
  "rom": "/roms/example/rom.nes",
  "cover": "/roms/example/cover.jpg",
  "description": "/roms/example/description.txt",
  "screens": ["/roms/example/cover.jpg"]
}
```
- 每个 ROM 建议单独目录存放 `rom.nes`、`cover.jpg`、`description.txt` 等资源。

## 键位（桌面）
- 方向：↑ ↓ ← →
- A：Z
- B：X
- Start：Enter
- Select：Shift
- Home：Esc

## 发布
- 已配置 Vercel，默认 `pnpm build` 产物部署。

## 许可证
- 本仓库未声明许可证，使用前请确认 ROM 版权合规。
