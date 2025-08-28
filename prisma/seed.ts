import {
  PrismaClient,
  UserRole,
  CourseType,
  PreferenceLevel,
  PreferenceType,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Admin user
  const admin = await prisma.user.create({
    data: {
      email: "admin@uni.edu",
      name: "System Admin",
      role: UserRole.ADMIN,
    },
  });

  // 2. College + college user
  const collegeUser = await prisma.user.create({
    data: {
      email: "college@uni.edu",
      name: "College Admin",
      role: UserRole.COLLEGE,
    },
  });

  const college = await prisma.college.create({
    data: {
      name: "Engineering College",
      code: "ENG",
      description: "College of Engineering",
      userId: collegeUser.id,
    },
  });

  // 3. Department + dept user
  const deptUser = await prisma.user.create({
    data: {
      email: "cs@uni.edu",
      name: "CS Head",
      role: UserRole.DEPARTMENT,
    },
  });

  const department = await prisma.department.create({
    data: {
      name: "Computer Science",
      code: "CS",
      description: "CS Department",
      userId: deptUser.id,
      collegeId: college.id,
    },
  });

  // 4. Program, Batch, Section, Group
  const program = await prisma.program.create({
    data: {
      name: "BSc Computer Science",
      code: "BSC-CS",
      description: "4-year CS Program",
      duration: 4,
      departmentId: department.id,
    },
  });

  const batch2025 = await prisma.batch.create({
    data: {
      name: "Batch 2025",
      year: 2025,
      programId: program.id,
    },
  });

  const sectionA = await prisma.section.create({
    data: {
      name: "A",
      strength: 40,
      batchId: batch2025.id,
    },
  });

  const group1 = await prisma.group.create({
    data: {
      name: "Group 1",
      size: 20,
      sectionId: sectionA.id,
    },
  });

  // 5. Semester
  const semester = await prisma.semester.create({
    data: {
      name: "Fall 2025",
      startDate: new Date("2025-09-01"),
      endDate: new Date("2026-01-15"),
      isActive: true,
    },
  });

  // 6. Teacher + Assistant
  const teacher = await prisma.user.create({
    data: {
      email: "teacher@uni.edu",
      name: "Prof. Alice",
      role: UserRole.TEACHER,
    },
  });

  const assistant = await prisma.user.create({
    data: {
      email: "assistant@uni.edu",
      name: "Bob Assistant",
      role: UserRole.ASSISTANT,
    },
  });

  // 7. Course
  const course = await prisma.course.create({
    data: {
      name: "Algorithms",
      code: "CS201",
      credits: 3,
      type: CourseType.THEORY,
      departmentId: department.id,
    },
  });

  // 8. Course Assignment
  const assignment = await prisma.courseAssignment.create({
    data: {
      courseId: course.id,
      semesterId: semester.id,
      sectionId: sectionA.id,
      teacherId: teacher.id,
      assistantId: assistant.id,
    },
  });

  // 9. Building + Room
  const building = await prisma.building.create({
    data: {
      name: "Main Block",
      code: "MB",
      description: "Main Academic Block",
      collegeId: college.id,
    },
  });

  const room = await prisma.room.create({
    data: {
      name: "Lecture Hall 101",
      code: "MB-101",
      capacity: 60,
      type: "Lecture",
      buildingId: building.id,
    },
  });

  // 10. TimeSlot
  const timeSlot = await prisma.timeSlot.create({
    data: {
      name: "Morning Slot",
      startTime: "09:00",
      endTime: "10:30",
      dayOfWeek: 1,
      collegeId: college.id,
    },
  });

  // 11. Schedule
  await prisma.schedule.create({
    data: {
      courseAssignmentId: assignment.id,
      timeSlotId: timeSlot.id,
      roomId: room.id,
      semesterId: semester.id,
    },
  });

  // 12. Preferences
  await prisma.preference.create({
    data: {
      type: PreferenceType.TIME_SLOT,
      level: PreferenceLevel.PREFERRED,
      description: "Prefers morning classes",
      userId: teacher.id,
      timeSlotId: timeSlot.id,
    },
  });

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
