
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

      let customClaims: { organizationId?: string; role?: string } = {};

      // Check the user document first, as it should be the primary source of truth after signup
      const userDocRef = adminDoc(db, 'users', uid);
      const userDoc = await getAdminDoc(userDocRef);

      if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData && userData.organizationId) {
            customClaims.organizationId = userData.organizationId;
            
            // Now, check the staff document within that organization to get the role
            const staffDocRef = adminDoc(db, `organizations/${userData.organizationId}/staff`, uid);
            const staffDoc = await getAdminDoc(staffDocRef);

            if (staffDoc.exists()) {
                const staffData = staffDoc.data();
                customClaims.role = staffData?.role || 'Member';
            } else {
                 // Fallback to role on user document if staff doc doesn't exist for some reason
                 customClaims.role = userData.role || 'Member';
            }
          }
      }
      
      // If we found an organization, we must set the custom claims for the user
      // This makes subsequent token verifications faster
      if (Object.keys(customClaims).length > 0 && customClaims.organizationId) {
        await getAuth(app).setCustomUserClaims(uid, customClaims);
      } else {
        // If no organization is found after all checks, we cannot create a valid session
        return new NextResponse('User not associated with an organization', { status: 403 });
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
