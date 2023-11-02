import {dataGet, value} from './helpers';

export class Collection<K extends string | number | symbol = number, V = unknown> implements Iterable<[string, V]> {
  /**
   * The items contained in the collection
   */
  private items: Record<K, V>;

  /**
   * Create a new collection.
   */
  constructor(items?: V | V[] | Collection<K, V> | Record<string, V>) {
    // @ts-ignore
    this.items = this.getObjectableItems(items);

    return new Proxy(this, {
      get(target: Collection<K, V>, property: string | symbol) {
        if (property in target) {
          // @ts-ignore
          return target[property];
        }

        // @ts-ignore
        return target.get(property);
      }
    });
  }

  itCount = 0;

  * [Symbol.iterator]() {
    // @ts-ignore
    yield this.get(this.itCount);
  }

  /**
   * Create a collection with the given range.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from#sequence_generator_range
   * @return static
   */
  public static range(start: number, stop: number, step = 1) {
    return new Collection(
      Array.from({length: (stop - start) / step + 1}, (_, index) => start + (index * step))
    );
  }

  /**
   * Get all the items in the collection.
   */
  public all() {
    return this.isArray() ? this.values() : this.items;
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

    const items = this.map((item) => mapper(item)).filter((item) => item !== null);

    const count = items.count();
    if (count) {
      return items.sum() as number / count;
    }

    return Number.NaN;
  }

  /**
   * Chunk the collection into chunks of the given size
   */
  // public chunk(size: number): Collection<Collection<V>> {
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
    return new Collection(this.values().flat(Number.POSITIVE_INFINITY));
  }

  /**
   * Collect the values into a collection.
   */
  public collect() {
    return new Collection(this.all());
  }

  /**
   * Create a collection by using this collection for keys and another for its values.
   */
  public combine<T>(values: T[]) {
    return new Collection(values.reduce((items: Record<string, T>, value, index) => {
      // @ts-ignore
      items[this.get(index.toString())] = value;
      return items;
    }, {}));
  }

  /**
   * Push all of the given items onto the collection.
   */
  // @ts-ignore
  public concat(source: V[] | Collection<K, V>) {
    // @ts-ignore
    const result = new Collection(this);

    for (const value of Object.values(this.getObjectableItems(source))) {
      // @ts-ignore
      result.push(value);
    }

    return result;
  }


  /**
   * Determine if an item is contained in the collection.
   *
   * @param item {any} The item to search for.
   * @param item {[string, any]} The entry (key-value pair) of the item to search for.
   * @param item {(value, key) => boolean} Predicate to test every entry
   */
  public contains(item: V | ((value: V, key: string) => boolean) | [string, V | unknown]) {
    let callback: (value: V, key: string) => boolean = () => false;
    if (this.useAsCallable(item)) {
      callback = item as (value: V, key: string) => boolean;
    }

    if (Array.isArray(item)) {
      // @ts-ignore
      callback = (value, key) => [key, value] === item;
    }

    if (callback) {
      let result = false;

      for (const [key, value] of this.entries()) {
        // @ts-ignore
        result = callback(value, key);
        if (result) {
          return result;
        }
      }
    }
  }

  /**
   * Count the amount of items in the collection.
   */
  public count() {
    return this.keys().length;
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
  public diff(items: V) {
    const itemsValues = Object.values(this.getObjectableItems(items));
    return new Collection(this.values().filter((v) => !itemsValues.includes(v)));
  }

  /**
   * Get the items in the collection that are not present in the given items.
   */
  public diffAssoc(items: V) {
    // const itemsEntries = Object.entries(this.getObjectableItems(items));
    // return new Collection(this.values().filter((v) => !itemsEntries.includes(v)));
  }

  /**
   * Get the items in the collection that are not present in the given items.
   */
  public diffKeys(items: V) {
    const itemsKeys = Object.keys(this.getObjectableItems(items));
    return new Collection(this.keys().filter((v) => !itemsKeys.includes(v)));
  }

  /**
   * Determine if an item is not contained in the collection.
   *
   * @param item {any} The item to search for.
   * @param item {[string, any]} The entry (key-value pair) of the item to search for.
   * @param item {(value, key) => boolean} Predicate to test every entry
   */
  public doesntContain(item: V | ((value: V, key: string) => boolean) | [string, V | unknown]) {
    return !this.contains(item);
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
  public duplicates(callback?: string | ((item: V) => string)) {
    const items = this.valueRetriever(callback);
    //const unique = items.unique();
  }

  /**
   * Get the entries array of the collection items in [key, value] format.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries
   */
  public entries() {
    return Object.entries(this.items);
  }

  /**
   * Run a filter over each of the items.
   */
  public filter(callback?: (value: V, key: string) => boolean) {
    if (callback) {
      return new Collection(
        // @ts-ignore
        Object.fromEntries(this.entries().filter(([key, item]) => callback(item, key)))
      );
    }

    return new Collection(this.values().filter(Boolean));
  }

  /**
   * Get an item from the collection by key.
   */
  public get(key: K, fallback?: any) {
    if (key in this.items) {
      return this.items[key];
    }

    return value(fallback);
  }

  public has(key: K) {
    return key in this.items;
  }

  /**
   * Get the keys of the collection items.
   */
  public keys() {
    return Object.keys(this.items);
  }

  /**
   * Run a map over each of the items.
   */
  public map<T>(callback: (item: V, key: string) => T) {
    const newObject = Object.fromEntries<T>(
      // @ts-ignore
      this.entries().map(([key, item]) => [key, callback(item, key)])
    );
    return new Collection(newObject);
  }

  /**
   * Put an item in the collection by key.
   */
  public put(key: string, newValue: V) {
    if (this.isArray() && Number.isNaN(Number.parseInt(key, 10))) {
      // @ts-ignore
      this.items = {};
    }

    // @ts-ignore
    this.items[key] = newValue;
    return this;
  }

  /**
   * Reduce the collection to a single value.
   */
  public reduce<R>(callback: (result: R | undefined, item: V, key: string) => R, initial?: R) {
    let result = initial;

    for (const [key, item] of this) {
      result = callback(result, item, key);
    }

    return result;
  }

  /**
   * Get the sum of the given values.
   */
  public sum(mapper?: ((item: V) => number) | string) {
    const callback = mapper === undefined ? (item: V) => item : this.valueRetriever(mapper);

    return this.reduce((result, item) => result as number + (callback(item) as number), 0);
  }

  public values() {
    return Object.values(this.items);
  }

  /**
   * Prepare items to be added to the {@link items} property.
   */
  protected getObjectableItems(items?: V | V[] | Collection<K, V> | Record<K, V>) {
    let localItems = items;
    if (localItems instanceof Collection) {
      // @ts-ignore
      localItems = localItems.all();
    }

    if (Array.isArray(localItems)) {
      return Object.fromEntries(localItems.entries());
    }

    if (localItems && typeof localItems !== 'object') {
      return {0: localItems};
    }

    return localItems ?? {};
  }

  /**
   * Check if collection represents an array (has numeric indexes).
   */
  protected isArray() {
    return this.keys().every((key) => !Number.isNaN(Number.parseInt(key, 10)));
  }

  /**
   * Determine if the given value is callable, but not a string.
   */
  protected useAsCallable(item: any) {
    return typeof item !== 'string' && typeof item === 'function';
  }

  /**
   * Get a value retrieving callback.
   */
  protected valueRetriever(callback?: ((item: V) => unknown) | string) {
    if (this.useAsCallable(callback)) {
      return callback as (item: V) => unknown;
    }

    return (item: V) => dataGet(item, callback as string);
  }
}
