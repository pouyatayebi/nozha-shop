import { z } from "zod";
import { categorySchema } from "./schema";

export type CategoryInput = z.infer<typeof categorySchema>;