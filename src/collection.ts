import {dataGet, value} from './helpers';
import {match, P} from 'ts-pattern';

/**
 * Represents the type of the key used in a collection.
 * It can either be a string or a number.
 */
export type CollectionKeyType = string | number;
/**
 * Represents the input types accepted by a collection.
 * @template K The type of the collection keys.
 * @template V The type of the collection values.
 */
export type CollectionInputType<K extends CollectionKeyType = string, V = unknown> = V[] | [K, V][] | Iterable<V> | Collection<K, V> | Record<K, V> | Map<K, V>;

/**
 * A collection class for storing and manipulating items.
 * @template K The type of the collection keys.
 * @template V The type of the collection values.
 */
export class Collection<K extends CollectionKeyType = string, V = unknown> implements Iterable<[K, V]> {
  /**
   * The items contained in the collection
   */
  private items: Map<K, V>;

  /**
   * Creates a new instance of the Collection class.
   *
   * @param items - Items to be added to the collection.
   *
   * @throws {TypeError} If {@link items} is not one of the accepted types.
   */
  constructor(items: CollectionInputType<K, V> = []) {
    this.items = this.getObjectableItems(items);
  }

  /**
   * The `Symbol.iterator` method returns an iterator object for the items in the current object.
   * This method is used to make the object iterable, allowing it to be used in the `for…of` loop.
   *
   * @return An iterator object that can be used to iterate through the items in the object.
   *
   * @example
   * const collection = new Collection([1, 2, 3]);
   * for (const [key, value] of collection) {
   *  console.log(key, value);
   *  }
   *  // expected output: 0 1
   *  // expected output: 1 2
   *  // expected output: 2 3
   *
   */
  * [Symbol.iterator](): Iterator<[K, V]> {
    yield * this.items;
  }

