import bcrypt from "bcryptjs";
import { z } from "zod";
import { getEmployeeByEmail } from "@/server/repositories/employees";
import { buildSessionUser, createSession } from "@/server/auth/session";

const LoginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const emp = getEmployeeByEmail(parsed.data.email);
  // Same response for wrong email or wrong password (no account enumeration).
  if (!emp || !bcrypt.compareSync(parsed.data.password, emp.passwordHash)) {
    return Response.json(
      { success: false, error: "Email or password is incorrect" },
      { status: 401 }
    );
  }

  await createSession(emp.id);
  return Response.json({ success: true, data: buildSessionUser(emp) });
}
