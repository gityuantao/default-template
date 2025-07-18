/**
 * 用于自定义键名转换的函数类型
 * @param oldKey 原始键名
 * @returns 转换后的新键名
 */
export type TemplateNewKeyFn = (oldKey: string) => string;

/**
 * 默认模板选项接口
 */
export interface DefaultTemplateOption {
  /**
   * 用于匹配所有键的通配符键名，默认为 '?'
   */
  allTemplateKey?: string;
}

/**
 * 表示一个普通对象的接口
 */
export interface PlainObject {
  /**
   * 索引签名，允许任意字符串键和任意类型值
   */
  [key: string]: any;
}

/**
 * 模板重命名类，用于处理对象键名的重命名和值的转换
 */
export class TemplateRename {
  /**
   * 新的键名或键名转换函数
   */
  public key: string | TemplateNewKeyFn;
  
  /**
   * 值的模板定义
   */
  public def: any;

  /**
   * 创建一个模板重命名实例
   * @param key 新的键名或键名转换函数
   * @param def 值的模板定义
   */
  constructor(key: string | TemplateNewKeyFn, def: any) {
    this.key = key;
    this.def = def;
  }
}

/**
 * 判断值是否为基本类型或特定的内置对象类型
 * 
 * 以下类型被视为基本类型：
 * - null
 * - undefined
 * - boolean
 * - number
 * - string
 * - function
 * - bigint
 * - symbol
 * - Date 实例
 * - Set 实例
 * - Map 实例
 * 
 * @param val 需要判断的值
 * @returns 如果是基本类型或特定的内置对象类型则返回 true，否则返回 false
 */
function isBaseType(val: any): boolean {
  return (
    val == null ||
    typeof val === 'boolean' ||
    typeof val === 'number' ||
    typeof val === 'string' ||
    typeof val === 'function' ||
    typeof val === 'bigint' ||
    typeof val === 'symbol' ||
    val instanceof Date ||
    val instanceof Set ||
    val instanceof Map
  );
}

/**
 * 判断值是否为普通对象（不包括数组和特定的内置对象类型）
 * 
 * 以下条件必须同时满足：
 * - 不为 null
 * - typeof 结果为 'object'
 * - 不是数组
 * - 不是 Date 实例
 * - 不是 Set 实例
 * - 不是 Map 实例
 * 
 * @param val 需要判断的值
 * @returns 如果是普通对象则返回 true，否则返回 false
 */
function isObject(val: any): val is PlainObject {
  return val !== null && typeof val === 'object' && !Array.isArray(val) &&
    !(val instanceof Date) && !(val instanceof Set) && !(val instanceof Map);
}

/**
 * 将值转换为指定类型的实例
 * 
 * 支持以下类型的转换：
 * - boolean: 字符串 'false' 转为 false，其他值使用 Boolean() 转换
 * - number: 尝试将字符串或数字转换为有效数字，失败则返回默认值
 * - string: null/undefined 返回默认值，其他值使用 String() 转换
 * - Date: 如果不是 Date 实例则返回默认值
 * - Set: 如果不是 Set 实例则返回默认值
 * - Map: 如果不是 Map 实例则返回默认值
 * - symbol: 如果不是 symbol 则返回默认值
 * 
 * @param type 目标类型的示例值
 * @param val 需要转换的值
 * @returns 转换后的值
 */
function convertToType(type: any, val: any) {
  if (typeof type === 'boolean') {
    if (typeof val === 'string' && val.toLowerCase() === 'false') return false;
    return Boolean(val);
  }
  if (typeof type === 'number') {
    if (typeof val === 'string' && val !== '') {
      const n = Number(val);
      if (Number.isFinite(n)) return n;
    }
    if (typeof val === 'number' && Number.isFinite(val)) return val;
    return type;
  }
  if (typeof type === 'string') {
    return val == null ? type : String(val);
  }
  if (type instanceof Date) {
    if (val instanceof Date) return val;
    return type;
  }
  if (type instanceof Set) {
    if (val instanceof Set) return val;
    return type;
  }
  if (type instanceof Map) {
    if (val instanceof Map) return val;
    return type;
  }
  if (typeof type === 'symbol') {
    if (typeof val === 'symbol') return val;
    return type;
  }
  return val;
}

