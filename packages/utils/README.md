# btpanel-pure-utils

纯函数版 btpanel 工具库：包含校验、类型守卫、日期、随机、颜色等工具函数。

- 使用 TypeScript，提供完整类型定义与 JSDoc。
- 使用 Rsbuild 进行编译与打包，当前输出为 ESM。
- 使用 Rstest 进行单元测试（当前基线：Statements ≥ 80%，Branches ≥ 60%，Functions ≥ 95%，Lines ≥ 84.5%）。
 - 使用 Rstest 进行单元测试（当前基线：Statements/Branches/Functions/Lines 均为 100%）。
- 使用 ESLint + Prettier 保持一致代码风格。

安装与使用：

```bash
pnpm add btpanel-pure-utils
```

```ts
import { checkUrl, formatTime } from 'btpanel-pure-utils'
```