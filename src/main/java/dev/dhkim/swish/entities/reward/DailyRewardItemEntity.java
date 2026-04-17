package dev.dhkim.swish.entities.reward;

import lombok.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "id")
public class DailyRewardItemEntity {
    private int id;
    private int dailyRewardId;
    private int itemId;
    private int itemCount;
}
