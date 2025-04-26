import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  TextInput,
  Modal,
  TouchableOpacity,
} from "react-native";
import { ReactNativeModal } from "react-native-modal";

import CustomButton from "@components/CustomButton";
import InputField from "@components/InputField";
import { icons } from "@/constants";

const SignIn = () => {
  const signInInstance = useSignIn();
  const { signIn, setActive, isLoaded } = signInInstance || {};
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetStage, setResetStage] = useState<"sendEmail" | "resetPassword">(
    "sendEmail",
  );
  const [passwordVisible, setPasswordVisible] = useState(false);

  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const showErrorModal = (title: string, message: string) => {
    setErrorTitle(title);
    setErrorMessage(message);
    setErrorModalVisible(true);
  };

  const onSignInPress = useCallback(async () => {
    if (!form.email && !form.password) {
      return showErrorModal(
        "Missing Information",
        "Please enter your email and password.",
      );
    }

    if (!form.email) {
      return showErrorModal(
        "Missing Email",
        "Please enter your email address.",
      );
    }

    if (!form.password) {
      return showErrorModal("Missing Password", "Please enter your password.");
    }

    if (!isLoaded || !signIn) {
      return showErrorModal("Error", "Sign-in functionality is not available.");
    }

    try {
      const signInAttempt = await signIn.create({
        identifier: form.email,
        password: form.password,
      });

      if (signInAttempt.status === "complete") {
        await setActive?.({ session: signInAttempt.createdSessionId });
        router.replace("/(auth)/success");
      } else {
        showErrorModal("Sign In Failed", "Log in failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Sign-in error:", err);

      const errorMessage = err.errors?.[0]?.longMessage || "";

      if (errorMessage.includes("identifier is invalid")) {
        showErrorModal("Invalid Email", "Please enter a valid email address.");
      } else {
        showErrorModal(
          "Sign In Error",
          errorMessage || "Invalid credentials. Please try again.",
        );
      }
    }
  }, [isLoaded, form, setActive, signIn, router]);

  const onForgotPasswordPress = useCallback(async () => {
    if (!resetEmail) {
      return showErrorModal(
        "Missing Email",
        "Please enter your email to reset your password.",
      );
    }

    if (!signIn) {
      return showErrorModal(
        "Error",
        "Password reset functionality is not available.",
      );
    }

    try {
      await signIn.create({
        identifier: resetEmail,
        strategy: "reset_password_email_code",
      });

      setResetStage("resetPassword"); // Move to the reset password stage
      showErrorModal(
        "Reset Email Sent",
        "A password reset code has been sent to your email.",
      );
    } catch (err: any) {
      console.error("Error sending reset email:", err);

      const errorMessage = err.errors?.[0]?.longMessage || "";

      if (errorMessage.includes("identifier is invalid")) {
        showErrorModal("Invalid Email", "Please enter a valid email address.");
      } else {
        showErrorModal(
          "Reset Error",
          errorMessage || "Unable to send reset link. Please try again.",
        );
      }
    }
  }, [resetEmail, signIn]);

  const onResetPasswordPress = useCallback(async () => {
    if (!resetCode || !newPassword) {
      return showErrorModal(
        "Missing Information",
        "Please enter the reset code and your new password.",
      );
    }

    try {
      const result = await signIn?.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: resetCode,
        password: newPassword,
      });

      if (result?.status === "complete") {
        setResetModalVisible(false); // Close modal on success
        showErrorModal(
          "Success",
          "Your password has been reset successfully. Please login again.",
        );
      } else {
        showErrorModal(
          "Reset Failed",
          "Password reset failed. Please check the code and try again.",
        );
      }
    } catch (err: any) {
      console.error("Error resetting password:", err);

      showErrorModal(
        "Reset Error",
        err.errors?.[0]?.longMessage ||
          "Something went wrong. Please try again.",
      );
    }
  }, [resetCode, newPassword, signIn]);

  return (
    <ScrollView className="flex-1 bg-[#F2EFE7]">
      <View className="flex-1 bg-[#F2EFE7]">
        <Text className="text-3xl text-[#006A71] font-JakartaBold mt-[60px] text-center">
          Welcome Back
        </Text>

        <Text className="text-lg text-[#9ACBD0] mt-1 text-center">
          Login to your account
        </Text>

        <View className="p-5 mt-[80px]">
          <InputField
            label="Email"
            placeholder="Enter email"
            icon={icons.email}
            textContentType="emailAddress"
            value={form.email}
            onChangeText={(value: string) => setForm({ ...form, email: value })}
          />

          <InputField
            label="Password"
            placeholder="Enter password"
            icon={icons.lock}
            rightIcon={icons.eyecross}
            secureTextEntry={!passwordVisible}
            textContentType="password"
            value={form.password}
            onChangeText={(value: string) =>
              setForm({ ...form, password: value })
            }
            onRightIconPress={() => setPasswordVisible(!passwordVisible)}
            rightIconStyle={`opacity-${passwordVisible ? "100" : "50"}`}
          />

          <Text
            onPress={() => {
              setResetModalVisible(true);
              setResetStage("sendEmail");
            }}
            className="text-[#9ACBD0] text-right mr-2 mt-2"
          >
            Forgot Password?
          </Text>

          <CustomButton
            title="Sign In"
            onPress={onSignInPress}
            className="mt-[100px] bg-[#48A6A7]"
          />

          <TouchableOpacity
            onPress={() => setRoleModalVisible(true)}
            className="text-lg text-center text-[#48A6A7] mt-[35px]"
          >
            <Text className="text-lg text-center text-[#48A6A7]">
              Don't have an account?{" "}
              <Text className="text-[#006A71]">Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Forgot Password Modal */}
      <ReactNativeModal
        isVisible={resetModalVisible}
        onBackdropPress={() => setResetModalVisible(false)}
        backdropOpacity={0.5}
        className="justify-center items-center"
      >
        <View className="bg-white px-6 py-8 rounded-lg w-full max-w-[90%]">
          {resetStage === "sendEmail" ? (
            <>
              <Text className="text-2xl font-bold text-center mb-4">
                Forgot Password
              </Text>
              <Text className="text-base text-[#006A71] text-center mb-6">
                Enter your email address, and we'll send you a reset code.
              </Text>

              <TextInput
                placeholder="Enter your email"
                value={resetEmail}
                onChangeText={setResetEmail}
                className="border border-[#9ACBD0] rounded-lg px-4 py-3 mb-4 text-[#006A71]"
                placeholderTextColor="#A0A0A0"
                keyboardType="email-address"
              />

              <CustomButton
                title="Send Reset Code"
                onPress={onForgotPasswordPress}
                className="mt-4 bg-[#006A71]"
              />
            </>
          ) : (
            <>
              <Text className="text-2xl font-bold text-center mb-4">
                Reset Password
              </Text>
              <Text className="text-base text-[#006A71] text-center mb-6">
                Enter the reset code sent to your email and your new password.
              </Text>

              <TextInput
                placeholder="Enter the reset code"
                value={resetCode}
                onChangeText={setResetCode}
                className="border border-[#9ACBD0] rounded-lg px-4 py-3 mb-4 text-[#006A71]"
                placeholderTextColor="#A0A0A0"
              />

              <TextInput
                placeholder="Enter your new password"
                value={newPassword}
                onChangeText={setNewPassword}
                className="border border-[#9ACBD0] rounded-lg px-4 py-3 mb-4 text-[#006A71]"
                placeholderTextColor="#A0A0A0"
                secureTextEntry
              />

              <CustomButton
                title="Reset Password"
                onPress={onResetPasswordPress}
                className="mt-4 bg-[#006A71]"
              />
            </>
          )}

          <CustomButton
            title="Cancel"
            onPress={() => setResetModalVisible(false)}
            className="bg-[#9ACBD0] mt-4"
          />
        </View>
      </ReactNativeModal>

      {/* Role Selection Modal */}
      <Modal
        visible={roleModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setRoleModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="w-4/5 bg-white rounded-lg p-6">
            <Text className="text-lg font-bold text-[#006A71] text-center mb-4">
              Select Your Role
            </Text>
            <CustomButton
              title="Teacher"
              onPress={() => {
                try {
                  setRoleModalVisible(false);
                  router.replace("/(auth)/sign-up-teacher");
                } catch (error) {
                  console.error("Navigation error (Teacher):", error);
                  showErrorModal(
                    "Navigation Error",
                    "Unable to navigate to Teacher Sign Up.",
                  );
                }
              }}
              className="bg-[#48A6A7] w-full py-3 mb-4 rounded-lg"
            />
            <CustomButton
              title="Parent"
              onPress={() => {
                try {
                  setRoleModalVisible(false);
                  router.replace("/(auth)/sign-up");
                } catch (error) {
                  console.error("Navigation error (Parent):", error);
                  showErrorModal(
                    "Navigation Error",
                    "Unable to navigate to Parent Sign Up.",
                  );
                }
              }}
              className="bg-[#48A6A7] w-full py-3 rounded-lg"
            />
            <TouchableOpacity
              onPress={() => setRoleModalVisible(false)}
              className="mt-4"
            >
              <Text className="text-center text-[#9ACBD0] underline">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Error Modal */}
      <ReactNativeModal
        isVisible={errorModalVisible}
        onBackdropPress={() => setErrorModalVisible(false)}
        backdropOpacity={0.5}
        className="justify-center items-center"
      >
        <View className="bg-white px-6 py-8 rounded-lg w-full max-w-[90%]">
          <Text className="text-2xl font-bold text-center mb-4 text-[#006A71]">
            {errorTitle}
          </Text>
          <Text className="text-base text-center text-gray-700 mb-6">
            {errorMessage}
          </Text>
          <CustomButton
            title="Close"
            onPress={() => setErrorModalVisible(false)}
            className="bg-[#9ACBD0]"
          />
        </View>
      </ReactNativeModal>
    </ScrollView>
  );
};

export default SignIn;
