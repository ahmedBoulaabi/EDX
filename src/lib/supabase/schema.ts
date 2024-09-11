import {
  pgTable,
  pgEnum,
  uuid,
  timestamp,
  text,
  foreignKey,
  integer,
  date,
  boolean,
  numeric,
} from "drizzle-orm/pg-core";

export const UserType = pgEnum("UserType", ["admin", "teacher", "student"]);
export const ClassroomType = pgEnum("ClassroomType", ["PC", "cours"]);
export const CourseType = pgEnum("CourseType", [
  "CM",
  "TD",
  "TP",
  "Examen_CCI",
  "Examen_CCF",
  "Session_2",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  birthDate: date("birth_date"),
  gitlabUser: text("gitlab_user").unique(),
  githubUser: text("github_user").unique(),
  otherEmail: text("other_email"),
  mobilePhone: text("mobile_phone"),
  role: UserType("role"),
});

export const studentTypes = pgTable("student_types", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  name: text("name").notNull().unique(),
});

export const students = pgTable("students", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  studentNumber: text("student_number").unique(),
  studentUserAccount: uuid("student_user_account").references(() => users.id, {
    onDelete: "cascade",
  }),
  studentType: uuid("student_type").references(() => studentTypes.id, {
    onDelete: "cascade",
  }),
  status: text("status"),
  photo: text("photo"),
  createdBy: uuid("created_by").references(() => users.id, {
    onDelete: "cascade",
  }),
  createdOn: date("created_on"),
  validatedBy: uuid("validated_by").references(() => users.id, {
    onDelete: "cascade",
  }),
  validatedOn: date("validated_on"),
  programId: uuid("program_id").references(() => programs.id, {
    onDelete: "cascade",
  }),
});

export const teachers = pgTable("teachers", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  teacherUserAccount: uuid("teacher_user_account").references(() => users.id, {
    onDelete: "cascade",
  }),
  isInternal: boolean("is_internal"),
});

export const groups = pgTable("groups", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  name: text("name").notNull(),
});

export const studentGroups = pgTable("student_groups", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  studentId: uuid("student_id").references(() => students.id, {
    onDelete: "cascade",
  }),
  groupId: uuid("group_id").references(() => groups.id, {
    onDelete: "cascade",
  }),
});

export const programs = pgTable("programs", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  name: text("name"),
});

export const courses = pgTable("courses", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  instructor: uuid("instructor")
    .references(() => teachers.id, {
      onDelete: "cascade",
    })
    .notNull(),
  name: text("name").notNull(),
  courseType: CourseType("course_type").notNull(),
});

export const coursePrograms = pgTable("course_programs", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  courseId: uuid("course_id").references(() => courses.id, {
    onDelete: "cascade",
  }),
  programId: uuid("program_id").references(() => programs.id, {
    onDelete: "cascade",
  }),
});

export const classrooms = pgTable("classrooms", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  name: text("name").notNull(),
  type: ClassroomType("type").notNull(),
  maxCapacity: integer("max_capacity"),
  buildingId: uuid("building_id")
    .references(() => buildings.id, {
      onDelete: "cascade",
    })
    .notNull(),
  roomPlanId: uuid("room_plan_id")
    .references(() => roomPlans.id, {
      onDelete: "cascade",
    })
    .notNull(),
});

export const seances = pgTable("seances", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  courseId: uuid("course_id")
    .references(() => courses.id, {
      onDelete: "cascade",
    })
    .notNull(),
  classroomId: uuid("classroom_id")
    .references(() => classrooms.id, {
      onDelete: "cascade",
    })
    .notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  year: integer("year").notNull(),
  month: integer("month").notNull(),
  day: integer("day").notNull(),
});

export const seanceGroups = pgTable("seance_groups", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  seanceId: uuid("seance_id").references(() => seances.id, {
    onDelete: "cascade",
  }),
  groupsId: uuid("groups_id").references(() => groups.id, {
    onDelete: "cascade",
  }),
});

export const studentSeatings = pgTable("student_seatings", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  seanceId: uuid("seance_id").references(() => seances.id, {
    onDelete: "cascade",
  }),
  studentId: uuid("student_id")
    .references(() => students.id, {
      onDelete: "cascade",
    })
    .notNull(),
  seatId: uuid("seat_id")
    .references(() => planSeats.id, {
      onDelete: "cascade",
    })
    .notNull(),
});

export const buildings = pgTable("buildings", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  name: text("name"),
});

export const roomPlans = pgTable("room_plans", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  name: text("name"),
  numberOfRows: integer("number_of_rows"),
  numberOfSeats: integer("number_of_seats"),
});

export const planRows = pgTable("plan_rows", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  name: text("name"),
  planId: uuid("plan_id").references(() => roomPlans.id),
  x: numeric("x"),
  y: numeric("y"),
});

export const planSeats = pgTable("plan_seats", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  seatName: text("seat_name"),
  rowId: uuid("row_id").references(() => planRows.id),
});

export const studentPresences = pgTable("student_presences", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  seanceId: uuid("seance_id")
    .references(() => seances.id, {
      onDelete: "cascade",
    })
    .notNull(),
  studentId: uuid("student_id")
    .references(() => students.id, {
      onDelete: "cascade",
    })
    .notNull(),
  isPresent: boolean("is_present").notNull(),
});

export const schoolyears = pgTable("schoolyears", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  name: text("name").notNull(),
  begin: date("begin").notNull(),
  end: date("end").notNull(),
  isVisible: boolean("is_visible").default(true),
});

export const academicBackgrounds = pgTable("academic_backgrounds", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  studentId: uuid("student_id").references(() => students.id, {
    onDelete: "cascade",
  }),
  year: integer("year").notNull(),
  preparedDiplomaName: text("prepared_diploma_name").notNull(),
  schoolName: text("school_name").notNull(),
  schoolLocationTown: text("school_location_town").notNull(),
  schoolLocationCountry: text("school_location_country").notNull(),
  isDiplomaValidated: boolean("is_diploma_validated").notNull(),
});

export const internships = pgTable("internships", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  studentId: uuid("student_id").references(() => students.id, {
    onDelete: "cascade",
  }),
  year: integer("year").notNull(),
  durationInMonths: integer("duration_in_months").notNull(),
  businessOrganisationName: text("business_organisation_name").notNull(),
  businessOrganisationLocation: text(
    "business_organisation_location"
  ).notNull(),
  description: text("description"),
});

export const skillsLanguage = pgTable("skills_language", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  studentId: uuid("student_id").references(() => students.id, {
    onDelete: "cascade",
  }),
  name: text("name").notNull(),
  levelEnum: integer("level_enum").notNull(),
});

export const enrollmentPrograms = pgTable("enrollment_programs", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  studentId: uuid("student_id").references(() => students.id, {
    onDelete: "cascade",
  }),
  programId: uuid("program_id").references(() => programs.id, {
    onDelete: "cascade",
  }),
  state: text("state").default("pending").notNull(),
  note: text("note").default("N/A").notNull(),
  requestDate: timestamp("request_date").defaultNow().notNull(),
});

export const mainRepositories = pgTable("main_repositories", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  name: text("name").notNull(),
  status: text("status").default("opened").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const forkedRepositories = pgTable("forked_repositories", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  mainRepoId: uuid("main_repositories").references(() => mainRepositories.id, {
    onDelete: "cascade",
  }),
  repoName: text("repo_name").notNull(),
  studentId: uuid("student_id").references(() => students.id, {
    onDelete: "cascade",
  }),
});
