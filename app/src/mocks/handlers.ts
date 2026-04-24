import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/categories', () => {
    return HttpResponse.json([])
  }),
]
