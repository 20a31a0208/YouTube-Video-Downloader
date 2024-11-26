import React, { useState } from "react";
import { FaYoutube } from "react-icons/fa";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";  // Import Toastify components
import "react-toastify/dist/ReactToastify.css";  // Import Toastify styles

function App() {
  const [URL, setURL] = useState("");
  const [videoInfo, setVideoInfo] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // To track the loading state

  // Handle input change
  const handleInput = (e) => {
    setURL(e.target.value);
  };

 
  const extractVideoId = (url) => {
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?\/]+)/);
    return match ? match[1] : null;
  };

  // Fetch video details from YouTube API
  const fetchVideoDetails = async () => {
    if (!URL) {
      toast.error("Please enter a valid YouTube URL."); // Show error toast
      return;
    }

    const videoId = extractVideoId(URL);
    if (!videoId) {
      toast.error("Invalid YouTube URL format."); // Show error toast
      return;
    }

    setError("");
    setLoading(true); // Start loader when API call begins

    const options = {
      method: "GET",
      url: "https://youtube-data8.p.rapidapi.com/video/details/",
      params: {
        id: videoId,
        hl: "en",
        gl: "US",
      },
      headers: {
        "x-rapidapi-key": import.meta.env.VITE_DETAILS_API_KEY,
        "x-rapidapi-host": import.meta.env.VITE_RAPIDAPI_HOST,
      },
    };

    try {
      const response = await axios.request(options);
      setVideoInfo(response.data);
      toast.success("Video details fetched successfully!"); // Show success toast
    } catch (error) {
      console.error("Error fetching video details:", error);
      toast.error("Failed to fetch video details. Please try again."); // Show error toast
    } finally {
      setLoading(false); // Stop loader once API call is finished
    }
  };

  // Download video
  const downloadVideo = async () => {
    if (!URL) {
      toast.error("Please enter a valid YouTube URL."); // Show error toast
      return;
    }

    const videoId = extractVideoId(URL);
    if (!videoId) {
      toast.error("Invalid YouTube URL format."); // Show error toast
      return;
    }

    setError("");
    setLoading(true); // Start loader when API call begins
    const options = {
      method: "GET",
      url: "https://youtube-data8.p.rapidapi.com/video/streaming-data/",
      params: { id: videoId },
      headers: {
        "x-rapidapi-key": import.meta.env.VITE_DOWNLOAD_API_KEY,
        "x-rapidapi-host": import.meta.env.VITE_RAPIDAPI_HOST,
        "content-type": "application/json",
      },
    };

    try {
      const response = await axios.request(options);

      if (!response?.data?.formats?.length) {
        toast.error("No streaming data available for this video."); // Show error toast
        return;
      }

      const downloadUrl = response.data.formats[0]?.url;
      if (downloadUrl) {
        window.location.href = downloadUrl;
        toast.success("Download started successfully!"); // Show success toast
      } else {
        toast.error("No valid download link found."); // Show error toast
      }
    } catch (error) {
      toast.error("Failed to download video. Please try again."); // Show error toast
      console.error(error);
    } finally {
      setLoading(false); // Stop loader once API call is finished
    }
  };

  function clearText(){
    setURL("")
    setVideoInfo("");
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 relative">
      {/* Loader - The overlay loader */}
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-16 h-16 border-4 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      )}

      {/* Header Section */}
      <div className="flex items-center justify-center mb-8">
        <FaYoutube size={64} className="text-red-600 mr-4" />
        <h1 className="text-4xl font-bold text-gray-800">YouTube Downloader</h1>
      </div>

      {/* Input & Buttons Section */}
      <div className="w-full max-w-md flex flex-col items-center">
        <input
          type="url"
          placeholder="Enter YouTube video URL"
          className="p-3 w-full rounded-lg border-2 border-gray-300 mb-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={URL}
          onChange={handleInput}
        />
        {error && <p className="text-red-600 mb-4">{error}</p>}

        <div className="flex w-full justify-between mb-4">
          {/* Fetch Video Button */}
          <button
            className={`px-6 py-3 w-[160px] bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={fetchVideoDetails}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-4 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
                <span className="ml-2">Fetching...</span>
              </div>
            ) : (
              "Fetch Video"
            )}
          </button>

          {/* Download Button */}
          <button
            className="px-6 py-3 w-[120px] bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all duration-300"
            onClick={downloadVideo}
            disabled={loading || !videoInfo}
          >
            Download
          </button>
          <button
            className="px-6 py-3 w-[120px] bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all duration-300"
            onClick={clearText}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Video Details Section */}
      {videoInfo && !loading && (
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg mt-8 text-center">
          <img
            src={videoInfo.thumbnails?.[0]?.url || ""}
            alt="Video Thumbnail"
            className="w-full h-auto rounded-lg mb-4"
          />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{videoInfo.title}</h2>
          <p className="text-sm text-gray-600 mb-2"><span className="font-semibold">Description:</span> {videoInfo.description}</p>
          <p className="text-sm text-gray-600"><span className="font-semibold">Views:</span> {videoInfo.stats.views}</p>
          <p className="text-sm text-gray-600"><span className="font-semibold">Likes:</span> {videoInfo.stats.likes}</p>
          <p className="text-sm text-gray-600"><span className="font-semibold">Comments:</span> {videoInfo.stats.comments}</p>
        </div>
      )}

      {/* Toast Notifications */}
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar={true} closeOnClick pauseOnHover />
    </div>
  );
}

export default App;