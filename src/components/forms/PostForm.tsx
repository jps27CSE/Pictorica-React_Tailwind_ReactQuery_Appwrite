import * as nsfwjs from "nsfwjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react"; // Import useState for managing state
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea.tsx";
import FileUploader from "@/components/shared/FileUploader.tsx";
import { PostValidation } from "@/lib/validation";
import { Models } from "appwrite";
import { useUserContext } from "@/context/AuthContext.tsx";
import { useToast } from "@/components/ui/use-toast.ts";
import { useNavigate } from "react-router-dom";
import {
  useCreatePost,
  useUpdatePost,
} from "@/lib/react-query/queriesAndMutations.ts";

type PostFormProps = {
  post?: Models.Document;
  action: "Create" | "Update";
};

const PostForm = ({ post, action }: PostFormProps) => {
  const { mutateAsync: createPost, isPending: isLoadingCreate } =
    useCreatePost();

  const { mutateAsync: updatePost, isPending: isLoadingUpdate } =
    useUpdatePost();

  const { user } = useUserContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [captionInput, setCaptionInput] = useState("");
  const [isImageSafe, setIsImageSafe] = useState(true);

  const form = useForm<z.infer<typeof PostValidation>>({
    resolver: zodResolver(PostValidation),
    defaultValues: {
      caption: post ? post?.caption : "",
      file: [],
      location: post ? post.location : "",
      tags: post ? post.tags.join(",") : "",
    },
  });

  const handleCaptionChange = (value: string) => {
    setCaptionInput(value);
    form.setValue("caption", value);
  };

  const checkImageSafety = async (file: File) => {
    const model = await nsfwjs.load();
    const image = await loadImage(file); // Function to create an image from the file

    const predictions = await model.classify(image);

    const isNeutralOrDrawing =
      predictions[0].className === "Neutral" ||
      predictions[0].className === "Drawing";

    // Get the percentage of the first prediction
    const firstPredictionPercentage = predictions[0].probability;

    if (isNeutralOrDrawing) {
      setIsImageSafe(true);
      toast({
        title: "Image Checked",
        description: `Appropriate image detected with ${Math.round(firstPredictionPercentage * 100)}% confidence.`,
        variant: "success",
      });
    } else {
      setIsImageSafe(false);
      toast({
        title: "Image Checked",
        description: `Inappropriate image detected with ${Math.round(firstPredictionPercentage * 100)}% confidence. Please choose a different image or ensure that it is suitable for posting.`,
        variant: "error",
      });
    }
  };

  // Helper function to load image from file
  const loadImage = (file: File) => {
    return new Promise<HTMLImageElement>((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => resolve(img);
    });
  };

  async function onSubmit(values: z.infer<typeof PostValidation>) {
    if (!isImageSafe) {
      toast({
        title: "Image not safe for posting.",
        description: "Please choose a different image.",
        variant: "error",
      });
      return;
    }

    if (post && action === "Update") {
      const updatedPost = await updatePost({
        ...values,
        postId: post.$id,
        imageId: post?.imageId,
        imageUrl: post?.imageUrl,
      });

      if (!updatedPost) {
        toast({ title: "Please try again" });
      }
      return navigate(`/posts/${post.$id}`);
    }

    const newPost = await createPost({
      ...values,
      userId: user.id,
    });

    if (!newPost) {
      toast({
        title: "Please try again",
      });
    }

    navigate("/");
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-9 w-full max-w-5xl"
      >
        <FormField
          control={form.control}
          name="caption"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Caption</FormLabel>
              <FormControl>
                <Textarea
                  className="shad-textarea custom-scrollbar"
                  {...field}
                  onChange={(e) => handleCaptionChange(e.target.value)} // Update state on change
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        {/* Conditional Rendering for Grammar Check Button */}
        {captionInput && (
          <div className="flex justify-end">
            <Button
              type="button"
              className="shad-button_secondary"
              onClick={() => {
                // Logic for grammar checking can be implemented here
                toast({
                  title: "Grammar check functionality is not implemented yet.",
                });
              }}
            >
              Check Grammar
            </Button>
          </div>
        )}

        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Photos</FormLabel>
              <FormControl>
                <FileUploader
                  fieldChange={(file: File[]) => {
                    field.onChange(file);
                    if (file.length > 0) {
                      checkImageSafety(file[0]); // Check the first selected file for safety
                    }
                  }}
                  mediaUrl={post?.imageUrl}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Location</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input" {...field} />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">
                Add Tags (separated by comma ",")
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  className="shad-input"
                  placeholder="Tour, Blog, Article"
                  {...field}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <div className="flex gap-4 items-center justify-end">
          <Button type="button" className="shad-button_dark_4">
            Cancel
          </Button>
          <Button
            type="submit"
            className="shad-button_primary whitespace-nowrap"
            disabled={isLoadingCreate || isLoadingUpdate || !isImageSafe} // Disable if image is not safe
          >
            {isLoadingCreate || isLoadingUpdate ? "Loading...." : action} Post
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PostForm;
