DO $$ BEGIN
 CREATE TYPE "ClassroomType" AS ENUM('PC', 'cours');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "CourseType" AS ENUM('CM', 'TD', 'TP', 'Examen_CCI', 'Examen_CCF', 'Session_2');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "UserType" AS ENUM('admin', 'teacher', 'student');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "student_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "student_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_number" text,
	"student_user_account" uuid,
	"student_type" uuid,
	"status" text,
	"photo" text,
	"created_by" uuid,
	"created_on" date,
	"validated_by" uuid,
	"validated_on" date,
	CONSTRAINT "students_student_number_unique" UNIQUE("student_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"birth_date" date,
	"gitlab_user" text,
	"github_user" text,
	"other_email" text,
	"mobile_phone" text,
	"type" "UserType",
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_gitlab_user_unique" UNIQUE("gitlab_user"),
	CONSTRAINT "users_github_user_unique" UNIQUE("github_user")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "students" ADD CONSTRAINT "students_student_user_account_users_id_fk" FOREIGN KEY ("student_user_account") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "students" ADD CONSTRAINT "students_student_type_student_types_id_fk" FOREIGN KEY ("student_type") REFERENCES "student_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "students" ADD CONSTRAINT "students_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "students" ADD CONSTRAINT "students_validated_by_users_id_fk" FOREIGN KEY ("validated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
