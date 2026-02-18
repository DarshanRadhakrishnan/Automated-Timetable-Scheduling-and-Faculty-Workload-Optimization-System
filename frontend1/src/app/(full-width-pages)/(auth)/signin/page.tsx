import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Timetable Scheduling System",
  description: "Faculty Login for Automated Timetable Scheduling and Faculty Workload Optimization System",
};

export default function SignIn() {
  return <SignInForm />;
}
