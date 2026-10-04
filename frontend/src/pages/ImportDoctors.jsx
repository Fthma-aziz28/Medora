import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { 
    Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, XCircle, 
    ArrowRight, ArrowLeft, Download, RefreshCw, Check, Sparkles, AlertCircle 
} from 'lucide-react';

const STANDARD_FIELDS = [
    { key: 'fullName', label: 'Full Name', required: true, aliases: ['name', 'doctor name', 'dr name', 'physician name', 'employee name', 'physician', 'full name'] },
    { key: 'email', label: 'Email', required: true, aliases: ['email', 'email address', 'e-mail', 'mail'] },
    { key: 'phone', label: 'Phone Number', required: false, aliases: ['phone', 'phone number', 'contact', 'mobile', 'cell'] },
    { key: 'department', label: 'Department', required: true, aliases: ['department', 'dept', 'unit', 'department name', 'clinic'] },
    { key: 'specialization', label: 'Specialization', required: false, aliases: ['specialization', 'specialty', 'speciality', 'sub-specialty', 'field'] },
    { key: 'designation', label: 'Designation', required: false, aliases: ['designation', 'role', 'title', 'position', 'rank'] },
    { key: 'employmentStatus', label: 'Employment Status', required: false, aliases: ['employment status', 'status', 'type', 'contract'] },
    { key: 'workingDays', label: 'Working Days', required: false, aliases: ['working days', 'days', 'work days', 'schedule'] },
    { key: 'startTime', label: 'Start Time', required: false, aliases: ['start time', 'shift start', 'from', 'start'] },
    { key: 'endTime', label: 'End Time', required: false, aliases: ['end time', 'shift end', 'to', 'end'] }
];

