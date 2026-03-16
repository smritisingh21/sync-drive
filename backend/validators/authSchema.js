import {z} from "zod/v4"

export const loginSchema = z.object({
    email : z.email("Please enter a valid email"),
    password : z.string()
})
export const registerSchema = loginSchema.extend({
    name : z.string().min(3).max(100),
})