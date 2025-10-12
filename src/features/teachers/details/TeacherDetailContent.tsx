import {
  Text,
  VStack,
  HStack,
  Separator,
  Button,
  Alert,
  useDisclosure,
} from "@chakra-ui/react";
import { useState, useCallback } from "react";
import { CenteredSpinner } from "@/components/Spinner";
import { formatDate } from "@/utils/date";
import { useUpdateTeacher } from "./useUpdateTeacher";
import { TeacherSearchResult } from "@/app/(teachers)/api/teachers/schema";
import { useNavigation } from "@/features/navigation/location/NavigationContext";
import TeacherEditForm from "@/features/teachers/details/TeacherEditForm";

interface TeacherDetailContentProps {
  teacher: TeacherSearchResult;
  loading: boolean;
  error: string | null;
  onTeacherUpdate: (updatedTeacher: TeacherSearchResult) => void;
  refetchTeachers: () => void;
  onClose: () => void;
}

export default function TeacherDetailContent({
  teacher,
  loading,
  onTeacherUpdate,
  refetchTeachers,
  onClose: onParentClose,
}: TeacherDetailContentProps) {
  const [isEditMode, setIsEditMode] = useState(false);

  const { deleteTeacher } = useUpdateTeacher();
  const { locations, majors } = useNavigation();
  const {
    open: isAlertOpen,
    onOpen: onAlertOpen,
    onClose: onCloseAlert,
  } = useDisclosure();

  const formatText = (text: string | null | undefined) => {
    if (!text || text.trim() === "") return "(없음)";
    return text;
  };

  const handleCancel = () => {
    setIsEditMode(false);
  };

  const handleDelete = useCallback(async () => {
    if (!teacher) return;

    const { success, data: updatedTeacher } = await deleteTeacher(teacher.id, {
      successMessage: "선생님 퇴사 처리가 완료되었습니다.",
    });

    if (success) {
      refetchTeachers();
      onCloseAlert();
      onParentClose();
    }
  }, [teacher, deleteTeacher, refetchTeachers, onCloseAlert, onParentClose]);

  if (loading) {
    return <CenteredSpinner size="lg" minHeight="400px" />;
  }

  return (
    <VStack gap={4} align="stretch">
      {!isEditMode ? (
        <>
          <HStack justify="space-between">
            <Text fontWeight="bold">ID:</Text>
            <Text>{teacher.id}</Text>
          </HStack>

          <Separator />

          <HStack justify="space-between">
            <Text fontWeight="bold">이름:</Text>
            <Text>{formatText(teacher.name)}</Text>
          </HStack>

          <HStack justify="space-between">
            <Text fontWeight="bold">생년월일:</Text>
            <Text>
              {teacher.birth
                ? formatDate(new Date(teacher.birth), true, true)
                : "(없음)"}
            </Text>
          </HStack>

          <HStack justify="space-between">
            <Text fontWeight="bold">성별:</Text>
            <Text>{teacher.gender ? "여성" : "남성"}</Text>
          </HStack>

          <HStack justify="space-between">
            <Text fontWeight="bold">연락처:</Text>
            <Text>{formatText(teacher.contact)}</Text>
          </HStack>

          <HStack justify="space-between">
            <Text fontWeight="bold">주소:</Text>
            <Text>{formatText(teacher.address)}</Text>
          </HStack>

          <HStack justify="space-between">
            <Text fontWeight="bold">이메일:</Text>
            <Text>{formatText(teacher.email)}</Text>
          </HStack>

          <HStack justify="space-between">
            <Text fontWeight="bold">전공:</Text>
            <Text>
              {teacher.major
                ? `${teacher.major.symbol} ${teacher.major.name}`
                : "(없음)"}
            </Text>
          </HStack>

          <HStack justify="space-between">
            <Text fontWeight="bold">지점:</Text>
            <Text>{teacher.location?.name || "(없음)"}</Text>
          </HStack>

          <HStack justify="space-between">
            <Text fontWeight="bold">관리자:</Text>
            <Text>{teacher.isManager ? "예" : "아니오"}</Text>
          </HStack>

          <HStack justify="space-between">
            <Text fontWeight="bold">근무일수:</Text>
            <Text>
              {teacher.workingDays ? `${teacher.workingDays}일` : "(없음)"}
            </Text>
          </HStack>

          <HStack justify="space-between">
            <Text fontWeight="bold">퇴사 상태:</Text>
            <Text color={teacher.isLeaved ? "red.500" : "green.500"}>
              {teacher.isLeaved ? "퇴사" : "재직"}
            </Text>
          </HStack>

          <HStack justify="space-between">
            <Text fontWeight="bold">등록일:</Text>
            <Text>
              {teacher.registeredAt
                ? formatDate(new Date(teacher.registeredAt), true, true)
                : "(없음)"}
            </Text>
          </HStack>

          <Separator />
          <HStack gap={2} justify="stretch">
            <Button
              onClick={() => setIsEditMode(true)}
              colorPalette="brand"
              flex={1}
            >
              수정하기
            </Button>
            <Button
              onClick={onAlertOpen}
              colorPalette="red"
              variant="outline"
              flex={1}
              disabled={!!teacher.isLeaved}
            >
              퇴사 처리
            </Button>
          </HStack>
        </>
      ) : (
        <TeacherEditForm
          teacher={teacher}
          locations={locations}
          majors={majors}
          onTeacherUpdate={onTeacherUpdate}
          refetchTeachers={refetchTeachers}
          onCancel={handleCancel}
        />
      )}

      {isAlertOpen && (
        <Alert.Root status="warning" variant="outline">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>선생님 퇴사 처리</Alert.Title>
            <Alert.Description>
              정말로 이 선생님을 퇴사 처리하시겠습니까? 이 작업은 되돌릴 수
              없습니다.
            </Alert.Description>
          </Alert.Content>
          <HStack gap={2} ml={4}>
            <Button size="sm" colorPalette="gray" onClick={onCloseAlert}>
              취소
            </Button>
            <Button size="sm" onClick={handleDelete}>
              퇴사 처리
            </Button>
          </HStack>
        </Alert.Root>
      )}
    </VStack>
  );
}