export default function ImportDoctors({ onFinish }) {
    const [step, setStep] = useState(1);
    const [file, setFile] = useState(null);
    const [rawHeaders, setRawHeaders] = useState([]);
    const [rawRows, setRawRows] = useState([]);
    const [fieldMapping, setFieldMapping] = useState({});
    const [validationResults, setValidationResults] = useState({ valid: [], duplicates: [], errors: [], warnings: [] });
    const [importProgress, setImportProgress] = useState(0);
    const [importResult, setImportResult] = useState(null);
    const [isImporting, setIsImporting] = useState(false);

    // Download template
    const handleDownloadTemplate = () => {
        const headers = ["Doctor ID", "Full Name", "Email", "Phone", "Department", "Specialization", "Designation", "Employment Status", "Working Days", "Start Time", "End Time"];
        const sampleRows = [
            ["DOC-101", "Dr. Aisha Patel", "aisha.patel@medora.com", "+1-555-0101", "Cardiology", "Interventional Cardiology", "Senior Consultant", "Full-Time", "Mon,Tue,Wed,Thu,Fri", "08:00", "16:00"],
            ["DOC-102", "Dr. Marcus Brody", "marcus.brody@medora.com", "+1-555-0102", "Neurology", "Clinical Neurophysiology", "Attending Physician", "Full-Time", "Mon,Wed,Fri", "09:00", "17:00"],
            ["DOC-103", "Dr. Elena Rostova", "elena.rostova@medora.com", "+1-555-0103", "Emergency", "Trauma Care", "Consultant", "Full-Time", "Tue,Thu,Sat", "10:00", "18:00"]
        ];

        const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "DoctorsTemplate");
        XLSX.writeFile(wb, "MEDORA_Doctor_Import_Template.xlsx");
    };

    // Step 1: File reading
    const handleFileUpload = (e) => {
        const uploadedFile = e.target.files[0];
        if (!uploadedFile) return;

        setFile(uploadedFile);
        const reader = new FileReader();

        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

                if (data.length < 2) {
                    alert("The uploaded file contains insufficient data.");
                    return;
                }

                const headers = data[0].map(h => String(h || '').trim());
                const rows = data.slice(1).filter(r => r.some(cell => cell !== undefined && cell !== ''));

                setRawHeaders(headers);
                setRawRows(rows);

                // Auto-map columns via fuzzy matching
                const initialMap = {};
                STANDARD_FIELDS.forEach(field => {
                    const matchIndex = headers.findIndex(h => {
                        const cleanHeader = h.toLowerCase().replace(/[^a-z0-9]/g, '');
                        return field.aliases.some(alias => cleanHeader === alias.replace(/[^a-z0-9]/g, '') || cleanHeader.includes(alias.replace(/[^a-z0-9]/g, '')));
                    });

                    if (matchIndex !== -1) {
                        initialMap[field.key] = headers[matchIndex];
                    }
                });

                setFieldMapping(initialMap);
                setStep(2); // Move to Read & Detect
            } catch (err) {
                console.error("Failed to read file", err);
                alert("Failed to parse file. Please verify it is a valid .xlsx or .csv.");
            }
        };

        reader.readAsBinaryString(uploadedFile);
    };

    // Step 4: Deterministic Validation
    const runValidation = () => {
        const valid = [];
        const duplicates = [];
        const errors = [];
        const warnings = [];
        const seenEmails = new Set();

        rawRows.forEach((row, rowIndex) => {
            const docObj = {};
            STANDARD_FIELDS.forEach(f => {
                const header = fieldMapping[f.key];
                if (header) {
                    const colIdx = rawHeaders.indexOf(header);
                    docObj[f.key] = colIdx !== -1 && row[colIdx] !== undefined ? String(row[colIdx]).trim() : '';
                } else {
                    docObj[f.key] = '';
                }
            });

            const rowErrors = [];
            const rowWarnings = [];

            // Check required fields
            if (!docObj.fullName) rowErrors.push("Missing doctor full name");
            if (!docObj.email) {
                rowErrors.push("Missing email address");
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(docObj.email)) {
                rowErrors.push(`Invalid email format: "${docObj.email}"`);
            }
            if (!docObj.department) rowErrors.push("Missing department");

            // Time sanity check
            if (docObj.startTime && docObj.endTime) {
                if (docObj.startTime >= docObj.endTime) {
                    rowWarnings.push(`Start time (${docObj.startTime}) is not before End time (${docObj.endTime})`);
                }
            }

            // Duplicate email check
            if (docObj.email) {
                if (seenEmails.has(docObj.email.toLowerCase())) {
                    duplicates.push({ rowNumber: rowIndex + 2, data: docObj, reason: `Duplicate email within file (${docObj.email})` });
                    return;
                }
                seenEmails.add(docObj.email.toLowerCase());
            }

            if (rowErrors.length > 0) {
                errors.push({ rowNumber: rowIndex + 2, data: docObj, errors: rowErrors });
            } else {
                if (rowWarnings.length > 0) warnings.push({ rowNumber: rowIndex + 2, data: docObj, warnings: rowWarnings });
                valid.push({ rowNumber: rowIndex + 2, data: docObj });
            }
        });

        setValidationResults({ valid, duplicates, errors, warnings });
        setStep(5); // Proceed to Review
    };

    // Step 6: Process Batch Import via Java/JDBC
    const handleExecuteImport = async () => {
        setStep(6);
        setIsImporting(true);
        setImportProgress(20);

        try {
            const token = localStorage.getItem('medora_token');
            const recordsToImport = validationResults.valid.map(v => v.data);

            setImportProgress(50);

            const payload = {
                filename: file ? file.name : 'doctor_import.xlsx',
                records: recordsToImport
            };

            const res = await fetch('http://localhost:8080/api/doctors/import', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            setImportProgress(90);

            if (res.ok) {
                const data = await res.json();
                setImportResult(data);
            } else {
                setImportResult({
                    status: 'FAILED',
                    imported: 0,
                    skipped: validationResults.duplicates.length,
                    failed: recordsToImport.length,
                    totalRecords: recordsToImport.length
                });
            }
        } catch (err) {
            console.error("Import failed", err);
            setImportResult({
                status: 'FAILED',
                imported: 0,
                skipped: validationResults.duplicates.length,
                failed: validationResults.valid.length,
                totalRecords: validationResults.valid.length
            });
        } finally {
            setImportProgress(100);
            setIsImporting(false);
            setStep(7); // Move to Result
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '2rem' }}>
            
            {/* Visual Progress Bar */}
            <div className="pipeline-visualizer">
                {[
                    { id: 1, label: 'Upload' },
                    { id: 2, label: 'Detect' },
                    { id: 3, label: 'Map' },
                    { id: 4, label: 'Validate' },
                    { id: 5, label: 'Review' },
                    { id: 6, label: 'Import' },
                    { id: 7, label: 'Result' }
                ].map((s, idx) => (
                    <React.Fragment key={s.id}>
                        <div className={`pipeline-step ${step === s.id ? 'active' : ''} ${step > s.id ? 'completed' : ''}`}>
                            <div className="step-node">
                                {step > s.id ? <Check size={16} /> : s.id}
                            </div>
                            <span className="step-label">{s.label}</span>
                        </div>
                        {idx < 6 && <div className={`pipeline-arrow ${step > s.id ? 'filled' : ''}`} />}
                    </React.Fragment>
                ))}
            </div>

            {/* STEP 1: UPLOAD */}
            {step === 1 && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--color-1)', fontFamily: '"Playfair Display", serif' }}>Upload Doctor Dataset</h2>
                            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                Import multiple physician accounts with departments, shifts, and clinical credentials.
                            </p>
                        </div>
                        <button 
                            onClick={handleDownloadTemplate}
                            className="tab-btn"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-6)', borderColor: 'var(--color-4)', color: 'var(--color-1)', fontWeight: 600 }}
                        >
                            <Download size={16} color="var(--color-4)" /> Download Medora Template (.xlsx)
                        </button>
                    </div>

                    <label className="dropzone" style={{ display: 'block' }}>
                        <input 
                            type="file" 
                            accept=".xlsx, .xls, .csv" 
                            onChange={handleFileUpload} 
                            style={{ display: 'none' }} 
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '1.25rem', background: 'var(--color-6)', borderRadius: '50%', color: 'var(--color-4)' }}>
                                <Upload size={38} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, color: 'var(--color-1)', fontSize: '1.2rem' }}>Click to browse or drop doctor spreadsheet here</h3>
                                <p style={{ margin: '0.5rem 0 0 0', color: 'var(--color-3)', fontSize: '0.85rem' }}>
                                    Supports Microsoft Excel (.xlsx, .xls) and Comma-Separated Values (.csv)
                                </p>
                            </div>
                        </div>
                    </label>
                </div>
            )}

            {/* STEP 2: READ & DETECT */}
            {step === 2 && (
                <div>
                    <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-1)', fontFamily: '"Playfair Display", serif' }}>Spreadsheet Inspection</h2>
                    <p style={{ margin: '0 0 1.5rem 0', color: 'var(--text-secondary)' }}>
                        Detected <strong>{rawRows.length}</strong> data rows with <strong>{rawHeaders.length}</strong> columns in <em>{file?.name}</em>.
                    </p>

                    <div style={{ background: 'rgba(255,255,255,0.4)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)', marginBottom: '2rem' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-3)', textTransform: 'uppercase', marginBottom: '0.75rem', fontWeight: 600 }}>
                            Detected Column Headers
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                            {rawHeaders.map((h, i) => (
                                <span key={i} style={{ padding: '0.4rem 0.85rem', background: 'var(--color-6)', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--color-1)', border: '1px solid rgba(35,83,71,0.2)', fontWeight: 500 }}>
                                    {h || `[Column ${i+1}]`}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <button className="tab-btn" onClick={() => setStep(1)}><ArrowLeft size={16} /> Re-upload</button>
                        <button className="action-btn" onClick={() => setStep(3)}>
                            Proceed to Field Mapping <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 3: MAP FIELDS */}
            {step === 3 && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h2 style={{ margin: 0, color: 'var(--color-1)', fontFamily: '"Playfair Display", serif' }}>Field Mapping Configuration</h2>
                            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)' }}>
                                Auto-detected matches using heuristic AI column detection. You can adjust mappings if necessary.
                            </p>
                        </div>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-1)', fontSize: '0.85rem', background: 'var(--color-6)', border: '1px solid var(--color-4)', padding: '0.4rem 0.85rem', borderRadius: '20px', fontWeight: 600 }}>
                            <Sparkles size={14} color="var(--color-4)" /> Smart Matching Active
                        </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                        {STANDARD_FIELDS.map(f => (
                            <div key={f.key} style={{ background: 'rgba(255,255,255,0.4)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 600, color: 'var(--color-1)', fontSize: '0.9rem' }}>
                                        {f.label} {f.required && <span style={{ color: '#b91c1c' }}>*</span>}
                                    </span>
                                    {fieldMapping[f.key] ? (
                                        <span style={{ color: 'var(--color-4)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}>
                                            <Check size={12} /> Mapped
                                        </span>
                                    ) : (
                                        <span style={{ color: 'var(--color-3)', fontSize: '0.75rem' }}>Optional</span>
                                    )}
                                </div>
                                <select 
                                    value={fieldMapping[f.key] || ''} 
                                    onChange={(e) => setFieldMapping({ ...fieldMapping, [f.key]: e.target.value })}
                                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', background: 'rgba(255,255,255,0.85)', color: 'var(--color-1)', border: '1px solid var(--glass-border)', fontSize: '0.85rem' }}
                                >
                                    <option value="">-- Do Not Import / None --</option>
                                    {rawHeaders.map((h, i) => (
                                        <option key={i} value={h}>{h}</option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <button className="tab-btn" onClick={() => setStep(2)}><ArrowLeft size={16} /> Back</button>
                        <button className="action-btn" onClick={runValidation}>
                            Run Validation Checks <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 5: REVIEW */}
            {step === 5 && (
                <div>
                    <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-1)', fontFamily: '"Playfair Display", serif' }}>Validation & Quality Review</h2>
                    <p style={{ margin: '0 0 1.5rem 0', color: 'var(--text-secondary)' }}>
                        Review valid candidates, skipped internal duplicates, and row errors before persisting to database.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ padding: '1.25rem', background: 'rgba(35, 83, 71, 0.12)', borderRadius: '10px', border: '1px solid rgba(35, 83, 71, 0.25)' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-4)', textTransform: 'uppercase', fontWeight: 600 }}>Valid Records</div>
                            <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--color-2)', margin: '0.25rem 0', fontFamily: '"Playfair Display", serif' }}>{validationResults.valid.length}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-3)' }}>Ready for database ingestion</div>
                        </div>
                        <div style={{ padding: '1.25rem', background: 'rgba(217, 119, 6, 0.12)', borderRadius: '10px', border: '1px solid rgba(217, 119, 6, 0.25)' }}>
                            <div style={{ fontSize: '0.8rem', color: '#b45309', textTransform: 'uppercase', fontWeight: 600 }}>Duplicates</div>
                            <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#b45309', margin: '0.25rem 0', fontFamily: '"Playfair Display", serif' }}>{validationResults.duplicates.length}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-3)' }}>Will be skipped automatically</div>
                        </div>
                        <div style={{ padding: '1.25rem', background: 'rgba(185, 28, 28, 0.12)', borderRadius: '10px', border: '1px solid rgba(185, 28, 28, 0.25)' }}>
                            <div style={{ fontSize: '0.8rem', color: '#b91c1c', textTransform: 'uppercase', fontWeight: 600 }}>Errors</div>
                            <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#b91c1c', margin: '0.25rem 0', fontFamily: '"Playfair Display", serif' }}>{validationResults.errors.length}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-3)' }}>Invalid structure/email</div>
                        </div>
                        <div style={{ padding: '1.25rem', background: 'rgba(142, 182, 155, 0.2)', borderRadius: '10px', border: '1px solid rgba(142, 182, 155, 0.4)' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-3)', textTransform: 'uppercase', fontWeight: 600 }}>Warnings</div>
                            <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--color-1)', margin: '0.25rem 0', fontFamily: '"Playfair Display", serif' }}>{validationResults.warnings.length}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-3)' }}>Non-blocking recommendations</div>
                        </div>
                    </div>

                    {/* Problematic rows inspector */}
                    {validationResults.errors.length > 0 && (
                        <div style={{ marginBottom: '2rem', background: 'rgba(185, 28, 28, 0.06)', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(185, 28, 28, 0.2)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b91c1c', marginBottom: '0.75rem', fontWeight: 600 }}>
                                <AlertTriangle size={18} /> Problematic Rows Detected ({validationResults.errors.length})
                            </div>
                            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {validationResults.errors.map((err, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(35,83,71,0.1)', fontSize: '0.85rem' }}>
                                        <span style={{ color: 'var(--color-1)' }}>Row {err.rowNumber}: <strong>{err.data.fullName || 'Unknown'}</strong></span>
                                        <span style={{ color: '#b91c1c' }}>{err.errors.join(', ')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <button className="tab-btn" onClick={() => setStep(3)}><ArrowLeft size={16} /> Re-configure Mapping</button>
                        <button 
                            className="action-btn" 
                            disabled={validationResults.valid.length === 0}
                            onClick={handleExecuteImport}
                            style={{ opacity: validationResults.valid.length === 0 ? 0.5 : 1 }}
                        >
                            Confirm & Ingest {validationResults.valid.length} Doctors <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 6: IMPORT IN PROGRESS */}
            {step === 6 && (
                <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                    <div style={{ display: 'inline-block', padding: '1.5rem', background: 'var(--color-6)', borderRadius: '50%', color: 'var(--color-4)', marginBottom: '1.5rem' }}>
                        <RefreshCw size={48} className="animate-spin" />
                    </div>
                    <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-1)', fontFamily: '"Playfair Display", serif' }}>Transactional Ingestion in Progress</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        Executing safe JDBC batch transactions across Users and Doctors tables...
                    </p>

                    <div style={{ maxWidth: '420px', margin: '0 auto', background: 'rgba(35,83,71,0.15)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ width: `${importProgress}%`, height: '100%', background: 'var(--color-4)', transition: 'width 0.4s ease' }} />
                    </div>
                    <div style={{ marginTop: '0.75rem', color: 'var(--color-3)', fontSize: '0.85rem' }}>{importProgress}% completed</div>
                </div>
            )}

            {/* STEP 7: RESULT */}
            {step === 7 && importResult && (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                    <div style={{ display: 'inline-block', padding: '1.5rem', background: importResult.status === 'SUCCESS' ? 'var(--color-6)' : 'rgba(217, 119, 6, 0.15)', borderRadius: '50%', color: importResult.status === 'SUCCESS' ? 'var(--color-4)' : '#b45309', marginBottom: '1.5rem' }}>
                        <CheckCircle2 size={56} />
                    </div>

                    <h1 style={{ margin: '0 0 0.5rem 0', fontFamily: '"Playfair Display", serif', color: 'var(--color-1)', fontSize: '2.2rem' }}>
                        INGESTION REPORT
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
                        Dataset <strong>{file?.name || 'Physician List'}</strong> processed via transactional JDBC engine.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', maxWidth: '850px', margin: '0 auto 2.5rem auto' }}>
                        <div className="glass-panel" style={{ padding: '1.4rem', borderTop: '3px solid var(--color-4)' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-3)', textTransform: 'uppercase', fontWeight: 600 }}>IMPORTED</div>
                            <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--color-4)', margin: '0.25rem 0', fontFamily: '"Playfair Display", serif' }}>{importResult.imported || 0}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-3)' }}>Doctors activated</div>
                        </div>
                        <div className="glass-panel" style={{ padding: '1.4rem', borderTop: '3px solid var(--color-2)' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-3)', textTransform: 'uppercase', fontWeight: 600 }}>UPDATED</div>
                            <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--color-2)', margin: '0.25rem 0', fontFamily: '"Playfair Display", serif' }}>{importResult.updated || 0}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-3)' }}>Existing records</div>
                        </div>
                        <div className="glass-panel" style={{ padding: '1.4rem', borderTop: '3px solid #d97706' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-3)', textTransform: 'uppercase', fontWeight: 600 }}>SKIPPED</div>
                            <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#d97706', margin: '0.25rem 0', fontFamily: '"Playfair Display", serif' }}>{importResult.skipped || 0}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-3)' }}>Duplicates omitted</div>
                        </div>
                        <div className="glass-panel" style={{ padding: '1.4rem', borderTop: '3px solid #b91c1c' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-3)', textTransform: 'uppercase', fontWeight: 600 }}>FAILED</div>
                            <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#b91c1c', margin: '0.25rem 0', fontFamily: '"Playfair Display", serif' }}>{importResult.failed || 0}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-3)' }}>Errors encountered</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button className="tab-btn" onClick={() => { setStep(1); setFile(null); setImportResult(null); }}>
                            Import Another File
                        </button>
                        <button className="action-btn" onClick={onFinish}>
                            Return to Doctor Directory
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
