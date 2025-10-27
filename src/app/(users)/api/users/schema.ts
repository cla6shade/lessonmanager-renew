import { z } from 'zod';
import { DataResponseSchema, PaginatedDataResponseSchema } from '@/app/schema';

import {
  LocationSchema,
  TeacherSchema,
  LessonSchema,
  PaymentSchema,
  UserSchema,
  MajorSchema,
} from '@/generated/zod';
import { toKstDate } from '@/utils/date';

export const PublicUserSchema = UserSchema.omit({
  password: true,
});

export const SingleUserResponseSchema = DataResponseSchema(PublicUserSchema);

export type SingleUserResponse = z.infer<typeof SingleUserResponseSchema>;

export const UserSearchFilterSchema = z.enum([
  'ALL',
  'ACTIVE',
  'ONE_DAY_BEFORE_LESSON',
  'ONE_WEEK_BEFORE_REREGISTER',
  'BIRTHDAY',
  'STARTDATE_NON_SET',
  'MORE_THAN_6_MONTHS',
]);

export type UserSearchFilter = z.infer<typeof UserSearchFilterSchema>;

export const UserSearchRequestSchema = z.object({
  name: z.string().optional(),
  contact: z.string().optional(),
  locationId: z.coerce.number().optional(),
  filter: UserSearchFilterSchema.default('ALL'),
  birthDate: z.iso
    .datetime()
    .transform((val) => (val ? toKstDate(val) : undefined))
    .optional(),
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  lookup: z
    .transform((val) => val === 'true')
    .pipe(z.boolean())
    .optional(),
});

export type UserSearchRequest = z.infer<typeof UserSearchRequestSchema>;

export const UserSearchResultSchema = {
  Base: PublicUserSchema.extend({
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
  }),
  Lookup: PublicUserSchema.pick({
    id: true,
    name: true,
    contact: true,
  }),
};

export type UserSearchResult = z.infer<typeof UserSearchResultSchema.Base>;
export type UserLookupResult = z.infer<typeof UserSearchResultSchema.Lookup>;

export const UserSearchResponseSchema = PaginatedDataResponseSchema(
  UserSearchResultSchema.Base.array(),
);

export type UserSearchResponse = z.infer<typeof UserSearchResponseSchema>;

export const CreateUserRequestSchema = z
  .object({
    locationId: z.number().min(1),
    name: z.string().min(1),
    birth: z.iso.datetime().transform((val) => (val ? toKstDate(val) : undefined)),
    gender: z.boolean(),
    contact: z.string().min(1),
    loginId: z.string().min(1),
    password: z.string().min(1).min(8),
    passwordConfirm: z.string().min(1),
    email: z.email().min(1),
    ability: z.string().optional(),
    genre: z.string().optional(),
    howto: z.number(),
    address: z.string().min(1),
  })
  .strict();

export const CreateUserResponseSchema = DataResponseSchema(
  UserSchema.pick({
    id: true,
  }),
);

export type CreateUserResponse = z.infer<typeof CreateUserResponseSchema>;
