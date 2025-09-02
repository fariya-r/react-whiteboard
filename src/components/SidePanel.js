import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth'; // Not used in this snippet, but kept for context
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { extractTextFromBase64Data } from '../utils/ocrHelper'; // Corrected import path
import { fileToBase64, getFileType } from '../utils/fileUtils'; // Corrected import path
import { supabase } from './supabaseClient';

const SidePanel = ({ onTextExtracted, userId }) => {
  console.log('User ID received:', userId);
  const [file, setFile] = useState(null);
  const [filesList, setFilesList] = useState([]);
  const [selectedFileUrl, setSelectedFileUrl] = useState(null);
  const [selectedFileType, setSelectedFileType] = useState('');
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
  const [extractedText, setExtractedText] = useState('');

  const handleFileChange = (event) => {
    const selected = event.target.files[0];
    if (!selected) return;
    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file || !userId) {
      toast.error("Please select a file and login first");
      return;
    }
  
    try {
      // 1. Upload file via backend
      const formData = new FormData();
      formData.append("file", file);
      formData.append("user_id", userId);
  
      const res = await axios.post(`${baseUrl}/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      if (!res.data || !res.data.filePath) {
        throw new Error("Upload failed at backend");
      }
  
      const filePath = res.data.filePath;
  
      // 2. Insert metadata into user_files table
      const { data: insertedFile, error: insertError } = await supabase
        .from("user_files")
        .insert([
          {
            user_id: userId,
            file_path: filePath,
            created_at: new Date(),
          },
        ])
        .select();
  
      if (insertError) throw insertError;
  
      toast.success("File uploaded successfully!");
      setFile(null);
  
      // Refresh file list
      fetchFiles(userId);
    } catch (err) {
      console.error("❌ Upload error:", err.message);
      toast.error("Upload failed");
    }
  };
  
  const handleDelete = async (filePath) => {
    if (!userId) {
      toast.error("User ID not found. Cannot delete file.");
      return;
    }
    try {
      // 1. Delete from storage via backend
      await axios.delete(`${baseUrl}/api/files/${encodeURIComponent(filePath)}`);
  
      // 2. Delete from DB
      const { error: dbError } = await supabase
        .from("user_files")
        .delete()
        .eq("file_path", filePath)
        .eq("user_id", userId);
  
      if (dbError) throw dbError;
  
      toast.success("File deleted successfully");
      fetchFiles(userId);
    } catch (error) {
      console.error("❌ Delete error:", error);
      toast.error("Failed to delete file");
    }
  };
  
const fetchFiles = async (uid) => {
  if (!uid) return;

  console.log("Fetching files for:", uid);

  const { data, error } = await supabase
    .from("user_files")
    .select("*")
    .eq("user_id", uid);

  if (error) {
    console.error("❌ Fetch error:", error.message);
    return;
  }

  // Generate public URLs
  const filesWithUrls = data.map((file) => {
    const { data: urlData } = supabase.storage
      .from("user-files")
      .getPublicUrl(file.file_path);

    return {
      ...file,
      url: urlData.publicUrl,
    };
  });

  console.log("✅ Files fetched with URLs:", filesWithUrls);
  setFilesList(filesWithUrls);
};


useEffect(() => {
  if (userId) {
    fetchFiles(userId);
  }
}, [userId]);



const handleFileClick = (fileItem) => {
  setSelectedFileUrl(fileItem.url);
  setSelectedFileType(fileItem.file_path.split('.').pop().toLowerCase()); // ✅ fixed
};


  const saveExtractedText = async (textToSave) => {
    if (!userId || !textToSave) return; // Ensure userId and text are present
    try {
      // Use a new endpoint for saving/updating text associated with the user
      await axios.post(`${baseUrl}/api/extracted-text`, { userId, text: textToSave });
    } catch (error) {
      console.error('❌ Failed to save text:', error);
      toast.error('Failed to save extracted text.');
    }
  };

  const deleteExtractedText = async () => {
    if (!userId) return;
    try {
      await axios.delete(`${baseUrl}/api/extracted-text/${userId}`);
      setExtractedText(''); // Clear the extracted text from state
      onTextExtracted(''); // Clear text on the whiteboard as well
      toast.success("Extracted text deleted successfully.");
    } catch (error) {
      console.error('❌ Failed to delete text:', error);
      toast.error('Failed to delete extracted text.');
    }
  };

  const fetchExtractedText = async () => {
    if (!userId) return;
    try {
      // Fetch the saved text for the current user
      const response = await axios.get(`${baseUrl}/api/extracted-text/${userId}`);
      if (response.data && response.data.text) {
        setExtractedText(response.data.text);
        // Pass the loaded text to the whiteboard on load
        onTextExtracted(response.data.text);
      }
    } catch (error) {
      // It's normal for this to fail if no text has been saved yet, so log as info
      console.info('No extracted text found for user:', userId);
    }
  };

  const handleOCR = async () => {
    // Initial check for a file
    if (!file) {
      toast.warn("Please select a file using 'Choose File' button to perform OCR.");
      return;
    }
    const fileToProcess = file;
    const type = getFileType(fileToProcess); // This will return 'image' or 'pdf'

    if (type !== 'image' && type !== 'pdf') {
      toast.error('OCR only supports image (PNG, JPG) or PDF files.');
      return;
    }

    setIsProcessingOCR(true);
    toast.info("Processing OCR...");

    try {
      const base64Data = await fileToBase64(fileToProcess);
            const extractedTextResult = await extractTextFromBase64Data(base64Data, type);

      if (extractedTextResult) {
        setExtractedText(extractedTextResult);
        onTextExtracted(extractedTextResult); // Send to whiteboard
        toast.success("Text extracted and sent to whiteboard!");
        await saveExtractedText(extractedTextResult); // Save to backend
      } else {
        toast.info("No text could be extracted from this file.");
      }
    } catch (error) {
      console.error('OCR failed:', error);
      toast.error(`OCR failed: ${error.message}. Check browser console and backend logs.`);
    } finally {
      setIsProcessingOCR(false);
      setFile(null);
      document.querySelector('input[type="file"]').value = '';
    }
  };

 

  useEffect(() => {
    fetchExtractedText();
  }, [userId]);

  // Effect to debounce saving of edited extracted text
  useEffect(() => {
    if (extractedText) {
      const handler = setTimeout(() => {
        saveExtractedText(extractedText);
      }, 1000); // Wait 1 second after the user stops typing before saving
      return () => {
        clearTimeout(handler);
      };
    }
  }, [extractedText, userId]);   


  return (
    <div
      style={{
        width: '340px',
        backgroundColor: '#010141',
        borderRight: '1px solid #ccc',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'sans-serif',
        height: '100vh',
        boxSizing: 'border-box',
        color: '#fff',
        borderTopRightRadius: '16px',
        borderBottomRightRadius: '16px',
        overflow: 'hidden', // This is crucial to prevent the main panel from creating its own scrollbar
        maxWidth: '100%', // Ensures the panel doesn't exceed the width of its parent
      }}
    >
      <h4 style={{ marginBottom: '10px', fontSize: '18px', color: '#ffffff' }}>
        Attach File
      </h4>

      <label
        htmlFor="file-upload"
        style={{
          display: 'block',
          width: '100%',
          padding: '6px 12px',
          backgroundColor: '#fff',
          color: '#000',
          borderRadius: '4px',
          fontSize: '13px',
          textAlign: 'center',
          cursor: 'pointer',
          marginBottom: '10px',
          border: '1px solid #ccc',
        }}
      >
        Choose File
      </label>
      <input
        id="file-upload"
        type="file"
        onChange={handleFileChange}
        style={{
          display: 'none',
        }}
      />
      
      {file && (
        <p style={{ fontSize: '12px', color: '#ccc', marginBottom: '10px' }}>
          Selected: {file.name}
        </p>
      )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={handleUpload}
          style={{
            fontSize: '13px',
            padding: '6px 12px',
            backgroundColor: '#4A90E2',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            flex: 1,
          }}
        >
          Upload
        </button>
        <button
          onClick={handleOCR}
          disabled={isProcessingOCR || !file}
          style={{
            fontSize: '13px',
            padding: '6px 12px',
            backgroundColor: isProcessingOCR ? '#888' : '#28A745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isProcessingOCR ? 'not-allowed' : 'pointer',
            flex: 1,
          }}
        >
          {isProcessingOCR ? 'Processing...' : 'Extract Text'}
        </button>
      </div>

      <h4 style={{ marginBottom: '10px', fontSize: '16px', color: '#ffffff' }}>
        Uploaded Files
      </h4>
      <ul
        style={{
          listStyle: 'none',
          padding: '6px 10px',
          backgroundColor: '#ffffff',
          borderRadius: '6px',
          color: '#000',
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {Array.isArray(filesList) && filesList.length > 0 ? (
          filesList.map((fileItem, index) => (
            <li
              key={fileItem.id || index}
              style={{
                marginBottom: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '6px',
                wordBreak: 'break-all',
              }}
            >
              <button
                onClick={() => handleFileClick(fileItem)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#010141',
                  cursor: 'pointer',
                  fontSize: '13px',
                  textAlign: 'left',
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={fileItem.file_path}
              >
{fileItem.file_path.split('/').pop()} 
              </button>
              <button
                onClick={() => handleDelete(fileItem.file_path)}
                style={{
                  color: 'red',
                  fontSize: '12px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                }}
              >
                🗑
              </button>
            </li>
          ))
        ) : (
          <li style={{ color: '#888', fontSize: '12px' }}>No files uploaded yet.</li>
        )}
      </ul>
  
      {selectedFileUrl && (
        <div style={{ marginTop: '20px' }}>
          <h5 style={{ fontSize: '14px', marginBottom: '8px' }}>Preview</h5>
          {['jpg', 'jpeg', 'png'].includes(selectedFileType) ? (
            <img
              src={selectedFileUrl}
              alt="Preview"
              style={{
                width: '100%',
                maxHeight: '200px',
                objectFit: 'contain',
                borderRadius: '6px',
                border: '1px solid #ccc',
              }}
            />
          ) : selectedFileType === 'pdf' ? (
            <iframe
              src={selectedFileUrl}
              width="100%"
              height="260px"
              title="PDF Preview"
              style={{
                border: '1px solid #ccc',
                borderRadius: '6px',
              }}
            />
          ) : (
            <p style={{ fontSize: '12px', color: '#fff' }}>
              Not previewable.{' '}
              <a
                href={selectedFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#4A90E2', textDecoration: 'underline' }}
              >
                Download
              </a>
            </p>
          )}
        </div>
      )}
      {extractedText && (
        <div
          ref={(ref) => (window.extractedBox = ref)}
          style={{
            position: 'fixed',
            top: '100px',
            left: '350px',
            zIndex: 999,
            width: '400px',
            height: '240px',
            backgroundColor: '#f9f9f9',
            border: '2px solid #ccc',
            borderRadius: '8px',
            padding: '12px',
            cursor: 'move',
            boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
            color: '#000',
            resize: 'both',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
          onMouseDown={(e) => {
            const box = e.currentTarget;
            if (e.target.closest('.resize-handle') || e.target.tagName === 'TEXTAREA' || e.target.classList.contains('close-btn')) return;
            const shiftX = e.clientX - box.getBoundingClientRect().left;
            const shiftY = e.clientY - box.getBoundingClientRect().top;
            function moveAt(pageX, pageY) {
              const screenW = window.innerWidth;
              const screenH = window.innerHeight;
              const boxW = box.offsetWidth;
              const boxH = box.offsetHeight;
              let newLeft = pageX - shiftX;
              let newTop = pageY - shiftY;
              newLeft = Math.max(0, Math.min(newLeft, screenW - boxW));
              newTop = Math.max(0, Math.min(newTop, screenH - boxH));
              box.style.left = newLeft + 'px';
              box.style.top = newTop + 'px';
            }
            function onMouseMove(e) {
              moveAt(e.pageX, e.pageY);
            }
            document.addEventListener('mousemove', onMouseMove);
            document.onmouseup = () => {
              document.removeEventListener('mousemove', onMouseMove);
              document.onmouseup = null;
            };
          }}
        >
          <button
            className="close-btn"
            onClick={(e) => {
              e.preventDefault();
              deleteExtractedText(); // Call the new function to delete from Firestore
            }}
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              background: 'transparent',
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer',
              color: '#333',
              fontWeight: 'bold',
            }}
          >
            ❌
          </button>
          <h5 style={{ fontSize: '15px', marginBottom: '8px', fontWeight: 'bold' }}>Extracted Text</h5>
          <textarea
            value={extractedText}
            onChange={(e) => setExtractedText(e.target.value)}
            style={{
              width: '100%',
              height: 'calc(100% - 50px)',
              resize: 'none',
              padding: '8px',
              fontSize: '13px',
              borderRadius: '4px',
              border: '1px solid #aaa',
              backgroundColor: '#fff',
              fontFamily: 'monospace',
              color: '#000',
              boxSizing: 'border-box',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default SidePanel;
