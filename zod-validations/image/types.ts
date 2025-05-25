import { z } from "zod";
import { imageSchema } from "./schema";

export type ImageInput = z.infer<typeof imageSchema>;