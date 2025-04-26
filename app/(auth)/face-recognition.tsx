import * as FaceDetector from "expo-face-detector";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, View, Text, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { database, ref, set } from "@/(api)/firebaseConfig";
import { ReactNativeModal } from "react-native-modal";
import CustomButton from "@components/CustomButton";
import { images } from "@/constants";

const FaceDetection = () => {
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [facesDetected, setFacesDetected] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const showErrorModal = (title: string, message: string) => {
    setErrorTitle(title);
    setErrorMessage(message);
    setErrorModalVisible(true);
  };

  const saveToDatabase = async (
    userId: string,
    uri: string,
    filename: string,
  ) => {
    try {
      const sanitizedFilename = filename.replace(/\./g, "_");
      const base64String = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const userRef = ref(database, `users/${userId}/faceRecognition`);
      await set(userRef, {
        filename: sanitizedFilename,
        imageData: base64String,
      });
      return `https://profile-29971-default-rtdb.asia-southeast1.firebasedatabase.app/users/${userId}/faceRecognition`;
    } catch (error) {
      console.error("Error saving image to Firebase Realtime Database:", error);
      throw new Error("Failed to save image.");
    }
  };

  const handleCapture = async () => {
    try {
      const { granted } = await ImagePicker.requestCameraPermissionsAsync();
      if (!granted) {
        showErrorModal("Permission Required", "Camera access is required.");
        return;
      }

      await new Promise((resolve) => {
        setTimeout(resolve, 500); // Short delay for tip
      });

      setImageUri(null);
      setFacesDetected(false);

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const uri = result.assets[0].uri;
        if (!uri) throw new Error("No image URI found.");

        setImageUri(uri);
        await detectFace(uri);
      }
    } catch (error) {
      console.error("Error capturing image:", error);
      showErrorModal(
        "Capture Error",
        "An error occurred while capturing the image.",
      );
    }
  };

  const detectFace = async (uri: string) => {
    try {
      const options = {
        mode: FaceDetector.FaceDetectorMode.accurate,
        detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
        runClassifications: FaceDetector.FaceDetectorClassifications.none,
      };

      const result = await FaceDetector.detectFacesAsync(uri, options);

      if (result.faces && result.faces.length > 0) {
        if (result.faces.length > 1) {
          showErrorModal(
            "Multiple Faces Detected",
            "Please ensure only one face is in the frame.",
          );
          return;
        }

        const face = result.faces[0];
        const { bounds } = face;
        const faceArea = bounds.size.width * bounds.size.height;
        const imageArea = result.image.width * result.image.height;

        if (faceArea < 0.2 * imageArea) {
          showErrorModal("Face Too Small", "Move closer to the camera.");
          return;
        }

        if (
          bounds.origin.x < 0 ||
          bounds.origin.y < 0 ||
          bounds.origin.x + bounds.size.width > result.image.width ||
          bounds.origin.y + bounds.size.height > result.image.height
        ) {
          showErrorModal(
            "Face Misaligned",
            "Center your face properly within the frame.",
          );
          return;
        }

        const requiredLandmarks = [
          "LEFT_EYE",
          "RIGHT_EYE",
          "NOSE_BASE",
          "LEFT_MOUTH",
          "RIGHT_MOUTH",
        ];
        const missingLandmarks: string[] = [];

        requiredLandmarks.forEach((key) => {
          const landmark = face[key as keyof typeof face];
          if (!landmark) {
            missingLandmarks.push(key);
          }
        });

        if (missingLandmarks.length > 0) {
          showErrorModal(
            "Face Validation Failed",
            `Missing landmarks: ${missingLandmarks.join(", ")}.`,
          );
          return;
        }

        setFacesDetected(true);
      } else {
        showErrorModal(
          "No Face Detected",
          "Please ensure your face is clearly visible.",
        );
      }
    } catch (error) {
      console.error("Face detection error:", error);
      showErrorModal(
        "Detection Error",
        "Face detection failed. Please try again.",
      );
    }
  };

  const handleDone = async () => {
    if (!imageUri || !facesDetected) {
      showErrorModal(
        "Missing Face Scan",
        "Capture and validate your face first.",
      );
      return;
    }

    setLoading(true);

    try {
      const userId = "user_2rI4yE3vW85lw6XU2Sit7a65amJ"; // Replace with dynamic user ID if needed
      const filename = "face.jpg";

      const base64String = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await saveToDatabase(userId, imageUri, filename);

      router.push({
        pathname: "/sign-up",
        params: {
          imageUri,
          filename,
          faceImageBase64: base64String,
        },
      });
    } catch (error) {
      console.error("Error saving image:", error);
      showErrorModal("Save Error", "Failed to save image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F2EFE7",
      }}
    >
      {loading ? (
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 24, marginBottom: 20, textAlign: "center" }}>
            This process may take a minute.
          </Text>
          <Text style={{ fontSize: 24, marginBottom: 20, textAlign: "center" }}>
            Please wait...
          </Text>
          <ActivityIndicator size="large" color="#006A71" />
        </View>
      ) : (
        <>
          <View style={{ alignItems: "center", marginBottom: 16 }}>
            <Text
              style={{ fontSize: 24, fontWeight: "bold", color: "#006A71" }}
            >
              Set up Face ID
            </Text>
            <Text style={{ color: "#006A71" }}>
              Scan the face to verify identity
            </Text>
            <Text style={{ marginTop: 8, fontStyle: "italic", color: "gray" }}>
              Tip: Ensure good lighting for better results.
            </Text>
          </View>

          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{
                width: 300,
                height: 300,
                marginTop: 20,
                borderWidth: 2,
                borderColor: facesDetected ? "#48A6A7" : "#F44336",
              }}
            />
          ) : (
            <Image
              source={images.face}
              style={{ width: 200, height: 200, marginTop: 20 }}
              resizeMode="contain"
            />
          )}

          {!imageUri ? (
            <CustomButton
              title="Capture Image"
              onPress={handleCapture}
              style={{ marginTop: 20, width: 250, backgroundColor: "#006A71" }}
            />
          ) : (
            <>
              <CustomButton
                title="Try Again"
                onPress={handleCapture}
                style={{
                  marginTop: 20,
                  width: 250,
                  backgroundColor: "#FF9800",
                }}
              />
              {facesDetected && (
                <CustomButton
                  title="Done"
                  onPress={handleDone}
                  style={{
                    marginTop: 20,
                    width: 250,
                    backgroundColor: "#48A6A7",
                  }}
                />
              )}
            </>
          )}
        </>
      )}

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
    </SafeAreaView>
  );
};

export default FaceDetection;
