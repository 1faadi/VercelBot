import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// import { hash } from 'bcryptjs'; // Optional for now

export async function POST(req: Request) {
  try {
    const { name, email, password, phone } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password, // store directly for now (we'll hash later)
        phone,
      },
    });
console.log("user creted", user)
    return NextResponse.json({
      message: 'User created',
      user: {
        id: user.id,
        email: user.email,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('[REGISTER_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const allusers = await prisma.user.findMany();
  return NextResponse.json(allusers);
}
