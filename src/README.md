# Canvas2Mermaid 重构项目

## 项目概述

Canvas2Mermaid 是一个 Obsidian 插件，主要功能是将 Canvas 转换为 Callout-Mermaid-flowchart 格式，并支持剪贴板复制和自动更新相关文件。

## 重构目标

本次重构旨在：
1. 采用清晰的分层架构设计
2. 实现 Canvas 到 Mermaid 的转换功能
3. 支持 Callout 格式包装
4. 实现剪贴板复制功能
5. 支持根据反向链接自动更新相关文件

## 项目结构

```
src/
├── domain/                    # 领域层
│   ├── entities/             # 实体定义
│   │   ├── Canvas.ts         # Canvas数据结构
│   │   ├── Mermaid.ts        # Mermaid数据结构
│   │   └── Settings.ts       # 插件设置
│   ├── repositories/         # 仓库接口
│   │   ├── ICanvasRepository.ts    # Canvas仓库接口
│   │   ├── IClipboardRepository.ts # 剪贴板仓库接口
│   │   └── IFileRepository.ts      # 文件仓库接口
│   └── usecases/            # 用例层
│       ├── ConvertCanvasToMermaidUseCase.ts    # Canvas转换用例
│       └── RefreshCanvasCalloutsUseCase.ts     # 刷新Callouts用例
├── infrastructure/           # 基础设施层
│   └── repositories/         # 仓库实现
│       ├── CanvasDataRepository.ts  # Canvas数据仓库
│       ├── FileRepository.ts        # 文件操作仓库
│       └── ClipboardRepository.ts   # 剪贴板操作仓库
├── presentation/             # 表现层
│   ├── commands/            # 命令实现
│   │   ├── ConvertCanvasToMermaidCommand.ts    # Canvas转换命令
│   │   └── RefreshCanvasCalloutsCommand.ts     # 刷新Callouts命令
│   └── ui/                  # 用户界面
│       └── settings/        # 设置界面
│           └── SettingTab.ts        # 设置标签页
├── shared/                  # 共享资源
│   ├── constants/           # 常量定义
│   │   ├── default-settings.ts      # 默认设置
│   │   ├── mermaid-constants.ts     # Mermaid常量
│   │   └── canvas-constants.ts      # Canvas常量
│   └── utils/               # 工具函数
├── main.ts                  # 插件主入口
└── README.md                # 项目说明
```

## 核心功能

### 1. Canvas 转 Mermaid 转换

- 解析 Canvas 中的节点、连线、分组关系
- 转换为 Mermaid flowchart 语法
- 支持 Obsidian 内链格式
- 生成 Callout 包装的 Mermaid 内容

### 2. 剪贴板复制

- 支持多种格式复制（Markdown、Mermaid、HTML）
- 自动检测剪贴板支持
- 降级到传统方法（如果现代API不可用）

### 3. 自动更新功能

- 根据反向链接找到相关文件
- 使用正则表达式匹配现有内容
- 自动备份和更新
- 支持批量处理

## 架构设计

### 分层架构

1. **领域层 (Domain)**: 核心业务逻辑和实体定义
2. **基础设施层 (Infrastructure)**: 外部依赖的实现
3. **表现层 (Presentation)**: 用户界面和命令处理
4. **共享层 (Shared)**: 常量和工具函数

### 设计模式

- **Repository Pattern**: 数据访问抽象
- **Use Case Pattern**: 业务逻辑封装
- **Command Pattern**: 命令处理
- **Dependency Injection**: 依赖注入

## 使用方法

### 命令面板

1. **转换Canvas为Mermaid流程图**: 将当前Canvas转换为Mermaid格式并复制到剪贴板
2. **刷新Canvas Callouts**: 重新生成并更新所有相关的Callout内容

### 快捷键

- `Ctrl+Shift+M`: 转换Canvas为Mermaid
- `Ctrl+Shift+R`: 刷新Canvas Callouts

## 配置选项

### Canvas转换设置
- 启用/禁用转换功能
- 设置默认流程图方向
- 配置节点和边的样式

### Callout设置
- 选择默认Callout类型
- 启用/禁用图标显示

### 剪贴板设置
- 启用/禁用剪贴板功能
- 选择复制格式

### 性能设置
- 启用懒加载
- 设置批处理大小

## 开发说明

### 环境要求

- Node.js 16+
- TypeScript 5.0+
- Obsidian 1.1.0+

### 构建命令

```bash
# 安装依赖
npm install

# 开发构建
npm run build:dev

# 生产构建
npm run build

# 监听模式
npm run build:watch
```

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 所有公共方法必须有 JSDoc 注释
- 使用中文注释（根据用户偏好）

## 测试

### 单元测试

```bash
npm run test
```

### 集成测试

在 Obsidian 环境中测试：
1. 打开 Canvas 文件
2. 执行转换命令
3. 检查剪贴板内容
4. 验证生成的 Mermaid 语法

## 部署

### 本地部署

```bash
npm run deploy:local
```

### 自动部署

```bash
npm run deploy
```

## 故障排除

### 常见问题

1. **Canvas数据解析失败**: 检查Canvas文件格式是否正确
2. **剪贴板操作失败**: 确认浏览器权限设置
3. **文件更新失败**: 检查文件权限和路径

### 调试模式

启用调试日志：
1. 打开插件设置
2. 启用"调试日志"选项
3. 查看浏览器控制台输出

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request

## 许可证

MIT License

## 更新日志

### v3.0.0 (重构版本)
- 完全重构项目架构
- 实现 Canvas 到 Mermaid 转换
- 添加 Callout 支持
- 实现剪贴板功能
- 支持自动更新相关文件
- 添加完整的设置界面
