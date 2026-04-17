package dev.dhkim.swish.mappers;

import dev.dhkim.swish.dto.UserItemDto;
import dev.dhkim.swish.entities.item.ItemEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ItemMapper {
    ItemEntity findById(int id);

    List<UserItemDto> findByUserId(@Param("userId") int userId);}
