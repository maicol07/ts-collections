import {dataGet, value} from './helpers';
import {match, P} from 'ts-pattern';

export type CollectionKeyType = string | number;
export type CollectionInputType<K extends CollectionKeyType = string, V = unknown> = V[] | [K, V][] | Iterable<V> | Collection<K, V> | Record<K, V> | Map<K, V>;

export class Collection<K extends CollectionKeyType = string, V = unknown> implements Iterable<[K, V]> {
  [index: number]: V;
  /**
   * The items contained in the collection
   */
  private items: Map<K, V>;

  /**
   * Creates a new instance of the Collection class.
   *
   * @param items - Items to be added to the collection.
   *
   * @throws {TypeError} If the items parameter is not of type V, V array, iterable, Collection, or Record<string, V>.
   */
  constructor(items: CollectionInputType<K, V> = []) {
    this.items = this.getObjectableItems(items);
  }

  * [Symbol.iterator]() {
    yield * this.items;
  }

  /**
   * Get all the items in the collection.
   */
  public all(): K extends number ? V[] : Map<K, V> {
    return (this.isArray() ? [...this.items.values()] : this.items) as K extends number ? V[] : Map<K, V>;
  }

  /**
   * Alias for the "avg" method.
   */
  public average(callback?: ((value: V) => string) | string) {
    return this.avg(callback);
  }

  /**
   * Get the average value of a given key.
   */
  public avg(callback?: ((item: V) => unknown) | string) {
    const mapper = this.valueRetriever(callback);

    const items = this.map((item) => mapper(item)).filter();

    const count = items.count();
    if (count) {
      return items.sum() / count;
    }

    return Number.NaN;
  }

  // public chunk(size: number): Collection<number, Collection<K, V>> {
  //
  //   if (size <= 0) {
  //     return new Collection();
  //   }
  //
  //   const chunks = this.keys().reduce((chunk: Collection<V>[], key, index) => {
  //     if (index % size === 0) {
  //       chunk?.push(new Collection({[key]: this.items[key]}));
  //     } else {
  //       chunk[chunk.length - 1].put(key, this.items[key]);
  //     }
  //     return chunk;
  //   }, []);
  //
  //   return new Collection(chunks);
  // }
  /**
   * Collapse the collection of items into a single array.
   */
  public collapse() {
    return new Collection(this.values().flatten(Number.POSITIVE_INFINITY));
  }

  /**
   * Collect the values into a collection.
   */
  public collect() {
    return new Collection<K, V>(this.all());
  }

  /**
   * Create a collection by using this collection for keys and another for its values.
   */
  public combine<T>(values: T[] | Collection<any, T>) {
    const m = new Map();
    const keys = this.items.values();
    for (const value of (values instanceof Collection ? values.values().all() : values)) {
      m.set(keys.next().value, value);
    }
    return new Collection(m);
  }

  /**
   * Push all the given items onto the collection.
   */
  public concat(source: CollectionInputType<K, V>) {
    const result = new Collection<K, V>(this);

    for (const [, value] of this.getObjectableItems(source)) {
      result.push(value);
    }

    return result;
  }


  /**
   * Determine if an item exists in the collection.
   *
   * @param  key
   * @param  operator
   * @param  value
   * @return boolean
   */
  public contains(key: ((value: V, key: K) => boolean) | V | K, operator?: any, value?: any): boolean {
    const args = [...arguments].filter(arg => arg !== undefined)
    if (args.length === 1) {
      if (typeof key === 'function') {
        let placeholder = {};

        return this.first(key as (value: V, key: K) => boolean, placeholder) !== placeholder;
      }

      return [...this.items.values()].includes(key as V);
    }

    // @ts-expect-error
    return this.contains(this.operatorForWhere.apply(this, args));
  }

  public containsOneItem() {
    return this.count() === 1;
  }

  /**
   * Determine if an item exists, using strict comparison.
   *
   * @param key   A function that returns a boolean type, a TValue, or an array key
   * @param value  A TValue or null
   * @return boolean
   */
  public containsStrict(key: ((item: V) => boolean) | V, value: any = null): boolean {
    if (arguments.length === 2) {
      // @ts-expect-error
      return this.contains((item: any) => dataGet(item, key) === value);
    }

    if (typeof key === 'function') {
      return this.first(key as (item: V) => boolean) !== null;
    }

    return this.contains(key);
  }

