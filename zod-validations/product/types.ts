import { z } from "zod";
import { productSchema } from "./schema";

export type ProductInput = z.infer<typeof productSchema>;