import { VStack, Table, Checkbox, Textarea } from '@chakra-ui/react';
import { Controller, useForm } from 'react-hook-form';

import { useUpdateLessons } from '@/features/users/lessons/useUpdateLessons';
import { formatDate, formatHour } from '@/utils/date';
import { UpdateLessonsRequest } from '@/app/(lessons)/api/lessons/schema';
import { UserLessonsResponse } from '@/app/(users)/api/users/[id]/lessons/schema';
import { useEffect } from 'react';

interface UserLessonsFormProps {
  lessons: UserLessonsResponse['data'];
}

export default function UserLessonsForm({ lessons }: UserLessonsFormProps) {
  const { updateLessons } = useUpdateLessons();

  const defaultLessons: UpdateLessonsRequest['lessons'] = lessons.map((lesson) => ({
    id: lesson.id,
    isDone: lesson.isDone,
    note: lesson.note ?? '',
  }));

  const { control, handleSubmit, register, reset } = useForm<UpdateLessonsRequest>({
    defaultValues: { lessons: defaultLessons },
  });

  useEffect(() => {
    reset({ lessons: defaultLessons });
  }, [lessons, reset]);

  const onSubmit = async (data: UpdateLessonsRequest) => {
    await updateLessons(data);
  };

  return (
    <form id="lessons-form" onSubmit={handleSubmit(onSubmit)}>
      <VStack gap={4} align="stretch">
        <Table.Root variant="line" size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>상태</Table.ColumnHeader>
              <Table.ColumnHeader>날짜</Table.ColumnHeader>
              <Table.ColumnHeader>시간</Table.ColumnHeader>
              <Table.ColumnHeader>담당 선생님</Table.ColumnHeader>
              <Table.ColumnHeader>위치</Table.ColumnHeader>
              <Table.ColumnHeader>분류</Table.ColumnHeader>
              <Table.ColumnHeader>메모</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {lessons.map((lesson, index) => (
              <Table.Row key={lesson.id}>
                <Table.Cell>
                  <Controller
                    control={control}
                    name={`lessons.${index}.isDone`}
                    render={({ field: { onChange, value } }) => (
                      <Checkbox.Root
                        checked={value}
                        onCheckedChange={(details) => onChange(!!details.checked)}
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control>
                          <Checkbox.Indicator />
                        </Checkbox.Control>
                      </Checkbox.Root>
                    )}
                  />
                  <input type="hidden" {...register(`lessons.${index}.id`)} value={lesson.id} />
                </Table.Cell>
                <Table.Cell>{formatDate(new Date(lesson.dueDate))}</Table.Cell>
                <Table.Cell>{formatHour(lesson.dueHour)}</Table.Cell>
                <Table.Cell>
                  {lesson.teacher.major.symbol} {lesson.teacher.name}
                </Table.Cell>
                <Table.Cell>{lesson.location.name}</Table.Cell>
                <Table.Cell>{lesson.isGrand ? '그랜드 레슨' : '일반 레슨'}</Table.Cell>
                <Table.Cell>
                  <Textarea
                    {...register(`lessons.${index}.note`)}
                    placeholder="레슨 노트를 입력하세요"
                    size="sm"
                    minH="80px"
                    minW="200px"
                    resize="vertical"
                  />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </VStack>
    </form>
  );
}