  // TODO: crossJoin, diff, diffUsing, diffAssoc, diffAssocUsing, diffKeys, diffKeysUsing, duplicates, duplicatesStrict,

  /**
   * Count the amount of items in the collection.
   */
  public count() {
    return this.items.size;
  }
  /**
   * Dump the items and end the script execution.
   */
  public dd() {
    this.dump();
    throw new Error('Stopping code execution from Collection dd()');
  }

  /**
   * Enables the browser debugger
   */
  public debugger() {
    debugger;
  }

  /**
   * Get the items in the collection that are not present in the given items.
   */
  public diff(items: CollectionInputType<K, V>) {
    const itemsValues = [...this.getObjectableItems(items).values()];
    return new Collection(this.filter((v) => !itemsValues.includes(v)));
  }

  /**
   * Get the items in the collection that are not present in the given items.
   */
  public diffAssoc(items: CollectionInputType<K, V>) {
    const itemsEntries = [...this.getObjectableItems(items).entries()];
    return new Collection(this.filter((v, k) => !itemsEntries.some(entry => entry[0] === k && entry[1] === v)));
  }

  /**
   * Get the items in the collection that are not present in the given items.
   */
  public diffKeys(items: CollectionInputType<K, V>) {
    const itemsKeys = [...this.getObjectableItems(items).keys()]
    return new Collection(this.filter((_v, k) => !itemsKeys.includes(k)));
  }

  /**
   * Determine if an item is not contained in the collection.
   *
   * @param item {any} The item to search for.
   * @param item {[string, any]} The entry (key-value pair) of the item to search for.
   * @param operator
   * @param value
   * @param item {(value, key) => boolean} Predicate to test every entry
   */
  public doesntContain(item: ((value: V, key: K) => boolean) | V | K, operator?: any, value?: any) {
    return !this.contains(item, operator, value);
  }

  /**
   * Dump the items.
   */
  public dump() {
    console.log(this);
  }

  /**
   * Retrieve duplicate items from the collection.
   * TODO: To finish
   */
  // public duplicates(callback?: string | ((item: V) => string)) {
  //   const items = this.valueRetriever(callback);
  //   //const unique = items.unique();
  // }

  /**
   * Execute a callback over each item.
   *
   * @param callback - The callback function to be applied to each element.
   *                   The callback should accept two parameters: item and key.
   *                   The item parameter represents the value of the current element.
   *                   The key parameter represents the key of the current element.
   * @return Returns the collection itself.
   */
  public each(callback: (item: V, key: CollectionKeyType) => unknown) {
    for (const [key, value] of this.entries()) {
      if (callback(value, key) === false) {
        break;
      }
    }
    return this;
  }

  /**
   * Get the entries array of the collection items in [key, value] format.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries
   */
  public entries() {
    return [...this.items.entries()];
  }

  public every(key: (value: V, key: K) => boolean | V, operator?: unknown, value?: unknown): boolean {
    if (arguments.length === 1) {
      const callback = this.valueRetriever(key);
      for (const [key, value] of this) {
        if (!callback(value, key)) {
          return false;
        }
      }

      return true;
    }

    // @ts-expect-error
    return this.every(this.operatorForWhere.apply(this, arguments));
  }

  /**
   * Run a filter over each of the items.
   */
  public filter(callback?: (value: V, key: K) => boolean): Collection<K, V> {
    return new Collection(
      this.entries()
        .filter(([key, value]) => callback ? callback(value, key) : (Boolean(value) && (typeof value === 'object' ? (value as any).length > 0 : true)))
    );
  }

  public first<D>(callback?: (value: V, key: K) => boolean, defaultValue?: D | (() => D)): V | D | undefined {
    if (!callback) {
      if (this.items.size === 0) {
        return value(defaultValue);
      }

      return this.items.values().next().value;
    }

    for (let [key, value] of this.items) {
      if (callback(value, key)) {
        return value;
      }
    }

    return value(defaultValue);
  }

