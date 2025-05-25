
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

export function CreateSeoFormAccordion({ form }: { form: any }) {
  return (
    <AccordionItem value="seo">
      <AccordionTrigger>اطلاعات سئو (اختیاری)</AccordionTrigger>
      <AccordionContent>
        <FormField
          control={form.control}
          name="seo.title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>عنوان سئو</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="seo.description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>توضیح سئو</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </AccordionContent>
    </AccordionItem>
  );
}
