import {collect, Collection} from '../src';

describe('Collections tests', () => {
  test('All returns all items in Collection', () => {
    const c = new Collection(['foo', 'bar']);
    expect(c.all()).toStrictEqual(['foo', 'bar']);

    const object = {users: {name: ['Taylor', 'Otwell']}};
    const collection = collect(object);
    expect(collection.all()).toStrictEqual(new Map(Object.entries(object)));

    const c2 = new Collection({0: 'foo', 1: 'bar'});
    expect(c2.all()).toStrictEqual(['foo', 'bar']);
  });

  test('Average returns the average value of a given key', () => {
    const c = new Collection([
      {foo: 10},
      {foo: 10},
      {foo: 20},
      {foo: 40},
    ]);
    expect(c.average('foo')).toBe(20);

    const c2 = new Collection([
      {foo: 10},
      {foo: 10},
      {bar: 10},
      {bar: 20},
    ]);
    expect(c2.average('foo')).toBe(10);
  });

  test('Collapse collapses a Collection of Collections into a single Collection', () => {
    const c = new Collection([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
    expect(c.collapse().all()).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    const c2 = new Collection([[{}], [{}]]);
    expect(c2.collapse().all()).toStrictEqual([{}, {}]);
  });

  test('Collapse with nested Collections', () => {
    const c = new Collection([new Collection([1, 2, 3]), new Collection([4, 5, 6])]);
    expect(c.collapse().all()).toStrictEqual([1, 2, 3, 4, 5, 6]);
  });

  test('Collect method', () => {
    const c = Collection.make({a: 1, b: 2, c: 3}).collect();
    expect(c).toBeInstanceOf(Collection);
    expect(c.toObject()).toStrictEqual({a: 1, b: 2, c: 3});
  });

  test('Combine with array', () => {
    const c = new Collection([1, 2, 3]);
    expect(c.combine([4, 5, 6]).toObject()).toStrictEqual({1: 4, 2: 5, 3: 6});

    const c2 = new Collection({1: 'name', 2: 'family'});
    expect(c2.combine(['Taylor', 'Otwell']).toObject()).toStrictEqual({name: 'Taylor', family: 'Otwell'});
  });

  test('Combine with collection', () => {
    const expected = {
      1: 4,
      2: 5,
      3: 6
    };

    const kc = new Collection(Object.keys(expected));
    const vc = new Collection(Object.values(expected));
    expect(kc.combine(vc).toObject()).toStrictEqual(expected);
  });

  test('Concat with array', () => {
    let data = new Collection<number, number | string>([4, 5, 6]);
    data = data.concat(['a', 'b', 'c']);
    // @ts-ignore
    data = data.concat({who: 'Jonny', preposition: 'from', where: 'Laroe'});
    // @ts-ignore
    let actual = data.concat({who: 'Jonny', preposition: 'from', where: 'Laroe'}).toObject();

    expect(actual).toStrictEqual({
      0: 4,
      1: 5,
      2: 6,
      3: 'a',
      4: 'b',
      5: 'c',
      6: 'Jonny',
      7: 'from',
      8: 'Laroe',
      9: 'Jonny',
      10: 'from',
      11: 'Laroe'
    });
  });

  test('Concat with collection', () => {
    let data = new Collection<number, number | string>([4, 5, 6]);
    data = data.concat(new Collection(['a', 'b', 'c']));
    data = data.concat(new Collection({who: 'Jonny', preposition: 'from', where: 'Laroe'}));
    let actual = data.concat(new Collection({who: 'Jonny', preposition: 'from', where: 'Laroe'})).toObject();

    expect(actual).toStrictEqual({
      0: 4,
      1: 5,
      2: 6,
      3: 'a',
      4: 'b',
      5: 'c',
      6: 'Jonny',
      7: 'from',
      8: 'Laroe',
      9: 'Jonny',
      10: 'from',
      11: 'Laroe'
    });
  });

  test('Contains', () => {
    const c = new Collection([1, 3, 5]);
    expect(c.contains(1)).toBeTruthy();
    expect(c.contains(2)).toBeFalsy();

    const c2 = new Collection(['1']);
    expect(c2.contains('1')).toBeTruthy();

    const c3 = new Collection([undefined]);
    expect(c3.contains(undefined)).toBeTruthy();

    const c4 = new Collection([0]);
    expect(c4.contains(0)).toBeTruthy();
    expect(c4.contains((value) => value < 5)).toBeTruthy();
    expect(c4.contains((value) => value > 5)).toBeFalsy();

    const c5 = new Collection([{v: 1}, {v: 3}, {v: 5}]);
    expect(c5.contains('v', 1)).toBeTruthy();
    expect(c5.contains('v', 2)).toBeFalsy();

    const c6 = new Collection(['date', 'class', {'foo': 50}]);
    expect(c6.contains('date')).toBeTruthy();
    expect(c6.contains('class')).toBeTruthy();
    expect(c6.contains('foo')).toBeFalsy();

    const c7 = new Collection([
      undefined, 1, 2,
    ]);
    expect(c7.contains((value) => !value)).toBeTruthy();
  });

  test('Contains one item', () => {
    expect(new Collection([]).containsOneItem()).toBeFalsy();
    expect(new Collection([1]).containsOneItem()).toBeTruthy();
    expect(new Collection([1, 2]).containsOneItem()).toBeFalsy();
  });

  test('ContainsStrict', () => {
    const c = new Collection([1, 3, 5, '02']);
    expect(c.containsStrict(1)).toBeTruthy();
    expect(c.containsStrict(2)).toBeFalsy();
    expect(c.containsStrict('02')).toBeTruthy();
  });

  test('Count', () => {
    const c = new Collection([1, 3, 5, '02']);
    expect(c.count()).toBe(4);
  });

  test('Diff', () => {
    const c = new Collection({id: 1, first_word: 'Hello'});
    // @ts-ignore
    expect(c.diff(new Collection({first_word: 'Hello', last_word: 'World'})).toObject()).toStrictEqual({id: 1});
  });

  test('Diff assoc', () => {
    const c = new Collection({id: 1, first_word: 'Hello', not_affected: 'value'});
    const c2 = new Collection({id: 123, first_word: 'Hello', not_affected: 'value'});
    expect(c.diffAssoc(c2).toObject()).toStrictEqual({id: 1});
  });

  test('Diff keys', () => {
    const c = new Collection<string, number | string>({id: 1, first_word: 'Hello'});
    const c2 = new Collection<string, number | string>({id: 123, foo_bar: 'Hello'});
    expect(c.diffKeys(c2).toObject()).toStrictEqual({first_word: 'Hello'});
  });


  test("Doesn't contain", () => {
    const c = new Collection([1, 3, 5]);
    expect(c.doesntContain(1)).toBeFalsy();
    expect(c.doesntContain(2)).toBeTruthy();

    const c2 = new Collection(['1']);
    expect(c2.doesntContain('1')).toBeFalsy();

    const c3 = new Collection([undefined]);
    expect(c3.doesntContain(undefined)).toBeFalsy();

    const c4 = new Collection([0]);
    expect(c4.doesntContain(0)).toBeFalsy();
    expect(c4.doesntContain((value) => value < 5)).toBeFalsy();
    expect(c4.doesntContain((value) => value > 5)).toBeTruthy();

    const c5 = new Collection([{v: 1}, {v: 3}, {v: 5}]);
    expect(c5.doesntContain('v', 1)).toBeFalsy();
    expect(c5.doesntContain('v', 2)).toBeTruthy();

    const c6 = new Collection(['date', 'class', {'foo': 50}]);
    expect(c6.doesntContain('date')).toBeFalsy();
    expect(c6.doesntContain('class')).toBeFalsy();
    expect(c6.doesntContain('foo')).toBeTruthy();

    const c7 = new Collection([
      undefined, 1, 2,
    ]);
    expect(c7.doesntContain((value) => !value)).toBeFalsy();
  });

  test('First returns first item in Collection', () => {
    const c = new Collection(['foo', 'bar']);
    expect(c.first()).toBe('foo');
  });

  test('First with callback', () => {
    const c = new Collection(['foo', 'bar', 'baz']);
    expect(c.first((value) => value === 'bar')).toBe('bar');
  });

  test('First with callback and default', () => {
    const c = new Collection(['foo', 'bar']);
    expect(c.first((value) => value === 'baz', 'default')).toBe('default');
  });

  test('First with default and without callback', () => {
    const c = new Collection();
    expect(c.first(undefined, 'default')).toBe('default');
    const collection = new Collection(['foo', 'bar']);
    expect(collection.first(undefined, 'default')).toBe('foo');
  });

  test('Last returns last item in Collection', () => {
    const c = new Collection(['foo', 'bar']);
    expect(c.last()).toBe('bar');

    const c2 = new Collection();
    expect(c2.last()).toBeUndefined();
  });

  test('Last with callback', () => {
    const c = new Collection<number, number>([100, 200, 300]);
    expect(c.last((value) => value < 250)).toBe(200);
    expect(c.last((value, key) => key < 2)).toBe(200);
    expect(c.last((value) => value > 300)).toBeUndefined();
  });

  test('Last with callback and default', () => {
    const c = new Collection(['foo', 'bar']);
    expect(c.last((value) => value === 'baz', 'default')).toBe('default');
    const c2 = new Collection(['foo', 'bar', 'Bar']);
    expect(c2.last((value) => value === 'bar', 'default')).toBe('bar');
  });

  test('Last with default and without callback', () => {
    const c = new Collection();
    expect(c.last(undefined, 'default')).toBe('default');
  });
});
