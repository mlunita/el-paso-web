import { StaffForm } from "../client-form";

export default function CreateStaffPage() {
  return (
    <div>
      <div className="mb-8 border-b border-white/20 pb-4">
        <h1 className="text-3xl font-black">Add Staff Member</h1>
        <p className="text-zinc-500 text-sm mt-1">Create a new staff member to display on the staff page.</p>
      </div>
      <StaffForm />
    </div>
  );
}
