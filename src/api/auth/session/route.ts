
import {NextResponse, type NextRequest} from 'next/server';
import {getAuth} from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import {app} from '@/lib/firebase/admin';

const db = getFirestore(app);

export async function POST(request: NextRequest) {
  const authorization = request.headers.get('Authorization');
  if (authorization?.startsWith('Bearer ')) {
    const idToken = authorization.split('Bearer ')[1];
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

    try {
      const decodedToken = await getAuth(app).verifyIdToken(idToken);
      const { uid } = decodedToken;

      // Check if user exists in our own user management system
      const userDoc = await db.collection('users').doc(uid).get();

      let customClaims: { organizationId?: string; role?: string } = {};

      if (userDoc.exists) {
          const userData = userDoc.data();
          if (userData && userData.organizationId) {
            customClaims.organizationId = userData.organizationId;
            customClaims.role = userData.role || 'Member'; // Default to member if no role
          }
      }
      
      // Set custom claims on the user's token
      await getAuth(app).setCustomUserClaims(uid, customClaims);
      
      const sessionCookie = await getAuth(app).createSessionCookie(idToken, {
        expiresIn,
      });

      const options = {
        name: 'session',
        value: sessionCookie,
        maxAge: expiresIn,
        httpOnly: true,
        secure: true,
      };

      const response = NextResponse.json({ status: 'success', organizationId: customClaims.organizationId });
      response.cookies.set(options);
      return response;

    } catch (error) {
      console.error('Error creating session:', error);
      return new NextResponse('Unauthorized', {status: 401});
    }
  }

  return new NextResponse('Invalid authorization header', {status: 400});
}


export async function DELETE() {
  const options = {
    name: 'session',
    value: '',
    maxAge: -1, // Expire the cookie immediately
  };
  
  const response = new NextResponse('Session deleted', { status: 200 });
  response.cookies.set(options);
  return response;
}
