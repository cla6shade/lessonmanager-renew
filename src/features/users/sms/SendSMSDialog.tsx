'use client';

import {
  Dialog,
  Button,
  Input,
  Box,
  Text,
  VStack,
  HStack,
  IconButton,
  Textarea,
} from '@chakra-ui/react';
import { useState, useEffect, useMemo } from 'react';
import { SMSTarget, GetSMSTargetResponse } from '@/app/(sms)/api/sms/schema';
import { useFetch } from '@/hooks/useFetch';
import { UserLookupResponse } from '@/app/(users)/api/users/lookup/schema';
import { toaster } from '@/components/ui/toaster';
import UserLookupSelector from '@/features/selectors/UserLookupSelector';
import { useUserTable } from '@/features/users/table/UserTableProvider';
import { useUserSelection } from '@/features/users/UserSelectionProvider';
import { useFilter } from '@/features/users/search/FilterProvider';
import FetchBoundary from '@/components/FetchBoundary';

interface SMSTargetDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function SMSTargetDialog({ open, onClose }: SMSTargetDialogProps) {
  const [editableTargets, setEditableTargets] = useState<SMSTarget[]>([]);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { isTotalSelected: totalSelected, selectedUsers } = useUserSelection();
  const { currentFilter: receiverType, searchContact, searchName, searchBirthDate } = useFilter();
  const { selectedLocation } = useUserTable();
  const selectedLocationId = selectedLocation?.id || 0;

  const isMessageEditable = receiverType === 'ALL';

  const fetchUrl = useMemo(() => {
    if (!totalSelected || !open) return null;
    const params = new URLSearchParams({
      receiverType,
      selectedLocationId: String(selectedLocationId),
      isTotalSelected: 'true',
      name: searchName,
      contact: searchContact,
      ...(searchBirthDate ? { birthDate: searchBirthDate } : {}),
    });
    return `/api/sms?${params.toString()}`;
  }, [
    totalSelected,
    open,
    receiverType,
    selectedLocationId,
    searchName,
    searchContact,
    searchBirthDate,
  ]);

  const { data, loading, error } = useFetch<GetSMSTargetResponse>(fetchUrl);

  useEffect(() => {
    if (open) {
      if (totalSelected && data?.data) {
        setEditableTargets(data.data);
      } else {
        const editableTargets = Array.from(selectedUsers).filter(
          (user) => user.contact != null,
        ) as SMSTarget[];
        setEditableTargets(editableTargets);
      }
    }
  }, [open, totalSelected, data, selectedUsers]);

  useEffect(() => {
    if (!open) {
      setMessage('');
      setIsSending(false);
    }
  }, [open]);

  const handleAddRegisteredUser = (user: UserLookupResponse['data'][number] | null) => {
    if (!user || !user.contact) return;

    const newTarget: SMSTarget = {
      id: user.id,
      name: user.name,
      contact: user.contact,
    };

    const isDuplicate = editableTargets.some((target) => target.contact === newTarget.contact);
    if (isDuplicate) {
      toaster.create({
        title: '이미 추가된 사용자입니다',
        type: 'warning',
        duration: 2000,
      });
      return;
    }
    setEditableTargets((prev) => [...prev, newTarget]);
  };

  const handleAddUnregisteredUser = () => {
    if (!newPhoneNumber.trim()) return;

    const newTarget: SMSTarget = {
      contact: newPhoneNumber.trim(),
    };

    const isDuplicate = editableTargets.some((target) => target.contact === newTarget.contact);
    if (isDuplicate) {
      toaster.create({
        title: '이미 추가된 번호입니다',
        type: 'warning',
        duration: 2000,
      });
      return;
    }
    setEditableTargets((prev) => [...prev, newTarget]);
    setNewPhoneNumber('');
  };

  const handleRemoveTarget = (contact: string) => {
    setEditableTargets((prev) => prev.filter((target) => target.contact !== contact));
  };

  const handleConfirm = async () => {
    if (!message.trim()) {
      toaster.create({
        title: '메시지를 입력해주세요',
        type: 'warning',
        duration: 2000,
      });
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch('/api/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverType,
          message: message.trim(),
          targetInfos: editableTargets,
          selectedLocationId,
        }),
      });

      if (!response.ok) {
        toaster.create({
          title: 'SMS 발송 중 오류가 발생했습니다',
          type: 'error',
          duration: 3000,
        });
      }

      toaster.create({
        title: 'SMS 발송 완료',
        type: 'success',
        duration: 2000,
      });

      onClose();
    } catch (error) {
      toaster.create({
        title: error instanceof Error ? error.message : 'SMS 발송 중 오류가 발생했습니다',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(e) => !e.open && onClose()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="600px">
          <Dialog.Header>
            <Dialog.Title>SMS 발송 대상 편집</Dialog.Title>
          </Dialog.Header>

          <Dialog.Body>
            <FetchBoundary
              isLoading={loading}
              error={error}
              loadingFallback={
                <Box textAlign="center" py={4}>
                  <Text>목록 조회 중</Text>
                </Box>
              }
            >
              <VStack gap={4} align="stretch">
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    메시지 내용
                  </Text>
                  <Textarea
                    placeholder={isMessageEditable ? '메시지를 입력하세요' : ''}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={!isMessageEditable}
                    rows={4}
                    bg={!isMessageEditable ? 'gray.100' : 'white'}
                  />
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    수강생 추가
                  </Text>
                  <UserLookupSelector
                    onUserSelect={handleAddRegisteredUser}
                    placeholder="이름 또는 연락처로 검색"
                  />
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    번호 추가
                  </Text>
                  <HStack>
                    <Input
                      placeholder="01000000000"
                      value={newPhoneNumber}
                      onChange={(e) => setNewPhoneNumber(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddUnregisteredUser();
                        }
                      }}
                    />
                    <Button onClick={handleAddUnregisteredUser} colorScheme="blue" flexShrink={0}>
                      추가
                    </Button>
                  </HStack>
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    발송 대상 목록 ({editableTargets.length}명)
                  </Text>
                  <Box
                    maxH="300px"
                    overflowY="auto"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    p={2}
                  >
                    {editableTargets.length === 0 ? (
                      <Text color="gray.500" textAlign="center" py={4}>
                        발송 대상이 없습니다
                      </Text>
                    ) : (
                      <VStack gap={2} align="stretch">
                        {editableTargets.map((target, index) => (
                          <HStack
                            key={`${target.contact}-${index}`}
                            p={2}
                            bg="gray.50"
                            borderRadius="md"
                            justify="space-between"
                          >
                            <Box flex={1}>
                              {target.name && (
                                <Text fontSize="sm" fontWeight="medium">
                                  {target.name}
                                </Text>
                              )}
                              <Text fontSize="xs" color="gray.600">
                                {target.contact}
                              </Text>
                            </Box>
                            <IconButton
                              aria-label="삭제"
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => handleRemoveTarget(target.contact)}
                            >
                              ✕
                            </IconButton>
                          </HStack>
                        ))}
                      </VStack>
                    )}
                  </Box>
                </Box>
              </VStack>
            </FetchBoundary>
          </Dialog.Body>

          <Dialog.Footer>
            <Button
              colorScheme="blue"
              onClick={handleConfirm}
              disabled={loading || editableTargets.length === 0 || isSending}
              loading={isSending}
            >
              {isSending ? '발송 중...' : '확인'}
            </Button>
            <Button variant="ghost" onClick={onClose} disabled={loading || isSending}>
              취소
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
