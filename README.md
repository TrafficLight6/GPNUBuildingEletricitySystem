# GPNU 公寓用电管理系统

> **⚠️ 这是一个课程作业，而且是纯前端项目。**
> 它只做界面演示，**没有后端、没有数据库、没有任何接口调用**。
> 页面上看到的电压、电流、能耗、账单、告警，全部是写死的静态数据或者用 `Math.random()` 现编的，**刷新页面就重新随机一遍，也不会真正控制任何设备**。
> 请勿把它当成可用的生产系统，也请勿接入真实用电场景。

---

## 一、先划重点：这是纯前端

### 1.1 生产系统 vs 本项目

| 一个真正的用电管理系统应该有 | 本项目 |
| --- | --- |
| 后端服务（Java / Node / Go…） | ❌ 没有，只有一堆 `.vue` 文件 |
| 数据库（MySQL / Redis…） | ❌ 没有 |
| REST / WebSocket 接口 | ❌ **一个都没有**，全项目零网络请求 |
| 登录鉴权、Token、权限校验 | ❌ 没有，随便输就能进 |
| 数据持久化 | ❌ 没有，所有状态只活在内存里 |
| 日志、监控、告警推送 | ❌ 没有，告警是写死的时间线文案 |
| 真实设备通信（Modbus / MQTT…） | ❌ 没有，开关只是 UI 上的一个布尔值 |

**这个项目本质上就是一张会动的设计稿。** 全部代码加起来只有 7 个 Vue 组件（1 个只含 `<router-view>` 的 `App.vue` + 6 个页面组件）+ 1 个路由表 + 1 个随机数工具函数。

### 1.2 三分钟自证：它确实是纯前端

不用读代码，下面任意一条都能验证：

1. **断网运行**：`npm run build` 之后把 `dist/` 用任意静态服务器跑起来，然后拔网线 / 关 Wi-Fi，页面一切照常。
2. **看 Network 面板**：打开浏览器 DevTools → Network，把筛选切到 `Fetch/XHR`，把 5 个页面全部点一遍 —— **请求数始终是 0**。
3. **搜代码**：在 `src/` 下全局搜索 `fetch(` / `axios` / `XMLHttpRequest` / `http://` —— **零匹配**。
   （构建后的 JS 里倒确实能搜到 `fetch` 和 `XMLHttpRequest`：前者是 Vite 注入的 modulepreload polyfill，只会去取本站自己的 JS/CSS；后者是 ECharts / Element Plus 自带的、本应用从未触发的数据加载分支。它们都不指向任何后端。）
4. **看产物**：构建结果只有 3 个文件（1 个 HTML + 1 个 JS + 1 个 CSS），没有任何服务端代码。

### 1.3 数据到底从哪来（逐项交代）

| 页面 | 你以为的数据 | 实际的数据 |
| --- | --- | --- |
| 登录 | 账号密码校验 | 用户名非空 + 密码 ≥ 6 位就放行，**输什么都算登录成功** |
| 首页 · 告警通知 | 后台推送的告警 | [home.vue](src/pages/main/home.vue) 里写死的 13 条数组 |
| 首页 · 电力开关 | 控制真实的断路器 | 一个 `ref(true)`，点一下变 `false`，仅此而已 |
| 首页 · 电费账单 | 数据库里的账单 | 写死的 4 条静态对象 |
| 输电监控 · 实时曲线 | 传感器实时采集 | [InputElectricity.js](src/lib/data/InputElectricity.js) 里的 `Math.random()`，`setInterval` 每秒push一个点 |
| 输电监控 · 历史平均 | 历史库查询 | 过去 10 天，现算现随机 |
| 能耗分析 · 全年柱状图 | 抄表统计 | 随机数 × 余弦季节因子（假装有夏季用电高峰） |
| 能耗分析 · 分时折线 | 分时计量 | 一张"基础负荷表" × 随机扰动 |
| 单元管理 · 异常单元 | 真实欠费/故障 | 每次刷新**随机挑 1~4 个**单元标红标黄 |
| 单元管理 · 用电器清单 | 设备台账 | 写死的 14 项（空调 1500W、热水器 2000W…） |

> 彩蛋：首页"跳转电费账单"按钮点了会弹一句
> 「我不是说这是纯前端项目吗，哪儿来的电费账单😅」—— 这是原作者留的自嘲。

---

## 二、这是作业，不是产品

- **性质**：课程作业 / 课程设计 / 前端练习，用于演示 Vue 3 组件开发与 ECharts 图表集成能力。
- **评价标准**：老师看的是**界面完成度、组件拆分、图表用得好不好**，而不是它能不能真的抄表收费。
- **因此**：功能停留在"看起来对"的层面。所有业务逻辑都在前端，数据一刷新就重置，没有任何正确性、安全性、并发性的保证。
- **请勿**：用于真实公寓/宿舍的用电管理、计费、断电控制，或作为任何形式的收费依据。
- **如果**你正在参考这份作业：欢迎看结构和图表写法，但请自行补齐后端与鉴权，别直接把假数据当业务逻辑抄走。

---

## 三、功能与页面

