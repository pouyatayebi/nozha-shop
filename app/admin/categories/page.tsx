// "use client";

// import { useState } from "react";
// import CategoryForm from "@/components/forms/category-form";
// import CategoryTable from "@/components/tables/category-table";
// import { Category } from "@/lib/generated/prisma";


// export default function CategoriesPage() {
//   const [editing, setEditing] = useState<Category | null>(null);

//   const handleSuccess = () => setEditing(null);

//   return (
//     <div className="space-y-6 p-4">
//       <CategoryForm
//         editMode={!!editing}
//         defaultValues={editing ?? undefined}
//         onSuccess={handleSuccess}
//       />
//       <CategoryTable onEdit={setEditing} />
//     </div>
//   );
// }
// app/admin/categories/page.tsx

import CategoryForm from "@/components/forms/category-form";
import CategoryTable from "@/components/tables/category-table";

export default function CategoriesPage() {
  return (
    <div className="space-y-6 p-4">
      <CategoryForm />
      <CategoryTable />
    </div>
  );
}

