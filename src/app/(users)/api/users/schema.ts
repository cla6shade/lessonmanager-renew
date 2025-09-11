import { z } from "zod";
import { DataResponseSchema, PublicUserSchema } from "../../../schema";

export const SingleUserResponseSchema = DataResponseSchema(PublicUserSchema);

export type SingleUserResponse = z.infer<typeof SingleUserResponseSchema>;
