# default-template

一个极致灵活的 TypeScript/JavaScript 默认值与结构转换工具，支持自动类型转换、嵌套结构、通配符模板、自定义键名映射与处理函数，适用于表单、配置、接口适配、数据清洗等多种场景。

---

## 目录
- [项目简介](#项目简介)
- [核心设计原则](#核心设计原则)
- [适用场景](#适用场景)
- [安装与兼容性](#安装与兼容性)
- [快速上手](#快速上手)
- [API 详解](#api-详解)
- [类型定义与 TypeScript 支持](#类型定义与-typescript-支持)
- [进阶用法](#进阶用法)
- [实战案例](#实战案例)
- [性能与安全性](#性能与安全性)
- [常见陷阱与最佳实践](#常见陷阱与最佳实践)
- [常见问题与陷阱](#常见问题与陷阱)
- [FAQ](#faq)
- [与其他库对比](#与其他库对比)
- [设计理念与实现原理](#设计理念与实现原理)
- [测试与用例](#测试与用例)
- [贡献指南](#贡献指南)
- [社区与贡献](#社区与贡献)
- [版本兼容与升级指引](#版本兼容与升级指引)
- [License](#license)
- [联系方式与社区](#联系方式与社区)

---

## 核心设计原则

- **声明式**：只需描述目标结构和类型，自动完成数据适配。
- **类型安全**：最大化利用 TypeScript 类型推导，减少类型错误。
- **最小惊讶**：未声明字段默认删除，行为可预测。
- **灵活扩展**：支持通配符、键名映射、自定义函数，适配复杂场景。
- **零副作用**：不修改原始数据，所有操作均返回新对象/数组。

---

## 项目简介

default-template 提供声明式的数据结构模板，自动填充默认值、类型转换、结构映射，极大简化数据适配、清洗、转换等场景下的代码复杂度。

## 适用场景
- 表单数据预处理与校验
- 配置文件合并与默认值填充
- 接口数据适配与兼容
- 数据清洗与类型安全转换
- 动态结构映射与重命名

## 安装与兼容性

支持 Node.js >= 12，TypeScript >= 4.0，兼容主流浏览器（需打包）。

```bash
npm install default-template
# 或 yarn add default-template
```

## 快速上手

```typescript
import defaultTemplate from 'default-template';

// 基本类型
console.log(defaultTemplate(10, undefined)); // 10
console.log(defaultTemplate(10, '20')); // 20 (自动转换为数字)
console.log(defaultTemplate(false, 'true')); // true

// 数组
console.log(defaultTemplate([10], [null, '20', 20])); // [10, 20, 20]

// 对象
console.log(defaultTemplate({a: 10, b: false, c: 20}, {a: '20', b: null, d: 'test'})); // {a: 20, b: false, c: 20}

// 通配符模板
console.log(defaultTemplate({'?': true}, {x: null, y: false})); // {x: true, y: false}

// 自定义处理函数
console.log(defaultTemplate((data) => data * 2, 20)); // 40
```

---

## API 详解

### defaultTemplate(def, src, opt?)

#### 参数
- `def: any` 模板定义
  - 基本类型：作为默认值和类型参考
  - 对象：定义每个属性的模板，支持通配符键
  - 数组：定义数组元素的模板
  - 函数：自定义处理逻辑 `(src, owner) => any`
- `src: any` 源数据
- `opt?: DefaultTemplateOption` 选项
  - `allTemplateKey?: string` 对象通用模板键（默认 `'?'`）

#### 返回值
- 处理后的新数据，类型与模板结构一致

#### 类型推导与泛型支持
- 若在 TypeScript 下使用，建议为模板 `def` 明确类型声明，IDE 可自动推导返回类型

#### 边界与异常
- `def` 为 `null`/`undefined` 时，原样返回 `src`
- `src` 为 `null`/`undefined` 时，返回模板默认值
- 数组模板为空数组时，原样返回 `src`
- 对象模板未声明的键会被删除，除非有通配符模板
- 不会深度合并对象，仅按模板结构输出
- `TemplateRename` 仅在对象模板中生效

#### 自动类型转换规则
- `number`：字符串数字自动转为数字，否则返回默认值
- `boolean`：'false' 字符串转为 `false`，其余 truthy/falsy 值自动转换
- `string`：值转为字符串
- 其他类型保持原样

#### 选项说明
```typescript
interface DefaultTemplateOption {
  allTemplateKey?: string; // 对象通用模板键，默认'?'，可自定义
}
```

#### TemplateRename
用于对象模板中键名映射。
```typescript
class TemplateRename {
  constructor(key: string | ((oldKey: string) => string), def: any);
}
```

---

## 类型定义与 TypeScript 支持

- 完全支持 TypeScript 类型推导
- 推荐为模板 `def` 明确类型声明，获得 IDE 智能提示
- 支持泛型、嵌套类型、联合类型等复杂结构

```typescript
type User = { id: number; name: string; active: boolean };
const def: User = { id: 0, name: '', active: false };
const user = defaultTemplate(def, { id: '1', name: '张三', active: 'true' });
// user: { id: 1, name: '张三', active: true }
```

---

## 进阶用法

### 1. 嵌套对象与数组
```typescript
const def = {
  user: {
    name: '',
    age: 0,
    tags: ['']
  },
  active: false
};
const src = {
  user: { name: '张三', age: '18', tags: [null, 'vip'] },
  active: 'true',
  extra: 123
};
console.log(defaultTemplate(def, src));
// { user: { name: '张三', age: 18, tags: ['', 'vip'] }, active: true }
```

### 2. 通配符模板与保留部分原始数据
```typescript
const def = { a: 1, '?': 0 };
const src = { a: 2, b: '3', c: null };
console.log(defaultTemplate(def, src)); // { a: 2, b: 3, c: 0 }
```

### 3. 自定义键名映射
```typescript
import { TemplateRename } from 'default-template';
const def = {
  id: 0,
  name: new TemplateRename('username', ''), // 将 name 映射为 username
};
const src = { id: 1, name: '张三' };
console.log(defaultTemplate(def, src)); // { id: 1, username: '张三' }
```

### 4. 自定义处理函数
```typescript
const def = (data) => Array.isArray(data) ? data.length : 0;
console.log(defaultTemplate(def, [1, 2, 3])); // 3
```

### 5. 修改通配符键名
```typescript
const def = { '*': 1 };
const src = { a: null, b: 2 };
console.log(defaultTemplate(def, src, { allTemplateKey: '*' })); // { a: 1, b: 2 }
```

### 6. 递归与深层结构
```typescript
const def = { a: { b: { c: 1 } } };
const src = { a: { b: { c: '2', d: 3 }, e: 4 } };
console.log(defaultTemplate(def, src)); // { a: { b: { c: 2 } } }
```

### 7. 动态模板与联合类型
```typescript
function dynamicDef(src: any) {
  return typeof src === 'string' ? '' : 0;
}
console.log(defaultTemplate(dynamicDef, 'abc')); // ''
console.log(defaultTemplate(dynamicDef, 123)); // 0
```

---

## 实战案例

### 表单数据预处理
```typescript
const formDef = {
  name: '',
  age: 0,
  agree: false,
  tags: ['']
};
const raw = { name: '李四', age: '25', agree: 'true', tags: [null, 'vip'] };
const data = defaultTemplate(formDef, raw);
// { name: '李四', age: 25, agree: true, tags: ['', 'vip'] }
```

### 配置文件合并
```typescript
const configDef = { port: 8080, debug: false, logLevel: 'info' };
const userConfig = { port: '3000', logLevel: 'debug' };
const config = defaultTemplate(configDef, userConfig);
// { port: 3000, debug: false, logLevel: 'debug' }
```

### 接口数据适配
```typescript
const apiDef = {
  id: 0,
  username: '',
  isActive: false,
  profile: { email: '', phone: '' }
};
const apiRaw = { id: '1', username: 'user', isActive: 'true', profile: { email: 'a@b.com' } };
const user = defaultTemplate(apiDef, apiRaw);
// { id: 1, username: 'user', isActive: true, profile: { email: 'a@b.com', phone: '' } }
```

### 数据清洗与类型安全
```typescript
const cleanDef = { a: 0, b: '', c: false };
const dirty = { a: '123', b: 456, c: 'false', d: 999 };
const clean = defaultTemplate(cleanDef, dirty);
// { a: 123, b: '456', c: false }
```

---

## 性能与安全性
- 采用递归遍历，适合绝大多数业务场景
- 不会修改原始数据，返回新对象/数组
- 支持大对象/数组，性能优良
- 不会执行模板函数以外的任意代码，安全可靠

---

## 常见陷阱与最佳实践

- **对象模板不会深度合并**：只保留模板声明的字段，原有多余字段会被删除（除非有通配符）。
- **数组模板补全行为**：数组元素为对象模板时，原有字段会被补全，非对象模板则严格裁剪。
- **TemplateRename 仅对对象模板生效**，数组模板和根级模板无效。
- **类型转换规则**：如需特殊类型（如 Date、Set、Map）处理，建议用函数模板自定义。
- **泛型推断**：建议为模板 `def` 明确类型声明，获得最佳类型推导体验。

---

## FAQ

**Q: 如何只保留部分字段？**  
A: 只在模板中声明需要保留的字段即可，未声明的字段会被删除。

**Q: 如何对所有字段应用同一规则？**  
A: 使用通配符键 `'?'` 或自定义 `allTemplateKey`。

**Q: 如何实现字段重命名？**  
A: 使用 `TemplateRename`，支持静态和动态（函数）映射。

**Q: 支持多层嵌套和数组吗？**  
A: 完全支持，递归处理任意深度结构。

**Q: 支持 symbol、bigint、Date 等特殊类型吗？**  
A: symbol、bigint 支持，Date 建议用函数模板自定义处理。

**Q: 会深度合并对象吗？**  
A: 不会，仅按模板结构输出。

**Q: 支持泛型和类型推导吗？**  
A: 支持，建议为模板声明类型。

---

## 与其他库对比

| 功能/库             | default-template | lodash.defaultsDeep | deepmerge | ajv (校验) |
|---------------------|:----------------:|:-------------------:|:---------:|:----------:|
| 类型自动转换        | ✅               | ❌                  | ❌        | ❌         |
| 通配符模板          | ✅               | ❌                  | ❌        | ❌         |
| 键名映射            | ✅               | ❌                  | ❌        | ❌         |
| 递归结构适配        | ✅               | ✅                  | ✅        | ❌         |
| 类型推导            | ✅               | ❌                  | ❌        | ❌         |
| 自定义处理函数      | ✅               | ❌                  | ❌        | ❌         |
| 深度合并            | ❌（只按模板结构）| ✅                  | ✅        | ❌         |
| 校验/报错           | ❌               | ❌                  | ❌        | ✅         |

---

## 测试与用例

本项目使用 [vitest](https://vitest.dev/) 进行单元测试，覆盖所有核心功能和边界场景。

#### 运行测试

```bash
npm install
npm test           # 运行全部测试
npm run test:watch # 监听文件变更自动测试
npm run test:ui    # 启动可视化测试界面
npm run test:cov   # 生成测试覆盖率报告
```

如需添加新用例，请在 `src/index.test.ts` 中补充。

测试覆盖内容包括：
- 基本类型、数组、对象、嵌套结构
- 通配符模板、键名映射、自定义处理函数
- 边界情况与类型安全

---

## 贡献指南
1. Fork 本仓库
2. 新建分支进行开发
3. 保持代码风格与注释
4. **提交 PR 前请确保通过所有单元测试**
5. 提交 PR 并描述你的更改
6. 欢迎 Issue 反馈与建议

---

## 社区与贡献

- 欢迎任何建议、Bug 反馈、PR！
- Issue 区长期开放，作者会积极回复。
- 你也可以提交用例、文档、类型增强等贡献。

---

## 版本兼容与升级指引
- 兼容 Node.js >= 12，TypeScript >= 4.0
- 低版本 Node/TS 请升级后使用
- 未来版本将保持 API 向后兼容，重大变更会在 Release Note 说明

---

## License

MIT

---

## 联系方式与社区
- 作者邮箱：your@email.com
- GitHub Issues: https://github.com/gityuantao/default-template/issues
- 欢迎加入讨论与贡献！
