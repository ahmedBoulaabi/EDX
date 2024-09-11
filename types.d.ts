type UserRole = "admin" | "teacher" | "student";

type SetAtom<Args extends any[], Result> = (...args: Args) => Result;
