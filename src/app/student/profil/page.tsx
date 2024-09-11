"use client";
import {
  GraduationCap,
  PersonStanding,
  ScrollText,
  Users,
  ArrowUpRight,
  Plus,
  CalendarIcon,
  Trash,
  UserCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import React, { ChangeEvent, useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";
import Loader from "@/components/atoms/Loader";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";

import { z } from "zod";
import {
  getStudentInformationProfil,
  updateStudentProfile,
} from "@/lib/supabase/students/queries";
import { academicBackgrounds } from "@/lib/supabase/schema";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { createClient } from "@/lib/utils/supabase-client";

const AcademicYearschema = z.object({
  year: z
    .number({
      required_error: "Academic year is required.",
    })
    .min(1900, "Year must be later than 1900")
    .max(new Date().getFullYear(), "Year cannot be in the future"),
  diplomaName: z
    .string({
      required_error: "Diploma name is required.",
    })
    .min(1, "Diploma name is required."),
  schoolName: z
    .string({
      required_error: "School name is required.",
    })
    .min(1, "School name is required."),
  schoolLocationTown: z
    .string({
      required_error: "School location town is required.",
    })
    .min(1, "School location town is required."),
  schoolLocationCountry: z
    .string({
      required_error: "School location country is required.",
    })
    .min(1, "School location country is required."),
  isValidated: z.boolean({
    required_error: "isValidated is required.",
  }),
});

const InternshipSchema = z.object({
  year: z
    .number({
      required_error: "Year is required.",
    })
    .min(1900, "Year must be later than 1900")
    .max(new Date().getFullYear(), "Year cannot be in the future"),
  durationInMonths: z
    .number({
      required_error: "Duration in months is required.",
    })
    .min(1, "Duration must be at least 1 month"),
  businessOrganisationName: z
    .string({
      required_error: "Business Organisation Name is required.",
    })
    .min(1, "Business Organisation Name is required."),
  businessOrganisationLocation: z
    .string({
      required_error: "Business Organisation Location is required.",
    })
    .min(1, "Business Organisation Location is required."),
  description: z.string().optional(),
});

const SkillLanguageSchema = z.object({
  name: z
    .string({
      required_error: "Skill or Language name is required.",
    })
    .min(1, "Skill or Language name is required."),
  levelEnum: z
    .number({
      required_error: "Skill or Language level is required.",
    })
    .min(1)
    .max(10, "Level must be between 1 and 10"),
});

const ProfilSchema = z.object({
  firstName: z
    .string({
      required_error: "First name is required.",
    })
    .min(1, "First name is required."),
  lastName: z
    .string({
      required_error: "Last name is required.",
    })
    .min(1, "Last name is required."),
  email: z.string().optional(),
  mobilePhone: z
    .string({
      required_error: "Mobile phone is required.",
    })
    .min(1, "Mobile phone is required."),
  dob: z.date(),
  academicYears: z.array(AcademicYearschema),
  internships: z.array(InternshipSchema),
  skillsLanguages: z.array(SkillLanguageSchema),
});

export type ProfileDataType = z.infer<typeof ProfilSchema>;

function Profil() {
  const form = useForm<z.infer<typeof ProfilSchema>>({
    resolver: zodResolver(ProfilSchema),
  });

  const {
    fields: academicFields,
    append: appendAcademic,
    remove: removeAcademic,
  } = useFieldArray({
    control: form.control,
    name: "academicYears",
  });

  const {
    fields: internshipFields,
    append: appendInternship,
    remove: removeInternship,
  } = useFieldArray({
    control: form.control,
    name: "internships",
  });

  const {
    fields: skillFields,
    append: appendSkill,
    remove: removeSkill,
  } = useFieldArray({
    control: form.control,
    name: "skillsLanguages",
  });
  const [loading, setLoading] = useState<boolean>(false);

  const [submitError, setSubmitError] = useState("");

  const isLoading = form.formState.isSubmitting;

  const router = useRouter();
  const supabase = createClient();

  const onSubmit = async (data: z.infer<typeof ProfilSchema>) => {
    try {
      form.trigger();

      if (!form.formState.isValid) {
        setSubmitError("Please fill in all required fields.");
        console.log("in error");
        return;
      }

      let profileImageUrl = "";

      if (selectedFile) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("images")
          .upload(
            `${selectedFile.name}-${new Date().toISOString()}`,
            selectedFile
          );

        if (uploadError) {
          throw uploadError;
        }

        profileImageUrl =
          "https://uhlsdnkfpdcldtvwnikf.supabase.co/storage/v1/object/public/images/" +
          uploadData.path;
      }

      const { error } = await updateStudentProfile(data, profileImageUrl);

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Profile updated successfully!",
        description: (
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">{JSON.stringify(data, null, 2)}</code>
          </pre>
        ),
      });

      router.refresh();
    } catch (error) {
      console.error("Error updating profile:", error);
      setSubmitError("Failed to update profile details.");
    }
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await getStudentInformationProfil();

        if (data) {
          form.setValue("firstName", data?.studentData.first_name ?? "");
          form.setValue("lastName", data?.studentData.last_name ?? "");
          form.setValue("email", data.studentData.email ?? "");
          form.setValue("mobilePhone", data?.studentData.mobilePhone ?? "");
          form.setValue("dob", new Date(data.studentData.dob ?? "01-01-2000"));

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
        console.error("Error fetching teacher details:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const [profileImage, setProfileImage] = useState<string>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      setSelectedFile(file);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col pt-24">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle> Profil</CardTitle>
              <CardDescription>
                Welcome to your profile page! Here, you have full control over
                your academic journey. Add your academic background,
                professional achievements, and any other pertinent information
                to streamline your enrollment process. Your profile is your
                personalized gateway to seamless communication and tailored
                assistance. Let&apos;s make your educational experience here as
                smooth and customized as possible.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader />
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="grid grid-cols-2">
                    <div className="p-4 col-span-1 ">
                      <h2 className="text-lg font-bold mb-4">
                        Personal Information
                      </h2>

                      {/* First Name */}
                      <FormField
                        disabled={isLoading}
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name*</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="focus:ring-0 focus-visible:ring-0"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Last Name */}
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name*</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Dupont"
                                {...field}
                                className="focus:ring-0 focus-visible:ring-0"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Email */}
                      <FormField
                        control={form.control}
                        name="email"
                        disabled
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email*</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="jean.dupont@gmail.com"
                                {...field}
                                className="focus:ring-0 focus-visible:ring-0"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Date of Birth */}
                      <FormField
                        control={form.control}
                        name="dob"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Date of birth</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  captionLayout="dropdown-buttons"
                                  fromYear={1950}
                                  toYear={2030}
                                  disabled={(date) =>
                                    date > new Date() ||
                                    date < new Date("1900-01-01")
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormDescription>
                              Your date of birth is used to calculate your age.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="mobilePhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mobile Phone</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0615781572"
                                className="focus:ring-0 focus-visible:ring-0"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-1 ">
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
                          <input
                            id="picture"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 w-full ">
                    <h2 className="text-lg font-bold mb-4">
                      Academic Information
                    </h2>
                    <div className="w-full  grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                      {academicFields.map((field, index) => (
                        <div key={field.id} className="mb-4 space-y-4">
                          <FormField
                            control={form.control}
                            name={`academicYears.${index}.year`}
                            render={({ field, fieldState }) => (
                              <FormItem>
                                <FormLabel>Academic Year*</FormLabel>
                                <div className="grid grid-cols-8 gap-2">
                                  <FormControl className="col-span-7">
                                    <Input
                                      type="number"
                                      placeholder="Academic Year"
                                      {...field}
                                      onChange={(e) =>
                                        form.setValue(
                                          `academicYears.${index}.year`,
                                          +e.target.value ?? 2000
                                        )
                                      }
                                      className="focus:ring-0 focus-visible:ring-0"
                                    />
                                  </FormControl>
                                  <Button
                                    type="button"
                                    onClick={() => removeAcademic(index)}
                                    variant={"destructive"}
                                    className="col-span-1"
                                  >
                                    <Trash className="w-5 h-5" />
                                  </Button>
                                </div>
                                <FormMessage>
                                  {fieldState.error?.message}
                                </FormMessage>{" "}
                                {/* Display error message */}
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`academicYears.${index}.diplomaName`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Prepared Diploma Name*</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Academic Year"
                                    {...field}
                                    className="focus:ring-0 focus-visible:ring-0"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`academicYears.${index}.schoolName`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>School Name*</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Academic Year"
                                    {...field}
                                    className="focus:ring-0 focus-visible:ring-0"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`academicYears.${index}.schoolLocationTown`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>School Location (Town)*</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Major"
                                    {...field}
                                    className="focus:ring-0 focus-visible:ring-0"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`academicYears.${index}.schoolLocationCountry`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  School Location (Country):*
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Major"
                                    {...field}
                                    className="focus:ring-0 focus-visible:ring-0"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`academicYears.${index}.isValidated`}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">
                                    Is Diploma Validated:
                                  </FormLabel>
                                  <FormDescription>
                                    Is this Diploma Validated ?
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      onClick={() =>
                        appendAcademic({
                          year: 2000,
                          schoolName: "",
                          schoolLocationCountry: "",
                          schoolLocationTown: "",
                          diplomaName: "",
                          isValidated: false,
                        })
                      }
                    >
                      Add Year
                    </Button>
                  </div>

                  <div className="p-4 w-full ">
                    <h2 className="text-lg font-bold mb-4">
                      Internship Information
                    </h2>
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                      {internshipFields.map((field, index) => (
                        <div key={field.id} className="mb-4 space-y-4">
                          <FormField
                            control={form.control}
                            name={`internships.${index}.year`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Year*</FormLabel>
                                <div className="grid grid-cols-8 gap-2">
                                  <FormControl className="col-span-7">
                                    <Input
                                      type="number"
                                      placeholder="Year"
                                      {...field}
                                      onChange={(e) =>
                                        form.setValue(
                                          `internships.${index}.year`,
                                          +e.target.value ?? 2000
                                        )
                                      }
                                      className="focus:ring-0 focus-visible:ring-0"
                                    />
                                  </FormControl>
                                  <Button
                                    type="button"
                                    onClick={() => removeInternship(index)}
                                    variant={"destructive"}
                                    className="col-span-1"
                                  >
                                    <Trash className="w-5 h-5" />
                                  </Button>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`internships.${index}.durationInMonths`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Duration (Months)*</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="Duration in Months"
                                    {...field}
                                    onChange={(e) =>
                                      form.setValue(
                                        `internships.${index}.durationInMonths`,
                                        +e.target.value ?? 2
                                      )
                                    }
                                    className="focus:ring-0 focus-visible:ring-0"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`internships.${index}.businessOrganisationName`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Organisation Name*</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Business Organisation Name"
                                    {...field}
                                    className="focus:ring-0 focus-visible:ring-0"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`internships.${index}.businessOrganisationLocation`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Organisation Location*</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Business Organisation Location"
                                    {...field}
                                    className="focus:ring-0 focus-visible:ring-0"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`internships.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Description"
                                    {...field}
                                    className="focus:ring-0 focus-visible:ring-0"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      onClick={() =>
                        appendInternship({
                          year: 2000,
                          durationInMonths: 1,
                          businessOrganisationName: "",
                          businessOrganisationLocation: "",
                          description: "",
                        })
                      }
                    >
                      Add Internship
                    </Button>
                  </div>

                  <div className="p-4 w-full ">
                    <h2 className="text-lg font-bold mb-4">
                      Skills and Languages
                    </h2>
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                      {skillFields.map((field, index) => (
                        <div key={field.id} className="mb-4 space-y-4">
                          <FormField
                            control={form.control}
                            name={`skillsLanguages.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name*</FormLabel>
                                <div className="grid grid-cols-8 gap-2">
                                  <FormControl className="col-span-7">
                                    <Input
                                      placeholder="Skill or Language Name"
                                      {...field}
                                      className="focus:ring-0 focus-visible:ring-0"
                                    />
                                  </FormControl>
                                  <Button
                                    type="button"
                                    onClick={() => removeSkill(index)}
                                    variant={"destructive"}
                                    className="col-span-1"
                                  >
                                    <Trash className="w-5 h-5" />
                                  </Button>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`skillsLanguages.${index}.levelEnum`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Level (1-10)*</FormLabel>
                                <FormControl>
                                  <Slider
                                    min={1}
                                    max={10}
                                    value={[field.value]}
                                    step={1}
                                    onValueChange={(value) => {
                                      field.onChange([value]);
                                      form.setValue(
                                        `skillsLanguages.${index}.levelEnum`,
                                        +value
                                      );
                                    }}
                                    className="focus:ring-0 focus-visible:ring-0"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      onClick={() =>
                        appendSkill({
                          name: "",
                          levelEnum: 1,
                        })
                      }
                    >
                      Add Skill/Language
                    </Button>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end items-center gap-4">
                    <div className="">
                      {submitError && <FormMessage>{submitError}</FormMessage>}
                    </div>
                    <Button type="submit" className="bg-green-400 w-[150px]">
                      {!isLoading ? "Save changes" : <Loader />}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default Profil;
