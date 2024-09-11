"use client";
import { UserCircle, X, Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { format } from "date-fns";
import Loader from "@/components/atoms/Loader";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { z } from "zod";
import { getStudentInformationProfilById } from "@/lib/supabase/students/queries";
import { createClient } from "@/lib/utils/supabase-client";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { getEnrollmentRequestById } from "@/lib/supabase/other/queries";
import { updateStudentRequestStatusById } from "@/lib/supabase/other/mutations";

const AcademicYearschema = z.object({
  year: z.number().min(1900).max(new Date().getFullYear()).optional(),
  diplomaName: z.string().optional(),
  schoolName: z.string().optional(),
  schoolLocationTown: z.string().optional(),
  schoolLocationCountry: z.string().optional(),
  isValidated: z.boolean().optional(),
});

const InternshipSchema = z.object({
  year: z.number().min(1900).max(new Date().getFullYear()).optional(),
  durationInMonths: z.number().min(1).optional(),
  businessOrganisationName: z.string().optional(),
  businessOrganisationLocation: z.string().optional(),
  description: z.string().optional().optional(),
});

const SkillLanguageSchema = z.object({
  name: z.string().optional(),
  levelEnum: z.number().min(1).max(10).optional(),
});

const ProfilSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
  mobilePhone: z.string().optional(),
  dob: z.date().optional(),
  note: z.string().optional(),
  academicYears: z.array(AcademicYearschema).optional(),
  internships: z.array(InternshipSchema).optional(),
  skillsLanguages: z.array(SkillLanguageSchema).optional(),
});

export type ProfileDataType = z.infer<typeof ProfilSchema>;

