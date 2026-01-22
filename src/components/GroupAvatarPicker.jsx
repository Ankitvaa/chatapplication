import React, { useRef } from "react";
import "./avatarUpload.scss";

const GroupAvatarPicker = ({ preview, onSelect }) => {
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Invalid image type");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onSelect(file, reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="avatar-upload">
      <div className="avatar-upload__preview">
        {preview ? (
          <img src={preview} alt="Group avatar" />
        ) : (
          <div className="avatar-upload__placeholder">G</div>
        )}
      </div>

      <button
        type="button"
        className="avatar-upload__button"
        onClick={() => fileRef.current.click()}
      >
        Upload Group Avatar
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFile}
      />
    </div>
  );
};

export default GroupAvatarPicker;
