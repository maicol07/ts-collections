<div align="center">
    <h2>TS Collections</h2>
    Collections for array and objects data. Heavily faithful to Laravel implementation.
</div>

## Why?
I love Laravel Collections and I wanted to use them in my TS projects.
I tried to find a library that implements them with a good support for JS objects, but I couldn't find any that satisfied my needs, so I decided to create my own.

## Differences between Laravel Collections and TS Collections

There are some little differences between Laravel Collections and TS Collections due to how JS/TS works:

- All names are camelCase (following JS coding standards)

### Differences between `ts-collections` and Laravel Collections
- There are some new methods:
  - `entries`
  - `toObject`
  - `toMap`
  - `isArray` (protected)
- Currently, lazy collections aren't implemented.
- Currently, macros aren't implemented.
- Currently, higher order messages aren't implemented.
- Due to the difference above, you can't use the following Laravel methods on your Collection:
  - `chunkWhile`
  - `countBy`

## Development Status
Planned releases here:
https://github.com/users/maicol07/projects/4/views/1

* [x] all
* [x] average
* [x] avg
* [ ] chunk
* [ ] chunkWhile
* [x] collapse
* [x] collect
* [x] combine
* [x] concat
* [x] contains
* [x] containsOneItem
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
* [x] last
* [ ] lazy
* [ ] macro
* [x] make
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
* [x] push
* [x] put
* [ ] random
* [x] range
* [x] reduce
* [ ] reduceSpread
* [ ] reject
* [ ] replace
* [ ] replaceRecursive
* [x] reverse
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
* [x] toArray
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
