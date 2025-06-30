import defaultTemplate, { TemplateRename } from ".";

console.log('基本类型：undefined/null 返回默认值', defaultTemplate(10, undefined));
console.log('基本类型：undefined/null 返回默认值', defaultTemplate(10, null));
console.log('基本类型：undefined/null 返回默认值', defaultTemplate(false, undefined));
console.log('基本类型：undefined/null 返回默认值', defaultTemplate('', undefined));

console.log('基本类型：类型自动转换', defaultTemplate(10, '20'));
console.log('基本类型：类型自动转换', defaultTemplate(false, 'true'));
console.log('基本类型：类型自动转换', defaultTemplate(false, 'false'));
console.log('基本类型：类型自动转换', defaultTemplate('', 123));
console.log('基本类型：类型自动转换', defaultTemplate(BigInt(1), '2'));
console.log('基本类型：类型自动转换', typeof defaultTemplate(Symbol('a'), Symbol('b')));

const fn = (x: any) => (typeof x === 'number' ? x * 2 : 0);
console.log('基本类型：function 作为模板', defaultTemplate(fn, 5));
console.log('基本类型：function 作为模板', defaultTemplate(fn, undefined));

const d = new Date('2020-01-01');
const d2 = new Date('2022-01-01');
console.log('基本类型：Date 作为模板', defaultTemplate(d, d2));
console.log('基本类型：Date 作为模板', defaultTemplate(d, undefined));

console.log('基本类型：原样返回', defaultTemplate(null, 10));
console.log('基本类型：原样返回', defaultTemplate(null, '10'));
console.log('基本类型：原样返回', defaultTemplate(null, { a: 1 }));

console.log('数组：元素模板', defaultTemplate([10], [null, '20', 20]));
console.log('数组：元素模板', defaultTemplate([false], [1, 0, 'false']));
console.log('数组：元素模板', defaultTemplate([{ a: 1 }], [{ a: 2 }, { a: '3' }]));

console.log('数组：嵌套数组', defaultTemplate([[0]], [[1, 2], [3, null]]));
console.log('数组：空模板数组', defaultTemplate([], [1, 2, 3]));
console.log('数组：空模板数组', defaultTemplate([], undefined));

console.log('对象：基础对象模板', defaultTemplate({ a: 10, b: false, c: 20 }, { a: '20', b: null, d: 'test' }));

const def1 = { a: { b: { c: 1 } } };
const src1 = { a: { b: { c: '2', d: 3 }, e: 4 } };
console.log('对象：深层嵌套对象', defaultTemplate(def1, src1));

console.log('对象：通配符模板', defaultTemplate({ '?': true }, { x: null, y: false }));
console.log('对象：通配符模板', defaultTemplate({ a: 1, '?': 0 }, { a: 2, b: '3', c: null }));
console.log('对象：通配符与显式key混用', defaultTemplate({ a: 1, '?': 2 }, { a: undefined, b: 3 }));
console.log('对象：自定义通配符键名', defaultTemplate({ '*': 1 }, { a: null, b: 2 }, { allTemplateKey: '*' }));
console.log('对象：空对象模板', defaultTemplate({}, { a: 1 }));
console.log('对象：空对象模板', defaultTemplate({}, {}));

const def2 = { user: { name: '', age: 0, tags: [''] }, active: false };
const src2 = { user: { name: '张三', age: '18', tags: [null, 'vip'] }, active: 'true', extra: 123 };
console.log('对象：嵌套结构', defaultTemplate(def2, src2));

const def3 = { id: 0, name: new TemplateRename('username', '') };
const src3 = { id: 1, name: '张三' };
console.log('对象：键名映射', defaultTemplate(def3, src3));

const def4 = { foo: new TemplateRename(k => 'bar_' + k, 1) };
const src4 = { foo: 2 };
console.log('对象：键名映射为函数', defaultTemplate(def4, src4));

const def5 = { a: new TemplateRename('b', new TemplateRename('c', 1)) };
const src5 = { a: 2 };
console.log('对象：TemplateRename 嵌套', defaultTemplate(def5, src5));

console.log('自定义处理函数', defaultTemplate((data: any) => Array.isArray(data) ? data.length : 0, [1, 2, 3]));
console.log('自定义处理函数', defaultTemplate((data: any) => typeof data === 'string' ? data.toUpperCase() : '', 'abc'));
console.log('自定义处理函数', defaultTemplate((data: any, owner: any) => owner && owner.flag ? 1 : 0, 5, undefined));

console.log('边界：模板为 null/undefined', defaultTemplate(null, 123));
console.log('边界：模板为 null/undefined', defaultTemplate(undefined, 456));
console.log('边界：src 为 null/undefined', defaultTemplate(1, null));
console.log('边界：src 为 null/undefined', defaultTemplate({ a: 1 }, null));
console.log('边界：src 为 null/undefined', defaultTemplate([1], null));
console.log('边界：对象模板未声明的字段被删除', defaultTemplate({ a: 1 }, { a: 2, b: 3 }));
console.log('边界：数组模板长度为0', defaultTemplate([], [1, 2, 3]));
console.log('边界：数组模板长度为0', defaultTemplate([], undefined));
console.log('极端情况：模板和数据都为 undefined/null/空', defaultTemplate(undefined, undefined));
console.log('极端情况：模板和数据都为 undefined/null/空', defaultTemplate(null, null));
console.log('极端情况：模板和数据都为 undefined/null/空', defaultTemplate({}, undefined));
console.log('极端情况：模板和数据都为 undefined/null/空', defaultTemplate([], undefined));
console.log('异常输入：模板为非对象/数组/基本类型/函数', defaultTemplate(new Set([1]), [1]));
console.log('异常输入：模板为非对象/数组/基本类型/函数', defaultTemplate(new Map([[1, 2]]), { a: 1 }));

// 泛型推断：类型安全
const defUser = { id: 0, name: '', active: false };
const user = defaultTemplate(defUser, { id: '1', name: '张三', active: 'true' });
console.log('泛型推断：类型安全', user);

console.log('数组模板：字段补全', defaultTemplate([{ min: 0 }], [{ val: -1 }, { val: 5 }]));
