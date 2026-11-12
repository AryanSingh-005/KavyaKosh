package com.verse.backend.document;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.Map;

@Document(collection = "system_settings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemSettingDocument {
    @Id
    private String id;
    private Map<String, Object> values;
    private Instant updatedAt;
    private String updatedBy;
}
