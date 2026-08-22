// client/src/components/shopping-view/account-settings.jsx
// "Settings" tab on the account page — email verification status/resend,
// and change-email. Password reset lives entirely under /auth/forgot-password
// (no "change password while logged in" flow exists yet, since neither
// Firebase's client SDK re-auth nor the local bcrypt path had one built —
// worth a follow-up if you want it).
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { sendVerificationEmail, requestEmailChange } from "@/store/auth-slice";
import { CheckCircle2, MailWarning, Loader2, Mail } from "lucide-react";

function AccountSettings() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { toast } = useToast();

  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [emailChangeSent, setEmailChangeSent] = useState(false);

  const handleResendVerification = () => {
    setIsSendingVerification(true);
    dispatch(sendVerificationEmail())
      .then((res) => {
        if (res?.payload?.success) {
          setVerificationSent(true);
          toast({ title: res.payload.message });
        } else {
          toast({ title: res?.payload?.message || "Could not send verification email", variant: "destructive" });
        }
      })
      .finally(() => setIsSendingVerification(false));
  };

  const handleChangeEmail = (e) => {
    e.preventDefault();
    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      toast({ title: "Please enter a valid email address", variant: "destructive" });
      return;
    }
    setIsChangingEmail(true);
    dispatch(requestEmailChange(newEmail))
      .then((res) => {
        if (res?.payload?.success) {
          setEmailChangeSent(true);
          toast({ title: res.payload.message });
        } else {
          toast({ title: res?.payload?.message || "Could not start email change", variant: "destructive" });
        }
      })
      .finally(() => setIsChangingEmail(false));
  };

  return (
    <div className="grid gap-6 max-w-xl">
      {/* Email verification status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="h-4 w-4" /> Email Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm">{user?.email}</p>
              {user?.emailVerified ? (
                <Badge className="mt-1.5 bg-green-600 hover:bg-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
                </Badge>
              ) : (
                <Badge variant="secondary" className="mt-1.5 bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                  <MailWarning className="h-3 w-3 mr-1" /> Not verified
                </Badge>
              )}
            </div>

            {!user?.emailVerified && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleResendVerification}
                disabled={isSendingVerification || verificationSent}
              >
                {isSendingVerification ? (
                  <><Loader2 className="h-3 w-3 mr-2 animate-spin" /> Sending...</>
                ) : verificationSent ? (
                  "Sent — check your inbox"
                ) : (
                  "Send verification email"
                )}
              </Button>
            )}
          </div>
          {!user?.emailVerified && (
            <p className="text-xs text-muted-foreground mt-3">
              We'll send a confirmation link to <strong>{user?.email}</strong>. Click it to verify your account.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Change email */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Change Email Address</CardTitle>
        </CardHeader>
        <CardContent>
          {emailChangeSent ? (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
              We&apos;ve sent a confirmation link to <strong>{newEmail}</strong>. Your email won&apos;t change until you click it.
            </p>
          ) : (
            <form onSubmit={handleChangeEmail} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="newEmail">New email address</Label>
                <Input
                  id="newEmail"
                  type="email"
                  placeholder="you@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={isChangingEmail}>
                {isChangingEmail ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
                ) : (
                  "Send confirmation link"
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Your email stays the same until you confirm it from the new address.
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AccountSettings;
