import { useSignUp } from "@clerk/clerk-expo";
import { useRouter, Link } from "expo-router";
import { getDatabase, ref, set } from "firebase/database";
import { useState } from "react";
import { ScrollView, Text, View, Image } from "react-native";
import { ReactNativeModal } from "react-native-modal";

import { useTeacherForm } from "@/(auth)/TeacherFormContext";
import CustomButton from "@components/CustomButton";
import InputField from "@components/InputField";
import { icons, images } from "@/constants";

interface FormState {
  email: string;
  password: string;
}

interface VerificationState {
  state: "default" | "pending" | "failed";
  error: string;
  code: string;
}

const SignUp_Teacher = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const { form, setForm } = useTeacherForm() as {
    form: FormState;
    setForm: React.Dispatch<React.SetStateAction<FormState>>;
  };

  const [passwordVisible, setPasswordVisible] = useState(false);

  const [verification, setVerification] = useState<VerificationState>({
    state: "default",
    error: "",
    code: "",
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const showErrorModal = (title: string, message: string) => {
    setErrorTitle(title);
    setErrorMessage(message);
    setErrorModalVisible(true);
  };

  const handleSignUp = async () => {
    if (!isLoaded || !signUp) {
      return showErrorModal(
        "Error",
        "Clerk is not ready. Please try again later.",
      );
    }

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

    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerification((prev) => ({
        ...prev,
        state: "pending",
      }));
    } catch (error: any) {
      console.error("Sign-up error:", error);

      const errorMessage = error.errors?.[0]?.longMessage || "";

      if (errorMessage.includes("identifier is invalid")) {
        showErrorModal("Invalid Email", "Please enter a valid email address.");
      } else {
        showErrorModal(
          "Sign Up Error",
          errorMessage || "An unknown error occurred.",
        );
      }
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded || !signUp) {
      return showErrorModal(
        "Error",
        "Clerk is not ready. Please try again later.",
      );
    }

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      });

      if (completeSignUp.status === "complete") {
        const db = getDatabase();
        const teacherId = completeSignUp.createdUserId;

        const payload = {
          email: form.email,
          clerkId: teacherId,
        };

        console.log("Saving Teacher to Firebase with payload:", payload);

        await set(ref(db, `Users/Teachers/TeacherId/${teacherId}`), payload);

        await setActive({ session: completeSignUp.createdSessionId });

        setShowSuccessModal(true);
      } else {
        setVerification((prev) => ({
          ...prev,
          error: "Verification failed. Please try again.",
          state: "failed",
        }));
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      setVerification((prev) => ({
        ...prev,
        error: "Verification failed. Please try again.",
        state: "failed",
      }));
    }
  };

  return (
    <ScrollView className="flex-1 bg-[#F2EFE7]">
      <View className="flex-1 bg-[#F2EFE7]">
        <Text className="text-3xl text-[#006A71] font-bold text-center mt-10">
          Let's get started!
        </Text>
        <Text className="text-base text-[#9ACBD0] text-center">
          Create an account to get started.
        </Text>

        <View className="p-5 mt-20">
          <InputField
            label="Email"
            placeholder="Enter email"
            icon={icons.email}
            textContentType="emailAddress"
            value={form.email}
            onChangeText={(value: string) =>
              setForm((prev) => ({ ...prev, email: value }))
            }
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
              setForm((prev) => ({ ...prev, password: value }))
            }
            onRightIconPress={() => setPasswordVisible(!passwordVisible)}
            rightIconStyle={`opacity-${passwordVisible ? "100" : "20"}`}
          />

          <CustomButton
            title="Sign Up"
            onPress={handleSignUp}
            className="mt-[150px] bg-[#48A6A7]"
          />

          <Link
            href="/sign-in"
            className="text-lg text-center text-[#9ACBD0] mt-10"
          >
            Already have an account?{" "}
            <Text className="text-[#006A71]">Sign In</Text>
          </Link>
        </View>
      </View>

      {/* Verification Modal */}
      <ReactNativeModal isVisible={verification.state === "pending"}>
        <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
          <Text className="font-bold text-2xl mb-2 text-[#006A71]">
            Verification
          </Text>
          <Text className="mb-5 text-[#9ACBD0]">
            We've sent a verification code to {form.email}.
          </Text>
          <InputField
            label="Verification Code"
            placeholder="Enter code"
            icon={icons.lock}
            keyboardType="numeric"
            value={verification.code}
            onChangeText={(value: string) =>
              setVerification((prev) => ({ ...prev, code: value }))
            }
          />
          {verification.error && (
            <Text className="text-red-500 text-sm mt-1">
              {verification.error}
            </Text>
          )}
          <CustomButton
            title="Verify Email"
            onPress={onPressVerify}
            className="mt-5 bg-[#48A6A7]"
          />
        </View>
      </ReactNativeModal>

      {/* Success Modal */}
      <ReactNativeModal isVisible={showSuccessModal}>
        <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
          <Image
            source={images.check}
            style={{ width: 110, height: 110, alignSelf: "center" }}
          />
          <Text className="text-3xl font-bold text-center mt-4 text-[#006A71]">
            Verified
          </Text>
          <Text className="text-base text-[#9ACBD0] text-center mt-2">
            You have successfully verified your account.
          </Text>
          <CustomButton
            title="Continue"
            className="mt-5 bg-[#48A6A7]"
            onPress={() => {
              setShowSuccessModal(false);
              router.push({
                pathname: "/home",
                params: { role: "teacher", userId: form.email },
              });
            }}
          />
        </View>
      </ReactNativeModal>

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

export default SignUp_Teacher;
