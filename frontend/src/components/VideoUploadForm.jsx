import React, { useState, useEffect } from 'react';
import axiosInstance from '../util/axiosInstance';

const VideoUploadForm = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [statusLink, setStatusLink] = useState(null);
    const [downloadLink, setDownloadLink] = useState(null);
    const [conversionStatus, setConversionStatus] = useState('');

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await axiosInstance.post('/videos/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setStatusLink(response.data.statusLink);
            setDownloadLink(response.data.downloadLink);
            setConversionStatus(response.data.message);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (statusLink) {
            checkConversionStatus();
        }
    }, [statusLink]); // This effect runs whenever statusLink changes

    const checkConversionStatus = async () => {
        if (!statusLink) return;

        try {
            const response = await axiosInstance.get(statusLink);
            setConversionStatus(response.data.message);
            console.log("Transcoding status: " + response.data.message);

            if (response.data.message === 'Transcoding is finished') {
                // Stop checking status if conversion is finished
                return;
            }

            // Check status every second
            setTimeout(checkConversionStatus, 1000);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDownload = async () => {
        try {
            const response = await axiosInstance.get(downloadLink, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            // Suggest a filename for the downloaded file
            link.setAttribute('download', 'downloadedVideo.mov');
            document.body.appendChild(link);
            link.click();

            // Clean up
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <input type="file" accept=".mp4" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload and Convert</button>
            {conversionStatus !== '' ? (
                conversionStatus === 'Transcoding is finished' ? (
                    <div>
                        <p>Transcoding is finished</p>
                        <button onClick={handleDownload}>Download Video</button>
                    </div>
                ) : (
                    <p>Transcoding, please wait</p>
                )
            ) : null}
        </div>
    );
};

export default VideoUploadForm;
