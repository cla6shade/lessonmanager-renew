import ContentLayout from "@/components/ContentLayout";
import LessonTablePage from "@/features/table/LessonTablePage";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

export default async function UserDefaultPage() {
  const { locationId } = await getSession();
  const workingTimes = await prisma.workingTime.findMany();
  const openHours = await prisma.openHours.findFirst();
  const teachers = await prisma.teacher.findMany({
    where: {
      locationId,
      isLeaved: false,
      isManager: false,
    },
  });

  const { startHour, endHour } = openHours!;
  return (
    <ContentLayout>
      <LessonTablePage
        workingTimes={workingTimes}
        openHours={openHours!}
        teachers={teachers}
      />
    </ContentLayout>
  );
}
