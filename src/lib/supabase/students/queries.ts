"use server";
import db from "../db";
import { revalidatePath } from "next/cache";
import { getCurrentSession } from "@/lib/utils/get-current-session-server";
import { createClient } from "@/lib/utils/supabase-server";
import {
  studentTypes,
  students,
  users,
  academicBackgrounds,
  internships,
  skillsLanguage,
} from "../schema";
import { eq, sql } from "drizzle-orm";
import { getStudentById } from "./mutations";
import { ProfileDataType } from "@/app/student/profil/page";

export async function getStudentInformationProfilById(student_id: string) {
  if (!student_id) return;

  const studentData = await getStudentById(student_id);

  let academicBackgroundsQuery = db
    .select()
    .from(academicBackgrounds)
    .where(eq(academicBackgrounds.studentId, sql.placeholder("studentId")))
    .prepare("get-student-background-details");

  const academicBackgroundsResult = await academicBackgroundsQuery.execute({
    studentId: studentData.id,
  });

  let internshipsQuery = db
    .select()
    .from(internships)
    .where(eq(internships.studentId, sql.placeholder("studentId")))
    .prepare("get-student-internship-details");

  const internshipsResult = await internshipsQuery.execute({
    studentId: studentData.id,
  });

  let skillsLanguagesQuery = db
    .select()
    .from(skillsLanguage)
    .where(eq(skillsLanguage.studentId, sql.placeholder("studentId")))
    .prepare("get-student-skills-language-details");

  const skillsLanguagesResult = await skillsLanguagesQuery.execute({
    studentId: studentData.id,
  });

  return {
    academicBackgrounds: academicBackgroundsResult,
    studentData: studentData,
    internships: internshipsResult,
    skillsLanguages: skillsLanguagesResult,
  };
}

export async function getStudentInformationProfil() {
  const currentUser = getCurrentSession();
  const studentId = (await currentUser).data.user?.id;

  if (!studentId) return;

  const studentData = await getStudentById(studentId);

  let academicBackgroundsQuery = db
    .select()
    .from(academicBackgrounds)
    .where(eq(academicBackgrounds.studentId, sql.placeholder("studentId")))
    .prepare("get-student-background-details");

  const academicBackgroundsResult = await academicBackgroundsQuery.execute({
    studentId: studentData.id,
  });

  let internshipsQuery = db
    .select()
    .from(internships)
    .where(eq(internships.studentId, sql.placeholder("studentId")))
    .prepare("get-student-internship-details");

  const internshipsResult = await internshipsQuery.execute({
    studentId: studentData.id,
  });

  let skillsLanguagesQuery = db
    .select()
    .from(skillsLanguage)
    .where(eq(skillsLanguage.studentId, sql.placeholder("studentId")))
    .prepare("get-student-skills-language-details");

  const skillsLanguagesResult = await skillsLanguagesQuery.execute({
    studentId: studentData.id,
  });

  return {
    academicBackgrounds: academicBackgroundsResult,
    studentData: studentData,
    internships: internshipsResult,
    skillsLanguages: skillsLanguagesResult,
  };
}

export async function updateStudentProfile(
  data: ProfileDataType,
  imageUrl: string | null
) {
  const currentUser = getCurrentSession();
  const studentId = (await currentUser).data.user?.id;

  try {
    // Update student basic information
    const response = await db
      .update(users)
      .set({
        firstName: data.firstName,
        lastName: data.lastName,
        birthDate: data.dob?.toISOString(),
        email: data.email,
        mobilePhone: data.mobilePhone,
      })
      .where(eq(users.id, sql.placeholder("studentId")))
      .prepare("update-user-data")
      .execute({ studentId: studentId });

    if (imageUrl) {
      await db
        .update(students)
        .set({
          photo: imageUrl,
        })
        .where(eq(students.id, sql.placeholder("studentId")))
        .prepare("update-student-photo-data")
        .execute({ studentId: studentId });
    }

    let queryDeleteAcademicBackgrounds = db
      .delete(academicBackgrounds)
      .where(eq(academicBackgrounds.studentId, sql.placeholder("studentId")))
      .prepare("delete-academic-background-by-student-id");

    await queryDeleteAcademicBackgrounds.execute({
      studentId,
    });

    // Update academic backgrounds
    for (const background of data.academicYears) {
      await db
        .insert(academicBackgrounds)
        .values({
          year: Number(background.year),
          preparedDiplomaName: background.diplomaName,
          schoolName: background.schoolName,
          schoolLocationTown: background.schoolLocationTown,
          schoolLocationCountry: background.schoolLocationCountry,
          isDiplomaValidated: background.isValidated,
          studentId: studentId,
        })
        .prepare("insert-academic-background")
        .execute();
    }

    let queryDeleteInterships = db
      .delete(internships)
      .where(eq(internships.studentId, sql.placeholder("studentId")))
      .prepare("delete-internships-by-student-id");

    await queryDeleteInterships.execute({
      studentId,
    });

    // Update internships
    for (const internship of data.internships) {
      await db
        .insert(internships)
        .values({
          year: internship.year,
          durationInMonths: internship.durationInMonths,
          businessOrganisationName: internship.businessOrganisationName,
          businessOrganisationLocation: internship.businessOrganisationLocation,
          studentId: studentId,
          description: internship.description,
        })
        .prepare("update-internship")
        .execute();
    }

    let queryDeleteSkills = db
      .delete(skillsLanguage)
      .where(eq(skillsLanguage.studentId, sql.placeholder("studentId")))
      .prepare("delete-skills-by-student-id");

    await queryDeleteSkills.execute({
      studentId,
    });

    // Update skills and languages
    for (const skill of data.skillsLanguages) {
      await db
        .insert(skillsLanguage)
        .values({
          name: skill.name,
          levelEnum: skill.levelEnum,
          studentId: studentId,
        })
        .prepare("update-skills")
        .execute();
    }
    return { error: null };
  } catch (error) {
    console.error("Error updating student:", error);
    return { error: { message: "Failed to update student details." } };
  }
}
