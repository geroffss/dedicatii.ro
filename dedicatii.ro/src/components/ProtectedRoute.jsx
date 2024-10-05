import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';

const LoadingIndicator = () => (
	<div className="fixed inset-0 flex items-center justify-center bg-dedicatii-bg bg-opacity-90 z-50">
	  <div className="flex flex-col items-center justify-center text-center">
		<motion.div
		  className="w-16 h-16 border-4 border-dedicatii-button3 border-t-transparent rounded-full"
		  animate={{ rotate: 360 }}
		  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
		/>
		<motion.p
		  className="mt-4 text-white text-xl font-inter font-semibold"
		  initial={{ opacity: 0 }}
		  animate={{ opacity: 1 }}
		  transition={{ delay: 0.5 }}
		>
		  Se încarcă...
		</motion.p>
	  </div>
	</div>
  );

const ProtectedRoute = ({ element: Component, requiredRole, ...rest }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    return <LoadingIndicator />;
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