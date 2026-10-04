package com.medora.model;

import java.util.List;

public class DoctorImportRequest {
    private String filename;
    private List<DoctorImportRecord> records;

    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }

    public List<DoctorImportRecord> getRecords() { return records; }
    public void setRecords(List<DoctorImportRecord> records) { this.records = records; }
}
