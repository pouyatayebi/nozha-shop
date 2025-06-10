// app/api/deleteImage/route.ts
import { utapi } from "@/lib/uploadthing";
import { NextResponse } from "next/server";




export async function DELETE(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) return new NextResponse("URL is required", { status: 400 });

    const key = url.substring(url.lastIndexOf("/") + 1);
    await utapi.deleteFiles([key]);

    return NextResponse.json({ message: "File deleted", key }, { status: 200 });
  } catch (e) {
    console.error("🚨 deleteImage route error:", e);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
