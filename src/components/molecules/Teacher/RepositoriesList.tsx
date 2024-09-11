import {
  ArrowUpRight,
  BookUser,
  Check,
  X,
  Trash,
  Wrench,
  FileLock,
  LockOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";
import {
  StudentInfo,
  getEnrollmentRequests,
  getMainRepositoriesWithStudentInfo,
} from "@/lib/supabase/other/queries";
import { revalidatePath } from "next/cache";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  deleteMainRepository,
  updateMainRepositoryStatusById,
} from "@/lib/supabase/other/mutations";
import { Octokit } from "@octokit/rest";
import Link from "next/link";

const RepositoriesList = async () => {
  const { data: repositories, error } =
    await getMainRepositoriesWithStudentInfo();
  revalidatePath("/");
  if (error) {
    return <div>Error loading repositories: {error.message}</div>;
  }

  const handleDelete = async (mainRepoId: string) => {
    "use server";
    await deleteMainRepository(mainRepoId);
    revalidatePath("/");
  };

  const getStateStyles = (state: string) => {
    switch (state) {
      case "opened":
        return "text-green-800";
      case "closed":
        return "text-red-800";
      case "opened":
      default:
        return "text-green-800";
    }
  };

  const handleRemoveAccess = async (
    students: StudentInfo[],
    mainRepoId: string
  ): Promise<{ error: { message: string } | null }> => {
    "use server";
    const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
    const octokit = new Octokit({ auth: token });
    const owner = process.env.NEXT_PUBLIC_ORG ?? "";

    try {
      await Promise.all(
        students.map(async (student) => {
          if (student.student.studentGithub) {
            console.log(
              `Removing collaborator ${student.student.studentGithub} from repo ${student.studentRepoName}`
            );

            const { data: invitations } = await octokit.repos.listInvitations({
              owner: owner,
              repo: student.studentRepoName.toString() ?? "",
            });

            const studentInvite = invitations.find(
              (invite) =>
                invite.invitee?.login === student.student.studentGithub
            );

            if (studentInvite) {
              await octokit.repos.deleteInvitation({
                owner: owner,
                repo: student.studentRepoName.toString() ?? "",
                invitation_id: studentInvite.id,
              });
              console.log(
                `Removed invitation for ${student.student.studentGithub}`
              );
            } else {
              await octokit.repos
                .removeCollaborator({
                  owner: owner,
                  repo: student.studentRepoName.toString() ?? "",
                  username: student.student.studentGithub,
                })
                .catch((error) => {
                  console.error(
                    `Error removing collaborator ${student.student.studentGithub} from repo ${student.studentRepoName}:`,
                    error
                  );
                  throw error;
                });
              console.log(
                `Removed collaborator access for ${student.student.studentGithub}`
              );
            }
          }
        })
      );
      await updateMainRepositoryStatusById(mainRepoId, "closed");
      revalidatePath("/");

      return { error: null };
    } catch (error) {
      console.error("Error removing access from all students:", error);
      return {
        error: { message: "Failed to remove access from all students." },
      };
    }
  };

  const handleGrantAccess = async (
    students: StudentInfo[],
    mainRepoId: string
  ): Promise<{ error: { message: string } | null }> => {
    "use server";
    const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
    const octokit = new Octokit({ auth: token });
    const owner = process.env.NEXT_PUBLIC_ORG ?? "";

    try {
      await Promise.all(
        students.map(async (student) => {
          if (student.student.studentGithub) {
            console.log(
              `Adding collaborator ${student.student.studentGithub} to repo ${student.studentRepoName}`
            );

            await octokit.repos
              .addCollaborator({
                owner: owner,
                repo: student.studentRepoName.toString() ?? "",
                username: student.student.studentGithub,
                permission: "push",
              })
              .catch((error) => {
                console.error(
                  `Error adding collaborator ${student.student.studentGithub} to repo ${student.studentRepoName}:`,
                  error
                );
                throw error;
              });
          }
        })
      );
      await updateMainRepositoryStatusById(mainRepoId, "opened");
      revalidatePath("/");

      return { error: null };
    } catch (error) {
      console.error("Error granting access to all students:", error);
      return {
        error: { message: "Failed to grant access to all students." },
      };
    }
  };

  return (
    <div>
      <Table className="w-full max-h-[600px] overflow-y-scroll">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>State</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {repositories.map((request) => (
            <TableRow key={request.mainRepositoryId}>
              <TableCell>
                <div className="font-medium">{request.mainRepositoryName}</div>
              </TableCell>
              <TableCell>
                <div className="font-medium">
                  {new Date(
                    request.mainRepositoriesCreatedAt
                  ).toLocaleDateString()}
                </div>
              </TableCell>
              <TableCell>
                <div
                  className={`${getStateStyles(request.mainRepositoryStatus)}`}
                >
                  {request.mainRepositoryStatus.charAt(0).toUpperCase() +
                    request.mainRepositoryStatus.slice(1)}
                </div>{" "}
              </TableCell>
              <TableCell className="flex justify-end gap-2">
                {/* Action buttons */}
                <AlertDialog>
                  <AlertDialogTrigger>
                    <div
                      className={`p-2 px-4 flex gap-2 items-center justify-center rounded ${
                        request.mainRepositoryStatus === "closed"
                          ? "bg-green-400 text-success-foreground hover:bg-green-400/90"
                          : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      }`}
                    >
                      {request.mainRepositoryStatus === "closed" ? (
                        <LockOpen className="h-4 w-4" />
                      ) : (
                        <FileLock className="h-4 w-4" />
                      )}
                      {request.mainRepositoryStatus === "closed"
                        ? "Grant access"
                        : "Remove access"}
                    </div>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action will{" "}
                        {request.mainRepositoryStatus === "closed"
                          ? "grant"
                          : "remove"}{" "}
                        access for the students.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <form
                        action={async () => {
                          "use server";
                          if (request.mainRepositoryStatus === "closed") {
                            await handleGrantAccess(
                              request.students,
                              request.mainRepositoryId
                            );
                          } else {
                            await handleRemoveAccess(
                              request.students,
                              request.mainRepositoryId
                            );
                          }
                          revalidatePath("/");
                        }}
                      >
                        <AlertDialogAction type="submit">
                          Confirm
                        </AlertDialogAction>
                      </form>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <AlertDialog>
                  <AlertDialogTrigger>
                    <div className="p-2 px-4 flex gap-2 items-center justify-center rounded bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      <Trash className="h-4 w-4" />
                      Delete
                    </div>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the data from the server.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <form
                        action={async () => {
                          "use server";
                          await handleDelete(request.mainRepositoryId);
                          revalidatePath("/");
                        }}
                      >
                        <AlertDialogAction type="submit">
                          Confirm
                        </AlertDialogAction>
                      </form>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RepositoriesList;
