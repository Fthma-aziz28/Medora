package com.medora.model;

import java.time.LocalDateTime;

public class ImportHistory {
    private Long id;
    private String filename;
    private String importedBy;
    private LocalDateTime date;
    private Integer totalRecords;
    private Integer imported;
    private Integer updated;
    private Integer skipped;
    private Integer failed;
    private String status;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }

    public String getImportedBy() { return importedBy; }
    public void setImportedBy(String importedBy) { this.importedBy = importedBy; }

    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }

    public Integer getTotalRecords() { return totalRecords; }
    public void setTotalRecords(Integer totalRecords) { this.totalRecords = totalRecords; }

    public Integer getImported() { return imported; }
    public void setImported(Integer imported) { this.imported = imported; }

    public Integer getUpdated() { return updated; }
    public void setUpdated(Integer updated) { this.updated = updated; }

    public Integer getSkipped() { return skipped; }
    public void setSkipped(Integer skipped) { this.skipped = skipped; }

    public Integer getFailed() { return failed; }
    public void setFailed(Integer failed) { this.failed = failed; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