/**
 * 根据模板类型 T 递归推导最终返回类型：
 * - 如果是函数，取其返回值类型
 * - 如果是数组，递归处理元素类型
 * - 如果是对象，递归处理每个字段
 * - 其他类型原样返回
 */
export type TemplateResult<T> =
  T extends (...args: any[]) => infer R
    ? R
    : T extends Array<infer U>
      ? Array<TemplateResult<U>>
      : T extends object
        ? { [K in keyof T]: TemplateResult<T[K]> }
        : T;

/**
 * 默认值模板函数，用于处理数据结构的默认值、类型转换和键名映射
 * 
 * 主要功能：
 * 1. 为 null/undefined 值提供默认值
 * 2. 自动转换值类型以匹配模板类型
 * 3. 支持数组元素的模板处理
 * 4. 支持对象属性的模板处理和键名映射
 * 5. 支持通配符键处理所有未指定的属性
 * 
 * @example 基本类型处理
 * ```typescript
 * defaultTemplate(10, undefined)     // 返回: 10
 * defaultTemplate(10, '20')         // 返回: 20 (类型转换)
 * defaultTemplate(false, 'true')    // 返回: true (类型转换)
 * ```
 * 
 * @example 数组处理
 * ```typescript
 * defaultTemplate([10], [null, '20', 30])  // 返回: [10, 20, 30]
 * defaultTemplate([{ min: 0 }], [{ val: -1 }, { val: 5 }])  
 * // 返回: [{ min: 0, val: -1 }, { min: 0, val: 5 }]
 * ```
 * 
 * @example 对象处理
 * ```typescript
 * defaultTemplate(
 *   { a: 10, b: false, '?': true },
 *   { a: '20', c: null }
 * )  // 返回: { a: 20, c: true }
 * 
 * // 嵌套对象处理
 * defaultTemplate(
 *   { user: { name: '', age: 0 } },
 *   { user: { name: 'John' } }
 * )  // 返回: { user: { name: 'John', age: 0 } }
 * ```
 * 
 * @example 键名映射
 * ```typescript
 * // 静态键名映射
 * defaultTemplate(
 *   { a: new TemplateRename('newA', 10) },
 *   { a: '20' }
 * )  // 返回: { newA: 20 }
 * 
 * // 动态键名映射
 * defaultTemplate(
 *   { '?': new TemplateRename(key => `prefix_${key}`, true) },
 *   { foo: false, bar: null }
 * )  // 返回: { prefix_foo: false, prefix_bar: true }
 * ```
 * 
 * @example 复杂嵌套结构
 * ```typescript
 * const template = {
 *   users: [{
 *     id: new TemplateRename('userId', ''),
 *     profile: {
 *       name: '',
 *       settings: { '?': false }
 *     }
 *   }]
 * };
 * const data = {
 *   users: [{
 *     id: 'u123',
 *     profile: {
 *       name: 'John',
 *       settings: { notifications: null, darkMode: true }
 *     }
 *   }]
 * };
 * // 返回: {
 * //   users: [{
 * //     userId: 'u123',
 * //     profile: {
 * //       name: 'John',
 * //       settings: { notifications: false, darkMode: true }
 * //     }
 * //   }]
 * // }
 * ```
 * 
 * @param def 模板定义，指定默认值和类型。可以是：
 *            - 基本类型值：用作默认值和类型示例
 *            - 数组：第一个元素作为所有数组元素的模板
 *            - 对象：键值对定义属性的模板，'?' 键作为通配符模板
 *            - TemplateRename：定义键名映射规则
 *            - null/undefined：表示保持原值不变
 * @param src 源数据，需要处理的原始数据
 * @param opt 选项配置，可以自定义通配符键名
 * @returns 处理后的数据
 */
export default function defaultTemplate<T>(def: T, src: any, opt: DefaultTemplateOption = { allTemplateKey: '?' }): TemplateResult<T> {
  return internalTemplate(def, src, opt, undefined) as TemplateResult<T>;
}

/**
 * 内部模板处理函数，处理模板定义和源数据的递归转换
 * 
 * 处理流程：
 * 1. 解包 TemplateRename：
 *    - 递归处理嵌套的 TemplateRename
 *    - 应用键名转换函数
 * 2. 基础情况处理：
 *    - null/undefined 模板：返回原值
 *    - 函数模板：直接调用
 * 3. 类型处理：
 *    - 基本类型：调用 convertToType 进行类型转换
 *    - 数组：递归处理每个元素
 *    - 对象：调用 handleObjectTemplate 处理
 * 
 * @param def 模板定义
 * @param src 源数据
 * @param opt 选项配置
 * @param owner 当前处理的对象或数组，用于键名转换函数
 * @returns 处理后的数据
 * @internal
 */
