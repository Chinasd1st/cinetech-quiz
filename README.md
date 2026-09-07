# CineTech Quiz · 光影考场

从 [CineTech Architecture](https://silentnrtx.top/lensoptics-lab/) 独立出来的影视技术答题应用（问答 section 单独项目实现）。
覆盖光学、传感器、编码、布光、录音与调色六大知识域，六种题型（单选 / 多选 / 判断 / 排序 / 连线 / 交互滑杆），每题即时解析。
本考场为 **TGTV** 定制建设。

## 技术栈

- **框架**: Next.js 16 (App Router, `output: 'export'` 静态导出) + React 19
- **样式**: Tailwind CSS v4（暗房美学设计系统，Space Grotesk / Manrope / JetBrains Mono）
- **包管理**: pnpm
- **图标**: lucide-react
- **部署**: GitHub Pages（`basePath: /cinetech-quiz/`，自定义域名 `silentnrtx.top` 下访问 `https://silentnrtx.top/cinetech-quiz/`）

## 本地运行

```bash
pnpm install
pnpm dev
```

访问 `http://localhost:3000/cinetech-quiz/`。

## 构建与部署

```bash
pnpm build     # 静态导出至 out/
```

推送到 `main` 分支后，`.github/workflows/deploy.yml` 自动构建并发布到 GitHub Pages。

## 功能

- 自定义题量（5/10/15/20/自定义）与难度分布（基础/进阶/硬核），自动回退补足
- 键盘快捷键：`1-9` 选择选项，`Enter` 提交/下一题
- 每题 45 秒限时，超时自动判错
- 结算页：得分环、称号、难度掌握度、待强化分类、逐题回顾
- 管理员模式（顶部按钮进入）：题库统计、筛选浏览、CSV 导出
- 最佳成绩本地记录（localStorage）

## 题库说明

题库源自 CineTech Architecture 的 `quizData.ts`，本独立项目做了以下整理与扩充：

- 删除全部填空题（`FILL_BLANK`，6 道），消除「30 vs 三十」类输入边界问题
- 合并重复知识点题目（T-Stop、转接环/法兰距共 3 道）
- 修正歧义题（超广角起始焦距、500 法则缺焦距参数）
- 难度校准（衍射极限 HARD → MEDIUM、五轴 Roll 轴 EASY → MEDIUM）
- 审阅全部题目：无重复选项、无错误题目
- 扩充 **27 道** 2024-2026 年最新机型/技术题（均已通过公开资料核实）：
  Sony α9 III（全球快门）、α1 II（AI/C2PA）、BURANO（8.6K/16 档/双基准 ISO）、
  FX5（内置 X-OCN RAW/三基准 ISO/5K 开门）、α7R VI（66.8MP 堆栈/Dual Gain）、
  RX1R III（固定 35mm F2/Step Crop）、XAVC HS、产品线配对与排序

当前题库共 **174 道**，覆盖 21 个知识分类。

> For TGTV · 献给每一位认真对待影像的人。
