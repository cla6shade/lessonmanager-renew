import { Flex } from "@chakra-ui/react";
import TooltipSection from "./TooltipSection";
import LessonGridBody from "./grid/LessonGridBody";

export default function LessonTable() {
  return (
    <Flex flexGrow={1}>
      <Flex width="100%" height="100%" direction="column">
        <TooltipSection />
        <Flex
          borderTop="4px solid"
          borderBottom="1px solid"
          borderBottomColor="gray.400"
          borderTopColor="gray.200"
          width="100%"
          height="100%"
          direction="column"
        >
          <LessonGridBody />
        </Flex>
      </Flex>
    </Flex>
  );
}
