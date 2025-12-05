import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Read JSON coming from your form
    const payload = await req.json();

    // Call Thoughtly webhook
    const res = await fetch(process.env.THOUGHTLY_WEBHOOK_URL as string, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-token": process.env.THOUGHTLY_API_TOKEN as string,
        "team_id": process.env.THOUGHTLY_TEAM_ID as string,
        // Optional: include user id if you want them to have it
        "user_id": process.env.THOUGHTLY_USER_ID as string,
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text(); // grab response text for debugging

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
