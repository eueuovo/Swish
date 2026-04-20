package dev.dhkim.swish.entities.item;

import lombok.*;

import java.time.LocalDateTime;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "id")
public class ItemEntity {
    private int id;
    private String name;
    private String description;
    private int price;
    private LocalDateTime createdAt;
    private String image;
    private String effectType;
    private Float effectValue;
}
