import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { CustomBreadCrumb } from "./custom-bread-crumb";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Headings } from "./headings";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { chatSession } from "@/scripts";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/config/firebase.config";
import {
  BriefcaseIcon,
  DocumentTextIcon,
  ClockIcon,
  CodeBracketIcon,
  ArrowPathIcon,
  TrashIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const formSchema = z.object({
  position: z.string().min(1, "Position is required").max(100),
  description: z.string().min(10, "Description is required"),
  experience: z.coerce.number().min(0, "Experience cannot be negative"),
  techStack: z.string().min(1, "Tech stack is required"),
});

const FieldIcon = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-2 text-neutral-300 text-sm font-bold tracking-wide">
    <Icon className="w-4 h-4 text-orange-400" />
    {label}
  </div>
);

export const FormMockInterview = ({ initialData }) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {},
  });

  const { isValid, isSubmitting } = form.formState;
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const userId = user?._id;

  const title = initialData ? initialData.position : "Create a New Interview";
  const breadCrumpPage = initialData ? initialData?.position : "Create";
  const actions = initialData ? "Save Changes" : "Generate Interview";

  const cleanAiResponse = (responseText) => {
    let cleanText = responseText.trim();

    // Try direct parse first (works when responseMimeType is application/json)
    try {
      const parsed = JSON.parse(cleanText);
      if (Array.isArray(parsed)) return parsed;
      // If Gemini wraps it in an object, try to find the array inside
      const keys = Object.keys(parsed);
      for (const key of keys) {
        if (Array.isArray(parsed[key])) return parsed[key];
      }
    } catch {
      // Not valid JSON yet, try cleaning
    }

    // Fallback: strip markdown code fences and extract array
    cleanText = cleanText.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();
    const jsonArrayMatch = cleanText.match(/\[[\s\S]*\]/);
    if (jsonArrayMatch) {
      try {
        return JSON.parse(jsonArrayMatch[0]);
      } catch (error) {
        throw new Error("Invalid JSON format: " + error?.message);
      }
    }

    throw new Error("No JSON array found in response");
  };

  const generateAiResponse = async (data) => {
    const prompt = `
        Generate a JSON array of 8 technical interview questions with concise answers (2-4 sentences each) based on this job info:

        - Position: ${data?.position}
        - Description: ${data?.description}
        - Experience: ${data?.experience} years
        - Tech Stack: ${data?.techStack}

        Return ONLY a JSON array like: [{"question": "...", "answer": "..."}]
        Keep answers brief but informative. No markdown, no code blocks, no extra text.
        `;

    const aiResult = await chatSession.sendMessage(prompt);
    return cleanAiResponse(aiResult.response.text());
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      if (initialData) {
        if (isValid) {
          const aiResult = await generateAiResponse(data);
          await updateDoc(doc(db, "interviews", initialData?.id), {
            questions: aiResult,
            ...data,
            updatedAt: serverTimestamp(),
          }).catch(console.log);
          toast("Updated!", { description: "Changes saved successfully." });
        }
      } else {
        if (isValid) {
          const aiResult = await generateAiResponse(data);
          await addDoc(collection(db, "interviews"), {
            ...data,
            userId,
            questions: aiResult,
            createdAt: serverTimestamp(),
          });
          toast("Created!", { description: "Your mock interview is ready." });
        }
      }
      navigate("/mock-interview", { replace: true });
    } catch (error) {
      console.log(error);
      toast.error("Error", { description: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      form.reset({
        position: initialData.position,
        description: initialData.description,
        experience: initialData.experience,
        techStack: initialData.techStack,
      });
    }
  }, [initialData, form]);

  return (
    <div className="w-full flex-col space-y-6 animate-fade-in">
      <CustomBreadCrumb
        breadCrumbPage={breadCrumpPage}
        breadCrumpItems={[{ label: "Mock Interviews", link: "/mock-interview" }]}
      />

      <div className="flex items-center justify-between w-full">
        <Headings title={title} isSubHeading />
        {initialData && (
          <button className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all">
            <TrashIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />

      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full glass-panel rounded-2xl p-8 flex flex-col gap-6 border border-white/5"
        >
          {/* Position */}
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem className="w-full space-y-2">
                <div className="flex items-center justify-between">
                  <FormLabel>
                    <FieldIcon icon={BriefcaseIcon} label="Job Role / Position" />
                  </FormLabel>
                  <FormMessage className="text-xs text-red-400 font-bold" />
                </div>
                <FormControl>
                  <Input
                    className="h-12 bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 rounded-xl transition-all"
                    disabled={loading}
                    placeholder="e.g. Full Stack Developer"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="w-full space-y-2">
                <div className="flex items-center justify-between">
                  <FormLabel>
                    <FieldIcon icon={DocumentTextIcon} label="Job Description" />
                  </FormLabel>
                  <FormMessage className="text-xs text-red-400 font-bold" />
                </div>
                <FormControl>
                  <Textarea
                    className="min-h-[100px] bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 rounded-xl resize-none transition-all"
                    disabled={loading}
                    placeholder="e.g. Building scalable web applications using React and Node.js..."
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Experience */}
          <FormField
            control={form.control}
            name="experience"
            render={({ field }) => (
              <FormItem className="w-full space-y-2">
                <div className="flex items-center justify-between">
                  <FormLabel>
                    <FieldIcon icon={ClockIcon} label="Years of Experience" />
                  </FormLabel>
                  <FormMessage className="text-xs text-red-400 font-bold" />
                </div>
                <FormControl>
                  <Input
                    type="number"
                    className="h-12 bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 rounded-xl transition-all"
                    disabled={loading}
                    placeholder="e.g. 3"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Tech Stack */}
          <FormField
            control={form.control}
            name="techStack"
            render={({ field }) => (
              <FormItem className="w-full space-y-2">
                <div className="flex items-center justify-between">
                  <FormLabel>
                    <FieldIcon icon={CodeBracketIcon} label="Tech Stacks" />
                  </FormLabel>
                  <FormMessage className="text-xs text-red-400 font-bold" />
                </div>
                <FormControl>
                  <Textarea
                    className="min-h-[80px] bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 rounded-xl resize-none transition-all"
                    disabled={loading}
                    placeholder="e.g. React, TypeScript, Node.js, MongoDB..."
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="reset"
              disabled={isSubmitting || loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Reset
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isValid || loading}
              className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-black bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-black transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4" />
                  {actions}
                </>
              )}
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};
