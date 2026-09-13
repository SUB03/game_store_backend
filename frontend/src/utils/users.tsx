import { queryOptions } from "@tanstack/react-query"
import { api } from "./api"

export type User = {
  username: string
}

export const API = "http://localhost:8000"

export const usersQueryOptions = () =>
  queryOptions({
    queryKey: ['user'],
    queryFn: async () =>{
      try {
        const { data } = await api.get<User>('/users/me')
        return data
      } catch (err: any) {
        if (err?.status === 401) return null
        throw err
      }
    },
  })