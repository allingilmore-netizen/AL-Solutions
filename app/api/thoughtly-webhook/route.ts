import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // 👇 Wrap your data inside a `payload` object for Thoughtly
    const thoughtlyBody = { payload };

    const res = await fetch(process.env.THOUGHTLY_WEBHOOK_URL as string, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-token": process.env.THOUGHTLY_API_TOKEN as string,
        "team_id": process.env.THOUGHTLY_TEAM_ID as string,
        "user_id": process.env.THOUGHTLY_USER_ID as string,
      },
      body: JSON.stringify(thoughtlyBody),
    });

    const text = await res.text();

    if (!res.ok) {
      console.error("Thoughtly webhook error:", res.status, text);
      return NextResponse.json(
        {
          ok: false,
          error: "Thoughtly webhook failed",
          status: res.status,
          detail: text,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      detail: text || "Thoughtly webhook success",
    });
  } catch (err) {
    console.error("Error in /api/thoughtly-webhook:", err);
    return NextResponse.json(
      { ok: false, error: "Server error sending to Thoughtly" },
      { status: 500 }
    );
  }
}
