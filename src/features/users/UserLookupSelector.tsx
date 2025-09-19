"use client";

import { Box, Input, Spinner, Text, Menu } from "@chakra-ui/react";
import { useRef, useState, useEffect } from "react";
import { UserLookupResponse } from "@/app/(users)/api/users/lookup/schema";

interface UserLookupSelectorProps {
  onUserSelect: (user: UserLookupResponse["data"][number] | null) => void;
  placeholder?: string;
  debounceMs?: number;
}

export default function UserLookupSelector({
  onUserSelect,
  placeholder = "사용자 검색",
  debounceMs = 300,
}: UserLookupSelectorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [results, setResults] = useState<UserLookupResponse["data"]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  // 검색 실행
  const runSearch = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/users/lookup?query=${encodeURIComponent(query)}`
      );
      if (!res.ok) throw new Error("검색 실패");
      const data: UserLookupResponse = await res.json();
      setResults(data.data);
      setOpen(true);
    } catch (err) {
      console.error(err);
      setResults([]);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // input 변화 감지 + debounce
  const handleChange = () => {
    const query = inputRef.current?.value || "";
    if (timer) clearTimeout(timer);
    const newTimer = setTimeout(() => {
      runSearch(query);
    }, debounceMs);
    setTimer(newTimer);
  };

  const handleSelect = (user: UserLookupResponse["data"][number]) => {
    if (inputRef.current) {
      inputRef.current.value = user.name;
    }
    onUserSelect(user);
    setOpen(false);
  };

  return (
    <Box position="relative">
      <Input
        ref={inputRef}
        placeholder={placeholder}
        size="sm"
        bg="white"
        onChange={handleChange}
      />

      <Menu.Root open={open}>
        <Menu.Content
          position="absolute"
          mt={1}
          w="full"
          maxH="200px"
          overflowY="auto"
          zIndex={10}
        >
          {loading && (
            <Menu.Item value="loading" disabled>
              <Spinner size="sm" mr={2} /> 검색 중
            </Menu.Item>
          )}
          {!loading && results.length === 0 && (
            <Menu.Item value="empty" disabled>
              검색 결과가 없습니다
            </Menu.Item>
          )}
          {results.map((user) => (
            <Menu.Item
              key={user.id}
              value={String(user.id)}
              onClick={() => handleSelect(user)}
            >
              <Box>
                <Text fontSize="sm" fontWeight="medium">
                  {user.name}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {user.contact}
                </Text>
              </Box>
            </Menu.Item>
          ))}
        </Menu.Content>
      </Menu.Root>
    </Box>
  );
}
