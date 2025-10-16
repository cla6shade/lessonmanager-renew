import { z } from "zod";
import { DataResponseSchema, PaginatedDataResponseSchema } from "@/app/schema";

import {
  LocationSchema,
  TeacherSchema,
  LessonSchema,
  PaymentSchema,
  UserSchema,
  MajorSchema,
} from "@/generated/zod";
import { Prisma } from "@/generated/prisma";
import { toKstDate } from "@/utils/date";

export const PublicUserSchema = UserSchema.omit({
  password: true,
});

export const SingleUserResponseSchema = DataResponseSchema(PublicUserSchema);

export type SingleUserResponse = z.infer<typeof SingleUserResponseSchema>;

export const UserSearchFilterSchema = z.enum([
  "ALL",
  "ACTIVE",
  "ONE_DAY_BEFORE_LESSON",
  "ONE_WEEK_BEFORE_REREGISTER",
  "BIRTHDAY",
  "STARTDATE_NON_SET",
  "MORE_THAN_6_MONTHS",
]);

export type UserSearchFilter = z.infer<typeof UserSearchFilterSchema>;

export const UserSearchRequestSchema = z.object({
  name: z.string().optional(),
  contact: z.string().optional(),
  locationId: z.coerce.number().optional(),
  filter: UserSearchFilterSchema.default("ALL"),
  birthDate: z.iso
    .datetime()
    .transform((val) => (val ? toKstDate(val) : undefined))
    .optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type UserSearchRequest = z.infer<typeof UserSearchRequestSchema>;

export type UserSearchSelectInput = {
  include: {
    location: true;
    teacherInCharge: {
      select: {
        id: true;
        name: true;
        major: true;
        location: true;
      };
    };
    latestLesson: true;
    payments: Prisma.PaymentFindManyArgs;
  };
  skip: number;
  take: number;
  omit: { password: true };
  orderBy: Prisma.UserFindManyArgs["orderBy"];
};
export type RawUserSearchResult = Prisma.UserGetPayload<UserSearchSelectInput>;

export const UserSearchResultSchema = UserSchema.omit({
  password: true,
}).extend({
  location: LocationSchema,
  teacherInCharge: TeacherSchema.pick({
    id: true,
    name: true,
    major: true,
    location: true,
  })
    .extend({
      major: MajorSchema,
    })
    .nullable(),
  latestLesson: LessonSchema.nullable(),
  payments: z.array(PaymentSchema),
});
export type UserSearchResult = z.infer<typeof UserSearchResultSchema>;

export const UserSearchResponseSchema = PaginatedDataResponseSchema(
  z.array(UserSearchResultSchema)
);

export type UserSearchResponse = z.infer<typeof UserSearchResponseSchema>;

export const CreateUserRequestSchema = UserSchema.pick({
  locationId: true,
  name: true,
  gender: true,
  birth: true,
  contact: true,
  loginId: true,
  password: true,
  email: true,
  ability: true,
  genre: true,
  howto: true,
  address: true,
}).extend({
  passwordConfirm: z.string(),
  birth: z.iso
    .datetime()
    .transform((val) => (val ? toKstDate(val) : undefined)),
});

export const CreateUserResponseSchema = DataResponseSchema(
  UserSchema.pick({
    id: true,
  })
);

export type CreateUserResponse = z.infer<typeof CreateUserResponseSchema>;