function internalTemplate(def: any, src: any, opt: DefaultTemplateOption, owner: any): any {
  // 递归解包 TemplateRename
  while (def instanceof TemplateRename) {
    const key = typeof def.key === 'function' && owner ? def.key(owner) : def.key;
    def = def.def;
    owner = key;
  }
  if (def == null) return src;
  if (typeof def === 'function') return def(src, owner);
  if (isBaseType(def)) {
    return src != null && isBaseType(src) ? convertToType(def, src) : def;
  }
  if (Array.isArray(def)) {
    if (Array.isArray(src)) {
      if (def.length > 0) {
        // 判断模板元素是否为对象模板
        if (isObject(def[0])) {
          return src.map(item => {
            // 以原对象为基础补全模板字段
            if (isObject(item)) {
              return { ...item, ...handleObjectTemplate(def[0], item, opt, src) };
            }
            return internalTemplate(def[0], item, opt, src);
          });
        } else {
          return src.map(item => internalTemplate(def[0], item, opt, src));
        }
      }
      return src;
    }
    return [];
  }
  if (isObject(def)) {
    return handleObjectTemplate(def, src, opt, owner);
  }
  return def;
}

/**
 * 处理对象类型的模板转换
 * 
 * 处理流程：
 * 1. 处理源对象中存在的属性：
 *    - 优先使用属性对应的模板
 *    - 如无对应模板，尝试使用通配符模板
 *    - 处理可能的键名重命名
 * 2. 处理模板中存在但源对象中不存在的属性：
 *    - 使用模板值作为默认值
 *    - 处理可能的键名重命名
 * 3. 键名重命名处理：
 *    - 解包嵌套的 TemplateRename
 *    - 支持静态重命名和动态重命名函数
 * 
 * 注意事项：
 * - 通配符键 ('?') 只用于未显式定义模板的属性
 * - 重命名后的键名不会再次应用模板
 * - 源对象中的属性如果没有对应模板且无通配符模板会被忽略
 * 
 * @param def 对象类型的模板定义
 * @param src 源数据
 * @param opt 选项配置
 * @param owner 当前处理的父对象
 * @returns 处理后的对象
 * @internal
 */
function handleObjectTemplate(def: PlainObject, src: any, opt: DefaultTemplateOption, owner: any): PlainObject {
  const allKey = opt.allTemplateKey || '?';
  const result: PlainObject = {};
  const defKeys = Object.keys(def);
  const srcObj = isObject(src) ? src : {};

  // 处理模板中声明的字段
  for (const key of defKeys) {
    if (key === allKey) continue;
    let tpl = def[key];
    let newKey = key;
    while (tpl instanceof TemplateRename) {
      newKey = typeof tpl.key === 'function' ? tpl.key(key) : tpl.key;
      tpl = tpl.def;
    }
    const val = internalTemplate(tpl, srcObj[key], opt, srcObj);
    if (val !== undefined) result[newKey] = val;
  }

  // 处理通配符模板，补全原对象中未被模板显式声明的字段
  if (def[allKey] !== undefined) {
    for (const key of Object.keys(srcObj)) {
      if (def.hasOwnProperty(key)) continue;
      let tpl = def[allKey];
      let newKey = key;
      while (tpl instanceof TemplateRename) {
        newKey = typeof tpl.key === 'function' ? tpl.key(key) : tpl.key;
        tpl = tpl.def;
      }
      const val = internalTemplate(tpl, srcObj[key], opt, srcObj);
      if (val !== undefined) result[newKey] = val;
    }
  }

  // 处理模板中存在但原对象中不存在的字段
  for (const key of defKeys) {
    if (key === allKey || srcObj.hasOwnProperty(key)) continue;
    let tpl = def[key];
    let newKey = key;
    while (tpl instanceof TemplateRename) {
      newKey = typeof tpl.key === 'function' ? tpl.key(key) : tpl.key;
      tpl = tpl.def;
    }
    const val = internalTemplate(tpl, undefined, opt, srcObj);
    if (val !== undefined) result[newKey] = val;
  }
  return result;
}
