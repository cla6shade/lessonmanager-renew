import { Badge } from '@chakra-ui/react';

interface StatusBadgeProps {
  isDone: boolean;
}

export default function StatusBadge({ isDone }: StatusBadgeProps) {
  if (isDone) {
    return <Badge colorScheme="green">완료</Badge>;
  }
  return <Badge colorScheme="blue">예정</Badge>;
}
