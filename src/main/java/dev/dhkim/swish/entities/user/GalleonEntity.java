package dev.dhkim.swish.entities.user;

import lombok.*;

import java.time.LocalDateTime;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "id")
public class GalleonEntity {
    private int id;
    private int userId;
    private int change;
    private String reason;
    private LocalDateTime createdAt;
}
