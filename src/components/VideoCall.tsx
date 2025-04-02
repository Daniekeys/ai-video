import React, { useEffect, useRef, useState } from "react";
import {
  CallClient,
  LocalVideoStream,
  VideoDeviceInfo,
  CallAgent,
  DeviceManager, VideoStreamRenderer
} from "@azure/communication-calling";
import { AzureCommunicationTokenCredential } from "@azure/communication-common";
import { ACS_USER_TOKEN } from "../azureConfig";

const VideoCall: React.FC = () => {

  const [callAgent, setCallAgent] = useState<CallAgent | null>(null);
  const [deviceManager, setDeviceManager] = useState<DeviceManager | null>(
    null
  );
  const [videoDevices, setVideoDevices] = useState<VideoDeviceInfo[]>([]);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [localVideoStream, setLocalVideoStream] =
    useState<LocalVideoStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);

  useEffect(() => {
    const setupCall = async () => {
      try {
        // Initialize the Call Client
        const callClient = new CallClient();
        const tokenCredential = new AzureCommunicationTokenCredential(
          ACS_USER_TOKEN
        );
        const agent = await callClient.createCallAgent(tokenCredential);
        setCallAgent(agent);

        // Get Device Manager
        const devices = await callClient.getDeviceManager();
        setDeviceManager(devices);

        // Get available cameras
        const cameras = await devices.getCameras();
        setVideoDevices(cameras);
        if (cameras.length > 0) {
          setSelectedCameraId(cameras[0].id);
        }
      } catch (error) {
        console.error("Error setting up ACS:", error);
      }
    };

    setupCall();
  }, []);

  useEffect(() => {
    const startLocalVideoStream = async (cameraId?: string) => {
      if (!deviceManager || !callAgent) return;

      try {
        const cameras = await deviceManager.getCameras();
        if (cameras.length > 0) {
          const selectedCamera = cameraId
            ? cameras.find((cam) => cam.id === cameraId)
            : cameras[0];
          if (!selectedCamera) {
            console.error("Selected camera not found.");
            return;
          }
          const newLocalVideoStream = new LocalVideoStream(selectedCamera);
          setLocalVideoStream(newLocalVideoStream);
          const videoRenderer = new VideoStreamRenderer(newLocalVideoStream);
          const view = await videoRenderer.createView();
          if (localVideoRef.current) {
            localVideoRef.current.innerHTML = "";
            localVideoRef.current.appendChild(view.target);
          }
          setIsCameraOn(true);
        }
      } catch (error) {
        console.error("Error starting local video stream:", error);
      }
    };
    const stopLocalVideoStream = async () => {
      if (localVideoStream) {
        const videoRenderer = new VideoStreamRenderer(localVideoStream);
        videoRenderer.dispose();
        setLocalVideoStream(null);
        setIsCameraOn(false);
      }
    };
    if (selectedCameraId && isCameraOn === false) {
      startLocalVideoStream(selectedCameraId);
    } else if (isCameraOn === false) {
      startLocalVideoStream();
    } else if (isCameraOn === true) {
      stopLocalVideoStream();
    }
  }, [deviceManager, callAgent, selectedCameraId, isCameraOn]);

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
  };
  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCameraId(e.target.value);
    setIsCameraOn(false);
  };
  return (
    <div className="p-4 bg-gray-900 text-white flex flex-col items-center">
      <h1 className="text-2xl font-bold">Azure Video Call</h1>
      <select
        onChange={handleCameraChange}
        className="bg-gray-800 text-white rounded-md p-2 mt-4"
      >
        {videoDevices.map((device) => (
          <option key={device.id} value={device.id}>
            {device.name}
          </option>
        ))}
      </select>
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        className="w-1/2 rounded-lg border mt-4"
      />
      <button
        onClick={toggleCamera}
        className="px-4 py-2 bg-purple-500 text-white rounded-lg shadow-md hover:bg-purple-600 mt-4"
      >
        {isCameraOn ? "Stop Camera" : "Start Camera"}
      </button>
    </div>
  );
};

export default VideoCall;
