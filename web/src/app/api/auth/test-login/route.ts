import { NextRequest, NextResponse } from 'next/server';

/**
 * Test Login Route - For development and testing only
 * Allows quick login with test credentials
 */
export async function POST(req: NextRequest) {
    try {
        const { userType } = await req.json();

        // Test credentials
        const testUsers = {
            admin: {
                uid: 'admin-test-user-001',
                email: 'admin@civic.ai',
                name: 'Test Admin',
                role: 'Admin',
                isAdmin: true,
                emailVerified: true,
            },
            citizen: {
                uid: 'citizen-test-user-001',
                email: 'testcitizen@civic.ai',
                name: 'Test Citizen',
                role: 'Citizen',
                isAdmin: false,
                emailVerified: true,
            },
        };

        const user = testUsers[userType as keyof typeof testUsers];

        if (!user) {
            return NextResponse.json(
                { error: `Invalid user type. Use 'admin' or 'citizen'` },
                { status: 400 }
            );
        }

        // Create response
        const response = NextResponse.json({
            success: true,
            user,
            message: `Test ${userType} login successful`,
        });

        // Set session cookie (HttpOnly for security)
        response.cookies.set({
            name: 'session_data',
            value: JSON.stringify(user),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        // Also set admin session flag if admin
        if (user.isAdmin) {
            response.cookies.set({
                name: 'admin_session',
                value: JSON.stringify(user),
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7, // 7 days
            });
        }

        return response;
    } catch (error) {
        console.error('Test login error:', error);
        return NextResponse.json(
            { error: 'Failed to process test login' },
            { status: 500 }
        );
    }
}

/**
 * GET - Return available test users
 */
export async function GET() {
    return NextResponse.json({
        message: 'Test Login Endpoint',
        usage: 'POST with { "userType": "admin" | "citizen" }',
        testUsers: [
            {
                type: 'admin',
                email: 'admin@civic.ai',
                description: 'Super Admin with full access',
            },
            {
                type: 'citizen',
                email: 'testcitizen@civic.ai',
                description: 'Regular citizen with limited access',
            },
        ],
    });
}
