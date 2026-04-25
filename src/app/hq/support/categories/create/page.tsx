import { SupportCategoryForm } from "../../category-form";

export default function CreateSupportCategoryPage() {
  return (
    <div>
      <div className="mb-8 border-b border-white/20 pb-4">
        <h1 className="text-3xl font-black">Create Support Category</h1>
        <p className="text-zinc-500 text-sm mt-1">Create a polished section for FAQs, support notes, or internal newsroom updates.</p>
      </div>
      <SupportCategoryForm />
    </div>
  );
}
