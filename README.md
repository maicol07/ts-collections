<div align="center">
    <h2>TS Collections</h2>
    Collections for array and objects data. Heavily faithful to Laravel implementation.
</div>

## Why?

## Differences between Laravel Collections and TS Collections
There are some little differences between Laravel Collections and TS Collections due to how JS/TS works:
- All names are camelCase (following JS coding standards)
### Helpers
- When you use a fallback value and the value you are trying to get is undefined, you will get the fallback value.
  Example:
  ```ts
  const data = {
    name: 'John Doe',
    age: undefined,
    address: {
      city: 'New York',
      country: 'USA'
    }
  }

  dataGet(data, 'age', 'fallback')
  // => 'fallback'
  ```
  The same applies to all the Collection methods that use this helper.
### Collections
- There are some new methods:
  - `entries`
  - `isArray`
- Currently, lazy collections aren't implemented.
- Due to the difference above, you can't use the following Laravel methods on your Collection:
  - `chunkWhile`
  - `countBy`
- There are some changes inn the API of these methods:
  - `contains`: Instead of Laravel approach, this method will accept only one argument (`item`) that can be one of these values:
    - The item to test for
    - A function that will be called for each item in the collection and return true if the item matches
    - An entry (key-value pair) of the item to search in the collection
- The following methods have not been implemented since they are already implemented in other methods or are natively supported by JS/TS:
  - `containsStrict` (since `contains` already does strict checks, following JS best practices)
- The following methods have not been yet implemented and are currently missing (PRs are welcome 😊):
  - `crossJoin` ([Laravel docs](https://laravel.com/docs/9.x/collections#method-crossjoin) - [Source](https://github.com/laravel/framework/blob/76a7b3cc7942eda2841518ca7877a5e009570b22/src/Illuminate/Collections/Collection.php#L198))

## Credits
- [Laravel](https://laravel.com/)