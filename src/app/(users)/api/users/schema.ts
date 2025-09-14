import { z } from "zod";
import {
  DataResponseSchema,
  PaginatedDataResponseSchema,
  PublicUserSchema,
} from "@/app/schema";

export const SingleUserResponseSchema = DataResponseSchema(PublicUserSchema);

export type SingleUserResponse = z.infer<typeof SingleUserResponseSchema>;

export const UserSearchRequestSchema = z.object({
  name: z.string().optional(),
  contact: z.string().optional(),
  locationId: z.coerce.number().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type UserSearchRequest = z.infer<typeof UserSearchRequestSchema>;

export const UserSearchResponseSchema = PaginatedDataResponseSchema(
  z.array(PublicUserSchema)
);

export type UserSearchResponse = z.infer<typeof UserSearchResponseSchema>;
