package com.medora.controller;

import com.medora.dao.PatientDocumentDao;
import com.medora.dao.UserDao;
import com.medora.model.PatientDocument;
import com.medora.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private static final String UPLOAD_DIR = "uploads/documents/";

    @Autowired private PatientDocumentDao docDao;
    @Autowired private UserDao userDao;

    public DocumentController() {
        File dir = new File(UPLOAD_DIR);
        if (!dir.exists()) {
            dir.mkdirs();
        }
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof User) {
            return (User) auth.getPrincipal();
        }
        return null;
    }

    /**
     * Retrieves patient documents.
     * Enforces privacy: PATIENT users can only see their own records.
     */
    @GetMapping
    public ResponseEntity<?> getDocuments(@RequestParam(required = false) String patientEmail) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required."));
        }
        
        if ("PATIENT".equalsIgnoreCase(user.getRole())) {
            // Patient strictly sees only their own documents - ignores any query parameter
            return ResponseEntity.ok(docDao.findByPatientUserIdOrEmail(user.getId(), user.getEmail()));
        }

        if (patientEmail != null && !patientEmail.trim().isEmpty()) {
            return ResponseEntity.ok(docDao.findByPatientEmail(patientEmail.trim()));
        }

        // Admin and Doctors can list all recent documents
        return ResponseEntity.ok(docDao.findAll());
    }

    /**
     * Uploads a real diagnostic document, lab report, or prescription.
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam("patientEmail") String patientEmail,
            @RequestParam("documentType") String documentType,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description) {

        User currentUser = getAuthenticatedUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required."));
        }
        if ("PATIENT".equalsIgnoreCase(currentUser.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Patients are not authorized to issue clinical documents."));
        }

        try {
            if (patientEmail == null || patientEmail.trim().isEmpty() ||
                title == null || title.trim().isEmpty() ||
                documentType == null || documentType.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "patientEmail, title, and documentType are required."));
            }

            PatientDocument doc = new PatientDocument();
            doc.setPatientEmail(patientEmail.trim().toLowerCase());
            doc.setDocumentType(documentType.trim().toUpperCase());
            doc.setTitle(title.trim());
            doc.setDescription(description != null ? description.trim() : "");

            // Link patient user ID if registered
            Optional<User> patientOpt = userDao.findByEmail(patientEmail.trim().toLowerCase());
            patientOpt.ifPresent(p -> doc.setPatientUserId(p.getId()));

            doc.setUploadedByUserId(currentUser.getId());

            if (file != null && !file.isEmpty()) {
                String originalFilename = file.getOriginalFilename();
                String ext = "";
                if (originalFilename != null && originalFilename.contains(".")) {
                    ext = originalFilename.substring(originalFilename.lastIndexOf("."));
                }
                
                String storedFilename = UUID.randomUUID() + ext;
                Path targetLocation = Paths.get(UPLOAD_DIR).resolve(storedFilename).normalize();

                Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

                doc.setFileName(originalFilename != null ? originalFilename : storedFilename);
                doc.setFilePath(targetLocation.toString());
                doc.setFileSize(file.getSize());
                doc.setContentType(file.getContentType() != null ? file.getContentType() : "application/octet-stream");
                doc.setFileUrl("/api/documents/" + storedFilename);
            } else {
                // Generate a clinical text placeholder on disk so it can always be downloaded
                String storedFilename = "doc_" + UUID.randomUUID() + ".txt";
                Path targetLocation = Paths.get(UPLOAD_DIR).resolve(storedFilename).normalize();
                String content = "MEDORA HOSPITAL OPERATIONS SYSTEM\n" +
                                 "====================================\n" +
                                 "DOCUMENT: " + title + "\n" +
                                 "TYPE:     " + documentType + "\n" +
                                 "PATIENT:  " + patientEmail + "\n" +
                                 "ISSUED BY:" + currentUser.getName() + " (" + currentUser.getRole() + ")\n" +
                                 "DATE:     " + new Date() + "\n" +
                                 "NOTES:\n" + (description != null ? description : "None provided") + "\n";
                Files.writeString(targetLocation, content, StandardCharsets.UTF_8);

                doc.setFileName(title.replaceAll("[^a-zA-Z0-9.-]", "_") + ".txt");
                doc.setFilePath(targetLocation.toString());
                doc.setFileSize((long) content.length());
                doc.setContentType("text/plain");
                doc.setFileUrl("/api/documents/" + storedFilename);
            }

            docDao.save(doc);
            return ResponseEntity.ok(Map.of(
                "message", "Document successfully stored and issued.",
                "id", doc.getId(),
                "fileName", doc.getFileName() != null ? doc.getFileName() : ""
            ));

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to store file: " + e.getMessage()));
        }
    }

    /**
     * Downloads an actual stored document with authentication and ownership validation.
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        PatientDocument doc = docDao.findById(id);
        if (doc == null) {
            return ResponseEntity.notFound().build();
        }

        if ("PATIENT".equalsIgnoreCase(user.getRole())) {
            // Patient can only download their own document
            boolean isOwner = (doc.getPatientUserId() != null && doc.getPatientUserId().equals(user.getId())) ||
                              (doc.getPatientEmail() != null && doc.getPatientEmail().equalsIgnoreCase(user.getEmail()));
            if (!isOwner) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        try {
            Resource resource = null;
            if (doc.getFilePath() != null) {
                Path filePath = Paths.get(doc.getFilePath()).normalize();
                if (Files.exists(filePath)) {
                    resource = new UrlResource(filePath.toUri());
                }
            }

            if (resource == null || !resource.exists()) {
                // If the underlying file was not yet on disk, generate a clinical certificate response
                String fallbackText = "MEDORA CLINICAL RECORD\n" +
                                      "------------------------------------\n" +
                                      "Title: " + doc.getTitle() + "\n" +
                                      "Category: " + doc.getDocumentType() + "\n" +
                                      "Patient: " + doc.getPatientEmail() + "\n" +
                                      "Summary: " + doc.getDescription() + "\n";
                resource = new ByteArrayResource(fallbackText.getBytes(StandardCharsets.UTF_8));
            }

            String contentType = doc.getContentType() != null ? doc.getContentType() : "application/octet-stream";
            String downloadName = doc.getFileName() != null && !doc.getFileName().isEmpty() 
                    ? doc.getFileName() 
                    : (doc.getTitle().replaceAll("[^a-zA-Z0-9.-]", "_") + ".txt");

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + downloadName + "\"")
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
