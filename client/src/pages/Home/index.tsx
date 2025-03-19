import { useRef, useState } from 'react';

function Home() {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [image, setImage] = useState<string | null>(null);

    // Bật camera
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            console.error('Không thể truy cập camera', error);
        }
    };

    // Chụp ảnh
    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) return;

        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        setImage(canvas.toDataURL('image/png'));
    };

    return (
        <div className="flex flex-col items-center p-4 space-y-4">
            <h1 className="text-xl font-bold">Chụp ảnh từ iPhone</h1>
            <video ref={videoRef} autoPlay className="w-full max-w-md rounded-lg shadow-lg" />
            <canvas ref={canvasRef} className="hidden" />
            <button
                onClick={startCamera}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-700"
            >
                Bật Camera
            </button>
            <button
                onClick={capturePhoto}
                className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-700"
            >
                Chụp Ảnh
            </button>
            {image && <img src={image} alt="Captured" className="w-full max-w-md rounded-lg shadow-md" />}
        </div>
    );
}

export default Home;
