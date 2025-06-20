interface TemplateNewKeyFn {
  (oldKey: string): string
}
interface DefaultTemplateOption {
  allTemplateKey?: string
}
interface InnerDefaultTemplateOption {
  objectFn: (def: any, src: any, opt: InnerDefaultTemplateOption) => any
}
interface PlainObject {
  [key: string]: any
}
/**
 * defaultTemplate方法, 更改对象的键名
 */
class TemplateRename {
  public key: string | TemplateNewKeyFn
  public def: any
  constructor(key: string | TemplateNewKeyFn, def: any) {
    this.key = key
    this.def = def
  }
}
/**
 * 判断基本类型(可以直接赋值)
 * null, undefined, boolean, number, string, function, bigint, symbol皆属于基本类型, 可以直接赋值
 * @param val 测试值
 * @return 测试结果
 */
function isBaseType(val: any): boolean {
  return val == null
    || typeof val === 'boolean'
    || typeof val === 'number'
    || typeof val === 'string'
    || typeof val === 'function'
    || typeof val === 'bigint'
    || val.constructor === Symbol
}
/**
 * 判断普通对象(不包括数组)
 * 除了isBaseType判断为true和数组的值
 * @param val 测试值
 * @return 测试结果
 */
function isObject(val: any): boolean {
  return !(isBaseType(val) || Array.isArray(val))
}
/**
 * defaultTemplate方法, 获取真正的 key 和 def
 */
function _setObjectKey(obj: any, src: any, opt: InnerDefaultTemplateOption, owner: any, def: any, key: any): void {
  if (def != null && def.constructor === TemplateRename) {
    key = typeof def.key === 'function' ? def.key(key) : def.key
    def = def.def
  }
  const value = _defaultTemplate(def, src, opt, owner)
  if (value !== undefined) {
    obj[key] = value
  }
}
/**
 * 返回转换为指定实例的类型的转换器
 * @param type 目标类型的实例
 * @return 转换器
 */
function convert(type: any) {
  if (typeof type === 'boolean') {
    return function (val: unknown): boolean {
      if (typeof val === 'string' && val.toLowerCase() === 'false') return false
      return Boolean(val)
    }
  }
  else if (typeof type === 'number') {
    return function (val: unknown): number {
      if (typeof val === 'string' && val) {
        val = Number(val)
      }
      if (typeof val === 'number' && Number.isFinite(val)) {
        return val
      }
      return type
    }
  }
  else if (typeof type === 'string') {
    return function (val: unknown): string {
      return `${val}`
    }
  }
  else {
    return function (val: unknown): unknown {
      return val
    }
  }
}
/**
 * 默认值模板
 * 定义src的默认值(当提供的数据为null或undefined则启用默认值), 且自动转换为默认值的类型. 会删除原始数据有且模板中不存在的属性, 添加模板上有且原始数据不存在的属性
 * @example 基本类型
 * defaultTemplate(10,undefined); //10
 * defaultTemplate(10,20); //20
 * defaultTemplate(10,'20'); //20
 * defaultTemplate(false,null); //false
 * defaultTemplate(false,true); //true
 * defaultTemplate(false,'true'); //true
 * @example 原样返回
 * defaultTemplate(null,10); //10
 * defaultTemplate(null,'10'); //'10'
 * defaultTemplate(null,{a:1}); //{a:1}
 * @example 数组默认值
 * defaultTemplate([10],[null,'20',20]); //[10,20,20]
 * @example 对象默认值
 * defaultTemplate({a:10,b:false,c:20},{a:'20',b:null,d:'test'}); //{a:20,b:false,c:20}
 * defaultTemplate({a:10,'?':true},{b:'false',c:null,d:false}); //{a:10,b:false,c:true,d:false}
 * @example 自定义处理函数
 * defaultTemplate(function(data){return data*2;},20); //40
 * @param def 模板, null或undefined表示原样返回, 数组中的对象表示对每个元素的模板, 对象中的 " ? " 键表示适配所有键
 * @param src 原数据
 * @param opt 选项
 * @param opt.allTemplateKey Object的通用模板键
 * @return 处理后的数据
 */
export default function defaultTemplate(def: any, src: any, opt: DefaultTemplateOption = { allTemplateKey: '?' }): any {
  return _defaultTemplate(def, src, {
    objectFn: opt.allTemplateKey
    // region 启用对象通用模板
      ? function (allTemplateKey: string, def: any, src: any, opt: InnerDefaultTemplateOption) {
          const obj: PlainObject = {}
          const defKeys = Object.keys(def)
          if (isObject(src)) {
            if (allTemplateKey in def) {
              const allTemplateDef = def[allTemplateKey]
              for (const key of Object.keys(src)) {
                _setObjectKey(obj, src[key], opt, src, key in def ? def[key] : allTemplateDef, key)
              }
              for (const key of defKeys) {
                if (key === allTemplateKey || Object.prototype.hasOwnProperty.call(src, key)) continue
                _setObjectKey(obj, undefined, opt, src, def[key], key)
              }
            }
            else {
              for (const key of defKeys) {
                _setObjectKey(obj, src[key], opt, src, def[key], key)
              }
            }
          }
          else {
            for (const key of defKeys) {
              if (key === allTemplateKey) continue
              _setObjectKey(obj, undefined, opt, src, def[key], key)
            }
          }
          return obj
        }.bind(null, opt.allTemplateKey)
    // endregion
    // region 禁用对象通用模板
      : function (def: any, src: any, opt: any) {
        const obj: PlainObject = {}
        for (const key of Object.keys(def)) {
          _setObjectKey(obj, src == null || Array.isArray(src) ? undefined : src[key], opt, src, def[key], key)
        }
        return obj
      },
    // endregion
  }, undefined)
}
function _defaultTemplate(def: any, src: any, opt: InnerDefaultTemplateOption, owner: any): any {
  if (def == null) {
    return src
  }
  else if (typeof def === 'function') {
    return def(src, owner)
  }
  else if (isBaseType(def)) {
    return src != null && isBaseType(src) ? convert(def)(src) : def
  }
  else if (Array.isArray(def)) {
    if (Array.isArray(src)) {
      if (def.length) {
        const arr = Array.from({ length: src.length })
        const def1 = def[0]
        for (let i = 0; i < src.length; ++i) {
          arr[i] = _defaultTemplate(def1, src[i], opt, src)
        }
        return arr
      }
      return src
    }
    return []
  }
  else {
    return opt.objectFn(def, src, opt)
  }
}
