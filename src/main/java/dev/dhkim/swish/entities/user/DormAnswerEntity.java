package dev.dhkim.swish.entities.user;

import lombok.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode
public class DormAnswerEntity {
    private int id;
    private int questionId;
    private String content;
    private int dormId;
}
