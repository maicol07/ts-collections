import {Collection, CollectionInputType, CollectionKeyType} from './collection';

/**
 * Create a collection from the given value.
 */
export function collect<K extends CollectionKeyType, V>(items: CollectionInputType<K, V> = []) {
  return new Collection<K, V>(items);
}

/**
 * Evaluates the given value with optional arguments and returns the result.
 *
 * @typeParam T - The type of the value to be evaluated.
 * @typeParam A - The type of the optional arguments to be passed to the value if it is a function.
 *
 * @param value_ - The value to be evaluated. It can be a function or a value.
 * @param arguments_ - Optional arguments to be passed to the value if it is a function.
 * @return The result of evaluating the value.
 *
 * @example
 * ```ts
 * value('foo') // 'foo'
 * value(() => 'foo') // 'foo'
 * ```
 */
export function value<T, A>(value_: ((...a: A[]) => T) | T, ...arguments_: A[]) {
  if (!arguments_) {
    arguments_ = [];
  }

  if (typeof value_ === 'function' && 'call' in value_) {
    // @ts-ignore
    return value_(...arguments_) as T;
  }

  return value_;
}


function isAccessible(data: unknown): data is object | unknown[] {
  return !!data && (Array.isArray(data) || typeof data === 'object');
}

function isTraversable(data: unknown): data is unknown[] | Record<string, unknown> {
  return Array.isArray(data) || (!!data && typeof data === 'object' && Symbol.iterator in data);
}

function exists(data: object, key: string | number | symbol) {
  return ((data instanceof Collection && data.has(key)) || key in data);
}

// noinspection JSValidateJSDoc
/**
 * Retrieves the value of a property from a given object using a key.
 * If the key is not provided, it returns the target object itself.
 *
 * @param target - The target object to retrieve the value from.
 * @param key - The key in dot notation or path to the property.
 * @param fallback - The fallback value if the property is not found.
 * @return The value of the property or the fallback value.
 *
 * @example
 * ```ts
 * const object = {users: {name: ['Taylor', 'Otwell']}};
 * dataGet(object, 'users.name.0') // 'Taylor'
 * ```
 */
// eslint-disable-next-line sonarjs/cognitive-complexity
export function dataGet(
  target: unknown,
  key?: string | string[] | number,
  fallback?: unknown
): unknown {
  if (!key) {
    return target;
  }

  key = Array.isArray(key) ? key : key.toString().split('.');

  const remaining = [...key];

  for (const segment of key) {
    remaining.shift();

    if (!segment) {
      return target;
    }

    if (segment === '*') {
      if (target instanceof Collection) {
        target = target.all();
      } else if (!isTraversable(target)) {
        return value(fallback);
      }
      const result = [];

      for (const item of Object.values(target as unknown[] | object)) {
        result.push(dataGet(item, [...remaining], fallback));
      }

      return remaining.includes('*') ? result.flat() : result;
    }

    if (isAccessible(target) && exists(target, segment)) {
      if (Array.isArray(target)) {
        target = target[Number.parseInt(segment, 10)];
      }
      target = (target as Record<any, any>)[segment];
    } else {
      return value(fallback);
    }
  }
  return target;
}

/**
 * Sets a value in a nested object or array based on the specified key.
 *
 * @param target - The target object or array.
 * @param key - The key to set the value at using dot notation.
 * @param value - The value to set.
 * @param overwrite - Specifies whether to overwrite an existing value at the key.
 * @returns The modified target object or array.
 *
 * @example
 * ```ts
 * const object = {users: {name: ['Taylor', 'Otwell']}};
 * dataSet(object, 'users.name.0', 'Abigail') // {users: {name: ['Abigail', 'Otwell']}}
 * ```
 */
