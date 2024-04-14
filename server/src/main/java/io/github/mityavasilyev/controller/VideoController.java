package io.github.mityavasilyev.controller;

import lombok.extern.log4j.Log4j2;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Stream;

@RestController
@RequestMapping("/videos")
@Log4j2
public class VideoController {

    private static final String UPLOAD_DIR = "uploads/";
    private static final String TRANSCODE_DIR = "transcodes/";

    public VideoController() {
        ensureDirectoriesExist();
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadVideo(@RequestParam("file") MultipartFile file) throws IOException {

        String uuid = UUID.randomUUID().toString();
        String originalExtension = "";
        if (Objects.requireNonNull(file.getOriginalFilename()).contains(".")) {
            originalExtension = file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf("."));
        }
        String newFileName = uuid + originalExtension;

        Path path = Paths.get(UPLOAD_DIR + newFileName);
        Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
        return ResponseEntity.ok(Map.of(
                "message", "Video put in queue for transcoding",
                "downloadLink", "/videos/download/" + uuid,
                "statusLink", "/videos/status/" + uuid
        ));
    }

    @GetMapping("/status/{fileUuid}")
    public ResponseEntity<Map<String, String>> checkTranscodingStatus(@PathVariable String fileUuid) {
        Path filePath = Paths.get(TRANSCODE_DIR + fileUuid + ".mov");
        if (Files.exists(filePath))
            return ResponseEntity.ok(Map.of("message", "Transcoding is finished"));

        return ResponseEntity.ok(Map.of("message", "Transcoding process is running"));
    }

    @GetMapping("/download/{fileName}")
    public ResponseEntity<?> downloadVideo(@PathVariable String fileName) throws IOException {
        Path filePath = Paths.get(TRANSCODE_DIR + fileName + ".mov");
        if (!Files.exists(filePath)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "The video is not yet transcoded. Please try again later."));
        }
        Resource resource = new UrlResource(filePath.toUri());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

    // Simulate transcoding process, in real world it would be done in a separate thread or service
    @Scheduled(fixedRate = 30000)
    public synchronized void transcodeVideos() throws IOException {
        try (Stream<Path> paths = Files.list(Paths.get(UPLOAD_DIR))) {
            List<String> filesToTranscode = paths
                    .filter(Files::isRegularFile) // Filter out directories
                    .map(Path::getFileName)
                    .map(Path::toString)
                    .toList();

            for (String fileName : filesToTranscode) {
                log.info("Transcoding video: " + fileName);
                transcodeVideo(fileName);
                log.info("Video transcoded: " + fileName);
            }
        } catch (IOException e) {
            log.error("Error listing files in upload directory", e);
        }
    }

    private void transcodeVideo(String originalFileName) throws IOException {
        String command = "ffmpeg -i " + UPLOAD_DIR + originalFileName + " " + TRANSCODE_DIR + originalFileName.replace(".mp4", ".mov");
        Process process = Runtime.getRuntime().exec(command);
        try {
            process.waitFor();
        } catch (InterruptedException e) {
            throw new IOException("Transcoding process interrupted", e);
        }

        Path originalFilePath = Paths.get(UPLOAD_DIR + originalFileName);
        boolean isDeleted = Files.deleteIfExists(originalFilePath);
        if (isDeleted) {
            log.info("Original file deleted: " + originalFileName);
        } else {
            log.error("Failed to delete original file: " + originalFileName);
        }
    }

    private void ensureDirectoriesExist() {
        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
            Files.createDirectories(Paths.get(TRANSCODE_DIR));
        } catch (IOException e) {
            throw new RuntimeException("Failed to create directories", e);
        }
    }
}
