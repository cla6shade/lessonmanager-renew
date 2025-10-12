import { logoutAction } from "@/app/(auth)/login/loginAction";
import { Box, Button, Text } from "@chakra-ui/react";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NavbarFooter() {
  const [state, formAction] = useActionState(logoutAction, {
    success: false,
  });
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      router.push("/login");
    }
  }, [state, router]);
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
