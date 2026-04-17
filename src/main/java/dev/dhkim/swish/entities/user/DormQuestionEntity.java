package dev.dhkim.swish.entities.user;

import lombok.*;

import java.util.List;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode
public class DormQuestionEntity {
    private int id;
    private String content;
    private int order;

    private List<DormAnswerEntity> answers;
}
