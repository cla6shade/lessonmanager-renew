import { DataResponseSchema } from "@/app/schema";
import z from "zod";
import { PublicUserSchema } from "../schema";

export const UserLookupRequestSchema = z.object({
  query: z.string(),
});

export type UserLookupRequest = z.infer<typeof UserLookupRequestSchema>;

export const UserLookupResponseSchema = DataResponseSchema(
  PublicUserSchema.pick({
    id: true,
    name: true,
    contact: true,
  }).array()
);

export type UserLookupResponse = z.infer<typeof UserLookupResponseSchema>;
