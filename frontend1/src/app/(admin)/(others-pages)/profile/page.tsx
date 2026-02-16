import UserAddressCard from "@/components/user-profile/UserAddressCard";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import UserPasswordCard from "@/components/user-profile/UserPasswordCard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | TimetableScheduler",
  description: "User Profile Page for TimetableScheduler Admin Dashboard",
};

export default function Profile() {
  return (
    <>
      <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6 2xl:p-10">
        <div className="mx-auto max-w-[1070px]">
          <h3 className="mb-5 text-2xl font-bold text-gray-800 dark:text-white/90 lg:mb-7">
            Profile
          </h3>

          <div className="flex flex-col gap-5 lg:gap-6">
            <UserMetaCard />
            <UserInfoCard />
            <UserAddressCard />
            <UserPasswordCard />
          </div>
        </div>
      </div>
    </>
  );
}
