import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        // Ye line aapke .env file se password uthayegi
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            return NextResponse.json(
                { error: 'Admin credentials not configured' },
                { status: 500 }
            );
        }

        if (email === adminEmail && password === adminPassword) {
            const adminUser = {
                id: 'admin-super-user', 
                email: adminEmail,
                name: 'Super Administrator',
                role: 'admin',
                emailVerified: true,
                isAdmin: true 
            };
            return NextResponse.json(adminUser, { status: 200 });
        }

        return NextResponse.json({ error: 'Not admin credentials' }, { status: 401 });
    } catch (error) {
        console.error('Admin check error:', error);
        return NextResponse.json({ error: 'Failed to check admin credentials' }, { status: 500 });
    }
}