  public flatten(depth: number = Infinity): Collection<number> {
    let result = [];

    for (let [, it] of this) {
      let item: Map<any, any> | any[] | V = it;
      if (it instanceof Collection) {
        item = it.all();
      }

      if (typeof item !== 'object' || item === null) {
        result.push(item);
      } else {
        let values: any;
        if (depth === 1) {
          values = item instanceof Map ? [...item.values()] : Object.values(item);
        } else {
          values = Array.isArray(item) ? item.flat(depth - 1) : Object.values(item).flat(depth - 1);
        }

        for (let value of values) {
          // noinspection SuspiciousTypeOfGuard - False positive
          if (value instanceof Collection) {
            value = value.flatten(depth - 1);
            for (let [, v] of value) {
              result.push(v);
            }
          } else {
            result.push(value);
          }
        }
      }
    }

    return new Collection<number>(result);
  }

  /**
   * Get an item from the collection by key.
   */
  public get(key: K, fallback?: any) {
    if (this.items.has(key)) {
      return this.items.get(key);
    }

    return value(fallback);
  }

  public has(...keys: K[]) {
    return keys.every((key) => this.items.has(key as K));
  }

  /**
   * Get the keys of the collection items.
   */
  public keys() {
    return new Collection<number, K>(this.items.keys());
  }

  public last(callback?: (value: V, key: K) => boolean, defaultValue?: unknown) {
    if (!callback) {
      return this.values().get(this.count() - 1) ?? value(defaultValue);
    }

    return this.reverse().first(callback, defaultValue);
  }

  /**
   * Run a map over each of the items.
   */
  public map<T>(callback: (item: V, key: K) => T) {
    const newObject = Object.fromEntries<T>(this.entries().map(([key, item]) => [key, callback(item, key)])) as Record<K, T>;
    return new Collection(newObject);
  }

  public static make<K extends CollectionKeyType = string, V = unknown>(items: CollectionInputType<K, V> = []) {
    return new Collection(items);
  }

  /**
   * Chunk the collection into chunks of the given size
   */

  public median(key?: K) {
    const values = (key ? this.pluck(key) : this)
      .filter((v) => !Number.isNaN(Number.parseFloat(v as string)))
      .sort()
      .values();
    const count = values.count();

    if (count === 0) {
      return Number.NaN;
    }

    const middle = Math.floor(count / 2);

    if (count % 2) {
      return values.get(middle);
    }

    return (values.get(middle - 1) + values.get(middle)) / 2;
  }

  public mode(key?: K) {
    if (this.count() === 0) {
      return [];
    }

    const collection: Collection<any, any> = key ? this.pluck(key) : this;
    const counts = new Collection<number, number>();
    collection.each((value) => counts.put(value, counts.get(value) ? counts.get(value) + 1 : 1));

    let sorted = counts.sort();

    let highestValue: number = sorted.last();

    return sorted.filter((value: number) => value == highestValue)
      .sort().keys().toArray();
  }

  public pluck(value: string | number, key?: string | number) {
    let results = new Collection();

    const v = typeof value === 'string' ? value.split('.') : value;
    const k = typeof key === 'string' ? key.split('.') : key;

    for (let [, item] of this) {
      let itemValue = dataGet(item, v);

      // If the key is "null", we will just append the value to the array and keep
      // looping. Otherwise, we will key the array using the value of the key we
      // received from the developer. Then we'll return the final array form.
      if (!key) {
        results.push(itemValue);
      } else {
        let itemKey = dataGet(item, k) as string | object;

        if (itemKey && typeof itemKey === "object") {
          itemKey = itemKey.toString();
        }

        results.put(itemKey, itemValue);
      }
    }

    return results;
  }

  public push(...items: V[]) {
    for (const item of items) {
      this.items.set(this.count() as K, item);
    }
    return this;
  }

  /**
   * Put an item in the collection by key.
   */
  public put(key: K | undefined, newValue: V) {
    if (key === undefined) {
      return this.push(newValue);
    }

    if (this.isArray() && Number.isNaN(Number.parseInt(key as string, 10))) {
      this.items = new Map();
    }

    this.items.set(key, newValue);
    return this;
  }

  /**
   * Create a collection with the given range.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from#sequence_generator_range
   * @return static
   */
  public static range(start: number, stop: number, step = 1) {
    const first = start > stop ? stop : start;
    const last = start > stop ? start : stop;

    const values = Array.from({length: (last - first) / step + 1}, start > stop ? (_, index) => last - (index * step) : (_, index) => first + (index * step));
    return new Collection(values);
  }

