import ContentLayout from "@/components/ContentLayout";
import { CenteredSpinner } from "@/components/Spinner";
import LessonTablePage from "@/features/table/LessonTablePage";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Suspense } from "react";

export default async function UserDefaultPage() {
  const { locationId } = await getSession();

  const workingTimes = prisma.workingTime.findMany();
  const openHours = prisma.openHours.findFirst();
  const teachers = prisma.teacher.findMany({
    where: {
      locationId,
      isLeaved: false,
      isManager: false,
    },
    include: {
      workingTime: true,
      major: true,
    },
  });
  return (
    <ContentLayout>
      <Suspense fallback={<CenteredSpinner />}>
        <LessonTablePage
          workingTimesPromise={workingTimes}
          openHoursPromise={openHours}
          teachersPromise={teachers}
        />
      </Suspense>
    </ContentLayout>
  );
}
