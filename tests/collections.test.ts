import {collect, Collection} from '../src';

describe('Collections tests', () => {
  test('First returns first item in Collection', () => {
    const c = new Collection(['foo', 'bar']);
    // @ts-ignore
    expect(c.first()).toBe('foo');
  });

  test('First with callback')
});
