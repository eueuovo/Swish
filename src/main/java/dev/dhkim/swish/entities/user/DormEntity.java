package dev.dhkim.swish.entities.user;

import lombok.*;
import org.springframework.data.relational.core.mapping.Table;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode
public class DormEntity {
    private int id;
    private String name;
}
