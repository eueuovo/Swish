package dev.dhkim.swish.entities.user;

import lombok.*;
import org.springframework.cglib.core.Local;

import java.time.LocalDateTime;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "id")
public class EnhanceWandEntity {
    private int id;
    private int wandId;
    private int rank;
    private int score;
    private String image;
    private int success;
    private int maintain;
    private int fail;
    private LocalDateTime createdAt;
    private int enhanceCost;
    private int sellPrice;
}
