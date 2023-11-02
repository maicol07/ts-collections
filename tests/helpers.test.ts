/* eslint-disable sonarjs/no-duplicate-string */
import {
  collect,
  Collection,
  dataFill, dataForget,
  dataGet, dataSet,
  value
} from '../src';

describe('Helpers tests', () => {
  test('value test', () => {
    expect(value('foo')).toBe('foo');
    expect(value(() => 'foo')).toBe('foo');
    expect(value((arguments_) => arguments_, 'foo')).toBe('foo');
  });

  test('dataGet', () => {
    const object = {users: {name: ['Taylor', 'Otwell']}};
    const array = [{users: [{name: 'Taylor'}]}];
    const dottedObject = {users: {'first.name': 'Taylor', 'middle.name': undefined}};

    const collection = collect({
      price: 56,
      user: collect({
        name: 'John'
      }),
      email: undefined
    });

    expect(dataGet(object, 'users.name.0')).toStrictEqual('Taylor');
    expect(dataGet(array, '0.users.0.name')).toStrictEqual('Taylor');
    expect(dataGet(array, '0.users.3')).toBeUndefined();
    expect(dataGet(array, '0.users.3', 'Not found!')).toStrictEqual('Not found!');
    expect(dataGet(array, '0.users.3', () => 'Not found!')).toStrictEqual('Not found!');
    expect(dataGet(dottedObject, ['users', 'first.name'])).toStrictEqual('Taylor');
    expect(dataGet(dottedObject, ['users', 'middle.name'])).toBeUndefined();
    expect(dataGet(dottedObject, ['users', 'last.name'], 'Not found!')).toStrictEqual('Not found!');
    expect(dataGet(collection, 'price')).toStrictEqual(56);
    expect(dataGet(collection, 'user.name')).toStrictEqual('John');
    expect(dataGet(collection, 'foo', 'void')).toStrictEqual('void');
    expect(dataGet(collection, 'user.foo', 'void')).toStrictEqual('void');
    expect(dataGet(collection, 'foo')).toBeUndefined();
    expect(dataGet(collection, 'user.foo')).toBeUndefined();
    expect(dataGet(collection, 'email', 'Not found!')).toBeUndefined();
  });

  test('dataGet with nested objects', () => {
    const nested = [
      {name: 'taylor', email: 'taylorotwell@gmail.com'},
      {name: 'abigail'},
      {name: 'dayle'}
    ];

    expect(dataGet(nested, '*.name')).toStrictEqual(['taylor', 'abigail', 'dayle']);
    expect(dataGet(nested, '*.email', 'irrelevant')).toStrictEqual(['taylorotwell@gmail.com', 'irrelevant', 'irrelevant']);

    const nested2 = {
      users: [
        {first: 'taylor', last: 'otwell', email: 'taylorotwell@gmail.com'},
        {first: 'abigail', last: 'otwell'},
        {first: 'dayle', last: 'rees'}
      ],
      posts: undefined
    };

    expect(dataGet(nested2, 'users.*.first')).toStrictEqual(['taylor', 'abigail', 'dayle']);
    expect(dataGet(nested2, 'users.*.email', 'irrelevant')).toStrictEqual(['taylorotwell@gmail.com', 'irrelevant', 'irrelevant']);
    expect(dataGet(nested2, 'posts.*.date', 'not found')).toStrictEqual('not found');
    expect(dataGet(nested2, 'posts.*.date')).toBeUndefined();
  });

  test('dataGet with double nested objects', () => {
    const object = {
      posts: [
        {
          comments: [
            {author: 'taylor', likes: 4},
            {author: 'abigail', likes: 3}
          ]
        },
        {
          comments: [
            {author: 'abigail', likes: 2},
            {author: 'dayle'}
          ]
        },
        {
          comments: [
            {author: 'dayle'},
            {author: 'taylor', likes: 1}
          ]
        }
      ]
    };

    expect(dataGet(object, 'posts.*.comments.*.author')).toStrictEqual(['taylor', 'abigail', 'abigail', 'dayle', 'dayle', 'taylor']);
    expect(dataGet(object, 'posts.*.comments.*.likes')).toStrictEqual([4, 3, 2, undefined, undefined, 1]);
    expect(dataGet(object, 'posts.*.users.*.name', 'irrelevant')).toStrictEqual(['irrelevant', 'irrelevant', 'irrelevant']);
    expect(dataGet(object, 'posts.*.users.*.name')).toStrictEqual([undefined, undefined, undefined]);
  });

  test('dataFill', () => {
    const data = {foo: 'bar'};

    expect(dataFill(data, 'baz', 'boom')).toStrictEqual({foo: 'bar', baz: 'boom'});
    expect(dataFill(data, 'baz', 'noop')).toStrictEqual({foo: 'bar', baz: 'boom'});
    expect(dataFill(data, 'foo.*', 'noop')).toStrictEqual({foo: {}, baz: 'boom'});
    expect(dataFill(data, 'foo.bar', 'kaboom')).toStrictEqual({foo: {bar: 'kaboom'}, baz: 'boom'});
  });

  test('dataFill with star', () => {
    const data = {foo: 'bar'};

    expect(dataFill(data, 'foo.*.bar', 'noop')).toStrictEqual({foo: {}});
    expect(dataFill(data, 'bar', [{baz: 'original'}, []])).toStrictEqual({foo: {}, bar: [{baz: 'original'}, []]});
    expect(dataFill(data, 'bar.*.baz', 'boom')).toStrictEqual({foo: {}, bar: [{baz: 'original'}, {baz: 'boom'}]});
    expect(dataFill(data, 'bar.*', 'noop')).toStrictEqual({foo: {}, bar: [{baz: 'original'}, {baz: 'boom'}]});
  });

  test('dataFill with double star', () => {
    const data = {
      posts: [
        {
          comments: [
            {name: 'First'},
            []
          ]
        },
        {
          comments: [
            [],
            {name: 'Second'}
          ]
        }
      ]
    };

    expect(dataFill(data, 'posts.*.comments.*.name', 'Filled')).toStrictEqual({
      posts: [
        {
          comments: [
            {name: 'First'},
            {name: 'Filled'}
          ]
        },
        {
          comments: [
            {name: 'Filled'},
            {name: 'Second'}
          ]
        }
      ]
    });
  });

  test('dataSet', () => {
    const data = {foo: 'bar'};

    expect(dataSet(data, 'baz', 'boom')).toStrictEqual({foo: 'bar', baz: 'boom'});
    expect(dataSet(data, 'baz', 'kaboom')).toStrictEqual({foo: 'bar', baz: 'kaboom'});
    expect(dataSet(data, 'foo.*', 'noop')).toStrictEqual({foo: {}, baz: 'kaboom'});
    expect(dataSet(data, 'foo.bar', 'boom')).toStrictEqual({foo: {bar: 'boom'}, baz: 'kaboom'});
    expect(dataSet(data, 'baz.bar', 'boom')).toStrictEqual({foo: {bar: 'boom'}, baz: {bar: 'boom'}});
    expect(dataSet(data, 'baz.bar.boom.kaboom', 'boom')).toStrictEqual({foo: {bar: 'boom'}, baz: {bar: {boom: {kaboom: 'boom'}}}});
  });

  test('dataSet with star', () => {
    const data = {foo: 'bar'};

    expect(dataSet(data, 'foo.*.bar', 'noop')).toStrictEqual({foo: {}});
    expect(dataSet(data, 'bar', [{baz: 'original'}, []])).toStrictEqual({foo: {}, bar: [{baz: 'original'}, []]});
    expect(dataSet(data, 'bar.*.baz', 'boom')).toStrictEqual({foo: {}, bar: [{baz: 'boom'}, {baz: 'boom'}]});
    expect(dataSet(data, 'bar.*', 'overwritten')).toStrictEqual({foo: {}, bar: ['overwritten', 'overwritten']});
  });

  test('dataSet with double star', () => {
    const data = {
      posts: [
        {
          comments: [
            {name: 'First'},
            []
          ]
        },
        {
          comments: [
            [],
            {name: 'Second'}
          ]
        }
      ]
    };

    expect(dataSet(data, 'posts.*.comments.*.name', 'Filled')).toStrictEqual({
      posts: [
        {
          comments: [
            {name: 'Filled'},
            {name: 'Filled'}
          ]
        },
        {
          comments: [
            {name: 'Filled'},
            {name: 'Filled'}
          ]
        }
      ]
    });
  });

  test('dataRemove', () => {
    let data: object = {foo: 'bar', hello: 'world'};

    expect(dataForget(data, 'foo')).toStrictEqual({hello: 'world'});

    data = {foo: 'bar', hello: 'world'};
    expect(dataForget(data, 'nothing')).toStrictEqual({foo: 'bar', hello: 'world'});

    data = {one: {two: {three: 'hello', four: ['five']}}};

    expect(dataForget(data, 'one.two.three')).toStrictEqual({one: {two: {four: ['five']}}});
  });

  test('dataRemove with star', () => {
    const data = {
      article: {
        title: 'Foo',
        comments: [
          {comment: 'foo', name: 'First'},
          {comment: 'bar', name: 'Second'}
        ]
      }
    };

    expect(dataForget(data, 'article.comments.*.name')).toStrictEqual({
      article: {
        title: 'Foo',
        comments: [
          {comment: 'foo'},
          {comment: 'bar'}
        ]
      }
    });
  });

  test('dataRemove with double star', () => {
    const data = {
      posts: [
        {
          comments: [
            {name: 'First', comment: 'foo'},
            {name: 'Second', comment: 'bar'}
          ]
        },
        {
          comments: [
            {name: 'Third', comment: 'hello'},
            {name: 'Fourth', comment: 'world'}
          ]
        }
      ]
    };

    expect(dataForget(data, 'posts.*.comments.*.name')).toStrictEqual({
      posts: [
        {
          comments: [
            {comment: 'foo'},
            {comment: 'bar'}
          ]
        },
        {
          comments: [
            {comment: 'hello'},
            {comment: 'world'}
          ]
        }
      ]
    });
  });
});
