import React from 'react';
import { Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const ProtectedRoute = ({ element: Component, requiredRole, ...rest }) => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
	const auth = getAuth();
	const db = getFirestore();
	const unsubscribe = onAuthStateChanged(auth, async (user) => {
	  if (user) {
		try {
		  const userDoc = await getDoc(doc(db, 'users', user.uid));
		  if (userDoc.exists()) {
			user.role = userDoc.data().role;
			setUser(user);
		  } else {
			setUser(null);
		  }
		} catch (error) {
		  console.error('Error fetching user role:', error);
		  setUser(null);
		}
	  } else {
		setUser(null);
	  }
	  setLoading(false);
	});

	return () => unsubscribe();
  }, []);

  if (loading) {
	return <div>Loading...</div>;
  }

  if (!user) {
	return <Navigate to="/" />;
  }

  if (user.role !== requiredRole) {
	return <Navigate to="/" />;
  }

  return <Component {...rest} />;
};

export default ProtectedRoute;