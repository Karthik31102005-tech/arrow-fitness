import { useState } from 'react';

function MediaUpload({ token, onUploadSuccess }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'gallery'
    });
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState(null);
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            setStatus('error');
            setMessage('Please select an image');
            return;
        }

        setStatus('loading');
        setMessage('Uploading...');

        try {
            const uploadData = new FormData();
            uploadData.append('image', file);
            uploadData.append('title', formData.title);
            uploadData.append('description', formData.description);
            uploadData.append('category', formData.category);

            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/media/upload`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: uploadData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            setStatus('success');
            setMessage('Uploaded successfully!');
            setFormData({ title: '', description: '', category: 'gallery' });
            setFile(null);
            e.target.reset();

            if (onUploadSuccess) onUploadSuccess();

        } catch (err) {
            setStatus('error');
            setMessage(err.message);
        }
    };

    return (
        <div style={{ maxWidth: '450px', padding: '1.5rem', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '2rem' }}>
            <h3>Upload Photo/Video</h3>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label>Description (optional)</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label>Category</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                    >
                        <option value="gallery">General Gallery</option>
                        <option value="event">Events Page</option>
                    </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label>Image File</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        required
                        style={{ width: '100%', marginTop: '0.25rem' }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={status === 'loading'}
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: '#ff6600', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    {status === 'loading' ? 'Uploading...' : 'Upload'}
                </button>
            </form>

            {message && (
                <p style={{ marginTop: '1rem', color: status === 'success' ? 'green' : status === 'error' ? 'red' : '#333' }}>
                    {message}
                </p>
            )}
        </div>
    );
}

export default MediaUpload;