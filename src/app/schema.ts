import z from 'zod';

export const DataResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    data: dataSchema,
  });

export const PaginatedDataResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  DataResponseSchema(dataSchema).extend({
    total: z.number(),
    totalPages: z.number(),
  });

export type DataResponse<T extends z.ZodType> = z.infer<typeof DataResponseSchema<T>>;

export type PaginatedDataResponse<T extends z.ZodType> = z.infer<
  typeof PaginatedDataResponseSchema<T>
>;
