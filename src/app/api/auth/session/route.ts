
import {NextResponse, type NextRequest} from 'next/server';
import {getAuth} from 'firebase-admin/auth';
import { getFirestore, doc as adminDoc, getDoc as getAdminDoc } from 'firebase-admin/firestore';
import { initializeApp, getApps, getApp, App, cert } from 'firebase-admin/app';


// It's important to check if the app is already initialized to avoid errors.
let app: App;
if (!getApps().length) {
  const serviceAccountString = process.env.FIREBASE_ADMIN_SDK_CONFIG_BASE64
    ? Buffer.from(process.env.FIREBASE_ADMIN_SDK_CONFIG_BASE64, 'base64').toString('utf-8')
    : '{}';

  try {
    const serviceAccount = JSON.parse(serviceAccountString);
    app = initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (error) {
    console.error('Error parsing Firebase Admin SDK config:', error);
    app = initializeApp();
  }

} else {
  app = getApp();
}

const db = getFirestore(app);

export async function POST(request: NextRequest) {
  const authorization = request.headers.get('Authorization');
  if (authorization?.startsWith('Bearer ')) {
    const idToken = authorization.split('Bearer ')[1];
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

    try {
      const decodedToken = await getAuth(app).verifyIdToken(idToken);
      const { uid } = decodedToken;

      const userDocRef = adminDoc(db, 'users', uid);
      const userDoc = await getAdminDoc(userDocRef);

      let customClaims: { organizationId?: string; role?: string } = {};

      if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData && userData.organizationId) {
            customClaims.organizationId = userData.organizationId;
            
            // The user's role is stored in the staff document within their organization.
            const staffDocRef = adminDoc(db, `organizations/${userData.organizationId}/staff`, uid);
            const staffDoc = await getAdminDoc(staffDocRef);

            if (staffDoc.exists()) {
                const staffData = staffDoc.data();
                customClaims.role = staffData?.role || 'Member'; // Default to 'Member' if role is missing
            } else {
                 // This case might happen if a user exists but isn't a staff member.
                 // We can assign a default role or handle as an error.
                 // For now, let's fall back to the role on the user doc if it exists, otherwise 'Member'.
                 customClaims.role = userData.role || 'Member';
            }
          }
      }
      
      // If we determined claims, set them on the user's auth token
      if (Object.keys(customClaims).length > 0) {
        await getAuth(app).setCustomUserClaims(uid, customClaims);
      }
      
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

      // The response now includes the organizationId which the client needs for routing.
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
