import {
  Button,
  Stack,
  TextField,
  Typography,
  colors,
  Box,
} from "@mui/material";
import React from "react";
import { ScreenMode } from "../pages/SigninPage";
import FacebookIcon from "@mui/icons-material/Facebook";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { authenticate, notifyError } from "../Utils/helpers";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { doSignInWithEmailAndPassword, FacebookAuth } from "../firebase/auth";
import { useAuth } from "../contexts/authContext";
import { generateToken } from "../firebase/auth";
import client from "../Utils/client";
const SigninForm = ({ onSwitchMode }) => {
  const { userLoggedIn } = useAuth();
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const FacebookAuthButtonClicked = async () => {
    try {
      const user = await FacebookAuth(); // Await the resolved data from the FacebookAuth function
      console.log("Facebook user: ", user); // Display the user object, including name, email, photoURL, and uid

      // Display specific details
      console.log("User Name:", user.displayName);
      console.log("User Email:", user.email);
      console.log("Profile Picture URL:", user.photoURL);
      console.log("User UID:", user.uid);
    } catch (error) {
      console.error("Error during Facebook authentication:", error);
    }
  };

  const onSubmit = async (data) => {
    try {
      const userCredential = await doSignInWithEmailAndPassword(
        data.email,
        data.password
      );
      console.log(userCredential); // Log the result or handle it as needed
    } catch (error) {
      console.error("Error signing in:", error);
      notifyError(error);
      // Handle the error (e.g., show an error message to the user)
    }
  };

  // axios
  //   .post(`${process.env.REACT_APP_API_LINK}/auth/login`, data, {
  //     headers: { "Content-Type": "application/json" },
  //   })
  //   .then((response) => {
  //     console.log("Response:", response.data);
  //     const user = response.data.user;
  //     const { role } = user;
  //     const targetPath = role === "admin" ? "/admin" : "/";
  //     authenticate(response.data, () => navigate(targetPath));
  //   })
  //   .catch((error) => {
  //     if (error.response) {
  //       console.error("Error response:", error.response.data);
  //       console.error("Error status:", error.response.status);
  //     } else {
  //       console.error("Error message:", error.message);
  //     }
  //   });
  const handleGoogleLoginSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse?.credential);
    client
      .post(`/auth/google-login`, {
        fname: decoded.given_name,
        lname: decoded.family_name,
        email: decoded.email,
        profile: decoded.picture,
        provider_id: decoded.sub,
        provider: "google",
      })
      .then(async (response) => {
        const token = await generateToken();
        const user = response.data.user;
        const { role, _id } = user;
        const data = {
          _id,
          token,
        };
        client.put("/auth/fcm-token-update", data);
        let targetPath;
        switch (role) {
          case "admin":
            targetPath = "/admin";
            break;
          case "serviceCrew":
            targetPath = "/crew";
            break;
          default:
            targetPath = "/";
        }

        authenticate(response.data, () => navigate(targetPath));
      })
      .catch((error) => {
        console.error("Error during Google login:", error);
      });
  };

  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      sx={{
        height: "100vh",
        color: colors.grey[800],
        p: 2,
        overflow: "hidden",
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack
          spacing={3}
          sx={{
            width: "100%",
            maxWidth: "400px",
            p: 3,
            borderRadius: 2,
          }}
        >
          <Stack spacing={2} alignItems="left">
            <Typography variant="h5" fontWeight={600} color={colors.grey[800]}>
              Welcome back
            </Typography>
            <Typography color={colors.grey[600]}>
              Please sign in to continue accessing your account.
            </Typography>
          </Stack>

          <Stack spacing={3}>
            <Stack spacing={1}>
              <Typography color={colors.grey[800]}>Email</Typography>
              <Controller
                name="email"
                control={control}
                rules={{ required: "Email is required" }}
                render={({ field }) => (
                  <TextField
                    size="large"
                    {...field}
                    value={field.value || ""}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    fullWidth
                    variant="outlined"
                  />
                )}
              />
            </Stack>
            <Stack spacing={1}>
              <Typography color={colors.grey[800]}>Password</Typography>
              <Controller
                name="password"
                control={control}
                rules={{
                  required: "Password is required",
                  validate: (value) =>
                    value.trim() !== "" || "Password cannot be empty",
                }}
                render={({ field }) => (
                  <TextField
                    type="password"
                    size="large"
                    {...field}
                    value={field.value || ""}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    fullWidth
                    variant="outlined"
                  />
                )}
              />
            </Stack>
            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{
                bgcolor: colors.grey[800],
                "&:hover": {
                  bgcolor: colors.grey[600],
                },
              }}
            >
              Sign in
            </Button>
          </Stack>
        </Stack>
      </form>
      <Box display="flex" justifyContent="center" alignItems="center" mt={3}>
        <Button
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            padding: 0,
            marginRight: "10px",
            backgroundColor: "transparent",
            transition: "background-color 0.3s ease",
            "&:hover": {
              backgroundColor: colors.blue[600],
              "& .MuiSvgIcon-root": {
                color: "white",
                transition: "color 0s ease",
              },
            },
          }}
        >
          <FacebookIcon
            sx={{ color: colors.blue[600] }}
            onClick={FacebookAuthButtonClicked}
          />
        </Button>
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            handleGoogleLoginSuccess(credentialResponse);
          }}
          onError={() => {
            console.log("Login Failed");
          }}
          clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
        />
      </Box>

      <Stack direction="row" spacing={1} justifyContent="center" mt={2}>
        <Typography>Don't have an account?</Typography>
        <Typography
          onClick={() => onSwitchMode(ScreenMode.SIGN_UP)}
          fontWeight={600}
          sx={{
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          Sign up now
        </Typography>
      </Stack>
    </Stack>
  );
};

export default SigninForm;