  /**
   * Reduce the collection to a single value.
   */
  public reduce<R>(callback: (result: R | null, item: V, key: K) => R, initial: R | null = null) {
    let result = initial;

    for (const [key, item] of this) {
      result = callback(result, item, key);
    }

    return result;
  }

  public reverse() {
    return new Collection([...this.items].reverse());
  }

  public sort(callback?: (a: V, b: V) => number) {
    const sorter = ([, aValue]: [K, V], [, bValue]: [K, V]) => {
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return aValue - bValue;
      }

      return String(aValue).localeCompare(String(bValue))
    }

    return new Collection<K, V>(
      this.entries()
        .sort((a, b) => callback ? callback(a[1], b[1]) : sorter(a, b))
    );
  }

  /**
   * Get the sum of the given values.
   */
  public sum(mapper?: ((item: V) => number) | string) {
    const callback = mapper === undefined ? (item: V) => item : this.valueRetriever(mapper);

    return this.reduce((result, item) => result! + (Number.parseFloat(callback(item))), 0)!;
  }

  public toArray() {
    return this.values().all();
  }

  public toObject() {
    return Object.fromEntries(this.items);
  }

  public toMap() {
    return new Map(this.items);
  }

  /**
   * Reset the keys on the underlying array.
   */
  public values() {
    return new Collection<number, V>(this.items.values());
  }

  /**
   * Prepare items to be added to the {@link items} property.
   */
  protected getObjectableItems(items: CollectionInputType<K, V>): Map<K, V> {
    const arrayCase = (value: V[] | [K, V][]) => {
      return value.every((item) => Array.isArray(item) && item.length == 2) ? new Map(value as [K, V][]) : new Map((value as V[]).map((item, index) => [index as K, item]));
    };

    return match(items)
      .returnType<Map<K, V>>()
      .when((value) => typeof value !== 'object', (value) => new Map([[0, value]]) as Map<K, V>)
      .when((value) => value instanceof Collection, (value: Collection<K, V>) => {
        const values = value.all();
        return Array.isArray(values) ? new Map(values.map((item, index) => [index as K, item])) : this.getObjectableItems(values);
      })
      .when((value) => value instanceof Map, (value: Map<K, V>) => value)
      // .when((value) => value instanceof Set, (value: Set<V>) => new Map<K, V>(value.entries()))
      .when((value) => Array.isArray(value), arrayCase)
      .when((value) => Symbol.iterator in value, (value: Iterable<V>) => arrayCase([...value]))
      .otherwise((value) => new Map(Object.entries(value)) as Map<K, V>);
  }

  /**
   * Check if collection represents an array (has numeric indexes).
   */
  protected isArray() {
    return this.keys().every((key) => !Number.isNaN(Number.parseInt(String(key), 10)));
  }

  /**
   * Get a value retrieving callback.
   */
  protected valueRetriever(callback?: Function | string) {
    if (typeof callback === 'function') {
      return callback;
    }

    return (item: V) => dataGet(item, callback as string);
  }

  /**
   * Get an operator checker callback.
   */
  protected operatorForWhere(key: any, operator?: string, value?: any)
  {
    if (typeof key === 'function') {
      return key;
    }

    if (arguments.length === 1) {
      value = true;

      operator = '=';
    }

    if (arguments.length === 2) {
      value = operator;

      operator = '=';
    }

    return (item: unknown) => {
    const retrieved: any = dataGet(item, key);

    const strings = [retrieved, value].filter((value) => {
      return typeof value === 'string' || typeof value === 'object';
    });

    if (strings.length < 2 && [retrieved, value].filter((value) => typeof value === 'object').length == 1) {
      return ['!=', '<>', '!=='].includes(operator!);
    }

    return match(operator)
      .with(P.union('=', '=='), () => retrieved == value)
      .with(P.union('!=', '<>'), () => retrieved != value)
      .with('<', () => retrieved < value)
      .with('>', () => retrieved > value)
      .with('<=', () => retrieved <= value)
      .with('>=', () => retrieved >= value)
      .with('===', () => retrieved === value)
      .with('!==', () => retrieved !== value)
      .otherwise(() => retrieved == value)
    };
  }
}
