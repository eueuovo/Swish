package dev.dhkim.swish.entities.user;

import lombok.*;
import java.time.LocalDateTime;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "loginId")
public class UserEntity {
    private int id;
    private String email;
    private String loginId;
    private String password;
    private int galleon;
    private int coin;
    private Integer dormId;
    private int wandId;
    private LocalDateTime createdAt;
    private String nickname;
    private String contact;
    private int wandRank;
    private LocalDateTime lastDailyRewardAt;
}
