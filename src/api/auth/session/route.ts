
import {NextResponse, type NextRequest} from 'next/server';
import {getAuth} from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import {app} from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  const authorization = request.headers.get('Authorization');
  if (authorization?.startsWith('Bearer ')) {
    const idToken = authorization.split('Bearer ')[1];
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

    try {
      const decodedToken = await getAuth(app).verifyIdToken(idToken);
      const { email, uid } = decodedToken;
      
      const db = getFirestore(app);
      const staffRef = db.collection('staff');
      const querySnapshot = await staffRef.where('email', '==', email).limit(1).get();

      let role = 'user'; // Default role
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        role = userDoc.data().role === 'Administrator' ? 'admin' : 'user';
      }
      
      await getAuth(app).setCustomUserClaims(uid, { role });

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

      const response = new NextResponse('Session created', { status: 200 });
      response.cookies.set(options);
      return response;

    } catch (error) {
       console.error('Error creating session cookie:', error);
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
