/* eslint-disable no-unused-vars */
//client/src/pages/auth/register.jsx
import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { registerFormControls } from "@/config";
import { useState } from "react";
import { Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase";
import { AuthProviders } from "@/components/auth/auth-providers";

const initialState = {
  userName: "",
  email: "",
  password: "",
};

function AuthRegister() {
  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);

    try {
      // First, try to create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Get Firebase ID token
      const idToken = await userCredential.user.getIdToken();

      // Register with backend using Firebase token
      const response = await fetch('/api/auth/firebase-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          userName: formData.userName,
          email: formData.email,
          firebaseUid: userCredential.user.uid
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Account created successfully!",
          description: "You will be redirected shortly."
        });
        // Don't manually navigate - let the auth state change handle it
        // The Firebase auth state listener in App.jsx will handle the redirect
      } else {
        // If backend registration fails, delete the Firebase user
        await userCredential.user.delete();
        throw new Error(data.message || 'Registration failed');
      }

    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Create new account
        </h1>
        <p className="mt-2">
          Already have an account
          <Link
            className="font-medium ml-2 text-primary hover:underline"
            to="/auth/login"
          >
            Login
          </Link>
        </p>
      </div>
      <CommonForm
        formControls={registerFormControls}
        buttonText={isLoading ? "Creating Account..." : "Sign Up"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
        disabled={isLoading}
      />
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <AuthProviders 
        onSuccess={(userData) => {
          toast({ 
            title: "Account created successfully!",
            description: "You will be redirected shortly."
          });
          // Don't manually navigate - let the auth state change handle it
        }}
        onError={(error) => {
          toast({
            title: "Registration failed",
            description: error,
            variant: "destructive"
          });
        }}
      />
    </div>
  );
}

export default AuthRegister;