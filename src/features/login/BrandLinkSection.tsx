"use client";

import brand from "@/brand/baseInfo";
import { Flex } from "@chakra-ui/react";
import Link from "next/link";
import Image from "next/image";

export default function BrandLinkSection() {
  return (
    <Flex justifyContent="space-evenly" w="full">
      {Object.entries(brand.sites).map(([key, data]) => {
        return (
          <Link
            key={key}
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image src={data.icon.src} alt={data.url} width={24} height={24} />
          </Link>
        );
      })}
    </Flex>
  );
}
