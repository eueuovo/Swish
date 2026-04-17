package dev.dhkim.swish.mappers;

import dev.dhkim.swish.entities.user.EmailTokensEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface EmailTokenMapper {
    int insert(EmailTokensEntity emailToken);
    EmailTokensEntity select(@Param("email") String email, @Param("code") String code, @Param("salt") String salt);
    int update(EmailTokensEntity emailToken);
}
