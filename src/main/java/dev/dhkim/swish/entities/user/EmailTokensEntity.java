package dev.dhkim.swish.entities.user;

import lombok.*;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "email")
public class EmailTokensEntity {
    private String email;
    private String code;
    private String salt;
    private boolean verified;
    private boolean used;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
}
