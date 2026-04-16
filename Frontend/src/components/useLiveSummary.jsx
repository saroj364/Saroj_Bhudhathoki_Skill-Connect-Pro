import { useState } from "react";
import axios from "axios";

export default function useLiveSummary() {
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const sendAudio = async (blob) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", blob, "audio.wav");

    try {
      const res = await axios.post("http://localhost:5003/process", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setTranscript(res.data.text);
      setSummary(res.data.summary);
    } catch (err) {
      console.error("Failed to get summary", err);
    } finally {
      setLoading(false);
    }
  };

  return { transcript, summary, loading, sendAudio };
}