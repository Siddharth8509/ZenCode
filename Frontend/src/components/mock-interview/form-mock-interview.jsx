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
  <div className="flex items-center gap-2 text-neutral-300 text-sm font-medium">
    <Icon className="w-4 h-4 text-red-400" />
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
    cleanText = cleanText.replace(/(json|```|`)/g, "");
    const jsonArrayMatch = cleanText.match(/\[.*\]/s);
    if (jsonArrayMatch) {
      cleanText = jsonArrayMatch[0];
    } else {
      throw new Error("No JSON array found in response");
    }
    try {
      return JSON.parse(cleanText);
    } catch (error) {
      throw new Error("Invalid JSON format: " + error?.message);
    }
  };

  const generateAiResponse = async (data) => {
    const prompt = `
        As an experienced prompt engineer, generate a JSON array containing 8 technical interview questions along with detailed answers based on the following job information. Each object in the array should have the fields "question" and "answer", formatted as follows:

        [
          { "question": "<Question text>", "answer": "<Answer text>" },
          ...
        ]

        Job Information:
        - Job Position: ${data?.position}
        - Job Description: ${data?.description}
        - Years of Experience Required: ${data?.experience}
        - Tech Stacks: ${data?.techStack}

        The questions should assess skills in ${data?.techStack} development and best practices, problem-solving, and experience handling complex requirements. Please format the output strictly as an array of JSON objects without any additional labels, code blocks, or explanations. Return only the JSON array with questions and answers.
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
          <button className="p-2 rounded-lg bg-red-950/20 border border-red-500/20 hover:bg-red-950/40 text-red-400 hover:text-red-300 transition-all">
            <TrashIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />

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
                  <FormMessage className="text-xs text-red-400" />
                </div>
                <FormControl>
                  <Input
                    className="h-12 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 focus:border-red-500/50 focus:ring-red-500/20 rounded-xl"
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
                  <FormMessage className="text-xs text-red-400" />
                </div>
                <FormControl>
                  <Textarea
                    className="min-h-[100px] bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 focus:border-red-500/50 focus:ring-red-500/20 rounded-xl resize-none"
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
                  <FormMessage className="text-xs text-red-400" />
                </div>
                <FormControl>
                  <Input
                    type="number"
                    className="h-12 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 focus:border-red-500/50 focus:ring-red-500/20 rounded-xl"
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
                  <FormMessage className="text-xs text-red-400" />
                </div>
                <FormControl>
                  <Textarea
                    className="min-h-[80px] bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 focus:border-red-500/50 focus:ring-red-500/20 rounded-xl resize-none"
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
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium border border-neutral-700 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:border-neutral-600 transition-all disabled:opacity-50"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Reset
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isValid || loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition-all shadow-md shadow-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
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
