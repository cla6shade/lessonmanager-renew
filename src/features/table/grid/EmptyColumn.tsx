import { Grid, Box } from "@chakra-ui/react";

interface EmptyColumnProps {
  allTimes: number[];
  date: Date;
}

export default function EmptyColumn({ allTimes, date }: EmptyColumnProps) {
  return (
    <Grid
      templateRows={`repeat(${allTimes.length}, 1fr)`}
      w="full"
      h="full"
      backgroundColor="gray.50"
    >
      {allTimes.map((hour, hourIndex) => (
        <Box
          key={`empty-${date.toDateString()}-${hour}`}
          borderBottom="1px solid"
          borderBottomColor={
            hourIndex < allTimes.length - 1 ? "gray.200" : "transparent"
          }
        />
      ))}
    </Grid>
  );
}
