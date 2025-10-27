import { logoutAction } from "@/app/(auth)/login/loginAction";
import { Box, Button, Text } from "@chakra-ui/react";
import { useActionState, useEffect } from 'react';

export default function NavbarFooter() {
  const [state, formAction] = useActionState(logoutAction, {
    success: false,
  });

  useEffect(() => {
    if (state.success) {
      location.href = '/login';
    }
  }, [state]);
  return (
    <Box>
      <form action={formAction}>
        <Button variant="solid" bg="transparent" type="submit">
          <Text textDecoration="underline">로그아웃</Text>
        </Button>
      </form>
    </Box>
  );
}
