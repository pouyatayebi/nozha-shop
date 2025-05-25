import { z } from "zod";
import { fileSchema } from "../shared/fileSchema";

export const imageSchema = z.object({
  alt: z.string().min(1, "توضیح alt تصویر الزامی است."),
  file: fileSchema,
});