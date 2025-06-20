# default-template

一个用于定义默认值和转换对象结构的实用工具

## 安装

```bash
npm install default-template
```

## 使用方法

```typescript
import defaultTemplate from 'default-template';

// 基本类型
defaultTemplate(10, undefined); // 返回 10
defaultTemplate(10, '20'); // 返回 20 (自动转换为数字)

// 数组
defaultTemplate([10], [null, '20', 20]); // 返回 [10, 20, 20]

// 对象
defaultTemplate(
  {a: 10, b: false, c: 20}, 
  {a: '20', b: null, d: 'test'}
); // 返回 {a: 20, b: false, c: 20}

// 使用通配符模板
defaultTemplate({'?': true}, {x: null, y: false}); // 返回 {x: true, y: false}
```

## API 说明

### `defaultTemplate(def, src, opt?)`

- `def`: 模板定义
  - 基本类型: 作为默认值
  - 对象: 定义每个属性的模板
  - 数组: 定义数组元素的模板
  - 函数: 自定义处理函数
- `src`: 源数据
- `opt`: 选项 (可选)
  - `allTemplateKey`: 对象通用模板键 (默认为 '?')

## 特性

1. 自动类型转换
2. 支持嵌套对象和数组
3. 支持通配符模板
4. 支持自定义键名转换