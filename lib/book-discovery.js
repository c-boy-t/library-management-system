export function buildBooksPageHref({ search, category } = {}) {
  const params = new URLSearchParams()
  const normalizedSearch = search?.trim()
  const normalizedCategory = category?.trim()

  if (normalizedSearch) {
    params.set("search", normalizedSearch)
  }

  if (normalizedCategory) {
    params.set("category", normalizedCategory)
  }

  const query = params.toString()
  return query ? `/books?${query}` : "/books"
}

export function readBooksPageState(searchParams) {
  return {
    search: searchParams.get("search")?.trim() ?? "",
    category: searchParams.get("category")?.trim() ?? "",
  }
}
