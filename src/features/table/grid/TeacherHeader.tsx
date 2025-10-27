import { ExtendedTeacher } from '../types';
import { Grid, Flex, Box, Text } from '@chakra-ui/react';

interface TeacherHeaderProps {
  workingTeachers: ExtendedTeacher[];
}

export default function TeacherHeader({ workingTeachers }: TeacherHeaderProps) {
  if (workingTeachers.length === 0) {
    return (
      <Grid templateColumns="1fr" height="36px">
        <Box borderBottom="1px solid" borderBottomColor="gray.200" />
      </Grid>
    );
  }

  return (
    <Grid templateColumns={`repeat(${workingTeachers.length}, 1fr)`} height="36px">
      {workingTeachers.map((teacher) => (
        <Flex
          key={`teacher-header-${teacher.id}`}
          alignItems="center"
          justifyContent="center"
          borderBottom="1px solid"
          borderBottomColor="gray.200"
        >
          <Text fontSize="sm" fontWeight="medium">
            {teacher.major?.symbol}
            {teacher.name}
          </Text>
        </Flex>
      ))}
    </Grid>
  );
}
