import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus, ChevronsUpDown, Check } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandList,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Octokit } from "@octokit/rest";
import { getSeanceData } from "@/lib/supabase/planner/queries";
import {
  addForkedRepositories,
  addMainRepository,
} from "@/lib/supabase/other/mutations";
import { Switch } from "@/components/ui/switch";

const GenerateRepositoriesFormSchema = z.object({
  mainRepoName: z.string().min(1, "Main repository name is required."),
  repoName: z
    .string()
    .min(1, "Repository name is required.")
    .regex(/^[\w#_-]+$/, "Invalid characters in repository name."),
  repository: z.string({
    required_error: "Repository id is required.",
  }),
  is_private: z.boolean({
    required_error: "Is Private is required.",
  }),
});

type SeanceData = Awaited<ReturnType<typeof getSeanceData>>;

type Repository = {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  license: {
    key: string;
    name: string;
    url: string | null;
    spdx_id: string | null;
    node_id: string;
    html_url?: string;
  } | null;
};

type ForkedRepositoryData = {
  mainRepoId: string;
  repoName: string;
  studentId: string;
};

interface GenerateRepositoriesModalProps {
  seanceData: SeanceData;
}

const GenerateRepositoriesModal: React.FC<GenerateRepositoriesModalProps> = ({
  seanceData,
}) => {
  const [submitError, setSubmitError] = useState("");
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);

  const form = useForm<z.infer<typeof GenerateRepositoriesFormSchema>>({
    resolver: zodResolver(GenerateRepositoriesFormSchema),
  });
  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
    if (!token) {
      setSubmitError("GitHub token is not set.");
      console.error("GitHub token is not set in the environment variables.");
      return;
    }
    const octokit = new Octokit({
      auth: token,
    });

    async function fetchRepositories() {
      try {
        const response = await octokit.repos.listForAuthenticatedUser();
        setRepositories(response.data);
        // console.log(response.data);
      } catch (error) {
        console.error("Error fetching repositories:", error);
      }
    }

    fetchRepositories();
  }, []);

  async function onSubmit(
    data: z.infer<typeof GenerateRepositoriesFormSchema>
  ) {
    const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
    if (!token) {
      setSubmitError("GitHub token is not set.");
      console.error("GitHub token is not set in the environment variables.");
      return;
    }
    const org = process.env.NEXT_PUBLIC_ORG;
    if (!org) {
      setSubmitError("GitHub organization name is not set.");
      console.error(
        "GitHub organization name is not set in the environment variables."
      );
      return;
    }
    const owner = process.env.NEXT_PUBLIC_GITHUB_OWNER_USERNAME;
    if (!owner) {
      setSubmitError("GitHub owner username is not set.");
      console.error(
        "GitHub owner username is not set in the environment variables."
      );
      return;
    }

    const octokit = new Octokit({
      auth: token,
    });

    try {
      const mainRepoId = await addMainRepository(data.mainRepoName);
      if (mainRepoId === null) {
        setSubmitError("A main repository with the same name already exists.");
        return;
      }
      const forkedRepositoriesData: ForkedRepositoryData[] = [];
      // console.log(selectedRepo?.private);

      if (!selectedRepo?.private && data.is_private) {
        setSubmitError("The selected repository must be private.");
        // console.error("The selected repository must be private.");
        return;
      }

      await Promise.all(
        seanceData.students.map(async (student) => {
          const repoName = data.repoName
            .replaceAll(
              "#courseName",
              seanceData.courses.name.replaceAll(" ", "_")
            )
            .replaceAll("#courseType", seanceData.courses.courseType)
            .replaceAll(
              "#studentName",
              `${student.user.firstName}_${student.user.lastName}`
            )
            .replaceAll(" ", "_");
          const username = student.user.githubUser;

          const forkResponse = await octokit.repos.createFork({
            owner: owner,
            repo: selectedRepo?.name ?? "",
            name: repoName,
            organization: org,
          });

          if (forkResponse.status === 202) {
            console.log(
              `Forked repository ${selectedRepo?.name} for ${student.user.firstName} ${student.user.lastName}`
            );

            const updateResponse = await octokit.repos.update({
              owner: org,
              repo: forkResponse.data.name,
              description: `Repository for ${student.user.firstName} ${student.user.lastName}`,
              private: data.is_private,
            });

            if (updateResponse.status === 200) {
              console.log(`Repository ${repoName} renamed successfully`);
              await octokit.repos.addCollaborator({
                owner: org,
                repo: repoName,
                username: username ?? "",
                permission: "push",
              });
              console.log(`Added ${student.user.githubUser} as a collaborator`);
            } else {
              console.error(
                `Failed to rename repository ${forkResponse.data.name}`
              );
            }

            forkedRepositoriesData.push({
              mainRepoId: mainRepoId,
              repoName: forkResponse.data.name,
              studentId: student.user.id,
            });
          } else {
            console.error(
              `Failed to fork repository for ${student.user.githubUser}`
            );
          }
        })
      );

      const forkedRepoResult = await addForkedRepositories(
        forkedRepositoriesData
      );
      if (forkedRepoResult !== null) {
        setSubmitError(forkedRepoResult);
        return;
      }
      toast({
        title: "Repositories Created",
        description: "Repositories have been created successfully.",
      });
    } catch (error) {
      setSubmitError("Failed to create repositories. Please try again.");
      console.error("Error creating repositories:", error);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          asChild
          size="sm"
          className="w-full flex justify-between mb-2 hover:cursor-pointer"
        >
          <div>
            Generate Repositories
            <Plus className="h-4 w-4" />
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-fit w-full pr-4">
              <DialogHeader>
                <DialogTitle>Generate Repositories</DialogTitle>
                <DialogDescription>
                  Fill in the details below to generate GitHub repositories for
                  the students.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="mainRepoName"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Main Repository Name*</FormLabel>
                      <FormControl>
                        <Input
                          className="focus:ring-0 focus-visible:ring-0"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription></FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="repoName"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Fork Repository Name*</FormLabel>
                      <FormControl>
                        <Input
                          className="focus:ring-0 focus-visible:ring-0"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        <code>#courseName</code> for course name, <br />
                        <code>#studentName</code> for student name <br />
                        <code>#courseType</code> for course type <br />
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="repository"
                  render={({ field }) => (
                    <FormItem className="flex flex-col w-full">
                      <FormLabel>Repository</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value && repositories
                                ? repositories.find(
                                    (repo) => String(repo.id) === field.value
                                  )?.name
                                : "Select Repository"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                          <Command>
                            <CommandInput placeholder="Search Repository..." />
                            <CommandEmpty>No repository found.</CommandEmpty>
                            <CommandGroup>
                              <CommandList>
                                {repositories &&
                                  repositories.map((repo) => (
                                    <CommandItem
                                      value={repo.name}
                                      key={repo.id}
                                      onSelect={() => {
                                        form.setValue(
                                          "repository",
                                          String(repo.id)
                                        );
                                        setSelectedRepo(repo);
                                      }}
                                    >
                                      {repo.name}
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          String(repo.id) === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                    </CommandItem>
                                  ))}
                              </CommandList>
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        This is the repository that will be used.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* is private FIELD*/}
                <FormField
                  control={form.control}
                  name="is_private"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">is_private</FormLabel>
                        <FormDescription>
                          Set this to private if you want the generated
                          repositories to be private.
                          <br />
                          Note: The selected repository must also be private to
                          enable this setting.
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

              <DialogFooter className="mt-4">
                {submitError && <FormMessage>{submitError}</FormMessage>}
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Generating..." : "Generate"}
                </Button>
              </DialogFooter>
            </ScrollArea>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateRepositoriesModal;
