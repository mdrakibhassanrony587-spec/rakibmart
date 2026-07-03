import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { employees } from "@/db/schema";
import { desc, sql, eq } from "drizzle-orm";
import { verifyToken } from "@/lib/auth";

function getToken(request: NextRequest): string | null {
  const auth = request.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  return auth.substring(7);
}

export async function GET(request: NextRequest) {
  const token = getToken(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const role = searchParams.get("role");

    const conditions = [];
    if (status && status !== "all") {
      conditions.push(eq(employees.status, status));
    }
    if (role && role !== "all") {
      conditions.push(eq(employees.role, role));
    }

    let result;
    if (conditions.length > 0) {
      result = await db
        .select()
        .from(employees)
        .where(conditions.length === 1 ? conditions[0] : sql`${conditions[0]} AND ${conditions[1]}`)
        .orderBy(desc(employees.createdAt));
    } else {
      result = await db.select().from(employees).orderBy(desc(employees.createdAt));
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const token = getToken(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, email, phone, role, department, salary, address, image, joiningDate } = body;

    if (!name || !email || !phone || !role) {
      return NextResponse.json({ error: "Name, email, phone and role are required" }, { status: 400 });
    }

    const [employee] = await db
      .insert(employees)
      .values({
        name,
        email,
        phone,
        role,
        department: department || "",
        salary: salary ? parseFloat(salary).toFixed(2) : null,
        address: address || "",
        image: image || "",
        joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
        status: "active",
      })
      .returning();

    return NextResponse.json(employee);
  } catch (error) {
    console.error("Error creating employee:", error);
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 });
  }
}
