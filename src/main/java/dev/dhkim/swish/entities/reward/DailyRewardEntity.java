package dev.dhkim.swish.entities.reward;

import lombok.*;

import java.time.LocalDateTime;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "id")
public class DailyRewardEntity {
    private int id;
    private int galleon;
    private int coin;
    private int dormRank;
    private LocalDateTime createdAt;
}
