'use client';

import { Select, createListCollection, Portal } from '@chakra-ui/react';
import { UserSearchFilter } from '@/app/(users)/api/users/schema';
import { useFilter } from './FilterProvider';

const filterOptions = [
  { label: '전체', value: 'ALL' as UserSearchFilter },
  { label: '활성 사용자', value: 'ACTIVE' as UserSearchFilter },
  { label: '수업 1일 전', value: 'ONE_DAY_BEFORE_LESSON' as UserSearchFilter },
  {
    label: '재등록 1주일 전',
    value: 'ONE_WEEK_BEFORE_REREGISTER' as UserSearchFilter,
  },
  { label: '생일', value: 'BIRTHDAY' as UserSearchFilter },
  { label: '시작일 미설정', value: 'STARTDATE_NON_SET' as UserSearchFilter },
  { label: '6개월 이상', value: 'MORE_THAN_6_MONTHS' as UserSearchFilter },
];

export default function FilterSelector() {
  const { currentFilter, setCurrentFilter } = useFilter();
  const filterCollection = createListCollection({
    items: filterOptions.map((option) => ({
      label: option.label,
      value: option.value,
    })),
  });

  const selectedOption = filterOptions.find((option) => option.value === currentFilter);

  return (
    <Select.Root
      collection={filterCollection}
      size="md"
      value={[currentFilter]}
      onValueChange={(details) => {
        const selectedValue = details.value[0] as UserSearchFilter;
        setCurrentFilter(selectedValue);
      }}
      width="200px"
    >
      <Select.Trigger>
        <Select.ValueText placeholder="필터 선택">{selectedOption?.label}</Select.ValueText>
      </Select.Trigger>
      <Portal>
        <Select.Positioner>
          <Select.Content>
            {filterCollection.items.map((item) => (
              <Select.Item key={item.value} item={item}>
                {item.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  );
}
