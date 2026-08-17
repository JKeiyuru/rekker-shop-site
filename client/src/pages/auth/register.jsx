// client/src/pages/auth/register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { registerFormControls } from "@/config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase";
import { AuthProviders } from "@/components/auth/auth-providers";
import { API_BASE_URL } from "@/config/config.js";
import { checkAuth } from "@/store/auth-slice";
import { setAuthToken } from "@/lib/auth-token";

const initialState = { userName: "", email: "", password: "" };

function AuthRegister() {
  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function finishSignup(role) {
    await dispatch(checkAuth());
    toast({ title: "Account created", description: "Welcome to Rekker." });
    navigate(role === "admin" ? "/admin/dashboard" : "/", { replace: true });
  }

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);

    let createdFirebaseUser = null;
    try {
      let idToken;
      try {
        const cred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        createdFirebaseUser = cred.user;
        idToken = await cred.user.getIdToken();
      } catch (fbError) {
        // Firebase may be unavailable/misconfigured — fall back to backend-only signup.
        console.warn("Firebase signup unavailable:", fbError?.code);
        if (fbError?.code === "auth/email-already-in-use") throw fbError;
      }

      const endpoint = idToken ? "/api/auth/firebase-register" : "/api/auth/register";
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({
          userName: formData.userName,
          email: formData.email,
          password: formData.password,
          firebaseUid: createdFirebaseUser?.uid,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.token) setAuthToken(data.token);
        await finishSignup(data?.user?.role);
      } else {
        if (createdFirebaseUser) {
          try { await createdFirebaseUser.delete(); } catch { /* ignore */ }
        }
        throw new Error(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      const map = {
        "auth/email-already-in-use": "An account with this email already exists.",
        "auth/weak-password": "Password should be at least 6 characters.",
        "auth/invalid-email": "Please enter a valid email address.",
      };
      toast({
        title: "Registration failed",
        description: map[error?.code] || error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Already have an account?
          <Link className="ml-2 font-medium text-primary hover:underline" to="/auth/login">
            Login
          </Link>
        </p>
      </div>

      <CommonForm
        formControls={registerFormControls}
        buttonText={isLoading ? "Creating account…" : "Sign Up"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
        disabled={isLoading}
      />

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <AuthProviders
        onSuccess={(userData) => finishSignup(userData?.user?.role)}
        onError={(error) =>
          toast({ title: "Registration failed", description: error, variant: "destructive" })
        }
      />
    </div>
  );
}

export default AuthRegister;
