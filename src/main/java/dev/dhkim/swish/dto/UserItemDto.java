package dev.dhkim.swish.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserItemDto {
    private int id;
    private String name;
    private String description;
    private String image;
    private int count;
    private String effectType;
    private Float effectValue;
}