  /**
   * Returns all the elements in the collection.
   *
   * @returns If the collection is an array, an array of values, otherwise the map itself.
   * @example
   * const collection = new Collection([1, 2, 3]);
   * collection.all(); // [1, 2, 3]
   * // or
   * const collection = new Collection({a: 1, b: 2, c: 3});
   * collection.all(); // Map { 'a' => 1, 'b' => 2, 'c' => 3 }
   *
   */
  public all(): K extends number ? V[] : Map<K, V> {
    return (this.isArray() ? [...this.items.values()] : this.items) as K extends number ? V[] : Map<K, V>;
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Alias for {@link avg}
   *
   * @see {@link avg}
   */
  public average(callback?: ((value: V) => string) | string) {
    return this.avg(callback);
  }

  /**
   * Calculates the average value of the elements in the collection.
   *
   * @param callback - An optional callback function or property name to retrieve a value from each element.
   * If a callback function is provided, it will be called with each element in the collection and should return the value to use for averaging.
   * If a string is provided, it will be treated as the property name to retrieve the value from each element.
   *
   * @return {number} - The average value of the elements in the collection.
   * If the collection is empty or no valid values can be calculated, `NaN` will be returned.
   *
   * @example
   * const collection = new Collection([1, 2, 3]);
   * collection.avg(); // 2
   * // or
   * const collection = new Collection([{a: 1}, {a: 2}, {a: 3}]);
   * collection.avg('a'); // 2
   * // or
   * const collection = new Collection([{a: 1}, {a: 2}, {a: 3}]);
   * collection.avg((item) => item.a); // 2
   * // or
   * const collection = new Collection([{a: 1}, {a: 2}, {a: 3}]);
   * collection.avg((item) => item.b); // NaN
   *
   */
  public avg(callback?: ((item: V) => unknown) | string): number {
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
   * Collapses the values of the collection into a new collection.
   *
   * @return A new Collection object containing the collapsed values.
   *
   * @example
   * const collection = new Collection([[1, 2], [3, 4], [5, 6]]);
   * collection.collapse(); // Collection { 0 => 1, 1 => 2, 2 => 3, 3 => 4, 4 => 5, 5 => 6 }
   *
   */
  public collapse() {
    return new Collection(this.values().flatten(Number.POSITIVE_INFINITY));
  }

  /**
   * Creates a new collection containing all the elements of the current collection.
   *
   * @return A new collection with all the elements of the current collection.
   *
   * @example
   * const collection = new Collection([1, 2, 3]);
   * collection.collect(); // Collection { 0 => 1, 1 => 2, 2 => 3 }
   *
   */
  public collect() {
    return new Collection<K, V>(this.all());
  }

  /**
   * Combines an array or Collection (as keys) with the items (as values) of the current Collection.
   *
   * @param values - The array or Collection with the keys to be combined.
   * @template T The type of the values in the given array or Collection.
   * @returns A new Collection with combined items (keys from {@link values}, values from existing items).
   *
   * @example
   * const collection = new Collection([1, 2, 3]);
   * collection.combine([4, 5, 6]); // Collection { 1 => 4, 2 => 5, 3 => 6 }
   *
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
   * Concatenates the items from the given source collection to the current collection.
   *
   * @param source - The source collection to concatenate.
   * @return A new collection with the concatenated items.
   *
   * @example
   * const collection = new Collection([1, 2, 3]);
   * collection.concat([4, 5, 6]); // Collection { 0 => 1, 1 => 2, 2 => 3, 3 => 4, 4 => 5, 5 => 6 }
   *
   */
  public concat(source: CollectionInputType<K, V>) {
    const result = new Collection<K, V>(this);

    for (const [, value] of this.getObjectableItems(source)) {
      result.push(value);
    }

    return result;
  }


  /**
   * Checks if the map contains a specific key, value, or a custom function.
   *
   * @param key - The key, value, or custom function to search for.
   * @param operator - Optional. The operator to be used for custom function operations.
   * @param value - Optional. The value to be used for comparison operations.
   * @returns {boolean} - Returns true if the map contains the specified key, value, or custom function; otherwise, false.
   *
   * @example
   * const collection = new Collection([1, 2, 3]);
   * collection.contains(2); // true
   * // or
   * const collection = new Collection([1, 2, 3]);
   * collection.contains((item) => item === 2); // true
   * // or
   * const collection = new Collection([1, 2, 3]);
   * collection.contains(2, '===', 2); // true
   *
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

  /**
   * Checks if the given array contains exactly one item.
   *
   * @returns True if the array contains exactly one item, false otherwise.
   *
   * @example
   * const collection = new Collection([1]);
   * collection.containsOneItem(); // true
   * // or
   * const collection = new Collection([1, 2]);
   * collection.containsOneItem(); // false
   *
   */
  public containsOneItem() {
    return this.count() === 1;
  }

  /**
   * Determine if an item exists, using strict comparison.
   *
   * @param key   A function that returns a boolean type, a TValue, or an array key
   * @param value  A TValue or null
   * @return boolean
   *
   * @example
   * const collection = new Collection([1, 2, 3]);
   * collection.containsStrict(2); // true
   * // or
   * const collection = new Collection([1, 2, 3]);
   * collection.containsStrict((item) => item === 2); // true
   * // or
   * const collection = new Collection([1, 2, 3]);
   * collection.containsStrict(2, 2); // true
   *
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
   * Returns the number of items in the count.
   *
   * @return The number of items in the count.
   *
   * @example
   * const collection = new Collection([1, 2, 3]);
   * collection.count(); // 3
   *
   */
  public count() {
    return this.items.size;
  }

  /**
   * Dumps the collection and throws an error to stop code execution.
   *
   * @throws Error message indicating code execution has stopped.
   *
   * @example
   * const collection = new Collection([1, 2, 3]);
   * collection.dd(); // Logs collection to console & Error: Stopping code execution from Collection dd()
   *
   */
  public dd() {
    this.dump();
    throw new Error('Stopping code execution from Collection dd()');
  }

  /**
   * Executes a debugger statement.
   *
   * @example
   * const collection = new Collection([1, 2, 3]);
   * collection.debugger(); // Debugger stops code execution
   *
   */
  public debugger() {
    debugger;
  }

  /**
   * Calculates the difference between the current collection and the given collection.
   *
   * @param items - The collection to compare with the current collection.
   * @returns A new collection containing the items that are present in the current
   * collection but not in the given collection.
   *
   * @example
   * const collection = new Collection([1, 2, 3]);
   * collection.diff([1, 2, 4]); // Collection { 2 => 3 }
   *
   */
  public diff(items: CollectionInputType<K, V>) {
    const itemsValues = [...this.getObjectableItems(items).values()];
    return new Collection(this.filter((v) => !itemsValues.includes(v)));
  }

  /**
   * Calculates the difference between this collection and the given collection based on key-value associations.
   * Returns a new Collection object that contains all key-value pairs from this collection, which are not present in the given collection.
   *
   * @param items - The collection to compare against this collection.
   * @return A new Collection object containing the key-value pairs that are in this collection but not in the given collection.
   *
   * @example
   * const collection = new Collection({a: 1, b: 2, c: 3});
   * collection.diffAssoc({a: 1, b: 2, c: 4, d: 5}); // Collection { 'c' => 3 }
   *
   */
  public diffAssoc(items: CollectionInputType<K, V>) {
    const itemsEntries = [...this.getObjectableItems(items).entries()];
    return new Collection(this.filter((v, k) => !itemsEntries.some(entry => entry[0] === k && entry[1] === v)));
  }

  /**
   * Returns a new Collection that contains only the key-value pairs whose keys are not present in the provided items.
   *
   * @param items - The items to compare keys against.
   * @returns A new Collection instance that contains key-value pairs whose keys are not present in the provided items.
   *
   * @example
   * const collection = new Collection({a: 1, b: 2, c: 3});
   * collection.diffKeys({a: 1, c: 4, d: 5}); // Collection { 'b' => 2 }
   *
   */
  public diffKeys(items: CollectionInputType<K, V>) {
    const itemsKeys = [...this.getObjectableItems(items).keys()]
    return new Collection(this.filter((_v, k) => !itemsKeys.includes(k)));
  }

  /**
   * Checks if the item does not exist in the collection.
   *
   * @param item - The item to check for existence.
   * @param operator - Optional operator parameter.
   * @param value - Optional value parameter.
   * @return Returns true if the item does not exist in the collection, otherwise returns false.
   *
   * @example
   * const collection = new Collection([1, 2, 3]);
   * collection.doesntContain(2); // false
   * // or
   * const collection = new Collection([1, 2, 3]);
   * collection.doesntContain((item) => item === 2); // false
   * // or
   * const collection = new Collection([1, 2, 3]);
   * collection.doesntContain(2, '===', 2); // false
   *
   */
  public doesntContain(item: ((value: V, key: K) => boolean) | V | K, operator?: any, value?: any) {
    return !this.contains(item, operator, value);
  }

  /**
   * Dumps the current object to the console.
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
   *
   * @example
   * const collection = new Collection([1, 2, 3]);
   * collection.each((item, key) => console.log(item, key)); // 1 0, 2 1, 3 2
   *
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
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries
   *
   * @example
   * const collection = new Collection([1, 2, 3]);
   * collection.entries(); // [ [ 0, 1 ], [ 1, 2 ], [ 2, 3 ] ]
   *
   */
  public entries() {
    return [...this.items.entries()];
  }

  /**
   * Checks whether every element in the map satisfies the given condition.
   *
   * @param key - The function used to test each element in the map.
   * @param operator - Optional operator argument.
   * @param value - Optional value argument.
   *
   * @returns true if every element satisfies the condition, otherwise false.
   *
   * @example
   * const collection = new Collection([1, 2, 3]);
   * collection.every((item) => item > 0); // true
   * // or
   * const collection = new Collection([1, 2, 3]);
   * collection.every((item) => item > 1); // false
   * // or
   * const collection = new Collection([1, 2, 3]);
   * collection.every((item) => item > 1, '===', 2); // false
   */
  public every(key: (value: V, key: K) => boolean | V, operator?: unknown, value?: unknown): boolean {
    if (arguments.length === 1) {
      const callback = this.valueRetriever(key);
      return this.entries().every(([key, value]) => callback(value, key));
    }

    // @ts-expect-error
    return this.every(this.operatorForWhere.apply(this, arguments));
  }

  /**
   * Filters the entries of the collection based on the provided callback function.
   * It creates and returns a new Collection instance containing the filtered entries.
   *
   * @param callback - The callback function used to filter each entry.
   *                               The function takes two parameters: the value and key of each entry.
   *                               It should return true to keep the entry or false to remove it.
   *
   * @return A new Collection instance with the filtered entries.
   *
   * @example
   * const collection = new Collection([1, 2, 3]);
   * collection.filter((item) => item > 1); // Collection { 1 => 2, 2 => 3 }
   *
   */
  public filter(callback?: (value: V, key: K) => boolean): Collection<K, V> {
    return new Collection(
      this.entries()
        .filter(([key, value]) => callback ? callback(value, key) : (Boolean(value) && (typeof value === 'object' ? (value as any).length > 0 : true)))
    );
  }

  /**
   * Retrieves the first value that matches the provided callback function.
   * If no callback function is provided, returns the first value in the collection.
   * If no values are in the collection, returns the default value.
   *
   * @template D The type of the default value.
   *
   * @param callback - The callback function used to match the values. The function should accept two arguments: the current value and the current key. It should return a
   * boolean value indicating whether the value matches the criterion.
   * @param defaultValue - The default value to return if no match is found. If a function is provided, it will be executed to generate the default value.
   * @returns The first value in the collection that matches the callback function, or the default value if no match is found.
   *
   * @example
   * const collection = new Collection({key1: 'value', key2: 'value2'});
   *
   * // Example with callback function
   * const result1 = collection.first((value, key) => key === "key2");
   * console.log(result1); // Output: "value2"
   *
   * // Example without callback function
   * const result2 = collection.first();
   * console.log(result2); // Output: "value1"
   *
   * // Example with default value
   * const result3 = collection.first('key3', "default");
   * console.log(result3); // Output: "default"
   */
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

  /**
   * Flattens the collection to a one-dimensional array.
   *
   * @param depth - The depth to which the collection should be flattened. Defaults to Infinity.
   * @returns A new Collection object with the flattened array.
   *
   * @example
   * const collection = new Collection([[1, 2], [3, 4], [5, 6]]);
   * collection.flatten(); // Collection { 0 => 1, 1 => 2, 2 => 3, 3 => 4, 4 => 5, 5 => 6 }
   */
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
   * Retrieves the value associated with the specified key from the collection.
   * If the key is found, the corresponding value is returned.
   * If the key is not found, the fallback value is returned.
   *
   * @template D The type of the fallback value.
   *
   * @param key - The key to retrieve the value for.
   * @param fallback - The fallback value to return if the key is not found. Default is undefined.
   * @return The value associated with the key, or the fallback value if the key is not found.
   *
   * @example
   * const collection = new Collection([1, 2, 3]);
   * collection.get(2); // 3
   * // or
   * const collection = new Collection({a: 1, b: 2, c: 3});
   * collection.get('b'); // 2
   * // or
   * const collection = new Collection([1, 2, 3]);
   * collection.get(4, 'default'); // 'default'
   */
  public get<D>(key: K, fallback?: D) {
    if (this.items.has(key)) {
      return this.items.get(key);
    }

    return value(fallback);
  }

  /**
   * Checks if all the specified keys are present in the items map.
   *
   * @param keys - The keys to check for presence in the items map.
   * @returns Returns true if all the keys are present, false otherwise.
   *
   * @example
   * const collection = new Collection([1, 3, 5]);
   * collection.has(2); // true
   * // or
   * const collection = new Collection({a: 1, b: 2, c: 3});
   * collection.has('a'); // true
   */
  public has(...keys: K[]) {
    return keys.every((key) => this.items.has(key as K));
  }

  /**
   * Returns a collection of keys for the current instance.
   *
   * @return A collection of keys for the current instance.
   *
   * @example
   * const collection = new Collection({a: 1, b: 2, c: 3});
   * collection.keys(); // Collection { 0 => 'a', 1 => 'b', 2 => 'c' }
   * // or
   * const collection = new Collection([1, 2, 3]);
   * collection.keys(); // Collection { 0 => 0, 1 => 1, 2 => 2 }
   */
  public keys() {
    return new Collection<number, K>(this.items.keys());
  }

  /**
   * Returns the last value in the collection that satisfies the provided callback function.
   * If no callback function is provided, it returns the last value in the collection.
   * If the collection is empty or the callback function doesn't find a match, it returns the defaultValue.
   *
   * @template D The type of the default value.
   *
   * @param callback - The callback function used to determine if a value satisfies a condition.
   *   It should return true if the value satisfies the condition, otherwise false.
   * @param defaultValue - The value to return if no match is found. Defaults to undefined.
   *
   * @return The last value that satisfies the callback function, or the defaultValue if no match is found.
   *
   * @example
   * const collection = new Collection([1, 2, 3]);
   * collection.last((item) => item > 1); // 3
   * // or
   * const collection = new Collection([1, 2, 3]);
   * collection.last((item) => item > 3, 'default'); // 'default'
   * // or
   * const collection = new Collection([1, 2, 3]);
   * collection.last(); // 3
   */
  public last<D>(callback?: (value: V, key: K) => boolean, defaultValue?: D) {
    if (!callback) {
      return this.values().get(this.count() - 1) ?? value(defaultValue);
    }

    return this.reverse().first(callback, defaultValue);
  }

  /**
   * Maps each key-value pair in the Collection object to a new value using a provided callback function.
   *
   * @template T The type of the new values.
   *
   * @param callback - The function to be applied to each key-value pair. It should take two arguments: the value of the current key-value pair and the
   * key of the current key-value pair.
   *
   * @return A new Collection object with the same keys as the original object, but with the values transformed by the callback function.
   *
   * @example
   * const collection = new Collection([1, 2, 3]);
   * collection.map((item) => item * 2); // Collection { 0 => 2, 1 => 4, 2 => 6 }
   * // or
   * const collection = new Collection({a: 1, b: 2, c: 3});
   * collection.map((item) => item * 2); // Collection { 'a' => 2, 'b' => 4, 'c' => 6 }
   */
  public map<T>(callback: (item: V, key: K) => T) {
    const newObject = Object.fromEntries<T>(this.entries().map(([key, item]) => [key, callback(item, key)])) as Record<K, T>;
    return new Collection(newObject);
  }

  /**
   * Create a new Collection instance.
   *
   * @param items - The items to initialize the Collection with.
   * @return The newly created Collection instance.
   *
   * @example
   * const collection = Collection.make([1, 2, 3]); // Collection { 0 => 1, 1 => 2, 2 => 3 }
   */
  public static make<K extends CollectionKeyType = string, V = unknown>(items: CollectionInputType<K, V> = []) {
    return new Collection(items);
  }

  /**
   * Calculates the median value from an array of numbers.
   *
   * @param key - Optional. The key to use for extracting values from objects in the array. If provided, the method will first use `this.pluck(key)` to extract values.
   *
   * @returns The median value. If the array is empty, returns `NaN`.
   *
   * @example
   * const collection = new Collection([1, 2, 3]);
   * collection.median(); // 2
   * // or
   * const collection = new Collection([{a: 1}, {a: 2}, {a: 3}]);
   * collection.median('a'); // 2
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
      return values.get(middle) as number;
    }

    return (values.get(middle - 1) as number + (values.get(middle) as number)) / 2;
  }

  /**
   * Returns an array containing the keys of the elements with the highest occurrence in the collection.
   * If a key parameter is provided, mode returns the keys of the elements with the highest occurrence for that specific key.
   *
   * @param key - Optional. The key parameter to filter the collection by.
   * @return An array containing the keys of the elements with the highest occurrence in the collection.
   *                  Returns an empty array if the collection is empty.
   *
   * @example
   * const collection = new Collection([1, 2, 2, 3, 3, 3]);
   * collection.mode(); // [3]
   * // or
   * const collection = new Collection([{a: 1}, {a: 2}, {a: 2}, {a: 3}, {a: 3}, {a: 3}]);
   * collection.mode('a'); // [3]
   */
  public mode(key?: K) {
    if (this.count() === 0) {
      return [];
    }

    const collection: Collection<any, any> = key ? this.pluck(key) : this;
    const counts = new Collection<number, number>();
    collection.each((value) => counts.put(value, counts.get(value) ? (counts.get(value) as number) + 1 : 1));

    let sorted = counts.sort();

    let highestValue = sorted.last() as number;

    return sorted.filter((value: number) => value == highestValue)
      .sort().keys().toArray();
  }

  /**
   * Retrieves values from a collection based on a given key.
   *
   * @param value - The key to retrieve values for. Can be a string or number.
   * @param key - Optional key to use for indexing the values. Can be a string or number.
   * @returns A new Collection containing the retrieved values.
   *
   * @example
   * const collection = new Collection([{a: 1}, {a: 2}, {a: 3}]);
   * collection.pluck('a'); // Collection { 0 => 1, 1 => 2, 2 => 3 }
   * // or
   * const collection = new Collection([{a: 1, b: 1}, {a: 2, b: 2}, {a: 3, b: 3}]);
   * collection.pluck('a', 'b'); // Collection { 1 => 1, 2 => 2, 3 => 3 }
   */
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

  /**
   * Adds one or more items to the collection.
   *
   * @param items - The items to add to the collection.
   * @returns The updated collection.
   *
   * @example
   * const collection = new Collection([1, 2, 3]);
   * collection.push(4, 5, 6); // Collection { 0 => 1, 1 => 2, 2 => 3, 3 => 4, 4 => 5, 5 => 6 }
   */
  public push(...items: V[]) {
    for (const item of items) {
      this.items.set(this.count() as K, item);
    }
    return this;
  }

  /**
   * Puts a new key-value pair into the map.
   *
   * @param key - The key for the new entry. If the key is undefined it fallbacks to the {@link push} method.
   * @param newValue - The value for the new entry.
   * @return This collection instance, after the new entry is added.
   *
   * @example
   * const collection = new Collection({a: 1, b: 2, c: 3});
   * collection.put('d', 4); // Collection { 'a' => 1, 'b' => 2, 'c' => 3, 'd' => 4 }
   * // or
   * const collection = new Collection([1, 2, 3]);
   * collection.put(undefined, 4); // Collection { 0 => 1, 1 => 2, 2 => 3, 3 => 4 }
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
   * @param start - The start of the range.
   * @param stop - The end of the range.
   * @param step - The step of the range.
   *
   * @return static
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from#sequence_generator_range
   *
   * @example
   * Collection.range(1, 5); // Collection { 0 => 1, 1 => 2, 2 => 3, 3 => 4, 4 => 5 }
   * // or
   * Collection.range(1, 5, 2); // Collection { 0 => 1, 1 => 3, 2 => 5 }
   */
  public static range(start: number, stop: number, step = 1) {
    const first = start > stop ? stop : start;
    const last = start > stop ? start : stop;

    const values = Array.from({length: (last - first) / step + 1}, start > stop ? (_, index) => last - (index * step) : (_, index) => first + (index * step));
    return new Collection(values);
  }

  /**
   * Applies a callback function to each item in the map and reduces them to a single value.
   *
   * @template R - The type of the reduced value.
   * @param callback - The function to execute on each item.
   * @param initial - The initial value for the reduction.
   * @return The reduced value.
   *
   * @example
   * const collection = new Collection([1, 2, 3]);
   * collection.reduce((result, item) => result + item); // 6
   * // or
   * const collection = new Collection([1, 2, 3]);
   * collection.reduce((result, item) => result + item, 10); // 16
   */
  public reduce<R>(callback: (result: R | null, item: V, key: K) => R, initial: R | null = null) {
    let result = initial;

    for (const [key, item] of this) {
      result = callback(result, item, key);
    }

    return result;
  }

  /**
   * Reverses the order of the items in the collection.
   *
   * @return A new collection with the items in reverse order.
   *
   * @example
   * const collection = new Collection([1, 2, 3]);
   * collection.reverse(); // Collection { 0 => 3, 1 => 2, 2 => 1 }
   * // or
   * const collection = new Collection({a: 1, b: 2, c: 3});
   * collection.reverse(); // Collection { 'c' => 3, 'b' => 2, 'a' => 1 }
   */
  public reverse() {
    return new Collection([...this.items].reverse());
  }

  /**
   * Sorts the elements of the collection.
   *
   * @param callback - (Optional) A callback function to determine the sort order.
   *                   If provided, the function should accept two elements from the collection
   *                   and return a negative number if the first element should be placed before
   *                   the second element, 0 if the order should remain unchanged, or a positive
   *                   number if the second element should be placed before the first element.
   *                   If not provided, the default sorting order is used.
   *
   * @returns A new Collection with the elements sorted.
   *
   * @example
   * const collection = new Collection([3, 2, 1]);
   * collection.sort(); // Collection { 0 => 1, 1 => 2, 2 => 3 }
   * // or
   * const collection = new Collection([3, 2, 1]);
   * collection.sort((a, b) => b - a); // Collection { 0 => 3, 1 => 2, 2 => 1 }
   * // or
   * const collection = new Collection([{a: 3}, {a: 2}, {a: 1}]);
   * collection.sort((a, b) => a.a - b.a); // Collection { 0 => { a: 1 }, 1 => { a: 2 }, 2 => { a: 3 } }
   * // or
   * const collection = new Collection([{a: 3}, {a: 2}, {a: 1}]);
   * collection.sort(); // Collection { 0 => { a: 1 }, 1 => { a: 2 }, 2 => { a: 3 } }
   */
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
   * Calculates the sum of the elements in the array.
   *
   * @param mapper - Optional. A callback function or property name for mapping each value before performing the sum. If specified, the mapper function
   * will be applied to each element in the array before summing. If a property name is provided, it will be used as a string accessor to retrieve the corresponding value from each element
   *.
   *
   * @returns The sum of the elements in the array.
   *
   * @example
   * const collection = new Collection([1, 2, 3]);
   * collection.sum(); // 6
   * // or
   * const collection = new Collection([{a: 1}, {a: 2}, {a: 3}]);
   * collection.sum('a'); // 6
   * // or
   * const collection = new Collection([{a: 1}, {a: 2}, {a: 3}]);
   * collection.sum((item) => item.a); // 6
   */
  public sum(mapper?: ((item: V) => number) | string) {
    const callback = mapper === undefined ? (item: V) => item : this.valueRetriever(mapper);

    return this.reduce((result, item) => result! + (Number.parseFloat(callback(item))), 0)!;
  }

  /**
   * Convert the collection to an array.
   *
   * @return The collection values as an array.
   *
   * @example
   * const collection = new Collection([1, 2, 3]);
   * collection.toArray(); // [1, 2, 3]
   * // or
   * const collection = new Collection({a: 1, b: 2, c: 3});
   * collection.toArray(); // [1, 2, 3]
   */
  public toArray() {
    return this.values().all();
  }

  /**
   * Converts the instance of the class to a plain object.
   *
   * @return The plain object representation of the class.
   *
   * @example
   * const collection = new Collection([1, 2, 3]);
   * collection.toObject(); // { '0': 1, '1': 2, '2': 3 }
   * // or
   * const collection = new Collection({a: 1, b: 2, c: 3});
   * collection.toObject(); // { a: 1, b: 2, c: 3 }
   */
  public toObject(): Record<K, V> {
    return Object.fromEntries(this.items) as Record<K, V>;
  }

  /**
   * Converts the items of this object into a Map.
   *
   * @return A new Map object containing the items of this object.
   *
   * @example
   * const collection = new Collection([1, 2, 3]);
   * collection.toMap(); // Map { 0 => 1, 1 => 2, 2 => 3 }
   * // or
   * const collection = new Collection({a: 1, b: 2, c: 3});
   * collection.toMap(); // Map { 'a' => 1, 'b' => 2, 'c' => 3 }
   */
  public toMap() {
    return new Map(this.items);
  }

  /**
   * Returns a new Collection of values from the underlying items.
   * @return A new Collection of values.
   *
   * @example
   * const collection = new Collection([1, 2, 3]);
   * collection.values(); // Collection { 0 => 1, 1 => 2, 2 => 3 }
   * // or
   * const collection = new Collection({a: 1, b: 2, c: 3});
   * collection.values(); // Collection { 'a' => 1, 'b' => 2, 'c' => 3 }
   */
  public values() {
    return new Collection<number, V>(this.items.values());
  }

  /**
   * Returns a Map object containing items suitable for iteration.
   *
   * @param items - The input collection of items.
   * @protected
   * @return A Map object containing the objectable items.
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
   * Checks whether the object is an array.
   *
   * @protected
   * @returns Returns true if the object is an array, otherwise false.
   */
  protected isArray() {
    return this.keys().every((key) => !Number.isNaN(Number.parseInt(String(key), 10)));
  }

  /**
   * Retrieves the value from an item using a callback function or a property path.
   *
   * @param callback - The callback function or property path used to retrieve the value from the item.
   * @protected
   * @return The callback function to retrieve the value from*/
  protected valueRetriever(callback?: Function | string) {
    if (typeof callback === 'function') {
      return callback;
    }

    return (item: V) => dataGet(item, callback as string);
  }

  /**
   * Returns a function that can be used as a filter in array methods like Array.filter().
   *
   * @param key - The key or function to use for comparison.
   * @param operator The comparison operator.
   * @param value The value to compare against.
   * @protected
   * @returns The filter function.
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
