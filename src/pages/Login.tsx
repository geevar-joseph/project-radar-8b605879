
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { LogIn, UserPlus, Mail, AlertCircle, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forcePasswordChange, setForcePasswordChange] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        navigate("/dashboard");
      }
    };
    
    checkUser();
  }, [navigate]);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setForcePasswordChange(true);
        } else if (session && !forcePasswordChange) {
          navigate("/dashboard");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, forcePasswordChange]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if user needs to change password
      const { data: teamMemberData, error: teamMemberError } = await supabase
        .from('team_members')
        .select('force_password_change')
        .eq('email', email)
        .single();

      if (teamMemberError) {
        console.error("Error checking password change status:", teamMemberError);
      }

      if (teamMemberData?.force_password_change) {
        setForcePasswordChange(true);
      } else {
        // Redirect to dashboard
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      // Update force_password_change flag
      const { error: flagUpdateError } = await supabase
        .from('team_members')
        .update({ force_password_change: false })
        .eq('email', email);

      if (flagUpdateError) {
        console.error("Error updating password change flag:", flagUpdateError);
      }

      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
      });
      
      setForcePasswordChange(false);
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Password change error:", error);
      setError(error.message || "Failed to update password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // For demo purposes, allow users to continue as guest
  const handleDemoLogin = () => {
    toast({
      title: "Demo Mode",
      description: "You're now using the application as a guest.",
    });
    navigate("/dashboard");
  };

  if (forcePasswordChange) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Change Your Password
            </CardTitle>
            <CardDescription className="text-center">
              You need to set a new password before continuing
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input 
                  id="newPassword" 
                  type="password" 
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Processing..." : "Set New Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Sign in to your account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 bg-blue-50 text-blue-800 border-blue-200">
            <Info className="h-4 w-4" />
            <AlertTitle>Testing Information</AlertTitle>
            <AlertDescription className="text-sm">
              To test authentication, add a new team member via the "Manage Options" page. 
              A temporary password will be sent to the email you provide.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            <Button 
              variant="link" 
              onClick={handleDemoLogin} 
              className="text-blue-600 hover:underline"
            >
              Continue as Guest
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
