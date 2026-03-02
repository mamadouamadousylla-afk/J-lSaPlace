import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// MOCK: This would typically be verified against a Supabase auth session
// and a custom claim or 'is_admin' field in the 'users' table.
// For now, we allow access but this is where the protection logic goes.
export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    // Protect /admin routes
    if (path.startsWith('/admin')) {
        // In a real app we would check the session:
        // const session = await supabase.auth.getSession()
        // if (!session || !session.user.user_metadata.is_admin) return redirect('/')

        // For this step, we just let it pass so the user can see the UI.
        // We will enhance this when we hook up the full authentication.
        return NextResponse.next()
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*'],
}
