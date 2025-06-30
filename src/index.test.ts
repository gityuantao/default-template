/// <reference types="vitest" />
import { describe, it, expect } from 'vitest';
import defaultTemplate, { TemplateRename } from './index';

describe('defaultTemplate', () => {
  it('基本类型：undefined/null 返回默认值', () => {
    let result = defaultTemplate(10, undefined);
    console.log('基本类型：undefined/null 返回默认值', result);
    expect(result).toBe(10);
    result = defaultTemplate(10, null);
    console.log('基本类型：undefined/null 返回默认值', result);
    expect(result).toBe(10);
    result = defaultTemplate(false, undefined);
    console.log('基本类型：undefined/null 返回默认值', result);
    expect(result).toBe(false);
    result = defaultTemplate('', undefined);
    console.log('基本类型：undefined/null 返回默认值', result);
    expect(result).toBe('');
  });

  it('基本类型：类型自动转换', () => {
    let result = defaultTemplate(10, '20');
    console.log('基本类型：类型自动转换', result);
    expect(result).toBe(20);
    result = defaultTemplate(false, 'true');
    console.log('基本类型：类型自动转换', result);
    expect(result).toBe(true);
    result = defaultTemplate(false, 'false');
    console.log('基本类型：类型自动转换', result);
    expect(result).toBe(false);
    result = defaultTemplate('', 123);
    console.log('基本类型：类型自动转换', result);
    expect(result).toBe('123');
    result = defaultTemplate(BigInt(1), '2');
    console.log('基本类型：类型自动转换', result);
    expect(result).toBe('2'); // bigint 作为模板时，字符串原样返回
    result = defaultTemplate(Symbol('a'), Symbol('b'));
    console.log('基本类型：类型自动转换', typeof result);
    expect(typeof result).toBe('symbol');
  });

  it('基本类型：function 作为模板', () => {
    const fn = (x: any) => (typeof x === 'number' ? x * 2 : 0);
    let result = defaultTemplate(fn, 5);
    console.log('基本类型：function 作为模板', result);
    expect(result).toBe(10);
    result = defaultTemplate(fn, undefined);
    console.log('基本类型：function 作为模板', result);
    expect(result).toBe(0);
  });

  it('基本类型：Date 作为模板', () => {
    const d = new Date('2020-01-01');
    const d2 = new Date('2022-01-01');
    let result = defaultTemplate(d, d2);
    console.log('基本类型：Date 作为模板', result);
    expect(result).toBe(d2);
    result = defaultTemplate(d, undefined);
    console.log('基本类型：Date 作为模板', result);
    expect(result).toBe(d);
  });

  it('基本类型：原样返回', () => {
    let result = defaultTemplate(null, 10);
    console.log('基本类型：原样返回', result);
    expect(result).toBe(10);
    result = defaultTemplate(null, '10');
    console.log('基本类型：原样返回', result);
    expect(result).toBe('10');
    result = defaultTemplate(null, { a: 1 });
    console.log('基本类型：原样返回', result);
    expect(result).toEqual({ a: 1 });
  });

  it('数组：元素模板', () => {
    let result = defaultTemplate([10], [null, '20', 20]);
    console.log('数组：元素模板', result);
    expect(result).toEqual([10, 20, 20]);
    result = defaultTemplate([false], [1, 0, 'false']);
    console.log('数组：元素模板', result);
    expect(result).toEqual([true, false, false]);
    result = defaultTemplate([{ a: 1 }], [{ a: 2 }, { a: '3' }]);
    console.log('数组：元素模板', result);
    expect(result).toEqual([{ a: 2 }, { a: 3 }]);
  });

  it('数组：嵌套数组', () => {
    const result = defaultTemplate([[0]], [[1, 2], [3, null]]);
    console.log('数组：嵌套数组', result);
    expect(result).toEqual([[1, 2], [3, 0]]);
  });

  it('数组：空模板数组', () => {
    let result = defaultTemplate([], [1, 2, 3]);
    console.log('数组：空模板数组', result);
    expect(result).toEqual([1, 2, 3]);
    result = defaultTemplate([], undefined);
    console.log('数组：空模板数组', result);
    expect(result).toEqual([]);
  });

  it('对象：基础对象模板', () => {
    const result = defaultTemplate({ a: 10, b: false, c: 20 }, { a: '20', b: null, d: 'test' });
    console.log('对象：基础对象模板', result);
    expect(result).toEqual({ a: 20, b: false, c: 20 });
  });

  it('对象：深层嵌套对象', () => {
    const def = { a: { b: { c: 1 } } };
    const src = { a: { b: { c: '2', d: 3 }, e: 4 } };
    const result = defaultTemplate(def, src);
    console.log('对象：深层嵌套对象', result);
    expect(result).toEqual({ a: { b: { c: 2 } } });
  });

  it('对象：通配符模板', () => {
    let result = defaultTemplate({ '?': true }, { x: null, y: false });
    console.log('对象：通配符模板', result);
    expect(result).toEqual({ x: true, y: false });
    result = defaultTemplate({ a: 1, '?': 0 }, { a: 2, b: '3', c: null });
    console.log('对象：通配符模板', result);
    expect(result).toEqual({ a: 2, b: 3, c: 0 });
  });

  it('对象：通配符与显式key混用', () => {
    const result = defaultTemplate({ a: 1, '?': 2 }, { a: undefined, b: 3 });
    console.log('对象：通配符与显式key混用', result);
    expect(result).toEqual({ a: 1, b: 3 });
  });

  it('对象：自定义通配符键名', () => {
    const result = defaultTemplate({ '*': 1 }, { a: null, b: 2 }, { allTemplateKey: '*' });
    console.log('对象：自定义通配符键名', result);
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it('对象：空对象模板', () => {
    let result = defaultTemplate({}, { a: 1 });
    console.log('对象：空对象模板', result);
    expect(result).toEqual({});
    result = defaultTemplate({}, {});
    console.log('对象：空对象模板', result);
    expect(result).toEqual({});
  });

  it('对象：嵌套结构', () => {
    const def = { user: { name: '', age: 0, tags: [''] }, active: false };
    const src = { user: { name: '张三', age: '18', tags: [null, 'vip'] }, active: 'true', extra: 123 };
    const result = defaultTemplate(def, src);
    console.log('对象：嵌套结构', result);
    expect(result).toEqual({ user: { name: '张三', age: 18, tags: ['', 'vip'] }, active: true });
  });

  it('对象：键名映射', () => {
    const def = { id: 0, name: new TemplateRename('username', '') };
    const src = { id: 1, name: '张三' };
    const result = defaultTemplate(def, src);
    console.log('对象：键名映射', result);
    expect(result).toEqual({ id: 1, username: '张三' });
  });

  it('对象：键名映射为函数', () => {
    const def = { foo: new TemplateRename(k => 'bar_' + k, 1) };
    const src = { foo: 2 };
    const result = defaultTemplate(def, src);
    console.log('对象：键名映射为函数', result);
    expect(result).toEqual({ bar_foo: 2 });
  });

  it('对象：TemplateRename 嵌套', () => {
    const def = { a: new TemplateRename('b', new TemplateRename('c', 1)) };
    const src = { a: 2 };
    const result = defaultTemplate(def, src);
    console.log('对象：TemplateRename 嵌套', result);
    expect(result).toEqual({ c: 2 });
  });

  it('自定义处理函数', () => {
    let result = defaultTemplate((data: string | any[]) => Array.isArray(data) ? data.length : 0, [1, 2, 3]);
    console.log('自定义处理函数', result);
    expect(result).toBe(3);
    result = defaultTemplate((data: string) => typeof data === 'string' ? data.toUpperCase() : '', 'abc');
    console.log('自定义处理函数', result);
    expect(result).toBe('ABC');
    // 测试 owner 参数
    result = defaultTemplate((data: any, owner: any) => owner && owner.flag ? 1 : 0, 5, undefined);
    console.log('自定义处理函数', result);
    expect(result).toBe(0);
    result = defaultTemplate((data: any, owner: any) => owner && owner.flag ? 1 : 0, 5, undefined);
    console.log('自定义处理函数', result);
    expect(result).toBe(0);
    result = defaultTemplate((data: any, owner: any) => owner && owner.flag ? 1 : 0, 5, undefined);
    console.log('自定义处理函数', result);
    expect(result).toBe(0);
  });

  it('边界：模板为 null/undefined', () => {
    let result = defaultTemplate(null, 123);
    console.log('边界：模板为 null/undefined', result);
    expect(result).toBe(123);
    result = defaultTemplate(undefined, 456);
    console.log('边界：模板为 null/undefined', result);
    expect(result).toBe(456);
  });

  it('边界：src 为 null/undefined', () => {
    let result = defaultTemplate(1, null);
    console.log('边界：src 为 null/undefined', result);
    expect(result).toBe(1);
    result = defaultTemplate({ a: 1 }, null);
    console.log('边界：src 为 null/undefined', result);
    expect(result).toEqual({ a: 1 });
    result = defaultTemplate([1], null);
    console.log('边界：src 为 null/undefined', result);
    expect(result).toEqual([]);
  });

  it('边界：对象模板未声明的字段被删除', () => {
    const result = defaultTemplate({ a: 1 }, { a: 2, b: 3 });
    console.log('边界：对象模板未声明的字段被删除', result);
    expect(result).toEqual({ a: 2 });
  });

  it('边界：数组模板长度为0', () => {
    let result = defaultTemplate([], [1, 2, 3]);
    console.log('边界：数组模板长度为0', result);
    expect(result).toEqual([1, 2, 3]);
    result = defaultTemplate([], undefined);
    console.log('边界：数组模板长度为0', result);
    expect(result).toEqual([]);
  });

  it('极端情况：模板和数据都为 undefined/null/空', () => {
    let result = defaultTemplate(undefined, undefined);
    console.log('极端情况：模板和数据都为 undefined/null/空', result);
    expect(result).toBe(undefined);
    result = defaultTemplate(null, null);
    console.log('极端情况：模板和数据都为 undefined/null/空', result);
    expect(result).toBe(null);
    result = defaultTemplate({}, undefined);
    console.log('极端情况：模板和数据都为 undefined/null/空', result);
    expect(result).toEqual({});
    result = defaultTemplate([], undefined);
    console.log('极端情况：模板和数据都为 undefined/null/空', result);
    expect(result).toEqual([]);
  });

  it('异常输入：模板为非对象/数组/基本类型/函数', () => {
    let result = defaultTemplate(new Set([1]), [1]);
    console.log('异常输入：模板为非对象/数组/基本类型/函数', result);
    expect(result).toEqual(new Set([1]));
    result = defaultTemplate(new Map([[1, 2]]), { a: 1 });
    console.log('异常输入：模板为非对象/数组/基本类型/函数', result);
    expect(result).toEqual(new Map([[1, 2]]));
  });

  it('泛型推断：类型安全', () => {
    type User = { id: number; name: string; active: boolean };
    const def: User = { id: 0, name: '', active: false };
    const user = defaultTemplate(def, { id: '1', name: '张三', active: 'true' });
    console.log('泛型推断：类型安全', user);
    expect(user).toEqual({ id: 1, name: '张三', active: true });
  });

  it('数组模板：字段补全', () => {
    const result = defaultTemplate([{ min: 0 }], [{ val: -1 }, { val: 5 }]);
    console.log('数组模板：字段补全', result);
    expect(result).toEqual([{ min: 0, val: -1 }, { min: 0, val: 5 }]);
  });
}); 