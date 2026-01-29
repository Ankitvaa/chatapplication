import React, { useState } from "react";
import "./mediaViewer.scss";

const MediaViewer = ({ media, onClose }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const mediaUrl = `http://localhost:8080${media.fileUrl}`;
    const isImage = media.fileType.startsWith("image/");

    const handleDownload = async () => {
        try {
            setIsDownloading(true);
            
            // Extract filename from URL or use default
            const fileName = media.fileName || `media-${Date.now()}`;
            
            // Fetch the file as a blob
            const response = await fetch(mediaUrl);
            if (!response.ok) {
                throw new Error(`Failed to download: ${response.statusText}`);
            }
            
            const blob = await response.blob();
            
            // Create a blob URL and download
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download error:", error);
            alert("Failed to download file. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleImageLoad = () => {
        setIsLoading(false);
    };

    const handleVideoLoadedMetadata = () => {
        setIsLoading(false);
    };

    return (
        <div className="media-viewer-overlay" onClick={onClose}>
            <div className="media-viewer-container" onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <button className="media-viewer-close" onClick={onClose} aria-label="Close">
                    ✕
                </button>

                {/* Download Button */}
                <button 
                    className="media-viewer-download" 
                    onClick={handleDownload}
                    title={isDownloading ? "Downloading..." : "Download media"}
                    aria-label="Download"
                    disabled={isDownloading}
                    style={{ opacity: isDownloading ? 0.5 : 1, pointerEvents: isDownloading ? 'none' : 'auto' }}
                >
                    {isDownloading ? '⏳' : '⬇️'}
                </button>

                {/* Loading Spinner */}
                {isLoading && (
                    <div className="media-viewer-loading">
                        <div className="spinner"></div>
                    </div>
                )}

                {/* Media Content */}
                <div className="media-viewer-content">
                    {isImage ? (
                        <img
                            src={mediaUrl}
                            alt="Fullscreen media"
                            onLoad={handleImageLoad}
                            className={isLoading ? "loading" : ""}
                        />
                    ) : (
                        <video
                            controls
                            autoPlay
                            onLoadedMetadata={handleVideoLoadedMetadata}
                            className={isLoading ? "loading" : ""}
                        >
                            <source src={mediaUrl} type={media.fileType} />
                            Your browser does not support the video tag.
                        </video>
                    )}
                </div>

                {/* Info Footer */}
                <div className="media-viewer-footer">
                    <p>
                        {isImage ? "🖼️ Image" : "🎬 Video"}
                        {media.fileName && ` • ${media.fileName}`}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MediaViewer;
