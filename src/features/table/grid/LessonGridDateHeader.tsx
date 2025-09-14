import { formatDate, getDatesInPeriod } from "@/utils/date";
import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { useTable } from "./providers/TableProvider";

export default function LessonGridDateHeader() {
  const { datePeriod } = useTable();
  const dates = getDatesInPeriod(datePeriod);
  return (
    <Grid
      templateColumns="88px repeat(7, 1fr)"
      gap={0}
      width="full"
      height="52px"
    >
      <Box />
      {dates.map((date) => (
        <Flex
          alignItems="center"
          justifyContent="center"
          key={`date-key-${date.toISOString()}`}
          borderLeft="1px solid"
          borderBottom="1px solid"
          borderColor="gray.200"
        >
          <Text>{formatDate(date, false, true)}</Text>
        </Flex>
      ))}
    </Grid>
  );
}
