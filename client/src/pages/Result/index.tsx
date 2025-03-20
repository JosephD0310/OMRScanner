import { useState } from "react";
import axios from "axios";

function Result() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendToBackend = async (base64Image: string) => {
    setLoading(true);
    setError(null);

    try {
      // Chuyển base64 thành Blob
      const blob = await fetch(base64Image).then((res) => res.blob());
      const formData = new FormData();
      formData.append("file", blob, "image.png");

      // Gửi ảnh lên Backend
      const response = await axios.post("http://localhost:8000/process-image/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Kết quả xử lý ảnh:", response.data);
    } catch (error) {
      console.error("Lỗi khi gửi ảnh", error);
      setError("Lỗi khi tải ảnh lên!");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      await sendToBackend(base64String);
    };
  };

  return (
    <div className="flex flex-col items-center p-4">
      <input type="file" onChange={handleFileChange} accept="image/*" className="mb-2" />
      {loading && <p className="text-blue-500">Đang tải lên...</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}

export default Result;
