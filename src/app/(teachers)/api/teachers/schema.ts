import { z } from "zod";
import { DataResponseSchema, PaginatedDataResponseSchema } from "@/app/schema";

import { LocationSchema, TeacherSchema, MajorSchema } from "@/generated/zod";
import { Prisma } from "@/generated/prisma";
import { toKstDate } from "@/utils/date";

export const SingleTeacherResponseSchema = DataResponseSchema(
  TeacherSchema.omit({
    password: true,
  })
);

export type SingleTeacherResponse = z.infer<typeof SingleTeacherResponseSchema>;

export const TeacherSearchRequestSchema = z.object({
  startDate: z.iso
    .datetime()
    .optional()
    .transform((value) => (value ? toKstDate(value) : undefined)),
  endDate: z.iso
    .datetime()
    .optional()
    .transform((value) => (value ? toKstDate(value) : undefined)),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type TeacherSearchRequest = z.infer<typeof TeacherSearchRequestSchema>;

export type TeacherSearchSelectInput = {
  include: {
    location: true;
    major: true;
  };
  skip: number;
  take: number;
  omit: { password: true };
  orderBy: Prisma.TeacherFindManyArgs["orderBy"];
};

export type RawTeacherSearchResult =
  Prisma.TeacherGetPayload<TeacherSearchSelectInput>;

export const RawSearchTeacherResultSchema = TeacherSchema.omit({
  password: true,
}).extend({
  location: LocationSchema,
  major: MajorSchema,
});

export const TeacherSearchResultSchema = TeacherSchema.omit({
  password: true,
}).extend({
  location: LocationSchema,
  major: MajorSchema,
  reregisterFraction: z.tuple([z.number(), z.number()]),
  lessonCompletionFraction: z.tuple([z.number(), z.number()]),
});

export type TeacherSearchResult = z.infer<typeof TeacherSearchResultSchema>;

export const TeacherSearchResponseSchema = PaginatedDataResponseSchema(
  z.array(TeacherSearchResultSchema)
);

export type TeacherSearchResponse = z.infer<typeof TeacherSearchResponseSchema>;

export const CreateTeacherRequestSchema = TeacherSchema.pick({
  locationId: true,
  name: true,
  gender: true,
  birth: true,
  contact: true,
  loginId: true,
  password: true,
  email: true,
  majorId: true,
  address: true,
  isManager: true,
  workingDays: true,
})
  .extend({
    passwordConfirm: z.string(),
    birth: z.iso
      .datetime()
      .transform((val) => (val ? toKstDate(val) : undefined))
      .optional(),
  })
  .strict();

export type CreateTeacherRequest = z.infer<typeof CreateTeacherRequestSchema>;

export const CreateTeacherResponseSchema = DataResponseSchema(
  TeacherSchema.pick({
    id: true,
  })
);

export type CreateTeacherResponse = z.infer<typeof CreateTeacherResponseSchema>;

export const UpdateTeacherRequestSchema = TeacherSchema.pick({
  locationId: true,
  name: true,
  gender: true,
  birth: true,
  contact: true,
  email: true,
  majorId: true,
  address: true,
  isManager: true,
  workingDays: true,
  isLeaved: true,
})
  .extend({
    birth: z.iso
      .datetime()
      .transform((val) => (val ? toKstDate(val) : undefined))
      .optional(),
  })
  .partial()
  .strict();

export type UpdateTeacherRequest = z.infer<typeof UpdateTeacherRequestSchema>;

export const UpdateTeacherResponseSchema = DataResponseSchema(
  RawSearchTeacherResultSchema
);

export type UpdateTeacherResponse = z.infer<typeof UpdateTeacherResponseSchema>;

export const RemoveTeacherResponseSchema = DataResponseSchema(
  RawSearchTeacherResultSchema.omit({
    location: true,
    major: true,
  })
);

export type RemoveTeacherResponse = z.infer<typeof RemoveTeacherResponseSchema>;
