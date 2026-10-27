import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, FileText, Check, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';
import './AddDoctorModal.css';

export default function UploadDocumentModal({ isOpen, onClose, onDocumentUploaded }) {
    const [patientEmail, setPatientEmail] = useState('');
    const [documentType, setDocumentType] = useState('TEST_RESULT');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            if (!title) {
                // Auto-fill title from clean filename
                const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                setTitle(nameWithoutExt.replace(/[-_]/g, ' '));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('medora_token');
            const formData = new FormData();
            formData.append('patientEmail', patientEmail);
            formData.append('documentType', documentType);
            formData.append('title', title);
            formData.append('description', description);
            if (selectedFile) {
                formData.append('file', selectedFile);
            }

            if (API_BASE_URL) {
                const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
                    method: 'POST',
                    headers: {
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    body: formData
                });

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(errData.error || 'Failed to upload document to clinical repository.');
                }
            }

            window.dispatchEvent(new Event('medora_document_updated'));
            if (onDocumentUploaded) onDocumentUploaded();
            
            // Reset form
            setPatientEmail('');
            setDocumentType('TEST_RESULT');
            setTitle('');
            setDescription('');
            setSelectedFile(null);
            onClose();
        } catch (err) {
            setErrorMessage(err.message || 'An error occurred during document upload.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="doctor-modal-overlay" onClick={onClose}>
                <motion.div 
                    className="doctor-modal-card" 
                    onClick={e => e.stopPropagation()}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.15 }}
                >
                    {/* Header */}
                    <div className="doctor-modal-header">
                        <div>
                            <h2>Upload Patient Document</h2>
                            <p>Issue an official diagnostic report, prescription authorization, or medical record</p>
                        </div>
                        <button className="doctor-modal-close" onClick={onClose} aria-label="Close">
                            <X size={18} />
                        </button>
                    </div>

                    {errorMessage && (
                        <div style={{ margin: '1rem 1.5rem 0', padding: '0.75rem 1rem', background: 'rgba(185,28,28,0.1)', border: '1px solid rgba(185,28,28,0.25)', borderRadius: '6px', color: '#b91c1c', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <AlertCircle size={16} />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="doctor-modal-body">
                            {/* Section 01: Recipient & Classification */}
                            <div className="modal-section">
                                <div className="modal-section-title">01 / Recipient & Classification</div>
                                
                                <div className="modal-input-group">
                                    <label>Patient Email Address</label>
                                    <input 
                                        type="email" 
                                        placeholder="e.g. emily@medora.com" 
                                        value={patientEmail} 
                                        onChange={e => setPatientEmail(e.target.value)} 
                                        required 
                                    />
                                </div>

                                <div className="modal-input-group">
                                    <label>Document Classification</label>
                                    <select 
                                        value={documentType} 
                                        onChange={e => setDocumentType(e.target.value)}
                                        style={{
                                            background: '#FAF9F5',
                                            border: '1px solid var(--border-subtle)',
                                            borderRadius: '4px',
                                            padding: '0.65rem 0.85rem',
                                            fontSize: '0.85rem',
                                            fontFamily: 'inherit',
                                            color: 'var(--color-1)',
                                            outline: 'none'
                                        }}
                                    >
                                        <option value="TEST_RESULT">Diagnostic / Lab Result (ECG, CMP, MRI)</option>
                                        <option value="PRESCRIPTION">Pharmacy Prescription Authorization</option>
                                        <option value="CLINICAL_NOTE">Attending Physician Clinical Summary</option>
                                        <option value="BILL">Hospital Billing & Encounter Statement</option>
                                    </select>
                                </div>
                            </div>

                            {/* Section 02: Clinical Summary & Real File Upload */}
                            <div className="modal-section">
                                <div className="modal-section-title">02 / Clinical Details & File Attachment</div>

                                <div className="modal-input-group">
                                    <label>Document Title</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Comprehensive Metabolic Panel (CMP)" 
                                        value={title} 
                                        onChange={e => setTitle(e.target.value)} 
                                        required 
                                    />
                                </div>

                                <div className="modal-input-group">
                                    <label>Description & Medical Notes</label>
                                    <textarea 
                                        placeholder="Clinical observations, normal reference ranges, or dosage instructions..." 
                                        value={description} 
                                        onChange={e => setDescription(e.target.value)} 
                                        rows={3}
                                        style={{
                                            background: '#FAF9F5',
                                            border: '1px solid var(--border-subtle)',
                                            borderRadius: '4px',
                                            padding: '0.65rem 0.85rem',
                                            fontSize: '0.85rem',
                                            fontFamily: 'inherit',
                                            color: 'var(--color-1)',
                                            outline: 'none',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>

                                <div className="modal-input-group">
                                    <label>Select Document File (.pdf, .png, .jpg, .docx)</label>
                                    <div style={{
                                        border: '2px dashed var(--border-subtle)',
                                        borderRadius: '8px',
                                        padding: '1.25rem',
                                        textAlign: 'center',
                                        background: 'rgba(250, 249, 245, 0.6)',
                                        cursor: 'pointer'
                                    }}>
                                        <input 
                                            type="file" 
                                            id="doc-file-input"
                                            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt"
                                            onChange={handleFileChange}
                                            style={{ display: 'none' }}
                                        />
                                        <label htmlFor="doc-file-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                                            <UploadCloud size={24} color="var(--color-4)" />
                                            {selectedFile ? (
                                                <span style={{ fontWeight: 600, color: 'var(--color-1)', fontSize: '0.85rem' }}>
                                                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                                                </span>
                                            ) : (
                                                <>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-1)' }}>Click to select a file from your device</span>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PDF, PNG, JPG, or DOC up to 10MB</span>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="doctor-modal-footer">
                            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-submit-doctor" disabled={isSubmitting}>
                                <UploadCloud size={16} />
                                <span>{isSubmitting ? 'Uploading & Issuing...' : 'Issue Document'}</span>
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