function StudentRequestDetails({ params }: { params: { id: string } }) {
  const form = useForm<z.infer<typeof ProfilSchema>>({
    resolver: zodResolver(ProfilSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      mobilePhone: "",
      dob: new Date("2000-01-01"),
      academicYears: [],
      internships: [],
      skillsLanguages: [],
    },
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [profileImage, setProfileImage] = useState<string>();
  const [submitError, setSubmitError] = useState("");
  const isLoading = form.formState.isSubmitting;

  const [currentState, setCurrentState] = useState<string>("");
  const [programId, setProgramId] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");

  const router = useRouter();
  const supabase = createClient();
  const request_id = params.id;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const enrollment_request = await getEnrollmentRequestById(request_id);
        router.refresh();
        setCurrentState(enrollment_request?.data?.state ?? "pending");
        setProgramId(enrollment_request?.data?.program.id ?? "");
        setStudentId(enrollment_request?.data?.student.id ?? "");
        const data = await getStudentInformationProfilById(
          enrollment_request?.data?.student.id ?? ""
        );
        router.refresh();

        if (data) {
          form.setValue("firstName", data?.studentData.first_name ?? "");
          form.setValue("lastName", data?.studentData.last_name ?? "");
          form.setValue("email", data.studentData.email ?? "");
          form.setValue("mobilePhone", data?.studentData.mobilePhone ?? "");
          form.setValue("note", enrollment_request?.data?.note ?? "N/A");
          form.setValue("dob", new Date(data.studentData.dob ?? "2000-01-01"));

          const internships = data.internships.map((internship) => ({
            year: internship.year,
            durationInMonths: internship.durationInMonths,
            businessOrganisationName: internship.businessOrganisationName,
            businessOrganisationLocation:
              internship.businessOrganisationLocation,
            description: internship.description ?? "",
          }));

          const skillsLanguages = data.skillsLanguages.map((skill) => ({
            name: skill.name,
            levelEnum: skill.levelEnum,
          }));

          const academicYears = data.academicBackgrounds.map((background) => ({
            year: background.year,
            diplomaName: background.preparedDiplomaName,
            schoolName: background.schoolName,
            schoolLocationTown: background.schoolLocationTown,
            schoolLocationCountry: background.schoolLocationCountry,
            isValidated: background.isDiplomaValidated,
          }));

          form.setValue("academicYears", academicYears);
          form.setValue("internships", internships);
          form.setValue("skillsLanguages", skillsLanguages);

          setProfileImage(data?.studentData.photo ?? undefined);
        }
      } catch (error) {
        console.error("Error fetching student details:", error);
      } finally {
        setLoading(false);
      }
    }
    if (request_id) {
      fetchData();
    }
  }, [request_id]);

  const onSubmit = async (
    data: z.infer<typeof ProfilSchema>,
    state: string
  ) => {
    try {
      const response = await updateStudentRequestStatusById(
        request_id,
        state,
        data.note ?? "N/A",
        studentId,
        programId
      );
      if (response.error) {
        throw new Error(response.error.message);
      }
      toast({
        title: "Request updated successfully!",
        description: (
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">
              Response : {JSON.stringify(state, null, 2)}
              <br />
              Note : {JSON.stringify(data.note, null, 2)}
            </code>
          </pre>
        ),
      });
      router.push("/teacher/dashboard");
    } catch (error) {
      console.error("Error updating request status:", error);
      setSubmitError("Failed to update request status.");
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col pt-24">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Profil</CardTitle>
              <CardDescription>
                Welcome to the student profile page! Here, you can view the
                student&apos;s academic journey, professional achievements, and
                other pertinent information.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader />
            ) : (
              <Form {...form}>
                <div className="grid grid-cols-2">
                  <div className="p-4 col-span-1">
                    <h2 className="text-lg font-bold mb-4">
                      Personal Information
                    </h2>

                    {/* First Name */}
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-white/50 ">
                            First Name
                          </FormLabel>
                          <div className="font-bold text-lg p-2">
                            {field.value}
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Last Name */}
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-white/50 ">
                            Last Name
                          </FormLabel>
                          <div className="font-bold text-lg p-2">
                            {field.value}
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Email */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-white/50 ">
                            Email
                          </FormLabel>
                          <div className="font-bold text-lg p-2">
                            {field.value}
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Date of Birth */}
                    <FormField
                      control={form.control}
                      name="dob"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-xs text-white/50 ">
                            Date of birth
                          </FormLabel>
                          <div className="font-bold text-lg p-2">
                            <div>
                              {format(
                                field.value ?? new Date("2000-01-01"),
                                "PPP"
                              )}
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="mobilePhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-white/50 ">
                            Mobile Phone
                          </FormLabel>
                          <div className="font-bold text-lg p-2">
                            {field.value}
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-1">
                    <div className="flex justify-center items-center h-full w-full col-span-1 pt-16">
                      <div className="relative w-72 h-72">
                        {profileImage ? (
                          <img
                            src={profileImage}
                            alt="Profile"
                            className="w-full h-full object-cover rounded-full border-2 border-gray-300"
                          />
                        ) : (
                          <div className="w-full h-full">
                            <UserCircle className="h-full w-full" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 w-full">
                  <h2 className="text-lg font-bold mb-4">
                    Academic Information
                  </h2>
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                    {form.watch("academicYears")?.map((academic, index) => (
                      <div
                        key={index}
                        className="mb-4 space-y-4 bg-brand-gray-light p-4 rounded"
                      >
                        <FormItem>
                          <FormLabel className="text-xs">
                            Academic Year
                          </FormLabel>
                          <div className="font-bold">{academic.year}</div>
                        </FormItem>

                        <FormItem>
                          <FormLabel className="text-xs">
                            Prepared Diploma Name
                          </FormLabel>
                          <div className="font-bold">
                            {academic.diplomaName}
                          </div>
                        </FormItem>

                        <FormItem>
                          <FormLabel className="text-xs">School Name</FormLabel>
                          <div className="font-bold">{academic.schoolName}</div>
                        </FormItem>

                        <FormItem>
                          <FormLabel className="text-xs">
                            School Location (Town)
                          </FormLabel>
                          <div className="font-bold">
                            {academic.schoolLocationTown}
                          </div>
                        </FormItem>

                        <FormItem>
                          <FormLabel className="text-xs">
                            School Location (Country)
                          </FormLabel>
                          <div className="font-bold">
                            {academic.schoolLocationCountry}
                          </div>
                        </FormItem>

                        <FormItem>
                          <FormLabel className="text-xs">
                            Is Diploma Validated
                          </FormLabel>
                          <div className="font-bold">
                            {academic.isValidated ? "Yes" : "No"}
                          </div>
                        </FormItem>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 w-full">
                  <h2 className="text-lg font-bold mb-4">
                    Internship Information
                  </h2>
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                    {form.watch("internships")?.map((internship, index) => (
                      <div
                        key={index}
                        className="mb-4 space-y-4 bg-brand-gray-light p-4 rounded"
                      >
                        <FormItem>
                          <FormLabel className="text-xs">Year</FormLabel>
                          <div className="font-bold">{internship.year}</div>
                        </FormItem>

                        <FormItem>
                          <FormLabel className="text-xs">
                            Duration (Months)
                          </FormLabel>
                          <div className="font-bold">
                            {internship.durationInMonths}
                          </div>
                        </FormItem>

                        <FormItem>
                          <FormLabel className="text-xs">
                            Organisation Name
                          </FormLabel>
                          <div className="font-bold">
                            {internship.businessOrganisationName}
                          </div>
                        </FormItem>

                        <FormItem>
                          <FormLabel className="text-xs">
                            Organisation Location
                          </FormLabel>
                          <div className="font-bold">
                            {internship.businessOrganisationLocation}
                          </div>
                        </FormItem>

                        <FormItem>
                          <FormLabel className="text-xs">Description</FormLabel>
                          <div className="font-bold">
                            {internship.description}
                          </div>
                        </FormItem>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 w-full">
                  <h2 className="text-lg font-bold mb-4">
                    Skills and Languages
                  </h2>
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                    {form.watch("skillsLanguages")?.map((skill, index) => (
                      <div
                        key={index}
                        className="mb-4 space-y-4 bg-brand-gray-light p-4 rounded"
                      >
                        <FormItem>
                          <FormLabel className="text-xs">Name</FormLabel>
                          <div className="font-bold">{skill.name}</div>
                        </FormItem>

                        <FormItem>
                          <FormLabel className="text-xs">Level :</FormLabel>
                          <div className="font-bold">
                            {skill.levelEnum} / 10
                          </div>
                          <Progress
                            value={(skill.levelEnum ?? 0) * 10}
                            className="w-full border-[1px] border-white/20"
                          />
                        </FormItem>
                      </div>
                    ))}
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Note</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write a note for the student ..."
                          {...field}
                          className="focus:ring-0 focus-visible:ring-0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end items-center gap-4">
                  <div className="">
                    {submitError && <FormMessage>{submitError}</FormMessage>}
                  </div>
                  {currentState !== "accepted" && (
                    <Button
                      onClick={form.handleSubmit((data) =>
                        onSubmit(data, "accepted")
                      )}
                      className="bg-green-400"
                    >
                      <Check className="w-5 h-5" />
                      Accept
                    </Button>
                  )}
                  {currentState !== "rejected" && (
                    <Button
                      onClick={form.handleSubmit((data) =>
                        onSubmit(data, "rejected")
                      )}
                      variant={"destructive"}
                    >
                      <X className="w-5 h-5" />
                      Reject
                    </Button>
                  )}
                </div>
              </Form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default StudentRequestDetails;
