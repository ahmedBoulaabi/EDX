CREATE TABLE IF NOT EXISTS "buildings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "classrooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "ClassroomType",
	"max_capacity" integer,
	"building_id" uuid,
	"room_plan_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "course_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid,
	"group_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"instructor" uuid,
	"name" text,
	"course_type" "CourseType"
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plan_seats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seat_id" uuid,
	"plan_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "programs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "room_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"number_of_rows" integer,
	"number_of_seats" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "schoolyears" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"begin" date NOT NULL,
	"end" date NOT NULL,
	"is_visible" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "seances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid,
	"classroom_id" uuid,
	"start_time" timestamp,
	"end_time" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "seats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"row" text,
	"number" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "student_groups" (
	"student_id" uuid,
	"group_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "student_presences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seance_id" uuid,
	"student_id" uuid,
	"is_present" boolean
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "student_seatings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seance_id" uuid,
	"student_id" uuid,
	"seat_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teachers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_user_account" uuid,
	"is_internal" boolean
);
--> statement-breakpoint
ALTER TABLE "students" DROP CONSTRAINT "students_student_user_account_users_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "students" ADD CONSTRAINT "students_student_user_account_users_id_fk" FOREIGN KEY ("student_user_account") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "classrooms" ADD CONSTRAINT "classrooms_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "classrooms" ADD CONSTRAINT "classrooms_room_plan_id_room_plans_id_fk" FOREIGN KEY ("room_plan_id") REFERENCES "room_plans"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "course_groups" ADD CONSTRAINT "course_groups_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "course_groups" ADD CONSTRAINT "course_groups_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "courses" ADD CONSTRAINT "courses_instructor_teachers_id_fk" FOREIGN KEY ("instructor") REFERENCES "teachers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plan_seats" ADD CONSTRAINT "plan_seats_seat_id_seats_id_fk" FOREIGN KEY ("seat_id") REFERENCES "seats"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plan_seats" ADD CONSTRAINT "plan_seats_plan_id_room_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "room_plans"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "seances" ADD CONSTRAINT "seances_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "seances" ADD CONSTRAINT "seances_classroom_id_classrooms_id_fk" FOREIGN KEY ("classroom_id") REFERENCES "classrooms"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "student_groups" ADD CONSTRAINT "student_groups_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "student_groups" ADD CONSTRAINT "student_groups_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "student_presences" ADD CONSTRAINT "student_presences_seance_id_seances_id_fk" FOREIGN KEY ("seance_id") REFERENCES "seances"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "student_presences" ADD CONSTRAINT "student_presences_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "student_seatings" ADD CONSTRAINT "student_seatings_seance_id_seances_id_fk" FOREIGN KEY ("seance_id") REFERENCES "seances"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "student_seatings" ADD CONSTRAINT "student_seatings_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "student_seatings" ADD CONSTRAINT "student_seatings_seat_id_seats_id_fk" FOREIGN KEY ("seat_id") REFERENCES "seats"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "teachers" ADD CONSTRAINT "teachers_teacher_user_account_users_id_fk" FOREIGN KEY ("teacher_user_account") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
