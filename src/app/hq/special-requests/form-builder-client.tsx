"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, GripVertical, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { adminCreateSpecialRequestForm, adminUpdateSpecialRequestForm } from "../special-requests-actions";

export type FormField = {
  id: string;
  label: string;
  type: "text" | "textarea" | "select";
  required: boolean;
  options?: string[];
};

interface FormBuilderProps {
  initialData?: {
    id: string;
    title: string;
    description: string | null;
    isActive: boolean;
    fields: string;
  };
}

export function FormBuilderClient({ initialData }: FormBuilderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  
  const [fields, setFields] = useState<FormField[]>(() => {
    if (initialData?.fields) {
      try { return JSON.parse(initialData.fields); } catch(e) { return []; }
    }
    return [];
  });

  const addField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      label: "New Field",
      type: "text",
      required: true,
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (fields.length === 0) {
      setError("At least one custom field is required");
      return;
    }

    startTransition(async () => {
      setError("");
      const payload = {
        title,
        description,
        isActive,
        fields: JSON.stringify(fields),
      };

      let res;
      if (initialData) {
        res = await adminUpdateSpecialRequestForm(initialData.id, payload);
      } else {
        res = await adminCreateSpecialRequestForm(payload);
      }

      if (res.success) {
        router.push("/hq/special-requests");
      } else {
        setError(res.error || "Failed to save form");
      }
    });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto animate-in fade-in duration-500">
      <Link href="/hq/special-requests" className="inline-flex items-center text-[var(--ep-text-muted)] hover:text-white transition-colors mb-6 text-sm font-bold">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Forms
      </Link>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-[family-name:var(--font-heading)] font-bold text-white mb-2">
            {initialData ? "Edit Form" : "Create Special Request Form"}
          </h1>
          <p className="text-[var(--ep-text-muted)] text-sm">
            Configure the form title and define custom input fields.
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isPending}
          className="bg-[var(--ep-accent)] hover:bg-[var(--ep-accent-hover)] text-black font-bold"
        >
          <Save className="w-4 h-4 mr-2" />
          {isPending ? "Saving..." : "Save Form"}
        </Button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-8 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card className="ep-card-elevated p-6 border-[var(--ep-border)]">
            <h3 className="font-bold text-white mb-4">Basic Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--ep-text-muted)] mb-1 uppercase tracking-wider">Form Title</label>
                <Input 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. LSPD Transfer Request"
                  className="bg-[var(--ep-bg-deep)] border-[var(--ep-border)] text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--ep-text-muted)] mb-1 uppercase tracking-wider">Description</label>
                <Textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description for users..."
                  className="bg-[var(--ep-bg-deep)] border-[var(--ep-border)] text-white h-24"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-[var(--ep-bg-deep)]"
                />
                <label htmlFor="isActive" className="text-sm text-white font-medium">Active (Visible to users)</label>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-[var(--ep-border)]">
              <div className="bg-[var(--ep-bg-hover)] p-4 rounded-lg border border-[var(--ep-border)]">
                <h4 className="text-sm font-bold text-white mb-1">Default Fields</h4>
                <p className="text-xs text-[var(--ep-text-muted)] mb-2">These fields are automatically included in every form:</p>
                <ul className="text-xs space-y-1 text-[var(--ep-text-secondary)] list-disc list-inside">
                  <li>Discord Username (Required)</li>
                  <li>Roblox Username (Required)</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-white text-lg">Custom Fields</h3>
            <Button onClick={addField} size="sm" variant="outline" className="bg-[var(--ep-bg-deep)] border-[var(--ep-border)] text-white hover:bg-[var(--ep-bg-hover)]">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Field
            </Button>
          </div>

          {fields.length === 0 ? (
            <div className="ep-card-elevated border-dashed border-2 border-[var(--ep-border)] p-12 text-center rounded-xl">
              <p className="text-[var(--ep-text-muted)] font-medium">No custom fields added yet.</p>
              <Button onClick={addField} variant="link" className="text-[var(--ep-accent)] mt-2">Click here to add one</Button>
            </div>
          ) : (
            fields.map((field, index) => (
              <Card key={field.id} className="ep-card-elevated p-5 border-[var(--ep-border)] flex gap-4">
                <div className="pt-2 text-[var(--ep-text-muted)] cursor-move">
                  <GripVertical className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-8">
                      <label className="block text-xs font-bold text-[var(--ep-text-muted)] mb-1 uppercase tracking-wider">Field Label</label>
                      <Input 
                        value={field.label}
                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                        className="bg-[var(--ep-bg-deep)] border-[var(--ep-border)] text-white"
                      />
                    </div>
                    <div className="col-span-4">
                      <label className="block text-xs font-bold text-[var(--ep-text-muted)] mb-1 uppercase tracking-wider">Field Type</label>
                      <select 
                        value={field.type}
                        onChange={(e) => updateField(field.id, { type: e.target.value as any })}
                        className="w-full h-10 rounded-md bg-[var(--ep-bg-deep)] border-[var(--ep-border)] text-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ep-accent)]"
                      >
                        <option value="text">Short Text</option>
                        <option value="textarea">Long Text</option>
                        <option value="select">Dropdown</option>
                      </select>
                    </div>
                  </div>

                  {field.type === "select" && (
                    <div>
                      <label className="block text-xs font-bold text-[var(--ep-text-muted)] mb-1 uppercase tracking-wider">Dropdown Options (Comma separated)</label>
                      <Input 
                        value={field.options?.join(", ") || ""}
                        onChange={(e) => updateField(field.id, { options: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                        placeholder="Option 1, Option 2, Option 3"
                        className="bg-[var(--ep-bg-deep)] border-[var(--ep-border)] text-white"
                      />
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t border-[var(--ep-border)]">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id={`req_${field.id}`}
                        checked={field.required}
                        onChange={(e) => updateField(field.id, { required: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-600 bg-[var(--ep-bg-deep)]"
                      />
                      <label htmlFor={`req_${field.id}`} className="text-xs text-[var(--ep-text-secondary)] font-medium">Required Field</label>
                    </div>
                    <button onClick={() => removeField(field.id)} className="text-red-400 hover:text-red-300 text-xs font-bold flex items-center">
                      <Trash2 className="w-3 h-3 mr-1" />
                      Remove
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
