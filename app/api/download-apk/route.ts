import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    const apkPath = path.join(process.cwd(), "public", "downloads", "san-enrique-rotc.apk");

    if (!fs.existsSync(apkPath)) {
      return NextResponse.json(
        { error: "APK file not found. Please contact the administrator." },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(apkPath);
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.android.package-archive",
        "Content-Disposition": 'attachment; filename="san-enrique-rotc.apk"',
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to download APK", details: err.message },
      { status: 500 }
    );
  }
}

