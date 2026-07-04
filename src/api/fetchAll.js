import api from './axios'

// Follow DRF's paginated `next` links and return all results flattened.
// `next` is an absolute URL; axios ignores baseURL when given an absolute URL.
export const fetchAllResults = async (path, config = {}) => {
  const all = []
  let url = path
  let first = true
  while (url) {
    const { data } = await api.get(url, first ? config : {})
    all.push(...data.results)
    url = data.next
    first = false
  }
  return all
}
