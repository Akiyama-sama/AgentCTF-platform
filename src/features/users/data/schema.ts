import { z } from 'zod'

// 用户状态的 Schema 定义，与后端 is_active 字段对应
export const userStatusSchema = z.boolean().transform(val => (val ? 'active' : 'inactive'))
export const userStatusReverseSchema = z.enum(['active', 'inactive']).transform(val => val === 'active')

// 用户状态类型推断
export type UserStatus = z.infer<typeof userStatusSchema>

// 用户角色 Schema 定义
export const roleSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
})
export type Role = z.infer<typeof roleSchema>

// 核心用户 Schema，字段与 UserOut 保持一致
export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  is_active: z.boolean(),
  created_time: z.coerce.date(),
  roles: z.array(roleSchema).optional().nullable(),
})
export type User = z.infer<typeof userSchema>

// 用户列表的 Schema
export const userListSchema = z.array(userSchema)
