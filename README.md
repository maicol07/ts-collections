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

## WIP Status
* [x] all
* [x] average
* [x] avg
* [ ] chunk
* [ ] chunkWhile
* [x] collapse
* [x] collect
* [x] combine
* [x] concat
* [-] contains
* [ ] containsOneItem
* [x] containsStrict
* [x] count
* [ ] countBy
* [ ] crossJoin
* [x] dd
* [x] diff
* [x] diffAssoc
* [ ] diffAssocUsing
* [x] diffKeys
* [x] doesntContain
* [ ] dot
* [x] dump
* [ ] duplicates
* [ ] duplicatesStrict
* [x] each
* [ ] eachSpread
* [ ] ensure
* [x] every
* [ ] except
* [x] filter
* [x] first
* [ ] firstOrFail
* [ ] firstWhere
* [ ] flatMap
* [x] flatten
* [ ] flip
* [ ] forget
* [ ] forPage
* [x] get
* [ ] groupBy
* [x] has
* [ ] hasAny
* [ ] implode
* [ ] intersect
* [ ] intersectAssoc
* [ ] intersectByKeys
* [ ] isEmpty
* [ ] isNotEmpty
* [ ] join
* [ ] keyBy
* [x] keys
* [ ] last
* [ ] lazy
* [ ] macro
* [ ] make
* [x] map
* [ ] mapInto
* [ ] mapSpread
* [ ] mapToGroups
* [ ] mapWithKeys
* [ ] max
* [x] median
* [ ] merge
* [ ] mergeRecursive
* [ ] min
* [x] mode
* [ ] nth
* [ ] only
* [ ] pad
* [ ] partition
* [ ] percentage
* [ ] pipe
* [ ] pipeInto
* [ ] pipeThrough
* [x] pluck
* [ ] pop
* [ ] prepend
* [ ] pull
* [ ] push
* [x] put
* [ ] random
* [x] range
* [x] reduce
* [ ] reduceSpread
* [ ] reject
* [ ] replace
* [ ] replaceRecursive
* [ ] reverse
* [ ] search
* [ ] shift
* [ ] shuffle
* [ ] skip
* [ ] skipUntil
* [ ] skipWhile
* [ ] slice
* [ ] sliding
* [ ] sole
* [ ] some
* [x] sort
* [ ] sortBy
* [ ] sortByDesc
* [ ] sortDesc
* [ ] sortKeys
* [ ] sortKeysDesc
* [ ] sortKeysUsing
* [ ] splice
* [ ] split
* [ ] splitIn
* [x] sum
* [ ] take
* [ ] takeUntil
* [ ] takeWhile
* [ ] tap
* [ ] times
* [ ] toArray
* [ ] toJson
* [ ] transform
* [ ] undot
* [ ] union
* [ ] unique
* [ ] uniqueStrict
* [ ] unless
* [ ] unlessEmpty
* [ ] unlessNotEmpty
* [ ] unwrap
* [ ] value
* [x] values
* [ ] when
* [ ] whenEmpty
* [ ] whenNotEmpty
* [ ] where
* [ ] whereStrict
* [ ] whereBetween
* [ ] whereIn
* [ ] whereInStrict
* [ ] whereInstanceOf
* [ ] whereNotBetween
* [ ] whereNotIn
* [ ] whereNotInStrict
* [ ] whereNotNull
* [ ] whereNull
* [ ] wrap
* [ ] zip

## Credits

- [Laravel](https://laravel.com/)
