function allCodeTags(root, args, context, info) {
  return context.db.query.codeTags({}, info)
}

async function codeSearch(parent, args, context, info) {
  // user supplied search string
  const searchString = args.search.toLowerCase()
  // func to filter our list by full text search on the name field
  function find(items, text) {
    text = text.split(" ")
    return items.filter(function(item) {
      // return text.every(function(el) {
      //   return item.name.toLowerCase().indexOf(el) > -1
      // })
      return text.every(function(el) {
        // 1. name is smallest so try it first per item
        if (item.name.toLowerCase().indexOf(el) > -1) return true
        // 2. try the content which could be large
        if (item.content.toLowerCase().indexOf(el) > -1) return true
        // if its not in these then return false
        return false
      })
    })
  }
  // not ideal but get all of the questions returned to the server
  const allItems = await context.db.query.codeSnippets({}, info)
  // filter by our search function
  const searchedItems = find(allItems, searchString)
  // send filtered list to the client
  return searchedItems
}

module.exports = {
  allCodeTags,
  codeSearch,
}
