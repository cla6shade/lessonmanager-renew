'use client';

import LoginBanner from '@/features/login/LoginBanner';
import LoginForm from '@/features/login/LoginForm';
import LoginFormCard from '@/features/login/LoginFormCard';
import { LoginProvider } from '@/features/login/LoginProvider';
import { Box } from '@chakra-ui/react';
import styled from '@emotion/styled';

export default function LoginPage() {
  return (
    <LoginProvider>
      <LoginPageContainer>
        <LoginFormCard>
          <LoginBanner />
          <LoginForm />
        </LoginFormCard>
      </LoginPageContainer>
    </LoginProvider>
  );
}
const LoginPageContainer = styled(Box)`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100dvw;
  height: 100dvh;
`;
