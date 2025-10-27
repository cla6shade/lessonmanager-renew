import z from 'zod';

export const LoginSchema = z.object({
  loginId: z.string().min(1, { message: '올바른 아이디를 입력해주세요.' }),
  password: z.string().min(1, { message: '올바른 비밀번호를 입력해주세요.' }),
  isAdmin: z.preprocess((val) => val === 'true', z.boolean()),
});
