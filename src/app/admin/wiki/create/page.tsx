import { WikiForm } from "../client-form";

export default function CreateWikiPage() {
  return (
    <div>
      <div className="mb-8 border-b border-white/20 pb-4">
        <h1 className="text-3xl font-black">Add Wiki Item</h1>
        <p className="text-zinc-500 text-sm mt-1">Create a new item to display on the public wiki page.</p>
      </div>
      <WikiForm />
    </div>
  );
}
