package dev.dhkim.swish.entities.user;

import lombok.*;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "id")
public class WandEntity {
    private int id;
    private String name;
    private int rank;
    private int score;
    private String image;
    private int success;
    private int maintain;
    private int fail;
    private float probability;
    private LocalDateTime createdAt;
    private int enhanceCost;
    private int sellPrice;
}
