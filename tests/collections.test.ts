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
    const c = new Collection([{foo: 10}, {foo: 20}]);
    expect(c.avg('foo')).toBe(15);

    const c2 = new Collection([{foo: 10}, {foo: 20}, {foo: null}]);
    expect(c2.avg('foo')).toBe(15);

    const c3 = new Collection([{foo: 10}, {foo: 20}]);
    expect(c3.avg('foo')).toBe(15);

    const c4 = new Collection([1, 2, 3, 4, 5]);
    expect(c4.avg()).toBe(3);

    const c5 = new Collection();
    expect(c5.avg()).toBeNaN();

    const c6 = new Collection([{foo: '4'}, {foo: '2'}]);
    expect(c6.avg('foo')).toBe(3);

    const c7 = new Collection([{foo: 1}, {foo: 2}]);
    expect(c7.avg('foo')).toBe(1.5);

    const c8 = new Collection([{foo: 1}, {foo: 2}, {foo: 6}]);
    expect(c8.avg('foo')).toBe(3);
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
    let data = new Collection<string & number, number | string>([4, 5, 6]);
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

  test('Each', () => {
    let original = {0: 1, 1: 2, 'foo': 'bar', 'bam': 'baz'};
    const c = new Collection(original);

    let result: Record<string | number, string | number> = {};
    c.each((item, key) => {
      result[key] = item;
    });
    expect(result).toStrictEqual(original);

    result = {};
    c.each((item: any, key: any) => {
      result[key] = item;
      if (Number.isNaN(Number.parseInt(key))) { // is a string
        return false;
      }
    });
    expect(result).toStrictEqual({0: 1, 1: 2, 'foo': 'bar'});
  });

  test('Every', () => {
    const c = new Collection([]);
    // @ts-ignore
    expect(c.every('key', 'value')).toBe(true);
    expect(c.every(() => false)).toBe(true);

    const c2 = new Collection([{age: 18}, {age: 20}, {age: 20}]);
    // @ts-ignore
    expect(c2.every('age', 18)).toBe(false);
    // @ts-ignore
    expect(c2.every('age', '>=', 18)).toBe(true);
    expect(c2.every((item) => item.age >= 18)).toBe(true);
    expect(c2.every((item) => item.age >= 20)).toBe(false);

    const c3 = new Collection([null, null]);
    expect(c3.every((item) => item === null)).toBe(true);

    const c4 = new Collection([{active: true}, {active: true}]);
    // @ts-ignore
    expect(c4.every('active')).toBe(true);
  });

  test('Filter', () => {
    const c = new Collection([{id: 1, name: 'Hello'}, {id: 2, name: 'World'}]);
    expect(c.filter(item => item.id == 2).all()).toEqual([{id: 2, name: 'World'}]);

    const c2 = new Collection(['', 'Hello', '', 'World']);
    expect(c2.filter().values().toArray()).toEqual(['Hello', 'World']);

    const c3 = new Collection({id: 1, first: 'Hello', second: 'World'});
    expect(c3.filter((item, key) => key !== 'id').toObject()).toEqual({first: 'Hello', second: 'World'});

    const c4 = new Collection([1, 2, 3, null, false, '', 0, []]);
    expect(c4.filter().all()).toEqual([1, 2, 3]);
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

  test('Flatten', () => {
    // Flat arrays are unaffected
    const c = new Collection(['#foo', '#bar', '#baz']);
    expect(c.flatten().all()).toStrictEqual(['#foo', '#bar', '#baz']);

    // Nested arrays are flattened with existing flat items
    const c2 = new Collection(['#foo', ['#bar', '#baz']]);
    expect(c2.flatten().all()).toStrictEqual(['#foo', '#bar', '#baz']);

    // Sets of nested arrays are flattened
    const c3 = new Collection([['#foo', '#bar'], ['#baz']]);
    expect(c3.flatten().all()).toStrictEqual(['#foo', '#bar', '#baz']);

    // Deeply nested arrays are flattened
    const c4 = new Collection([['#foo', ['#bar']], ['#baz']]);
    expect(c4.flatten().all()).toStrictEqual(['#foo', '#bar', '#baz']);

    // Nested collections are flattened alongside arrays
    const c5 = new Collection([new Collection(['#foo', '#bar']), ['#baz']]);
    expect(c5.flatten().all()).toStrictEqual(['#foo', '#bar', '#baz']);

    // Nested collections containing plain arrays are flattened
    const c6 = new Collection([new Collection(['#foo', ['#bar']]), ['#baz']]);
    expect(c6.flatten().all()).toStrictEqual(['#foo', '#bar', '#baz']);

    // Nested arrays containing collections are flattened
    const c7 = new Collection([['#foo', new Collection(['#bar'])], ['#baz']]);
    expect(c7.flatten().all()).toStrictEqual(['#foo', '#bar', '#baz']);

    // Nested arrays containing collections containing arrays are flattened
    const c8 = new Collection([['#foo', new Collection(['#bar', ['#zap']])], ['#baz']]);
    expect(c8.flatten().all()).toStrictEqual(['#foo', '#bar', '#zap', '#baz']);
  });

  test('Flatten ignores keys', () => {
    // No depth ignores keys
    let c = new Collection(['#foo', {'key': '#bar'}, {'key': '#baz'}, {'key': '#zap'}]);
    expect(c.flatten().all()).toStrictEqual(['#foo', '#bar', '#baz', '#zap']);

    // Depth of 1 ignores keys
    c = new Collection(['#foo', {'key': '#bar'}, {'key': '#baz'}, {'key': '#zap'}]);
    expect(c.flatten(1).all()).toStrictEqual(['#foo', '#bar', '#baz', '#zap']);
  });

  test('Flatten with depth', () => {
    // No depth flattens recursively
    const c = new Collection([['#foo', ['#bar', ['#baz']]], '#zap']);
    expect(c.flatten().all()).toEqual(['#foo', '#bar', '#baz', '#zap']);

    // Specifying a depth only flattens to that depth
    const c2 = new Collection([['#foo', ['#bar', ['#baz']]], '#zap']);
    expect(c2.flatten(1).all()).toEqual(['#foo', ['#bar', ['#baz']], '#zap']);

    const c3 = new Collection([['#foo', ['#bar', ['#baz']]], '#zap']);
    expect(c3.flatten(2).all()).toEqual(['#foo', '#bar', ['#baz'], '#zap']);
  });

  test('Get with callback as default value', () => {
    let data = new Collection<string, string>({name: 'taylor', framework: 'laravel'});
    let result = data.get('email', () => 'taylor@example.com');
    expect(result).toBe('taylor@example.com');
  });

  test('Get with default value', () => {
    let data = new Collection<string, string>({name: 'taylor', framework: 'laravel'});
    expect(data.get('age', 34)).toBe(34);
  });

  test('Get with undefined returns undefined', () => {
    let data = new Collection<string, string>({name: 'taylor', framework: 'laravel'});
    // @ts-expect-error
    expect(data.get(undefined)).toBe(undefined);
  });

  test('Has', () => {
    let data = new Collection<string, string | number>({id: 1, first: 'Hello', second: 'World'});

    expect(data.has('first')).toBe(true);
    expect(data.has('third')).toBe(false);
    expect(data.has('first', 'second')).toBe(true);
    expect(data.has('third', 'first')).toBe(false);
  });

  test('Keys', () => {
    const c = new Collection({name: 'taylor', framework: 'laravel'});
    expect(c.keys().all()).toStrictEqual(['name', 'framework']);

    const c2 = new Collection(['taylor', 'laravel']);
    expect(c2.keys().all()).toStrictEqual([0, 1]);
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

  test('Make method', () => {
    const data = Collection.make('foo');
    expect(data.all()).toEqual(['foo']);
  });

  test('Make method from undefined', () => {
    let data = Collection.make(undefined);
    expect(data.all()).toEqual([]);
    data = Collection.make();
    expect(data.all()).toEqual([]);
  });

  test('Make method from collection', () => {
    const firstCollection = Collection.make({foo: 'bar'});
    const secondCollection = Collection.make(firstCollection);
    expect(secondCollection.toObject()).toEqual({foo: 'bar'});
  });

  test('Make method from array', () => {
    const data = Collection.make({foo: 'bar'});
    expect(data.toObject()).toEqual({foo: 'bar'});
  });

  test('Map', () => {
    const c = new Collection([1, 2, 3]);
    const mapped = c.map((item) => item * 2);
    expect(mapped.all()).toStrictEqual([2, 4, 6]);
    expect(c.all()).toStrictEqual([1, 2, 3]);

    let c2 = new Collection<string, string>({first: 'taylor', last: 'otwell'});
    c2 = c2.map((item, key) => key + '-' + item);
    expect(c2.toObject()).toStrictEqual({first: 'first-taylor', last: 'last-otwell'});
  });

  test('Median with even in collection', () => {
    const data = new Collection([
      {'foo': 0},
      {'foo': 3},
    ]);
    expect(data.median('foo')).toBe(1.5);
  });

  test('Median on collection with undefined', () => {
    const data = new Collection([
      {'foo': 1},
      {'foo': 2},
      {'foo': 4},
      {'foo': undefined},
    ]);
    expect(data.median('foo')).toBe(2);
  });

  test('Median on empty collection', () => {
    const data = new Collection();
    expect(data.median()).toBeNaN();
  });

  test('Median out of order collection', () => {
    const data = new Collection([
      {'foo': 0},
      {'foo': 5},
      {'foo': 3},
    ]);
    expect(data.median('foo')).toBe(3);
  });

  test('Median value by key', () => {
    const data = new Collection([
      {'foo': 1},
      {'foo': 2},
      {'foo': 2},
      {'foo': 4},
    ]);
    expect(data.median('foo')).toBe(2);
  });

  test('Median value with array collection', () => {
    const data = new Collection([1, 2, 2, 4]);
    expect(data.median()).toBe(2);
  });

  test('Mode', () => {
    const data = new Collection([1, 2, 3, 4, 4, 5]);
    expect(data.mode()).toStrictEqual([4]);
  });

  test('Mode on empty collection', () => {
    const data = new Collection();
    expect(data.mode()).toStrictEqual([]);
  });

  test('Mode value by key', () => {
    let data = new Collection([
      {foo: 1},
      {foo: 1},
      {foo: 2},
      {foo: 4},
    ]);

    let data2 = new Collection([
      {foo: 1},
      {foo: 1},
      {foo: 2},
      {foo: 4},
    ]);

    expect(data.mode('foo')).toEqual([1]);
    expect(data2.mode('foo')).toEqual(data.mode('foo'));
  });

  test('Mode multiple values', () => {
    const data = new Collection([1, 2, 2, 1]);
    expect(data.mode()).toStrictEqual([1, 2]);
  });

  test('Pluck duplicates keys exists', () => {
    const data = new Collection([
      {brand: 'Tesla', color: 'red'},
      {brand: 'Pagani', color: 'white'},
      {brand: 'Tesla', color: 'black'},
      {brand: 'Pagani', color: 'orange'},
    ]);

    expect(data.pluck('color', 'brand').toObject()).toStrictEqual({Tesla: 'black', Pagani: 'orange'});
  });

  test('Pluck with array and object values', () => {
    const data = new Collection([{name: 'taylor', email: 'foo'}, {name: 'dayle', email: 'bar'}]);
    expect(data.pluck('email', 'name').toObject()).toStrictEqual({taylor: 'foo', dayle: 'bar'});
    expect(data.pluck('email').all()).toStrictEqual(['foo', 'bar']);
  });

  test('Pluck with dot notation', () => {
    let data = new Collection([
      {
        name: 'amir',
        skill: {
          backend: ['php', 'python'],
        },
      },
      {
        name: 'taylor',
        skill: {
          backend: ['php', 'asp', 'java'],
        },
      },
    ]);

    expect(data.pluck('skill.backend').all()).toStrictEqual([['php', 'python'], ['php', 'asp', 'java']]);
  });

  test('Push with multiple item', () => {
    const expected = [4, 5, 6, 'Johnny', 'from', 'Laroe', 'Johnny', 'from', 'Laroe', 'a', 'b', 'c'];
    const c = new Collection<string, number | string>([4, 5, 6]);
    c.push('Johnny', 'from', 'Laroe');
    c.push(...Object.values({11: 'Johnny', 12: 'from', 13: 'Laroe'}));
    c.push(...collect(['a', 'b', 'c']).values().toArray());
    const actual = c.push(...[]).toArray();

    expect(actual).toStrictEqual(expected);
  });

  test('Push with one item', () => {
    const expected = [4, 5, 6, ['a', 'b', 'c'], {who: 'Jonny', preposition: 'from', where: 'Laroe'}, 'Johnny from Laroe'];
    const c = new Collection<string, number | string | string[] | Record<string, string>>([4, 5, 6]);
    c.push(['a', 'b', 'c']);
    c.push({who: 'Jonny', preposition: 'from', where: 'Laroe'});
    const actual = c.push('Johnny from Laroe').toArray();
    expect(actual).toStrictEqual(expected);
  });

  test('Put', () => {
    const c = new Collection({name: 'taylor', email: 'foo'});
    expect(c.put('name', 'dayle').toObject()).toStrictEqual({name: 'dayle', email: 'foo'});
  });

  test('Put adds item to collection', () => {
    const c = new Collection();
    expect(c.toArray()).toStrictEqual([]);
    c.put('foo', 1);
    expect(c.toObject()).toStrictEqual({foo: 1});
    c.put('bar', {nested: 'two'});
    expect(c.toObject()).toStrictEqual({foo: 1, bar: {nested: 'two'}});
    c.put('foo', 3);
    expect(c.toObject()).toStrictEqual({foo: 3, bar: {nested: 'two'}});
  });

  test('Put with no key', () => {
    const c = new Collection(['taylor', 'shadwn']);
    expect(c.put(undefined, 'dayle').toArray()).toStrictEqual(['taylor', 'shadwn', 'dayle']);
  });

  test('Range', () => {
    expect(Collection.range(1, 5).all()).toStrictEqual([1, 2, 3, 4, 5]);
    expect(Collection.range(-2, 2).all()).toStrictEqual([-2, -1, 0, 1, 2]);
    expect(Collection.range(-4, -2).all()).toStrictEqual([-4, -3, -2]);
    expect(Collection.range(5, 1).all()).toStrictEqual([5, 4, 3, 2, 1]);
    expect(Collection.range(2, -2).all()).toStrictEqual([2, 1, 0, -1, -2]);
    expect(Collection.range(-2, -4).all()).toStrictEqual([-2, -3, -4]);
    expect(Collection.range(0, 5, 2).all()).toStrictEqual([0, 2, 4]);
    expect(Collection.range(5, 0, 2).all()).toStrictEqual([5, 3, 1]);
  });

  test('Reduce', () => {
    const data = new Collection([1, 2, 3]);
    expect(data.reduce<number>((carry, element) => carry! += element)).toEqual(6);

    const data2 = new Collection({
      'foo': 'bar',
      'baz': 'qux',
    });
    expect(data2.reduce((carry, element, key) => carry += key + element, '')).toBe('foobarbazqux');
  });

  test('Reverse', () => {
    const data = new Collection(['zaeed', 'alan']);
    const reversed = data.reverse();
    expect(reversed.all()).toStrictEqual(['alan', 'zaeed']);

    const data2 = new Collection({name: 'taylor', framework: 'laravel'});
    const reversed2 = data2.reverse();
    expect(reversed2.toObject()).toStrictEqual({'framework': 'laravel', 'name': 'taylor'});
  });

  test('Sort', () => {
    const data = (new Collection([5, 3, 1, 2, 4])).sort();
    expect(data.values().all()).toStrictEqual([1, 2, 3, 4, 5]);

    const data2 = (new Collection([-1, -3, -2, -4, -5, 0, 5, 3, 1, 2, 4])).sort();
    expect(data2.values().all()).toStrictEqual([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]);

    const data3 = (new Collection(['foo', 'bar-10', 'bar-1'])).sort();
    expect(data3.values().all()).toStrictEqual(['bar-1', 'bar-10', 'foo']);

    const data4 = (new Collection(['T2', 'T1', 'T10'])).sort();
    expect(data4.values().all()).toStrictEqual(['T1', 'T10', 'T2']);
  });

  test('Sort with callback', () => {
    const data = (new Collection([5, 3, 1, 2, 4])).sort((a, b) => {
      if (a === b) {
        return 0;
      }

      return (a < b) ? -1 : 1;
    });
    expect(data.values().all()).toStrictEqual([1, 2, 3, 4, 5]);
  });

  test('Sum', () => {
    const data = new Collection([1, 2, 3, 4, 5]);
    expect(data.sum()).toBe(15);
  });

  test('Sum with empty collection', () => {
    const data = new Collection();
    expect(data.sum()).toBe(0);
  });

  test('Sum with parameter', () => {
    let c = new Collection([{foo: 50}, {foo: 50}]);
    expect(c.sum('foo')).toEqual(100);

    c = new Collection([{foo: 50}, {foo: 50}]);
    expect(c.sum((i) => i.foo)).toEqual(100);
  });

  test('To array', () => {
    const c = new Collection(['foo', 'bar']);
    expect(c.toArray()).toStrictEqual(['foo', 'bar']);

    const c2 = new Collection({name: 'taylor', framework: 'laravel'});
    expect(c2.toArray()).toStrictEqual(['taylor', 'laravel']);
  });

  test('To object', () => {
    const c = new Collection(['foo', 'bar']);
    expect(c.toObject()).toStrictEqual({0: 'foo', 1: 'bar'});

    const c2 = new Collection({name: 'taylor', framework: 'laravel'});
    expect(c2.toObject()).toStrictEqual({name: 'taylor', framework: 'laravel'});
  });

  test('To map', () => {
    const c = new Collection(['foo', 'bar']);
    expect(c.toMap()).toStrictEqual(new Map([[0, 'foo'], [1, 'bar']]));

    const c2 = new Collection({name: 'taylor', framework: 'laravel'});
    expect(c2.toMap()).toStrictEqual(new Map([['name', 'taylor'], ['framework', 'laravel']]));
  });

  test('Values', () => {
    const collection = new Collection([{id: 1, name: 'Hello'}, {id: 2, name: 'World'}]);
    expect(collection.filter(item => item.id == 2).values().all()).toStrictEqual([{id: 2, name: 'World'}]);
  });

  test('Values reset keys', () => {
    let data = new Collection({1: 'a', 2: 'b', 3: 'c'});
    expect(data.values().all()).toStrictEqual(['a', 'b', 'c']);
    expect(data.values().toObject()).toStrictEqual({0: 'a', 1: 'b', 2: 'c'});
  });
});
