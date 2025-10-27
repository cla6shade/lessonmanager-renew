import { getTimesInPeriod } from '@/utils/date';
import { Flex, Grid, Text } from '@chakra-ui/react';
import { useTable } from '../providers/TableProvider';

export default function TimeColumn() {
  const { openHours } = useTable();
  const times = getTimesInPeriod(openHours);
  return (
    <Grid
      templateRows={`0.5fr repeat(${times.length}, 1fr) 0.5fr`}
      width="88px"
      flexShrink={0}
      height="full"
    >
      <div />
      {times.map((time) => (
        <Flex
          key={`time-key-${time}`}
          alignItems="center"
          justifyContent="center"
          width="full"
          height="full"
        >
          <Text>{time}:00</Text>
        </Flex>
      ))}
    </Grid>
  );
}