// eslint-disable-next-line sonarjs/cognitive-complexity
export function dataSet(
  target: unknown,
  key: string | string[] | number,
  // eslint-disable-next-line @typescript-eslint/no-shadow
  value: unknown,
  overwrite: boolean = true
): unknown {
  const segments = Array.isArray(key) ? key : key.toString().split('.');

  const segment = segments.shift() as string;
  if (segment === '*') {
    if (!isAccessible(target)) {
      target = {};
    }

    if (segments.length > 0) {
      for (const [index, item] of Object.entries(target as object)) {
        (target as Record<any, any>)[index] = dataSet(item, [...segments], value, overwrite);
      }
    } else if (overwrite) {
      for (const index of Object.keys(target as object)) {
        (target as Record<any, any>)[index] = value;
      }
    }
  } else if (isAccessible(target)) {
    if (segments.length > 0) {
      if (!exists(target, segment)) {
        (target as Record<any, any>)[segment] = {};
      }

      (target as Record<any, any>)[segment] = dataSet(
        (target as Record<any, any>)[segment],
        [...segments],
        value,
        overwrite
      );
    } else if (overwrite || !exists(target, segment)) {
      if (Array.isArray(target)) {
        target = Object.fromEntries(target.entries());
      }
      (target as Record<any, any>)[segment] = value;
    }
  } else {
    target = {};

    if (segments.length > 0) {
      (target as Record<any, any>)[segment] = dataSet(
        (target as Record<any, any>)[segment],
        [...segments],
        value,
        overwrite
      );
    } else if (overwrite) {
      (target as Record<any, any>)[segment] = value;
    }
  }

  return target;
}

/**
 * Fills the given target object or array with the provided new value at the specified key
 * using dot notation.
 * If the key is not found, the target object or array remains unchanged.
 *
 * @param target - The target object or array to fill.
 * @param key - The key (in dot notation) or path where the new value
 * should be filled.
 * @param newValue - The new value to fill.
 *
 * @return The target object or array after filling with the new value.
 *
 * @example
 * ```ts
 * const object = {users: {name: ['Taylor', 'Otwell']}};
 * dataFill(object, 'users.name.2', 'Abigail') // {users: {name: ['Taylor', 'Otwell', 'Abigail']}}
 * ```
 */
export function dataFill(target: unknown, key: string | string[] | number, newValue: any): unknown {
  return dataSet(target, key, newValue, false);
}

/**
 * Removes a specific key (dot notation) from an object or array.
 *
 * @param target - The object or array to remove the key from.
 * @param key - The key in dot notation or path of the element
 * to remove.
 *
 * @return The modified object or array.
 *
 * @example
 * ```ts
 * const object = {users: {name: ['Taylor', 'Otwell']}};
 * dataForget(object, 'users.name.0') // {users: {name: ['Otwell']}}
 * ```
 */
// eslint-disable-next-line sonarjs/cognitive-complexity
export function dataForget(target: unknown, key: string | string[] | number): unknown {
  let segments = Array.isArray(key) ? key : key.toString().split('.');

  const segment = segments.shift() as string;

  if (segment === '*' && isAccessible(target)) {
    if (segments.length > 0) {
      for (const [index, item] of Object.entries(target as object)) {
        (target as Record<any, any>)[index] = dataForget(item, [...segments]);
      }
    }
  } else if (isAccessible(target)) {
    if (segments.length > 0 && exists(target, segment)) {
      (target as Record<any, any>)[segment] = dataForget(
        (target as Record<any, any>)[segment],
        [...segments]
      );
    } else {
      // Arr:forget
      if (segments.length === 0) {
        segments = [segment];
      }
      // eslint-disable-next-line @typescript-eslint/no-shadow
      for (const segment of segments) {
        if (exists(target as Record<any, any>, segment)) {
          if (Array.isArray(target)) {
            target.splice(Number.parseInt(segment, 10), 1);
          } else {
            delete (target as Record<any, any>)[segment];
          }
          // eslint-disable-next-line no-continue
          continue;
        }
        const parts = segment.split('.');
        while (parts.length > 1) {
          const part = parts.shift()!;
          if (
            (target as Record<any, any>)[part] !== undefined
            && isAccessible((target as Record<any, any>)[part])
          ) {
            target = (target as Record<any, any>)[part];
          }
        }
        const part = parts.shift() as string;
        if (Array.isArray(target)) {
          target.splice(Number.parseInt(part, 10), 1);
        } else {
          delete (target as Record<any, any>)[part];
        }
      }
    }
  }

  return target;
}