| 路由（hash 模式） | 页面 | 内容 |
| --- | --- | --- |
| `#/` | 登录 | 表单校验演示；进入时会弹窗声明"纯前端、不改数据" |
| `#/main` | 首页 | 告警时间线、A/B/C/D 四区电力开关 + 总闸、电费账单表格（带合计行） |
| `#/main/transmission` | 输电监控 | 电压/频率/电流/有功功率 4 张实时曲线（每秒刷新，滚动保留 30 个点）+ 过去 10 天平均电压/频率 + 通知时间线 |
| `#/main/energy` | 能耗分析 | 四区全年 52 周能耗柱状图、四区昨日 24 小时分时能耗折线图、各区能耗占比饼图 |
| `#/main/unit` | 单元管理 | A/B/C/D 四区，每区 13 层 × 2 单元 = 26 个单元按钮；点击查看用电器功率表、电费账单、供电开关 |

界面外壳（[bar.vue](src/pages/main/bar.vue)）提供可折叠侧边栏 + 面包屑导航。

---

## 四、技术栈

| 技术 | 版本 | 用途 |
| --- | --- | --- |
| [Vue 3](https://vuejs.org/) | ^3.5.43 | 框架，全部使用 Composition API + `<script setup>` |
| [Vue Router](https://router.vuejs.org/) | ^4.6.4 | 路由，**hash 模式**（纯静态托管无需服务端重写规则） |
| [Vite](https://vite.dev/) | ^8.3.0 | 构建工具（底层 Rolldown） |
| [Element Plus](https://element-plus.org/) | ^2.14.6 | UI 组件库（全量引入） |
| [ECharts](https://echarts.apache.org/) | ^6.1.0 | 所有图表，直接 `import * as echarts` 使用 |
| [@element-plus/icons-vue](https://element-plus.org/) | ^2.3.2 | 图标 |

---

## 五、项目结构

```
GPNUBuildingEletricitySystem/
├── index.html                    # 单页入口
├── vite.config.js                # base: './' —— 产物用相对路径，可放任意子目录
├── package.json
├── src/
│   ├── main.js                   # 挂载 Vue + Element Plus + Router
│   ├── App.vue                   # 只有 <router-view />
│   ├── style.css                 # 仅重置 body margin
│   ├── router/
│   │   └── index.js              # 5 条路由，createWebHashHistory()
│   ├── lib/
│   │   └── data/
│   │       └── InputElectricity.js   # 4 个 Math.random() 假数据函数
│   └── pages/
│       ├── login.vue
│       └── main/
│           ├── bar.vue           # 布局外壳：侧边栏 + 面包屑
│           ├── home.vue
│           └── item/
│               ├── transmission.vue
│               ├── energy.vue
│               └── unit.vue
└── dist/                         # 构建产物（已被 .gitignore 忽略）
```

---

## 六、运行与构建

### 环境要求

- **Node.js `^20.19.0 || >=22.12.0`**（Vite 8 的硬性要求，低版本会直接报错）
- npm（或 pnpm / yarn）

### 开发

```bash
npm install
npm run dev          # 默认 http://localhost:5173
```

### 构建静态页面

```bash
npm run build        # 产物输出到 dist/
npm run preview      # 本地预览构建结果，默认 http://localhost:4173
```

产物共 3 个文件，约 2.4 MB：

```
dist/index.html                   0.4 KB
dist/assets/index-*.css         354.4 KB   (gzip 48.6 KB)
dist/assets/index-*.js         2102.7 KB   (gzip 705.1 KB)
```

### 部署

`dist/` 是**完全自包含的静态文件**，拷到任何静态托管（Nginx / Apache / GitHub Pages / Vercel / 对象存储）即可，放根目录或子目录都行，**不需要任何服务端配置**。

已为此做过两处适配：

- `vite.config.js` 中 `base: './'` —— 资源引用是 `./assets/...` 相对路径，因此换目录不用重新构建；
- 路由使用 `createWebHashHistory()` —— 刷新子页面不会 404，无需 `try_files` 回退规则。代价是地址栏带 `#`，如 `https://example.com/#/main/energy`。

> ⚠️ **不要直接双击 `dist/index.html` 打开。**
> 产物是 ES module，浏览器在 `file://` 协议下会因 CORS 策略拒绝加载模块，页面会白屏。请务必用静态服务器访问（`npm run preview` 或 `python -m http.server` 皆可）。

> ℹ️ `dist/` 已被 `.gitignore` 忽略，所以克隆仓库后需要自己跑一次 `npm run build`，仓库里没有现成的构建产物。

---

## 七、已知问题与局限

都是作业定位下"能接受但确实存在"的问题，如实列出：

- **有功功率数值偏小 100 倍**：[InputElectricity.js](src/lib/data/InputElectricity.js) 中 `Math.round((220 * 52) / 1000) / 100` 先除 1000 再除 100，结果是 `0.11 kW`，而 220V × 52A 应为 `11.44 kW`。同时该函数不含随机数，所以这条曲线是恒定的水平直线。
- **包体积偏大**：Element Plus 与 ECharts 均为全量引入，单个 JS 达 2.1 MB。可改为按需引入 + 路由懒加载优化（未做）。
- **`vue-echarts` 是未使用的依赖**：`package.json` 中声明了，但两个图表页面都直接 `import * as echarts from 'echarts'`，从未引用 `vue-echarts`。
- **登录流程有冗余**：`handleLogin` 中 `setTimeout` 模拟的 loading 状态尚未结束，`router.push` 已同步跳转，因此 loading 动画基本看不到。
- **响应式布局不完整**：栅格用的是固定 `:span="12"` / `:span="6"`，窄屏下图表和单元网格会挤在一起。
- **无任何持久化**：开关状态、选中单元、图表数据刷新即重置。

---

## 八、许可

本项目基于 [AGPL-3.0](LICENSE) 许可发布。
